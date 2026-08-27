import { NextRequest, NextResponse } from 'next/server';
import { executeMcpTool } from '@/lib/mcp/tools';
import { DiagnosticService } from '@/lib/services/diagnosticService';
import { FilingService } from '@/lib/services/filingService';
import { ComplianceService } from '@/lib/services/complianceService';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { message, context = {} } = await request.json();
    const query = (message || '').trim().toLowerCase();
    const activeCompany = context.companyName || 'Ziggers Technologies Pvt Ltd';
    const activeCin = context.cin || 'U72900KA2021PTC145892';

    // 1. Check if it's an error diagnosis question
    if (query.includes('error') || query.includes('fail') || query.includes('reject') || query.includes('dsc') || query.includes('reconcil')) {
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

    // 2. Application Tracking / Delay Inquiry
    if (query.includes('application') || query.includes('srn') || query.includes('status') || query.includes('delay') || query.includes('approval')) {
      return NextResponse.json({
        type: 'general',
        text: `### 🔎 Application Status for **${activeCompany}**\n\n• **SRN:** \`F98234129\` (Form RUN Name Reservation)\n• **Current Stage:** Under Scrutiny at Central Registration Centre (CRC)\n• **Filing Date:** 24 Aug 2026\n• **Estimated Turnaround:** 24 to 48 working hours\n\nNo resubmission notices have been issued by the examining RoC officer.`,
        action: {
          label: 'Track All SRN Applications',
          url: '/applications'
        },
        tools_used: ['get_application_status']
      });
    }

    // 3. Check if it's an intent-based corporate event
    if (query.includes('resig') || query.includes('add director') || query.includes('appoint') || query.includes('address') || query.includes('share') || query.includes('allot') || query.includes('what changed')) {
      const match = FilingService.matchIntentByQuery(query);
      if (match) {
        return NextResponse.json({
          type: 'intent_identified',
          text: `### 📋 Workflow Identified: ${match.intent.title}\n\n**Form Code:** \`${match.intent.form_code}\`  \n**Governing Law:** ${match.intent.section}  \n**Statutory Deadline:** ${match.intent.deadline_rule}\n\n${match.explanation}\n\n#### Required Documents:\n${match.intent.required_documents.map(d => `• ${d}`).join('\n')}`,
          action: {
            label: `Prepare ${match.intent.form_code} Filing Journey`,
            url: `/filings/new?intent=${match.intent.id}`
          },
          tools_used: ['identify_required_filing', 'get_filing_requirements']
        });
      }
    }

    // 4. Check if it's asking for what needs attention / compliance deadlines
    if (query.includes('attention') || query.includes('due') || query.includes('compliance') || query.includes('this month') || query.includes('critical') || query.includes('deadline') || query.includes('miss')) {
      const deadlines = await ComplianceService.getUpcomingDeadlines(activeCin);
      const critical = deadlines.filter(d => d.urgency === 'critical' || d.urgency === 'action_required');

      const itemsList = critical.map(c => `• **${c.form_code} (${c.title})** — Due **${c.due_date}** (${c.urgency.toUpperCase()})\n  _${c.description}_`).join('\n\n');

      return NextResponse.json({
        type: 'compliance_summary',
        text: `### ⚠️ Immediate Action Items Requiring Attention\n\nYou currently have **${critical.length} high-priority statutory items** for **${activeCompany}**:\n\n${itemsList}\n\n**Penalty Projection:** Delayed submission of AOC-4 incurs a statutory penalty of ₹100/day. Director KYC default incurs ₹5,000 late fee for deactivation reactivation.`,
        action: {
          label: 'View Compliance Schedule',
          url: '/compliance'
        },
        tools_used: ['get_compliance_status', 'get_upcoming_deadlines', 'get_next_required_action']
      });
    }

    // 5. Fallback search on knowledge base
    const kbResults = await executeMcpTool('search_mca_knowledge', { query: message });
    if (kbResults.results && kbResults.results.length > 0) {
      const top = kbResults.results[0];
      return NextResponse.json({
        type: 'knowledge',
        text: `### 📖 MCA Official Guidance: ${top.title}\n\n**Legal Section:** ${top.act_section || 'Companies Act 2013'}\n\n${top.summary}\n\n**Official Guidance:**\n${top.official_guidance}\n\n**Penalties for Default:**\n${top.penalties || 'Statutory fines apply.'}`,
        action: {
          label: 'Explore MCA Knowledge',
          url: '/compliance'
        },
        tools_used: ['search_mca_knowledge']
      });
    }

    // 6. General intelligent response
    return NextResponse.json({
      type: 'general',
      text: `Future MCA is analyzing your inquiry: *"I want to check ${message}"*.\n\nAs your authorized corporate assistant for **${activeCompany}**, I have direct access to your company master data, active Board DINs, DSC expiration registers, and RoC application timelines.\n\nYou can ask me to:\n• Check what compliance is due this month\n• Start a workflow ("A director resigned", "We changed our address")\n• Diagnose any MCA V3 error code or DSC issue\n• Inspect filed application status and timelines`,
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
