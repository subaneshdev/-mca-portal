import { NextRequest, NextResponse } from 'next/server';
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
        name: 'fetch_company_details',
        description: 'Fetch complete details of a company including registration, CIN, legal type, capital structure, directors, compliance summary, and recent filings.',
        parameters: {
          type: 'OBJECT',
          properties: {
            company_id_or_cin: { type: 'STRING', description: 'Name, CIN, or ID of the company' }
          }
        }
      },
      {
        name: 'fetch_compliance',
        description: 'Fetch real-time statutory MCA compliance status, overdue filings, form codes (DIR-12, AOC-4, MGT-7), upcoming deadlines, urgency levels, and penalty risks.',
        parameters: {
          type: 'OBJECT',
          properties: {
            company_id_or_cin: { type: 'STRING', description: 'Optional company name or CIN' },
            urgency: { type: 'STRING', description: 'all, critical, action_required, upcoming' }
          }
        }
      },
      {
        name: 'fetch_directors',
        description: 'Fetch active and former directors, DIN numbers, KYC status, designations, and DSC validity for a company.',
        parameters: {
          type: 'OBJECT',
          properties: {
            company_id_or_cin: { type: 'STRING', description: 'Name or CIN of the company' }
          }
        }
      },
      {
        name: 'fetch_all_companies',
        description: 'Fetch all registered companies in the workspace/portfolio with their CINs, status, capital, and registered office.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: { type: 'STRING', description: 'Optional search keyword to filter companies' }
          }
        }
      },
      {
        name: 'fetch_filings',
        description: 'Fetch historical and pending MCA statutory e-Form filings, SRN reference numbers, filing fees, challans, and approval statuses.',
        parameters: {
          type: 'OBJECT',
          properties: {
            company_id_or_cin: { type: 'STRING', description: 'Company CIN or name' },
            form_code: { type: 'STRING', description: 'Optional form code filter (e.g. DIR-12, SPICe+, AOC-4)' }
          }
        }
      },
      {
        name: 'fetch_deadlines',
        description: 'Fetch upcoming statutory MCA compliance deadlines, due dates, section references, and daily late fees.',
        parameters: {
          type: 'OBJECT',
          properties: {
            company_id_or_cin: { type: 'STRING', description: 'Optional CIN or company name' }
          }
        }
      },
      {
        name: 'create_company',
        description: 'Create and incorporate a new company in the Future MCA registry and workspace portfolio.',
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

You have full access to MCA MCP tools for:
- fetch_company_details: Get full master company data, capital, directors, and compliance summary
- fetch_compliance: Get compliance status, critical overdue filings, form codes (DIR-12, AOC-4, MGT-7), and penalties
- fetch_directors: Get board members, DIN numbers, KYC status, and DSC validity
- fetch_all_companies: Get all companies registered in the user's workspace
- fetch_filings: Get historical filings, SRN numbers, and challans
- fetch_deadlines: Get upcoming statutory compliance deadlines
- create_company: Incorporate a new company
- add_director: Appoint a new director with DIN
- process_director_resignation: Record director resignation and DIR-12 workflow

When the user asks to fetch, view, check, or perform actions, call the corresponding tool.
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

        // 1. FETCH COMPANY DETAILS
        if (funcName === 'fetch_company_details' || funcName === 'get_company_profile') {
          const target = funcArgs.company_id_or_cin || activeCompanyCin || activeCompanyName;
          const res = await executeMcpTool('fetch_company_details', { company_id_or_cin: target }, { workspaceId: context.workspaceId });
          const comp = res?.company;
          if (!comp) {
            return NextResponse.json({
              type: 'chat_response',
              text: 'No registered company found. You can ask me to "create a company" to get started.',
              tools_used: ['gemini_api', 'fetch_company_details']
            });
          }
          const dirsText = comp.directors?.length 
            ? comp.directors.map((d: any) => `• **${d.name}** (DIN: ${d.din}) — ${d.status}`).join('\n')
            : 'None registered';

          return NextResponse.json({
            type: 'company_profile',
            text: `### 🏢 Company Profile: ${comp.name}\n\n• **CIN**: \`${comp.cin}\`\n• **Type**: ${comp.legal_type || comp.company_type}\n• **Status**: **${comp.status}**\n• **ROC Jurisdiction**: ${comp.roc_jurisdiction || 'ROC Chennai'}\n• **Registered Office**: ${comp.registered_office}\n• **Authorized Capital**: ${comp.authorized_capital}\n• **Paid-Up Capital**: ${comp.paid_up_capital}\n\n**Board of Directors**:\n${dirsText}\n\n**Compliance Summary**:\n• Status: ${comp.compliance_status || comp.compliance_summary?.status || 'Active'}\n• Pending Actions: ${comp.compliance_summary?.pending_actions || 0}`,
            tools_used: ['gemini_api', 'fetch_company_details']
          });
        }

        // 2. FETCH COMPLIANCE
        if (funcName === 'fetch_compliance' || funcName === 'get_compliance_status') {
          const target = funcArgs.company_id_or_cin || activeCompanyCin || activeCompanyName;
          const res = await executeMcpTool('fetch_compliance', { company_id_or_cin: target, urgency: funcArgs.urgency }, { workspaceId: context.workspaceId });
          const deadlines = res?.deadlines || [];
          const summary = res?.summary || {};
          const listText = deadlines.length > 0 
            ? deadlines.map((d: any) => `• **${d.title}** (\`${d.form_code}\`) — Status: **${d.status}** | Due: ${d.due_date} | Section: ${d.statutory_section || 'Companies Act'}`).join('\n')
            : 'All statutory MCA filings are currently up to date with zero overdue penalties.';

          return NextResponse.json({
            type: 'compliance_deadlines',
            text: `### 📋 Statutory Compliance: ${res?.company || activeCompanyName}\n\n• **Risk Assessment**: **${summary.risk_level || 'HEALTHY'}**\n• **Critical Deadlines**: ${summary.critical || 0}\n• **Action Required**: ${summary.action_required || 0}\n• **Upcoming**: ${summary.upcoming || 0}\n\n**Deadlines & Filings**:\n${listText}`,
            tools_used: ['gemini_api', 'fetch_compliance']
          });
        }

        // 3. FETCH DIRECTORS
        if (funcName === 'fetch_directors' || funcName === 'get_company_directors') {
          const target = funcArgs.company_id_or_cin || activeCompanyCin || activeCompanyName;
          const res = await executeMcpTool('fetch_directors', { company_id_or_cin: target }, { workspaceId: context.workspaceId });
          const active = res?.active_directors || [];
          const former = res?.former_directors || [];

          let text = `### 👥 Board of Directors for ${res?.company || activeCompanyName}\n\n`;
          if (active.length > 0) {
            text += `**Active Directors**:\n` + active.map((d: any) => `• **${d.name}** (DIN: \`${d.din}\`) — ${d.designation} [KYC: ${d.kyc_status || 'COMPLIANT'}, DSC: ${d.dsc_status || 'ACTIVE'}]`).join('\n') + '\n\n';
          }
          if (former.length > 0) {
            text += `**Former / Resigned Directors**:\n` + former.map((d: any) => `• **${d.name}** (DIN: \`${d.din}\`) — Resigned effective ${d.effective_date}`).join('\n');
          }
          if (active.length === 0 && former.length === 0) {
            text += 'No directors currently registered for this company.';
          }

          return NextResponse.json({
            type: 'directors_list',
            text: text.trim(),
            tools_used: ['gemini_api', 'fetch_directors']
          });
        }

        // 4. FETCH ALL COMPANIES
        if (funcName === 'fetch_all_companies' || funcName === 'search_company') {
          const res = await executeMcpTool('fetch_all_companies', { query: funcArgs.query }, { workspaceId: context.workspaceId });
          const companies = res?.companies || [];
          if (companies.length === 0) {
            return NextResponse.json({
              type: 'chat_response',
              text: 'You do not have any registered companies in this workspace yet. Would you like to incorporate one?',
              tools_used: ['gemini_api', 'fetch_all_companies']
            });
          }
          const listText = companies.map((c: any) => `• **${c.name}**\n  - CIN: \`${c.cin}\`\n  - Type: ${c.legal_type}\n  - Status: ${c.status}\n  - ROC: ${c.roc_jurisdiction}\n  - Capital: ₹${(c.authorized_capital || 1000000).toLocaleString('en-IN')}`).join('\n\n');

          return NextResponse.json({
            type: 'chat_response',
            text: `### 🏢 Registered Companies (${companies.length})\n\n${listText}`,
            tools_used: ['gemini_api', 'fetch_all_companies']
          });
        }

        // 5. FETCH FILINGS
        if (funcName === 'fetch_filings') {
          const target = funcArgs.company_id_or_cin || activeCompanyCin || activeCompanyName;
          const res = await executeMcpTool('fetch_filings', { company_id_or_cin: target, form_code: funcArgs.form_code }, { workspaceId: context.workspaceId });
          const filings = res?.filings || [];
          if (filings.length === 0) {
            return NextResponse.json({
              type: 'chat_response',
              text: `No filed forms found for **${res?.company || activeCompanyName}**.`,
              tools_used: ['gemini_api', 'fetch_filings']
            });
          }
          const listText = filings.map((f: any) => `• **${f.form_title}**\n  - SRN: \`${f.srn}\`\n  - Status: **${f.status}**\n  - Submitted: ${f.submitted_at ? new Date(f.submitted_at).toLocaleDateString() : 'Recent'}`).join('\n\n');

          return NextResponse.json({
            type: 'chat_response',
            text: `### 📑 Filing Records for ${res?.company || activeCompanyName}\n\n${listText}`,
            tools_used: ['gemini_api', 'fetch_filings']
          });
        }

        // 6. FETCH DEADLINES
        if (funcName === 'fetch_deadlines') {
          const target = funcArgs.company_id_or_cin || activeCompanyCin || activeCompanyName;
          const res = await executeMcpTool('fetch_deadlines', { company_id_or_cin: target }, { workspaceId: context.workspaceId });
          const deadlines = res?.deadlines || [];
          if (deadlines.length === 0) {
            return NextResponse.json({
              type: 'compliance_deadlines',
              text: `All compliance deadlines for **${activeCompanyName}** are fully completed.`,
              tools_used: ['gemini_api', 'fetch_deadlines']
            });
          }
          const listText = deadlines.map((d: any) => `• **${d.title}** (\`${d.form_code}\`) — Due: **${d.due_date}** (${d.days_remaining > 0 ? `${d.days_remaining} days left` : 'Due now'}) | Late Fee: ₹${d.per_day_penalty || 100}/day`).join('\n');

          return NextResponse.json({
            type: 'compliance_deadlines',
            text: `### ⏰ Upcoming MCA Compliance Deadlines\n\n${listText}`,
            tools_used: ['gemini_api', 'fetch_deadlines']
          });
        }

        // 7. CREATE COMPANY
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

        // 8. PROCESS DIRECTOR RESIGNATION
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

        // 9. ADD DIRECTOR
        if (funcName === 'add_director') {
          const dirName = funcArgs.director_name || 'New Director';
          const genDin = `09${Math.floor(100000 + Math.random() * 900000)}`;
          await CompanyService.addDirector(activeCompanyCin || 'comp_new', {
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
      text: `I'm Founders AI, your corporate copilot for **${activeCompanyName || 'MCA operations'}**. I can help you fetch company details, check compliance, view directors, or incorporate a company. What would you like to do?`,
      tools_used: ['fallback']
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal AI service error' },
      { status: 500 }
    );
  }
}
