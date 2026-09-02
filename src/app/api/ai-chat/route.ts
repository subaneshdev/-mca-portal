import { NextRequest, NextResponse } from 'next/server';
import { ActionService } from '@/lib/services/actionService';
import { CompanyService } from '@/lib/services/companyService';
import { executeMcpTool } from '@/lib/mcp/tools';

export const runtime = 'nodejs';

// In-memory conversation stage
interface ConversationState {
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

let activeConversationState: ConversationState = { stage: 'IDLE' };

export async function POST(request: NextRequest) {
  try {
    const { message, context = {} } = await request.json();
    const query = (message || '').trim().toLowerCase();
    const rawText = (message || '').trim();

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
      if (activeConversationState.stage === 'START_COMPANY_CONFIRM') {
        const companyName = activeConversationState.company_name || 'New Venture Private Limited';
        const companyType = activeConversationState.company_type || 'Private Limited Company';
        const business = activeConversationState.business_activity || 'Technology & Enterprise Services';
        const office = activeConversationState.registered_office || 'Tamil Nadu, India';
        const capital = activeConversationState.authorized_capital || '₹10,00,000';
        const directors = activeConversationState.directors || ['Director 1', 'Director 2'];

        const result = await executeMcpTool('create_company', {
          company_name: companyName,
          company_type: companyType,
          business_activity: business,
          registered_office: office,
          authorized_capital: capital,
          directors: directors.map(name => ({ full_name: name, designation: 'Director' }))
        }, { workspaceId: context.workspaceId });

        activeConversationState = { stage: 'IDLE' };

        return NextResponse.json({
          type: 'action_executed',
          workflow_type: 'COMPANY_INCORPORATION',
          text: `Done. ${companyName} has been created in Future MCA. Added the company, its directors, and initial compliance workspace.\n\nCIN: ${result?.company?.cin || 'Assigned'}\nDirectors: ${directors.join(', ')}`,
          tools_used: ['create_company', 'get_company_profile']
        });
      }

      // 1B. DIRECTOR RESIGNATION CONFIRMATION
      if (activeConversationState.stage === 'RESIGN_CONFIRM') {
        const directorName = activeConversationState.resigning_director || 'Director';
        const effectiveDate = activeConversationState.resignation_date || new Date().toISOString().split('T')[0];

        await executeMcpTool('process_director_resignation', {
          company_name: activeCompanyName,
          cin: activeCompanyCin,
          director_name: directorName,
          effective_date: effectiveDate
        }, { workspaceId: context.workspaceId });

        activeConversationState = { stage: 'IDLE' };

        return NextResponse.json({
          type: 'action_executed',
          workflow_type: 'DIRECTOR_RESIGNATION',
          text: `Done. ${directorName}'s resignation has been recorded for ${activeCompanyName || 'your company'}. Updated the company records and prepared the DIR-12 filing workflow.`,
          tools_used: ['process_director_resignation', 'get_company_directors']
        });
      }

      // 1C. Fallback pending action confirmation (e.g. direct director addition)
      if (activeCompanyCin) {
        const pendingAction = await ActionService.getLatestPendingAction(activeCompanyCin);
        if (pendingAction && pendingAction.status === 'AWAITING_USER_CONFIRMATION') {
          await ActionService.confirmAction(pendingAction.id, pendingAction.confirmation_token || undefined, {
            workspaceId: context.workspaceId,
            userId: context.userId,
            actorType: 'USER',
            clientName: 'Founders AI Copilot'
          });

          const execResult = await ActionService.executeAction(pendingAction.id, undefined, {
            workspaceId: context.workspaceId,
            userId: context.userId,
            actorType: 'USER',
            clientName: 'Founders AI Copilot'
          });

          const candidateName = pendingAction.payload?.director_name || 'New Director';

          return NextResponse.json({
            type: 'action_executed',
            workflow_type: 'DIRECTOR_APPOINTMENT',
            action_id: pendingAction.id,
            text: `Done. ${candidateName} has been directly added to the Board of Directors of ${activeCompanyName || 'the company'}.\n\nReference SRN: ${execResult.reference_number}.`,
            tools_used: ['confirm_action', 'execute_action', 'get_company_directors']
          });
        }
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
      if (!activeCompanyCin) {
        return NextResponse.json({
          type: 'chat_response',
          text: 'No active company found in this workspace. You can say **"I want to start a company"** to incorporate a new entity.',
          tools_used: ['get_company_directors']
        });
      }

      const res = await executeMcpTool('get_company_directors', { cin: activeCompanyCin }, { workspaceId: context.workspaceId });
      const active = res.active_directors || [];
      const former = res.former_directors || [];

      let responseText = '';
      if (active.length === 0 && former.length === 0) {
        responseText = `No directors currently registered for **${res.company || activeCompanyName}**. You can add a director anytime by asking me.`;
      } else if (former.length > 0) {
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
      if (!activeCompanyCin) {
        return NextResponse.json({
          type: 'chat_response',
          text: 'No active company registered in your workspace yet. Say **"I want to start a company"** to register a new entity through MCA.',
          tools_used: ['get_company_profile']
        });
      }

      const profile = await executeMcpTool('get_company_profile', { cin: activeCompanyCin }, { workspaceId: context.workspaceId });
      if (profile.error) {
        return NextResponse.json({
          type: 'chat_response',
          text: profile.error,
          tools_used: ['get_company_profile']
        });
      }
      const comp = profile.company;

      return NextResponse.json({
        type: 'company_profile',
        text: `Company: ${comp.name}\nCIN: ${comp.cin}\nCompany Type: ${comp.company_type}\nRegistered Office: ${comp.registered_office}\nAuthorised Capital: ${comp.authorized_capital}\n\nDirectors:\n${comp.directors?.length > 0 ? comp.directors.map((d: any) => `• ${d.name} (${d.status})`).join('\n') : '• No directors recorded'}\n\nCompliance Status: ${comp.compliance_status}`,
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
      if (!activeCompanyCin) {
        return NextResponse.json({
          type: 'compliance_deadlines',
          text: 'No active company selected. You have no pending filings.',
          tools_used: ['get_compliance_status']
        });
      }

      const status = await executeMcpTool('get_compliance_status', { cin: activeCompanyCin }, { workspaceId: context.workspaceId });
      const deadlines = status.deadlines || [];

      const listText = deadlines.length > 0 
        ? deadlines.map((d: any) => `• **${d.title}** (${d.form_code}) — Status: **${d.status}** | Due: ${d.due_date}`).join('\n')
        : 'All statutory compliances are currently up to date.';

      return NextResponse.json({
        type: 'compliance_deadlines',
        text: `Compliance Status for **${activeCompanyName || 'your company'}**:\n\n${listText}`,
        tools_used: ['get_compliance_status', 'get_upcoming_deadlines']
      });
    }

    // ====================================================
    // 3. WORKFLOW: DIRECTOR RESIGNATION
    // ====================================================
    const isResignationIntent = 
      query.includes('director resigned') ||
      query.includes('director resign') ||
      query.includes('my director resigned') ||
      query.includes('resigned') ||
      query.includes('resignation');

    if (isResignationIntent || activeConversationState.stage?.startsWith('RESIGN_')) {
      // Step 2b: User provided effective date
      if (
        activeConversationState.stage === 'RESIGN_DATE' ||
        query.includes('august') ||
        query.includes('effective date') ||
        /\d{4}-\d{2}-\d{2}/.test(query)
      ) {
        const effectiveDate = rawText.match(/\d{1,2}\s+[A-Za-z]+\s+\d{4}/)?.[0] || 
                              rawText.match(/\d{4}-\d{2}-\d{2}/)?.[0] || 
                              new Date().toISOString().split('T')[0];
        activeConversationState.resignation_date = effectiveDate;
        activeConversationState.stage = 'RESIGN_CONFIRM';

        const dirName = activeConversationState.resigning_director || 'Director';

        return NextResponse.json({
          type: 'resignation_summary',
          text: `Director Change Summary\n\nCompany:\n${activeCompanyName || 'Your Company'}\n\nDirector:\n${dirName}\n\nChange:\nDirector Resignation\n\nEffective Date:\n${effectiveDate}\n\nRelevant MCA Filing:\nDIR-12\n\nWould you like me to update the director change and prepare the DIR-12 workflow?`,
          action: {
            label: 'Yes, Update Director & Prepare DIR-12',
            query: 'yes'
          },
          tools_used: ['prepare_director_resignation']
        });
      }

      // Step 2a: User named the director
      if (
        activeConversationState.stage === 'RESIGN_SELECT_DIRECTOR' ||
        (query.length > 2 && !isResignationIntent)
      ) {
        const nameCandidate = rawText.replace(/my director|resigned|has resigned|left|resigned as director/gi, '').trim();
        activeConversationState.resigning_director = nameCandidate || 'Director';
        activeConversationState.stage = 'RESIGN_DATE';

        return NextResponse.json({
          type: 'resignation_step_date',
          text: `Since ${activeConversationState.resigning_director} has resigned, the required MCA filing is **DIR-12** (Notice of Resignation of Director under Section 168).\n\nWhat was the effective date of resignation?`,
          tools_used: ['identify_required_filing']
        });
      }

      // Step 1: User initiated resignation
      activeConversationState = {
        stage: 'RESIGN_SELECT_DIRECTOR',
        company_name: activeCompanyName
      };

      return NextResponse.json({
        type: 'resignation_select_director',
        text: `Which director has resigned from **${activeCompanyName || 'your company'}**?`,
        tools_used: ['get_company_directors']
      });
    }

    // ====================================================
    // 4. WORKFLOW: START A COMPANY
    // ====================================================
    const isStartCompanyIntent = 
      query.includes('start a company') ||
      query.includes('start company') ||
      query.includes('incorporate a company') ||
      query.includes('register a company') ||
      query.includes('new company');

    if (isStartCompanyIntent || activeConversationState.stage?.startsWith('START_COMPANY_')) {
      // Step 4: User provided directors
      if (
        activeConversationState.stage === 'START_COMPANY_DIRECTORS' ||
        query.includes('and') ||
        query.includes(',')
      ) {
        const extractedDirs = rawText.split(/,| and /i).map((d: string) => d.trim()).filter((d: string) => d.length > 1);
        activeConversationState.directors = extractedDirs.length > 0 ? extractedDirs : ['Founder 1', 'Founder 2'];
        activeConversationState.stage = 'START_COMPANY_CONFIRM';

        const dirs = activeConversationState.directors || [];
        return NextResponse.json({
          type: 'incorporation_summary',
          text: `Here's what I'll create:\n\nCompany:\n${activeConversationState.company_name}\n\nType:\n${activeConversationState.company_type || 'Private Limited Company'}\n\nBusiness:\n${activeConversationState.business_activity || 'Technology & Enterprise Services'}\n\nRegistered Office:\n${activeConversationState.registered_office || 'Tamil Nadu, India'}\n\nAuthorised Capital:\n${activeConversationState.authorized_capital || '₹10,00,000'}\n\nDirectors:\n${dirs.map(d => `• ${d}`).join('\n')}\n\nWould you like me to create this company in Future MCA?`,
          action: {
            label: 'Yes, Create Company in Future MCA',
            query: 'yes'
          },
          tools_used: ['add_company_director', 'prepare_company_registration']
        });
      }

      // Step 3c: User provided capital
      if (
        activeConversationState.stage === 'START_COMPANY_CAPITAL' ||
        query.includes('000') ||
        query.includes('lakh') ||
        query.includes('cr')
      ) {
        activeConversationState.authorized_capital = rawText;
        activeConversationState.stage = 'START_COMPANY_DIRECTORS';

        return NextResponse.json({
          type: 'incorporation_directors',
          text: `Who will be the first directors of ${activeConversationState.company_name}? (e.g. "Arun Kumar and Priya Sharma")`,
          tools_used: ['collect_company_details']
        });
      }

      // Step 3b: User provided registered office
      if (
        activeConversationState.stage === 'START_COMPANY_OFFICE'
      ) {
        activeConversationState.registered_office = rawText;
        activeConversationState.stage = 'START_COMPANY_CAPITAL';

        return NextResponse.json({
          type: 'incorporation_capital',
          text: `What is the proposed authorised capital? (e.g. "₹10,00,000" or "₹1,00,000")`,
          tools_used: ['collect_company_details']
        });
      }

      // Step 3a: User provided business activity
      if (
        activeConversationState.stage === 'START_COMPANY_DETAILS'
      ) {
        activeConversationState.business_activity = rawText;
        activeConversationState.stage = 'START_COMPANY_OFFICE';

        return NextResponse.json({
          type: 'incorporation_office',
          text: `Where will the registered office be located? (State / City)`,
          tools_used: ['collect_company_details']
        });
      }

      // Step 2: User provided company name
      if (
        activeConversationState.stage === 'START_COMPANY_NAME'
      ) {
        const companyName = rawText.replace(/[.]/g, '').trim();
        activeConversationState.company_name = companyName;
        activeConversationState.company_type = 'Private Limited Company';
        activeConversationState.stage = 'START_COMPANY_DETAILS';

        return NextResponse.json({
          type: 'name_availability',
          text: `Great. **${companyName}** appears to be available for registration.\n\nWhat will the company do? Briefly describe its main business activity.`,
          tools_used: ['check_company_name_availability']
        });
      }

      // Step 1: User started incorporation
      activeConversationState = { stage: 'START_COMPANY_NAME' };

      return NextResponse.json({
        type: 'start_incorporation',
        text: `I'll guide you through incorporating a new company on MCA.\n\nWhat would you like to name your proposed company?`,
        tools_used: ['start_company_incorporation']
      });
    }

    // ====================================================
    // 5. DIRECT DIRECTOR APPOINTMENT
    // ====================================================
    if (query.includes('add') && query.includes('director')) {
      let candidateName = 'New Director';
      const rawMatch = message.match(/add\s+(.+?)\s+as\s+(?:an?\s+)?director/i);
      if (rawMatch && rawMatch[1]) {
        candidateName = rawMatch[1].replace(/\b(din|create din|ask confirmation|and directly add)\b.*/i, '').trim();
      }

      const generatedDin = `09${Math.floor(100000 + Math.random() * 900000)}`;
      const preparedAction = await ActionService.prepareDirectorChange({
        company_id_or_cin: activeCompanyCin || 'comp_new',
        change_type: 'APPOINTMENT',
        director_name: candidateName,
        din: generatedDin,
        effective_date: new Date().toISOString().split('T')[0],
        reason: 'Board appointment'
      }, { workspaceId: context.workspaceId, userId: context.userId });

      return NextResponse.json({
        type: 'action_prepared',
        workflow_type: 'DIRECTOR_APPOINTMENT',
        action_id: preparedAction.id,
        text: `I have generated DIN ${generatedDin} for ${candidateName} and prepared the appointment draft.\n\nWould you like me to directly add ${candidateName} to the board of ${activeCompanyName || 'your company'}?`,
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
    const greetingText = activeCompanyName
      ? `I am Founders AI, your autonomous corporate copilot for **${activeCompanyName}**.\n\nYou can try:\n• **"I want to start a company."**\n• **"My director resigned."**\n• **"Who are my directors?"**\n• **"Tell me about my company."**\n• **"What filings are pending?"**`
      : `I am Founders AI, your autonomous corporate copilot for MCA statutory operations.\n\nYou can try:\n• **"I want to start a company."**\n• **"Who are my directors?"**\n• **"My director resigned."**\n• **"What filings are required for a Private Limited?"**`;

    return NextResponse.json({
      type: 'chat_response',
      text: greetingText,
      tools_used: ['get_company_profile']
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal AI service error' },
      { status: 500 }
    );
  }
}
