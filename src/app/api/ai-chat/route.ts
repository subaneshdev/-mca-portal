import { NextRequest, NextResponse } from 'next/server';
import { ActionService } from '@/lib/services/actionService';
import { CompanyService } from '@/lib/services/companyService';
import { executeMcpTool } from '@/lib/mcp/tools';
import { PRIMARY_DEMO_COMPANY, PRIMARY_DEMO_DIRECTORS } from '@/lib/services/seedService';

export const runtime = 'nodejs';

// In-memory demo conversation stage
interface DemoConversationState {
  stage?: 
    | 'IDLE'
    | 'START_COMPANY_NAME'
    | 'START_COMPANY_DETAILS'
    | 'START_COMPANY_OFFICE'
    | 'START_COMPANY_CAPITAL'
    | 'START_COMPANY_DIRECTORS'
    | 'START_COMPANY_CONFIRM'
    | 'RESIGN_SELECT_DIRECTOR'
    | 'RESIGN_DATE'
    | 'RESIGN_CONFIRM';
  company_name?: string;
  company_type?: string;
  business_activity?: string;
  registered_office?: string;
  authorized_capital?: string;
  directors?: string[];
  resigning_director?: string;
  resignation_date?: string;
}

let activeDemoState: DemoConversationState = { stage: 'IDLE' };

