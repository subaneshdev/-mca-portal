import { NextRequest, NextResponse } from 'next/server';
import { DiagnosticService } from '@/lib/services/diagnosticService';
import { FilingService } from '@/lib/services/filingService';
import { ComplianceService } from '@/lib/services/complianceService';
import { ActionService } from '@/lib/services/actionService';

export const runtime = 'nodejs';

async function callGemini(prompt: string, contextPrompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are Future MCA Autonomous Copilot, an expert AI assistant on Indian Corporate Law (Companies Act 2013, LLP Act 2008, MCA V3 portal forms, RoC filings, Secretarial Standards, Board Governance, and the MCP Post-Action Protocol).

Active Company Context:
${contextPrompt}

User Question / Command:
"${prompt}"

Instructions:
1. Provide accurate, professional, well-formatted markdown answers.
2. Cite relevant statutory sections (e.g. Section 168, Section 137, Rule 12A), required MCA e-Forms (DIR-12, AOC-4, MGT-7, SPICe+), and strict deadline timelines.
3. If the user asks to prepare or file an action, explain that you have prepared the action draft in Future MCA, but it requires explicit user confirmation and secure DSC signature authorization before submission.
4. Keep the tone helpful, sharp, and authoritative.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024
        }
      })
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, context = {} } = await request.json();
    const query = (message || '').trim().toLowerCase();
    const activeCompany = context.companyName || 'Future Labs Private Limited';
    const activeCin = context.cin || 'U72900KA2022PTC158942';

    const contextPrompt = `
- Company Name: ${activeCompany}
- CIN: ${activeCin}
- Workspace Role: Founder / Corporate Officer
    `.trim();

    // 1. Director Resignation / Cessation Post-Action Flow
    if (query.includes('resig') || query.includes('director resign') || query.includes('cessation') || query.includes('dir-12') || query.includes('remove director')) {
      const preparedAction = await ActionService.prepareDirectorChange({
        company_id_or_cin: activeCin,
        change_type: 'RESIGNATION',
        director_name: 'Ananya Sharma',
        din: '08947219',
        effective_date: new Date().toISOString().split('T')[0],
        reason: 'Personal commitments and advisory focus'
      }, {
        workspaceId: context.workspaceId,
        actorType: 'AI_CLIENT',
        clientName: 'Future MCA Copilot',
        clientType: 'In-App AI Assistant'
      });

      return NextResponse.json({
        type: 'action_prepared',
        action_id: preparedAction.id,
        text: `### 📋 Form DIR-12 Action Draft Prepared\n\nUnder **Section 168 of the Companies Act 2013**, I have identified that **Form DIR-12 (Director Cessation)** is required for **${activeCompany}**.\n\n#### **Action Summary & Preview**\n- **Target Entity:** ${activeCompany} (${activeCin})\n- **Director:** Ananya Sharma (DIN: 08947219)\n- **Statutory Window:** 30 days from effective date\n- **Mandatory Attachments:** Resignation Letter, Board Resolution noting resignation\n\n⚠️ **Zero Silent Execution Policy:** This action has **NOT** been submitted yet. Please review and provide explicit confirmation to proceed to Digital Signature (DSC) authorization.`,
        action: {
          label: 'Review & Authorize Action (DIR-12)',
          url: `/actions/${preparedAction.id}`
        },
        tools_used: ['identify_required_filing', 'prepare_director_change']
      });
    }

    // 2. Registered Office Change Post-Action Flow
    if (query.includes('change address') || query.includes('office shift') || query.includes('relocat') || query.includes('inc-22')) {
      const preparedAction = await ActionService.prepareRegisteredOfficeChange({
        company_id_or_cin: activeCin,
        new_address_line1: '9th Floor, Brigade Tech Park',
        new_address_line2: 'Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560066',
        effective_date: new Date().toISOString().split('T')[0]
      }, {
        workspaceId: context.workspaceId,
        actorType: 'AI_CLIENT',
        clientName: 'Future MCA Copilot',
        clientType: 'In-App AI Assistant'
      });

      return NextResponse.json({
        type: 'action_prepared',
        action_id: preparedAction.id,
        text: `### 🏢 Form INC-22 Registered Office Shift Prepared\n\nUnder **Section 12 of the Companies Act 2013**, I have prepared the **INC-22 Address Change Envelope** for **${activeCompany}**.\n\n#### **Action Summary & Preview**\n- **New Address:** 9th Floor, Brigade Tech Park, Whitefield, Bengaluru, Karnataka - 560066\n- **Statutory Window:** Within 30 days of relocation\n- **Mandatory Attachments:** Utility Bill (< 2 months), Lease Agreement, Owner NOC\n\n⚠️ **Zero Silent Execution Policy:** This action has **NOT** been submitted. Please review the draft and authorize via DSC.`,
        action: {
          label: 'Review & Authorize Action (INC-22)',
          url: `/actions/${preparedAction.id}`
        },
        tools_used: ['prepare_registered_office_change', 'validate_pincode']
      });
    }

    // 3. Incorporation Guided Workflow
    if (query.includes('start a company') || query.includes('incorporat') || query.includes('register a new company') || query.includes('form a pvt ltd')) {
      const preparedAction = await ActionService.prepareCompanyRegistration({
        proposed_names: ['Future Nexa Technologies Private Limited', 'NexaFlow Systems Private Limited'],
        company_type: 'PVT_LTD',
        registered_state: 'Karnataka',
        authorized_capital: 1000000,
        paid_up_capital: 100000,
        directors: [
          { full_name: 'Subanesh R', email: 'subanesh@futuremca.gov.in' },
          { full_name: 'Co-Founder Name', email: 'cofounder@futuremca.gov.in' }
        ]
      }, {
        workspaceId: context.workspaceId,
        actorType: 'AI_CLIENT',
        clientName: 'Future MCA Copilot',
        clientType: 'In-App AI Assistant'
      });

      return NextResponse.json({
        type: 'incorporation_wizard',
        action_id: preparedAction.id,
        text: `### 🚀 SPICe+ Company Incorporation Pack Prepared\n\nUnder **Section 7 of the Companies Act 2013**, I have prepared the incorporation draft for **Future Nexa Technologies Private Limited**.\n\n- **Structure:** Private Limited Company\n- **Authorized Capital:** INR 10,00,000\n- **Subscribers / Directors:** 2 founding promoters\n- **Draft e-Forms:** SPICe+ Part A/B, INC-33 (e-MOA), INC-34 (e-AOA), AGILE-PRO-S\n\n⚠️ **Confirmation Required:** Please inspect the name reservation and subscriber details to authorize.`,
        action: {
          label: 'Review Incorporation Action',
          url: `/actions/${preparedAction.id}`
        },
        tools_used: ['prepare_company_registration', 'name_reservation_run']
      });
    }

    // 4. Call Google Gemini with real MCA context
    const geminiResponse = await callGemini(message, contextPrompt);

    if (geminiResponse) {
      let action = {
        label: 'Open Overview Dashboard',
        url: '/overview'
      };

      if (query.includes('error') || query.includes('fail') || query.includes('dsc') || query.includes('reject') || query.includes('reconcil')) {
        action = { label: 'Open Error Diagnostics Hub', url: '/diagnostics' };
      } else if (query.includes('action') || query.includes('approve') || query.includes('pending')) {
        action = { label: 'Open Actions & Approvals Hub', url: '/actions' };
      } else if (query.includes('due') || query.includes('compliance') || query.includes('deadline') || query.includes('penalty')) {
        action = { label: 'View Statutory Compliance Calendar', url: '/compliance' };
      } else if (query.includes('filing') || query.includes('form') || query.includes('aoc-4') || query.includes('mgt-7')) {
        action = { label: 'Open e-Forms & Filing Hub', url: '/filings' };
      } else if (query.includes('mcp') || query.includes('ai') || query.includes('claude') || query.includes('cursor')) {
        action = { label: 'Connect AI via MCP', url: '/connect-ai' };
      } else if (query.includes('srn') || query.includes('status') || query.includes('track') || query.includes('approval')) {
        action = { label: 'Track Application Status', url: '/applications' };
      }

      return NextResponse.json({
        type: 'gemini_intelligence',
        text: geminiResponse,
        action,
        tools_used: ['gemini-3.6-flash', 'mcp_post_action_protocol', 'companies_act_2013_engine']
      });
    }

    // 5. Fallback heuristic responses if Gemini API is unreachable
    if (query.includes('error') || query.includes('fail') || query.includes('reject') || query.includes('dsc')) {
      const diag = DiagnosticService.diagnose(query);
      return NextResponse.json({
        type: 'diagnosis',
        text: `### 🔍 Diagnostic Analysis\n\n**Finding:** ${diag.analysis}\n\n**Confidence:** ${Math.round(diag.confidence * 100)}%\n\n#### Recommended Resolution Steps:\n${diag.suggestedActions.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}`,
        action: {
          label: 'Open Error Diagnostics Hub',
          url: '/diagnostics'
        },
        tools_used: ['diagnose_filing_error', 'search_mca_knowledge']
      });
    }

    return NextResponse.json({
      type: 'general',
      text: `Future MCA is analyzing your inquiry: *"I want to check ${message}"*.\n\nAs your authorized corporate copilot for **${activeCompany}**, I can assist with:\n• **Post-Action Preparation:** DIR-12, INC-22, SPICe+, AOC-4, MGT-7\n• **Zero Silent Execution Review:** Explicit human confirmations & DSC authorization\n• **MCA V3 Portal Diagnostics:** DSC token errors, payment reconciliation, DIN KYC\n• **Model Context Protocol (MCP):** Connect Claude Desktop, Cursor, and AI agents`,
      action: {
        label: 'View Actions & Approvals',
        url: '/actions'
      },
      tools_used: ['get_company_profile', 'get_compliance_status']
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI request failed' }, { status: 500 });
  }
}
