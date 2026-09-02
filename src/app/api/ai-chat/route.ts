import { NextRequest, NextResponse } from 'next/server';
import { ActionService } from '@/lib/services/actionService';
import { CompanyService } from '@/lib/services/companyService';
import { executeMcpTool } from '@/lib/mcp/tools';

export const runtime = 'nodejs';

// Gemini API helper with model fallbacks
async function callGemini(contents: any[], tools?: any[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const models = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-flash-latest'];
  for (const model of models) {
    try {
      const body: any = { contents };
      if (tools && tools.length > 0) {
        body.tools = tools;
      }
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      // try next model
    }
  }
  return null;
}

// Function definitions for Gemini Tool Calling
const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'create_company',
        description: 'Create and incorporate a new company in the Future MCA registry and workspace portfolio. Call this whenever the user expresses intent to create, start, register, or incorporate a company.',
        parameters: {
          type: 'OBJECT',
          properties: {
            company_name: {
              type: 'STRING',
              description: 'The proposed name of the company (e.g., Aeos Private Limited)'
            },
            company_type: {
              type: 'STRING',
              description: 'The legal type of company, such as "Private Limited Company", "LLP", "One Person Company"'
            },
            registered_office: {
              type: 'STRING',
              description: 'The state or address of the registered office (e.g., Tamil Nadu, Karnataka, Mumbai)'
            },
            authorized_capital: {
              type: 'NUMBER',
              description: 'Authorized share capital in Indian Rupees (INR)'
            },
            directors: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'Names of the first directors'
            }
          },
          required: ['company_name']
        }
      },
      {
        name: 'get_company_directors',
        description: 'Get list of active and former directors for the company.',
        parameters: {
          type: 'OBJECT',
          properties: {
            company_name: { type: 'STRING', description: 'Name or CIN of the company' }
          }
        }
      },
      {
        name: 'get_company_profile',
        description: 'Get the full profile, registration, capital, and status of a company.',
        parameters: {
          type: 'OBJECT',
          properties: {
            company_name: { type: 'STRING', description: 'Name or CIN of the company' }
          }
        }
      },
      {
        name: 'get_compliance_status',
        description: 'Check upcoming and overdue statutory MCA compliance deadlines and filings.',
        parameters: {
          type: 'OBJECT',
          properties: {
            company_name: { type: 'STRING', description: 'Name or CIN of the company' }
          }
        }
      },
      {
        name: 'process_director_resignation',
        description: 'Record a director resignation and prepare/file the statutory DIR-12 filing.',
        parameters: {
          type: 'OBJECT',
          properties: {
            director_name: { type: 'STRING', description: 'Full name of the resigning director' },
            effective_date: { type: 'STRING', description: 'Effective date of resignation' },
            company_name: { type: 'STRING', description: 'Company from which the director resigned' }
          },
          required: ['director_name']
        }
      },
      {
        name: 'add_director',
        description: 'Appoint and add a new director to a company board with instant DIN generation.',
        parameters: {
          type: 'OBJECT',
          properties: {
            director_name: { type: 'STRING', description: 'Full name of the new director' },
            company_name: { type: 'STRING', description: 'Name or CIN of the company' }
          },
          required: ['director_name']
        }
      }
    ]
  }
];