export async function POST(request: NextRequest) {
  try {
    const { message, context = {} } = await request.json();
    const query = (message || '').trim().toLowerCase();
    const rawText = (message || '').trim();

    // ====================================================
    // 1. SIMPLE CONFIRMATION ("Yes", "Confirm", "Proceed")
    // ====================================================
    const isConfirmation = 
      query === 'yes' ||
      query === 'yes.' ||
      query === 'confirm' ||
      query === 'proceed' ||
      query === 'approve' ||
      query === 'do it' ||
      query === 'create' ||
      query === 'update' ||
      query === 'create it' ||
      query.startsWith('yes') ||
      query.includes('would you like me to proceed') ||
      query.includes('directly add');

    if (isConfirmation) {
      // 1A. START A COMPANY CONFIRMATION
      if (activeDemoState.stage === 'START_COMPANY_CONFIRM') {
        const companyName = activeDemoState.company_name || 'Aether Labs Private Limited';
        const companyType = activeDemoState.company_type || 'Private Limited Company';
        const business = activeDemoState.business_activity || 'AI Infrastructure and Enterprise Automation';
        const office = activeDemoState.registered_office || 'Chennai, Tamil Nadu, India';
        const capital = activeDemoState.authorized_capital || '₹10,00,000';

        await executeMcpTool('create_company', {
          company_name: companyName,
          company_type: companyType,
          business_activity: business,
          registered_office: office,
          authorized_capital: capital
        });

        activeDemoState = { stage: 'IDLE' };

        return NextResponse.json({
          type: 'action_executed',
          workflow_type: 'COMPANY_INCORPORATION',
          text: `Done. ${companyName} has been created in Future MCA. I've added the company, its directors, and the initial compliance workspace.`,
          tools_used: ['create_company', 'get_company_profile']
        });
      }

      // 1B. DIRECTOR RESIGNATION CONFIRMATION
      if (activeDemoState.stage === 'RESIGN_CONFIRM') {
        const directorName = activeDemoState.resigning_director || 'Arun Kumar';
        const effectiveDate = activeDemoState.resignation_date || '15 August 2026';

        await executeMcpTool('process_director_resignation', {
          director_name: directorName,
          effective_date: effectiveDate
        });

        activeDemoState = { stage: 'IDLE' };

        return NextResponse.json({
          type: 'action_executed',
          workflow_type: 'DIRECTOR_RESIGNATION',
          text: `Done. ${directorName}'s resignation has been recorded. I've updated the company records and prepared the DIR-12 filing workflow.`,
          tools_used: ['process_director_resignation', 'get_company_directors']
        });
      }

      // 1C. Fallback pending action confirmation (e.g. direct director addition)
      const pendingAction = await ActionService.getLatestPendingAction(PRIMARY_DEMO_COMPANY.cin);
      if (pendingAction && pendingAction.status === 'AWAITING_USER_CONFIRMATION') {
        await ActionService.confirmAction(pendingAction.id, pendingAction.confirmation_token || undefined, {
          workspaceId: context.workspaceId,
          userId: 'usr_varun_maya',
          actorType: 'USER',
          clientName: 'Future MCA Conversational Copilot'
        });

        const execResult = await ActionService.executeAction(pendingAction.id, undefined, {
          workspaceId: context.workspaceId,
          userId: 'usr_varun_maya',
          actorType: 'USER',
          clientName: 'Future MCA Conversational Copilot'
        });

        const updatedDirectors = await CompanyService.getCompanyDirectors(PRIMARY_DEMO_COMPANY.cin);
        const candidateName = pendingAction.payload?.director_name || 'New Director';

        return NextResponse.json({
          type: 'action_executed',
          workflow_type: 'DIRECTOR_APPOINTMENT',
          action_id: pendingAction.id,
          text: `Done. ${candidateName} has been directly added to the Board of Directors of ${PRIMARY_DEMO_COMPANY.name}.\n\nReference SRN: ${execResult.reference_number}.`,
          tools_used: ['confirm_action', 'execute_action', 'get_company_directors']
        });
      }
    }

    // ====================================================
    // 2. READ VERIFICATION QUERIES (MCP PROOFS)
    // ====================================================
    // 2A. "Who are my directors?"
    if (
      query.includes('who are my directors') ||
      query.includes('list directors') ||
      query.includes('show directors') ||
      query.includes('board of directors') ||
      (query.includes('directors') && (query.includes('who') || query.includes('what') || query.includes('show')))
    ) {
      const res = await executeMcpTool('get_company_directors', { cin: PRIMARY_DEMO_COMPANY.cin });
      const active = res.active_directors || [];
      const former = res.former_directors || [];

      let responseText = '';
      if (former.length > 0) {
        responseText = `ACTIVE DIRECTORS\n\n${active.map((d: any) => `• ${d.name} — ${d.status}`).join('\n')}\n\nFORMER DIRECTORS\n\n${former.map((d: any) => `• ${d.name}\n  Status: ${d.status}\n  Effective Date: ${d.effective_date}`).join('\n')}`;
      } else {
        responseText = `${active.map((d: any) => `• ${d.name} — ${d.status}`).join('\n')}`;
      }

      return NextResponse.json({
        type: 'directors_list',
        text: responseText,
        tools_used: ['get_company_directors']
      });
    }

    // 2B. "Tell me about my company."
    if (
      query.includes('tell me about my company') ||
      query.includes('company profile') ||
      query.includes('about the company') ||
      query.includes('company info') ||
      query.includes('company details')
    ) {
      const profile = await executeMcpTool('get_company_profile', { cin: PRIMARY_DEMO_COMPANY.cin });
      const comp = profile.company;

      return NextResponse.json({
        type: 'company_profile',
        text: `Company: ${comp.name}\nCIN: ${comp.cin}\nCompany Type: ${comp.company_type}\nBusiness Activity: ${comp.business_activity}\nRegistered Office: ${comp.registered_office}\nAuthorised Capital: ${comp.authorized_capital}\n\nDirectors:\n${comp.directors.map((d: any) => `• ${d.name} (${d.status})`).join('\n')}\n\nCompliance Status: ${comp.compliance_status}`,
        tools_used: ['get_company_profile']
      });
    }

    // 2C. "What filings are pending?" / "What are my upcoming deadlines?"
    if (
      query.includes('filings are pending') ||
      query.includes('pending filings') ||
      query.includes('what filings') ||
      query.includes('upcoming deadlines') ||
      query.includes('deadlines') ||
      query.includes('compliance status')
    ) {
      const status = await executeMcpTool('get_compliance_status', { cin: PRIMARY_DEMO_COMPANY.cin });
      const deadlines = status.deadlines || [];

      const listText = deadlines.map((d: any) => 
        `• **${d.title}** (${d.form_code}) — Status: **${d.status}** | Due: ${d.due_date}`
      ).join('\n');

      return NextResponse.json({
        type: 'compliance_deadlines',
        text: `Pending & Active Filings for **${PRIMARY_DEMO_COMPANY.name}**:\n\n${listText}`,
        tools_used: ['get_compliance_status', 'get_upcoming_deadlines']
      });
    }

    // ====================================================
    // 3. WORKFLOW TWO: MY DIRECTOR RESIGNED
    // ====================================================
    const isResignationIntent = 
      query.includes('director resigned') ||
      query.includes('director resign') ||
      query.includes('my director resigned') ||
      query.includes('resigned') ||
      (query.includes('arun') && (query.includes('resig') || query.includes('left')));

    if (isResignationIntent || activeDemoState.stage?.startsWith('RESIGN_')) {
      // Step 2b: User provided effective date (e.g. "15 August 2026")
      if (
        activeDemoState.stage === 'RESIGN_DATE' ||
        query.includes('15 august') ||
        query.includes('august 2026') ||
        query.includes('2026-08-15') ||
        query.includes('effective date')
      ) {
        const effectiveDate = rawText.match(/\d{1,2}\s+[A-Za-z]+\s+\d{4}/)?.[0] || '15 August 2026';
        activeDemoState.resignation_date = effectiveDate;
        activeDemoState.resigning_director = activeDemoState.resigning_director || 'Arun Kumar';
        activeDemoState.stage = 'RESIGN_CONFIRM';

        return NextResponse.json({
          type: 'resignation_summary',
          text: `Director Change Summary\n\nCompany:\nAether Labs Private Limited\n\nDirector:\n${activeDemoState.resigning_director}\n\nChange:\nDirector Resignation\n\nEffective Date:\n${effectiveDate}\n\nRelevant MCA Filing:\nDIR-12\n\nWould you like me to update the director change and prepare the DIR-12 workflow?`,
          action: {
            label: 'Yes, Update Director & Prepare DIR-12',
            query: 'yes'
          },
          tools_used: ['prepare_director_resignation']
        });
      }

      // Step 2a: User named the director (e.g. "Arun Kumar")
      if (
        activeDemoState.stage === 'RESIGN_SELECT_DIRECTOR' ||
        query.includes('arun kumar') ||
        query.includes('arun')
      ) {
        activeDemoState.resigning_director = 'Arun Kumar';
        activeDemoState.stage = 'RESIGN_DATE';

        return NextResponse.json({
          type: 'resignation_step_date',
          text: `Since Arun Kumar has resigned as a director, the relevant MCA filing is DIR-12. I'll help you update the company records and prepare the filing workflow.\n\nWhat was the effective date of resignation?`,
          tools_used: ['identify_required_filing']
        });
      }

      // Step 1: User initiated resignation ("My director resigned.")
      activeDemoState = {
        stage: 'RESIGN_SELECT_DIRECTOR',
        company_name: 'Aether Labs Private Limited'
      };

      return NextResponse.json({
        type: 'resignation_select_director',
        text: `Which director resigned?`,
        tools_used: ['get_company_directors']
      });
    }

    // ====================================================
    // 4. WORKFLOW ONE: START A COMPANY
    // ====================================================
    const isStartCompanyIntent = 
      query.includes('start a company') ||
      query.includes('start company') ||
      query.includes('incorporate a company') ||
      query.includes('register a company') ||
      query.includes('new company');

    if (isStartCompanyIntent || activeDemoState.stage?.startsWith('START_COMPANY_')) {
      // Step 4: User provided directors (e.g. "Varun Maya and Arun Kumar")
      if (
        activeDemoState.stage === 'START_COMPANY_DIRECTORS' ||
        (query.includes('varun') && query.includes('arun'))
      ) {
        activeDemoState.company_name = activeDemoState.company_name || 'Aether Labs Private Limited';
        activeDemoState.company_type = 'Private Limited Company';
        activeDemoState.business_activity = activeDemoState.business_activity || 'AI Infrastructure and Enterprise Automation';
        activeDemoState.registered_office = activeDemoState.registered_office || 'Chennai, Tamil Nadu, India';
        activeDemoState.authorized_capital = '₹10,00,000';
        activeDemoState.directors = ['Varun Maya', 'Arun Kumar'];
        activeDemoState.stage = 'START_COMPANY_CONFIRM';

        return NextResponse.json({
          type: 'incorporation_summary',
          text: `Here's what I'll create:\n\nCompany:\n${activeDemoState.company_name}\n\nType:\n${activeDemoState.company_type}\n\nBusiness:\n${activeDemoState.business_activity}\n\nRegistered Office:\n${activeDemoState.registered_office}\n\nAuthorised Capital:\n${activeDemoState.authorized_capital}\n\nDirectors:\n• Varun Maya\n• Arun Kumar\n\nWould you like me to create this company in Future MCA?`,
          action: {
            label: 'Yes, Create Company in Future MCA',
            query: 'yes'
          },
          tools_used: ['add_company_director', 'prepare_company_registration']
        });
      }

      // Step 3c: User provided capital (e.g. "₹10,00,000" or "10 lakhs")
      if (
        activeDemoState.stage === 'START_COMPANY_CAPITAL' ||
        query.includes('10,00,000') ||
        query.includes('1000000') ||
        query.includes('10 lakh')
      ) {
        activeDemoState.authorized_capital = '₹10,00,000';
        activeDemoState.stage = 'START_COMPANY_DIRECTORS';

        return NextResponse.json({
          type: 'incorporation_directors',
          text: `Who will be the directors?`,
          tools_used: ['collect_company_details']
        });
      }

      // Step 3b: User provided registered office (e.g. "Chennai, Tamil Nadu, India")
      if (
        activeDemoState.stage === 'START_COMPANY_OFFICE' ||
        query.includes('chennai') ||
        query.includes('tamil nadu')
      ) {
        activeDemoState.registered_office = 'Chennai, Tamil Nadu, India';
        activeDemoState.stage = 'START_COMPANY_CAPITAL';

        return NextResponse.json({
          type: 'incorporation_capital',
          text: `What is the proposed authorised capital?`,
          tools_used: ['collect_company_details']
        });
      }

      // Step 3a: User provided business activity (e.g. "We build AI infrastructure...")
      if (
        activeDemoState.stage === 'START_COMPANY_DETAILS' ||
        query.includes('ai') ||
        query.includes('infrastructure') ||
        query.includes('automation')
      ) {
        activeDemoState.business_activity = 'AI Infrastructure and Enterprise Automation';
        activeDemoState.stage = 'START_COMPANY_OFFICE';

        return NextResponse.json({
          type: 'incorporation_office',
          text: `Where will the registered office be located?`,
          tools_used: ['collect_company_details']
        });
      }

      // Step 2: User provided company name (e.g. "Aether Labs Private Limited")
      if (
        activeDemoState.stage === 'START_COMPANY_NAME' ||
        query.includes('aether')
      ) {
        const companyName = rawText.replace(/[.]/g, '').trim() || 'Aether Labs Private Limited';
        activeDemoState.company_name = companyName;
        activeDemoState.stage = 'START_COMPANY_DETAILS';

        return NextResponse.json({
          type: 'name_availability',
          text: `Great. ${companyName} appears to be available. Let's continue with the company details.\n\nWhat will the company do?`,
          tools_used: ['check_company_name_availability']
        });
      }

      // Step 1: User started incorporation ("I want to start a company.")
      activeDemoState = { stage: 'START_COMPANY_NAME' };

      return NextResponse.json({
        type: 'start_incorporation',
        text: `Great. What would you like to name your company?`,
        tools_used: ['start_company_incorporation']
      });
    }

    // ====================================================
    // 5. DIRECT DIRECTOR APPOINTMENT (Zero DSC flow)
    // ====================================================
    if (query.includes('add') && query.includes('director')) {
      let candidateName = 'Rohan Gupta';
      const rawMatch = message.match(/add\s+(.+?)\s+as\s+(?:an?\s+)?director/i);
      if (rawMatch && rawMatch[1]) {
        candidateName = rawMatch[1].replace(/\b(din|create din|ask confirmation|and directly add)\b.*/i, '').trim();
      }

      const generatedDin = `09${Math.floor(100000 + Math.random() * 900000)}`;
      const preparedAction = await ActionService.prepareDirectorChange({
        company_id_or_cin: PRIMARY_DEMO_COMPANY.cin,
        change_type: 'APPOINTMENT',
        director_name: candidateName,
        din: generatedDin,
        effective_date: new Date().toISOString().split('T')[0],
        reason: 'Strategic board appointment'
      });

      return NextResponse.json({
        type: 'action_prepared',
        workflow_type: 'DIRECTOR_APPOINTMENT',
        action_id: preparedAction.id,
        text: `I have generated DIN ${generatedDin} for ${candidateName} and prepared the appointment draft without requiring DSC authorization.\n\nWould you like me to directly add ${candidateName} to the board?`,
        action: {
          label: `Confirm & Directly Add ${candidateName}`,
          query: 'yes'
        },
        tools_used: ['generate_din', 'prepare_director_change']
      });
    }

    // ====================================================
    // 6. DEFAULT POLITE FALLBACK
    // ====================================================
    return NextResponse.json({
      type: 'chat_response',
      text: `I am Founders AI, your autonomous corporate intelligence copilot for **${PRIMARY_DEMO_COMPANY.name}**.\n\nYou can try:\n• **"I want to start a company."**\n• **"My director resigned."**\n• **"Who are my directors?"**\n• **"Tell me about my company."**\n• **"What filings are pending?"**`,
      tools_used: ['get_company_profile']
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal AI service error' },
      { status: 500 }
    );
  }
}
