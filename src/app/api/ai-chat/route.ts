import { NextRequest, NextResponse } from 'next/server';
import { DiagnosticService } from '@/lib/services/diagnosticService';
import { FilingService } from '@/lib/services/filingService';
import { ComplianceService } from '@/lib/services/complianceService';

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
                text: `You are Future MCA Autonomous Copilot, an expert AI assistant on Indian Corporate Law (Companies Act 2013, LLP Act 2008, MCA V3 portal forms, RoC filings, Secretarial Standards, and Board Governance).

Active Company Context:
${contextPrompt}

User Question / Command:
"${prompt}"

Instructions:
1. Provide accurate, professional, well-formatted markdown answers.
2. Cite relevant statutory sections (e.g. Section 168, Section 137, Rule 12A), required MCA e-Forms (DIR-12, AOC-4, MGT-7, SPICe+), and strict deadline timelines.
3. Give practical, step-by-step guidance that founders and compliance officers can execute immediately.
4. Keep the tone helpful, sharp, and authoritative without unnecessary fluff.`
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
      console.warn('Gemini API responded with status:', res.status);
      return null;
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || null;
  } catch (err) {
    console.error('Gemini generation error:', err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, context = {} } = await request.json();
    const query = (message || '').trim().toLowerCase();
    const activeCompany = context.companyName || 'Your Active Company';
    const activeCin = context.cin || '';

    const contextPrompt = `
- Company Name: ${activeCompany}
- CIN: ${activeCin || 'Not Registered / In Formation'}
- Workspace Role: Founder / Corporate Officer
    `.trim();

    // 1. Check if it's an in-chat interactive wizard intent
    if (query.includes('start a company') || query.includes('incorporat') || query.includes('register a new company') || query.includes('form a pvt ltd')) {
      return NextResponse.json({
        type: 'incorporation_wizard',
        text: `### 🚀 Guided Incorporation: SPICe+ Workflow\n\nI can guide you through incorporating **Private Limited**, **LLP**, or **One Person Company (OPC)** under the Companies Act 2013.\n\nLet's configure your proposed company details below:`,
        action: {
          label: 'Launch SPICe+ e-Form',
          url: '/filings/new?intent=incorporation'
        },
        tools_used: ['SPICe_plus_wizard', 'name_reservation_run']
      });
    }

    if (query.includes('resig') || query.includes('director resign') || query.includes('cessation') || query.includes('dir-12') || query.includes('remove director')) {
      return NextResponse.json({
        type: 'resignation_wizard',
        text: `### 📋 Director Resignation: Form DIR-12 Workflow\n\nUnder **Section 168 of the Companies Act 2013**, when a director resigns:\n1. The resigning director must submit a formal written notice of resignation.\n2. The Board must note the resignation via Board Resolution.\n3. The company must file **Form DIR-12** with the Registrar of Companies (RoC) within **30 days**.\n\nPlease select the details to generate the filing pack:`,
        action: {
          label: 'Open Form DIR-12 Workspace',
          url: '/filings/new?form=DIR-12'
        },
        tools_used: ['identify_required_filing', 'validate_board_quorum']
      });
    }

    // 2. Call Google Gemini with real MCA context
    const geminiResponse = await callGemini(message, contextPrompt);

    if (geminiResponse) {
      // Determine relevant quick action button based on topic
      let action = {
        label: 'Open Overview Dashboard',
        url: '/overview'
      };

      if (query.includes('error') || query.includes('fail') || query.includes('dsc') || query.includes('reject') || query.includes('reconcil')) {
        action = { label: 'Open Error Diagnostics Hub', url: '/diagnostics' };
      } else if (query.includes('due') || query.includes('compliance') || query.includes('deadline') || query.includes('penalty')) {
        action = { label: 'View Statutory Compliance Calendar', url: '/compliance' };
      } else if (query.includes('filing') || query.includes('form') || query.includes('aoc-4') || query.includes('mgt-7') || query.includes('dir-12')) {
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
        tools_used: ['gemini-3.6-flash', 'companies_act_2013_engine', 'mca_v3_knowledge']
      });
    }

    // 3. Fallback heuristic responses if Gemini API is unreachable
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

    if (query.includes('attention') || query.includes('due') || query.includes('compliance') || query.includes('deadline')) {
      const deadlines = await ComplianceService.getUpcomingDeadlines(activeCin);
      const critical = deadlines.filter(d => d.urgency === 'critical' || d.urgency === 'action_required');
      const itemsList = critical.map(c => `• **${c.form_code} (${c.title})** — Due **${c.due_date}** (${c.urgency.toUpperCase()})\n  _${c.description}_`).join('\n\n');

      return NextResponse.json({
        type: 'compliance_summary',
        text: `### ⚠️ Statutory Obligations Requiring Attention\n\n${itemsList || 'All compliance filings are current with no pending defaults.'}\n\n**Statutory Rules:** AOC-4 is due within 30 days of AGM under Section 137. Annual Return (MGT-7/7A) is due within 60 days under Section 92.`,
        action: {
          label: 'View Compliance Schedule',
          url: '/compliance'
        },
        tools_used: ['get_compliance_status', 'get_upcoming_deadlines']
      });
    }

    return NextResponse.json({
      type: 'general',
      text: `Future MCA is analyzing your inquiry: *"I want to check ${message}"*.\n\nAs your authorized corporate copilot for **${activeCompany}**, I can assist with:\n• Statutory filing roadmaps (SPICe+, DIR-12, AOC-4, MGT-7, INC-22)\n• MCA V3 portal error resolution & DSC token signing\n• Annual board compliance deadlines and penalty exposure\n• Model Context Protocol (MCP) agent connection`,
      action: {
        label: 'View Overview Dashboard',
        url: '/overview'
      },
      tools_used: ['get_company_profile', 'get_compliance_status']
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI request failed' }, { status: 500 });
  }
}