export async function POST(request: NextRequest) {
  try {
    const { message, context = {} } = await request.json();
    const rawText = (message || '').trim();
    if (!rawText) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    // Resolve active company from context or DB
    let targetCin = context.cin || '';
    let activeCompany = targetCin ? await CompanyService.getCompanyByCin(targetCin).catch(() => null) : null;
    if (!activeCompany) {
      const all = await CompanyService.listCompanies(context.workspaceId).catch(() => []);
      if (all.length > 0) {
        activeCompany = all[0];
        targetCin = activeCompany.cin;
      }
    }
    const activeCompanyName = activeCompany?.name || context.companyName || '';
    const activeCompanyCin = activeCompany?.cin || targetCin || '';

    // System prompt providing context to Gemini
    const systemPrompt = `You are Founders AI, an autonomous corporate intelligence copilot for the Future MCA portal.
Current user context:
- Active Company: ${activeCompanyName || 'None registered yet'}
- CIN: ${activeCompanyCin || 'N/A'}
- Workspace: ${context.workspaceId || 'Default Workspace'}

Your role is to help founders, business owners, and CAs interact with Indian MCA corporate filings seamlessly.
When the user wants to take an action (such as creating/starting a company, adding a director, resigning a director, or checking records), call the appropriate tool.
If the user provides parameters like capital, state, or company name, extract them accurately into the tool arguments.
Always maintain a helpful, professional tone.`;

    const geminiPayload = [
      {
        role: 'user',
        parts: [
          { text: `${systemPrompt}\n\nUser request: "${rawText}"` }
        ]
      }
    ];

    // Call Gemini with tools
    const geminiResponse = await callGemini(geminiPayload, GEMINI_TOOLS);

    if (geminiResponse?.candidates?.[0]?.content?.parts) {
      const parts = geminiResponse.candidates[0].content.parts;
      const functionCallPart = parts.find((p: any) => p.functionCall);

      if (functionCallPart && functionCallPart.functionCall) {
        const { name: funcName, args: funcArgs = {} } = functionCallPart.functionCall;

        // 1. CREATE COMPANY
        if (funcName === 'create_company') {
          const compName = funcArgs.company_name || rawText.replace(/create an? company called?/i, '').trim();
          const compType = funcArgs.company_type || 'Private Limited Company';
          const regOffice = funcArgs.registered_office || 'Tamil Nadu, India';
          const cap = funcArgs.authorized_capital || 100000;
          const dirs = Array.isArray(funcArgs.directors) && funcArgs.directors.length > 0
            ? funcArgs.directors
            : ['Promoter Director 1', 'Promoter Director 2'];

          const result = await executeMcpTool('create_company', {
            company_name: compName,
            company_type: compType,
            registered_office: regOffice,
            authorized_capital: cap,
            directors: dirs.map((name: string) => ({ full_name: name, designation: 'Director' }))
          }, { workspaceId: context.workspaceId, userId: context.userId });

          const createdCin = result?.company?.cin || 'Assigned';
          const capitalFormatted = typeof cap === 'number' ? `₹${cap.toLocaleString('en-IN')}` : `₹${cap}`;

          return NextResponse.json({
            type: 'action_executed',
            workflow_type: 'COMPANY_INCORPORATION',
            text: `Done! **${compName}** has been incorporated and registered in Future MCA.\n\n• **CIN**: \`${createdCin}\`\n• **Type**: ${compType}\n• **Authorised Capital**: ${capitalFormatted}\n• **Registered Office**: ${regOffice}\n• **Directors**: ${dirs.join(', ')}\n\nThe company has been added to your portfolio and is now visible on your dashboard.`,
            tools_used: ['gemini_api', 'create_company']
          });
        }

        // 2. GET COMPANY DIRECTORS
        if (funcName === 'get_company_directors') {
          const cinToUse = activeCompanyCin;
          if (!cinToUse) {
            return NextResponse.json({
              type: 'chat_response',
              text: 'No active company found in your workspace yet. You can ask me to "create a company" to get started.',
              tools_used: ['gemini_api']
            });
          }
          const res = await executeMcpTool('get_company_directors', { cin: cinToUse }, { workspaceId: context.workspaceId });
          const active = res.active_directors || [];
          const former = res.former_directors || [];
          let text = '';
          if (active.length === 0 && former.length === 0) {
            text = `No directors currently registered for **${res.company || activeCompanyName}**.`;
          } else if (former.length > 0) {
            text = `**ACTIVE DIRECTORS**\n\n${active.map((d: any) => `• **${d.name}** (DIN: ${d.din}) — ${d.status}`).join('\n')}\n\n**FORMER DIRECTORS**\n\n${former.map((d: any) => `• **${d.name}** — ${d.status} (Effective: ${d.effective_date})`).join('\n')}`;
          } else {
            text = `**Active Directors for ${res.company || activeCompanyName}**:\n\n${active.map((d: any) => `• **${d.name}** (DIN: ${d.din}) — ${d.status}`).join('\n')}`;
          }
          return NextResponse.json({
            type: 'directors_list',
            text,
            tools_used: ['gemini_api', 'get_company_directors']
          });
        }

        // 3. GET COMPANY PROFILE
        if (funcName === 'get_company_profile') {
          const cinToUse = activeCompanyCin;
          if (!cinToUse) {
            return NextResponse.json({
              type: 'chat_response',
              text: 'No registered company found in this workspace. Ask me to create a company to begin.',
              tools_used: ['gemini_api']
            });
          }
          const profile = await executeMcpTool('get_company_profile', { cin: cinToUse }, { workspaceId: context.workspaceId });
          const comp = profile?.company;
          if (!comp) {
            return NextResponse.json({
              type: 'chat_response',
              text: 'Could not retrieve company profile at this time.',
              tools_used: ['gemini_api']
            });
          }
          return NextResponse.json({
            type: 'company_profile',
            text: `**Company Profile: ${comp.name}**\n\n• **CIN**: \`${comp.cin}\`\n• **Type**: ${comp.company_type}\n• **Status**: ${comp.status}\n• **Authorised Capital**: ${comp.authorized_capital}\n• **Registered Office**: ${comp.registered_office}\n• **Directors**: ${comp.directors?.length ? comp.directors.map((d: any) => d.name).join(', ') : 'None listed'}\n• **Compliance**: ${comp.compliance_status}`,
            tools_used: ['gemini_api', 'get_company_profile']
          });
        }

        // 4. GET COMPLIANCE STATUS
        if (funcName === 'get_compliance_status') {
          const cinToUse = activeCompanyCin;
          if (!cinToUse) {
            return NextResponse.json({
              type: 'compliance_deadlines',
              text: 'No active company selected. You have no pending compliance deadlines.',
              tools_used: ['gemini_api']
            });
          }
          const status = await executeMcpTool('get_compliance_status', { cin: cinToUse }, { workspaceId: context.workspaceId });
          const deadlines = status.deadlines || [];
          const listText = deadlines.length > 0 
            ? deadlines.map((d: any) => `• **${d.title}** (${d.form_code}) — Status: **${d.status}** | Due: ${d.due_date}`).join('\n')
            : 'All statutory MCA filings are currently up to date.';
          return NextResponse.json({
            type: 'compliance_deadlines',
            text: `**Compliance Status for ${activeCompanyName || 'your company'}**:\n\n${listText}`,
            tools_used: ['gemini_api', 'get_compliance_status']
          });
        }

        // 5. PROCESS DIRECTOR RESIGNATION
        if (funcName === 'process_director_resignation') {
          const dirName = funcArgs.director_name || 'Director';
          const effDate = funcArgs.effective_date || new Date().toISOString().split('T')[0];
          const res = await executeMcpTool('process_director_resignation', {
            company_name: activeCompanyName,
            cin: activeCompanyCin,
            director_name: dirName,
            effective_date: effDate
          }, { workspaceId: context.workspaceId, userId: context.userId });

          return NextResponse.json({
            type: 'action_executed',
            workflow_type: 'DIRECTOR_RESIGNATION',
            text: `Done. **${dirName}**'s resignation from **${activeCompanyName || 'your company'}** has been recorded.\n\n• **Relevant Filing**: Form DIR-12\n• **Effective Date**: ${effDate}\n• **Reference SRN**: \`${res?.filing?.srn || 'Generated'}\`\n\nCompany records have been updated in the portal.`,
            tools_used: ['gemini_api', 'process_director_resignation']
          });
        }

        // 6. ADD DIRECTOR
        if (funcName === 'add_director') {
          const dirName = funcArgs.director_name || 'New Director';
          const genDin = `09${Math.floor(100000 + Math.random() * 900000)}`;
          const added = await CompanyService.addDirector(activeCompanyCin || 'comp_new', {
            full_name: dirName,
            din: genDin,
            designation: 'Director',
            appointment_date: new Date().toISOString().split('T')[0]
          });

          return NextResponse.json({
            type: 'action_executed',
            workflow_type: 'DIRECTOR_APPOINTMENT',
            text: `Successfully appointed **${dirName}** as Director to **${activeCompanyName || 'the board'}**.\n\n• **Assigned DIN**: \`${genDin}\`\n• **Status**: APPROVED\n• **DSC Status**: ACTIVE`,
            tools_used: ['gemini_api', 'add_director']
          });
        }
      }

      // If Gemini returned a direct text response
      const textPart = parts.find((p: any) => p.text);
      if (textPart && textPart.text) {
        return NextResponse.json({
          type: 'chat_response',
          text: textPart.text,
          tools_used: ['gemini_api']
        });
      }
    }

    // Fallback if Gemini did not respond
    return NextResponse.json({
      type: 'chat_response',
      text: `I'm Founders AI, your corporate copilot for **${activeCompanyName || 'MCA operations'}**. I can help you incorporate companies, add or resign directors, and check statutory filings. What would you like to do?`,
      tools_used: ['fallback']
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal AI service error' },
      { status: 500 }
    );
  }
}
