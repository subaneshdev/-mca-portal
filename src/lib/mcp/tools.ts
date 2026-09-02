import { CompanyService } from '@/lib/services/companyService';
import { ComplianceService } from '@/lib/services/complianceService';
import { FilingService } from '@/lib/services/filingService';
import { DiagnosticService } from '@/lib/services/diagnosticService';
import { KnowledgeService } from '@/lib/services/knowledgeService';
import { ActionService, ActionContext } from '@/lib/services/actionService';

export interface ToolDefinition {
  name: string;
  category?: 'LEVEL_1_READ' | 'LEVEL_2_PREPARE' | 'LEVEL_3_EXECUTION';
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export const MCP_TOOLS: ToolDefinition[] = [
  // ==========================================
  // LEVEL 1: READ TOOLS (Safe, immediate execution)
  // ==========================================
  {
    name: 'search_company',
    category: 'LEVEL_1_READ',
    description: 'Search registered Indian companies by name, CIN, or jurisdiction.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Company name keyword, CIN, or ROC locality' }
      },
      required: ['query']
    }
  },
  {
    name: 'get_company_profile',
    category: 'LEVEL_1_READ',
    description: 'Retrieve detailed master data for a specific company by its CIN or ID.',
    inputSchema: {
      type: 'object',
      properties: {
        cin: { type: 'string', description: 'Corporate Identification Number (CIN) or company ID' }
      },
      required: ['cin']
    }
  },
  {
    name: 'get_company_directors',
    category: 'LEVEL_1_READ',
    description: 'Retrieve the active Board of Directors, DIN numbers, DSC validity, and KYC statuses for a company.',
    inputSchema: {
      type: 'object',
      properties: {
        cin: { type: 'string', description: 'Corporate Identification Number (CIN) or company ID' }
      },
      required: ['cin']
    }
  },
  {
    name: 'get_compliance_status',
    category: 'LEVEL_1_READ',
    description: 'Get the complete compliance overview, critical deadlines, and overdue risks for a company.',
    inputSchema: {
      type: 'object',
      properties: {
        cin: { type: 'string', description: 'Corporate Identification Number (CIN) or company ID' },
        urgency: { type: 'string', description: 'Optional filter: all, critical, action_required, upcoming' }
      }
    }
  },
  {
    name: 'get_upcoming_deadlines',
    category: 'LEVEL_1_READ',
    description: 'Get upcoming statutory MCA filing deadlines, per-day penalties, and section references.',
    inputSchema: {
      type: 'object',
      properties: {
        cin: { type: 'string', description: 'Optional CIN to filter deadlines for a specific company' }
      }
    }
  },
  {
    name: 'get_next_required_action',
    category: 'LEVEL_1_READ',
    description: 'Identify the immediate highest-priority action item requiring user attention.',
    inputSchema: {
      type: 'object',
      properties: {
        cin: { type: 'string', description: 'Corporate Identification Number (CIN) or company ID' }
      },
      required: ['cin']
    }
  },
  {
    name: 'identify_required_filing',
    category: 'LEVEL_1_READ',
    description: 'Understand a natural language corporate event (e.g. "a director resigned", "we changed office") and map it to the exact MCA form and workflow.',
    inputSchema: {
      type: 'object',
      properties: {
        event_description: { type: 'string', description: 'Natural language description of what changed in the company' }
      },
      required: ['event_description']
    }
  },
  {
    name: 'get_filing_requirements',
    category: 'LEVEL_1_READ',
    description: 'Get required documents, prerequisites, and step-by-step checklist for an MCA e-Form.',
    inputSchema: {
      type: 'object',
      properties: {
        form_code_or_intent: { type: 'string', description: 'e.g. DIR-12, INC-22, PAS-3, AOC-4, director-resigned' }
      },
      required: ['form_code_or_intent']
    }
  },
  {
    name: 'get_application_status',
    category: 'LEVEL_1_READ',
    description: 'Check the real-time status, SRN, and officer remarks for a filed MCA application.',
    inputSchema: {
      type: 'object',
      properties: {
        application_no: { type: 'string', description: 'Service Request Number (SRN) or application ID' }
      },
      required: ['application_no']
    }
  },
  {
    name: 'get_application_timeline',
    category: 'LEVEL_1_READ',
    description: 'Retrieve the step-by-step journey timeline and future actions for an application.',
    inputSchema: {
      type: 'object',
      properties: {
        application_no: { type: 'string', description: 'Service Request Number (SRN)' }
      },
      required: ['application_no']
    }
  },
  {
    name: 'diagnose_filing_error',
    category: 'LEVEL_1_READ',
    description: 'Diagnose an MCA portal error code, failure popup, or DSC rejection and get actionable resolution steps.',
    inputSchema: {
      type: 'object',
      properties: {
        error_message_or_code: { type: 'string', description: 'Error message text, code, or description of failure' }
      },
      required: ['error_message_or_code']
    }
  },
  {
    name: 'search_mca_knowledge',
    category: 'LEVEL_1_READ',
    description: 'Search official MCA guidance, Companies Act 2013 rules, circulars, and FAQs.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Topic or legal question to search' }
      },
      required: ['query']
    }
  },

  // ==========================================
  // LEVEL 2: PREPARE TOOLS (Draft creation only, NEVER submits)
  // ==========================================
  {
    name: 'prepare_company_registration',
    category: 'LEVEL_2_PREPARE',
    description: 'Prepare an incorporation workflow for a new Private Limited, LLP, OPC, or Public Company. Creates a draft preview awaiting user review. DOES NOT submit.',
    inputSchema: {
      type: 'object',
      properties: {
        proposed_names: { type: 'array', items: { type: 'string' }, description: '1 to 2 proposed names in order of preference' },
        company_type: { type: 'string', enum: ['PVT_LTD', 'LLP', 'OPC', 'PUBLIC_LTD'], description: 'Legal entity structure' },
        registered_state: { type: 'string', description: 'State of proposed registered office' },
        authorized_capital: { type: 'number', description: 'Proposed authorized capital in INR' },
        paid_up_capital: { type: 'number', description: 'Proposed paid-up capital in INR' },
        directors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              full_name: { type: 'string' },
              email: { type: 'string' },
              din: { type: 'string' },
              pan: { type: 'string' }
            },
            required: ['full_name', 'email']
          },
          description: 'List of founding directors / subscribers'
        }
      },
      required: ['proposed_names', 'company_type', 'registered_state', 'directors']
    }
  },
  {
    name: 'prepare_director_change',
    category: 'LEVEL_2_PREPARE',
    description: 'Prepare a director appointment or cessation (resignation) in Form DIR-12. Validates statutory requirements, calculates deadlines, and creates an action draft awaiting explicit confirmation. DOES NOT submit.',
    inputSchema: {
      type: 'object',
      properties: {
        company_id_or_cin: { type: 'string', description: 'Company CIN or ID' },
        change_type: { type: 'string', enum: ['RESIGNATION', 'APPOINTMENT'], description: 'Director resignation or appointment' },
        director_name: { type: 'string', description: 'Full name of the director' },
        din: { type: 'string', description: '8-digit Director Identification Number (DIN)' },
        effective_date: { type: 'string', description: 'Effective date of change (YYYY-MM-DD)' },
        reason: { type: 'string', description: 'Reason for change / board resolution notes' }
      },
      required: ['company_id_or_cin', 'change_type', 'director_name', 'effective_date']
    }
  },
  {
    name: 'prepare_registered_office_change',
    category: 'LEVEL_2_PREPARE',
    description: 'Prepare a registered office address change workflow in Form INC-22. Validates address rules and prerequisites. Creates an action draft awaiting explicit confirmation. DOES NOT submit.',
    inputSchema: {
      type: 'object',
      properties: {
        company_id_or_cin: { type: 'string', description: 'Company CIN or ID' },
        new_address_line1: { type: 'string', description: 'Street address / premises name' },
        new_address_line2: { type: 'string', description: 'Area / landmark' },
        city: { type: 'string', description: 'City' },
        state: { type: 'string', description: 'State' },
        pincode: { type: 'string', description: '6-digit Postal PIN Code' },
        effective_date: { type: 'string', description: 'Effective date of relocation (YYYY-MM-DD)' },
        is_within_local_limits: { type: 'boolean', description: 'Whether the shift is within the local limits of the same city/town' }
      },
      required: ['company_id_or_cin', 'new_address_line1', 'city', 'state', 'pincode', 'effective_date']
    }
  },
  {
    name: 'prepare_filing',
    category: 'LEVEL_2_PREPARE',
    description: 'Prepare a generic statutory MCA e-Form draft (e.g. DIR-12, INC-22, PAS-3, AOC-4, MGT-7). Generates full preview and requirements checklist. DOES NOT submit.',
    inputSchema: {
      type: 'object',
      properties: {
        company_id_or_cin: { type: 'string', description: 'Company CIN or ID' },
        form_code: { type: 'string', description: 'MCA e-Form code (e.g. DIR-12, INC-22, PAS-3, AOC-4)' },
        reason: { type: 'string', description: 'Filing reason or corporate event description' },
        filing_data: { type: 'object', description: 'Optional field payload for the e-Form' }
      },
      required: ['company_id_or_cin', 'form_code', 'reason']
    }
  },
  {
    name: 'prepare_compliance_submission',
    category: 'LEVEL_2_PREPARE',
    description: 'Prepare an annual or periodic compliance submission (e.g. AOC-4 Financial Statements, MGT-7 Annual Return, DIR-3 KYC). Creates an action draft awaiting explicit confirmation. DOES NOT submit.',
    inputSchema: {
      type: 'object',
      properties: {
        company_id_or_cin: { type: 'string', description: 'Company CIN or ID' },
        compliance_type: { type: 'string', enum: ['AOC-4', 'MGT-7', 'DIR-3-KYC', 'DPT-3', 'MSME-1'], description: 'Statutory compliance type' },
        financial_year: { type: 'string', description: 'e.g. 2025-2026' },
        agm_date: { type: 'string', description: 'Date of AGM (YYYY-MM-DD)' }
      },
      required: ['company_id_or_cin', 'compliance_type', 'financial_year']
    }
  },

  // ==========================================
  // LEVEL 3: LIFECYCLE & EXECUTION TOOLS
  // ==========================================
  {
    name: 'get_action_status',
    category: 'LEVEL_3_EXECUTION',
    description: 'Get real-time status, preview, authorization details, and audit history for an MCP Action by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        action_id: { type: 'string', description: 'Action ID (e.g. act_dir_12345)' }
      },
      required: ['action_id']
    }
  },
  {
    name: 'get_action_preview',
    category: 'LEVEL_3_EXECUTION',
    description: 'Retrieve a structured human-readable preview of a prepared action for presentation to the user.',
    inputSchema: {
      type: 'object',
      properties: {
        action_id: { type: 'string', description: 'Action ID' }
      },
      required: ['action_id']
    }
  },
  {
    name: 'confirm_action',
    category: 'LEVEL_3_EXECUTION',
    description: 'Confirm an action draft after the user gives EXPLICIT confirmation. Verifies the confirmation token, checks authorization requirements, and advances status to CONFIRMED or AUTHORIZATION_REQUIRED.',
    inputSchema: {
      type: 'object',
      properties: {
        action_id: { type: 'string', description: 'Action ID' },
        confirmation_token: { type: 'string', description: 'Security confirmation token returned from prepare tool' }
      },
      required: ['action_id']
    }
  },
  {
    name: 'cancel_action',
    category: 'LEVEL_3_EXECUTION',
    description: 'Cancel a pending or prepared action.',
    inputSchema: {
      type: 'object',
      properties: {
        action_id: { type: 'string', description: 'Action ID' },
        reason: { type: 'string', description: 'Reason for cancellation' }
      },
      required: ['action_id']
    }
  },
  {
    name: 'execute_action',
    category: 'LEVEL_3_EXECUTION',
    description: 'Securely execute a confirmed and authorized action. Validates invariants, prevents duplicate submissions via idempotency, generates official SRN reference, and returns a submission receipt.',
    inputSchema: {
      type: 'object',
      properties: {
        action_id: { type: 'string', description: 'Action ID' },
        idempotency_key: { type: 'string', description: 'Optional unique key to ensure idempotent execution' }
      },
      required: ['action_id']
    }
  }
];

export async function executeMcpTool(
  name: string, 
  args: any = {}, 
  context: ActionContext = {}
): Promise<any> {
  switch (name) {
    // ----------------------------------------------------
    // LEVEL 1: READ TOOLS
    // ----------------------------------------------------
    case 'search_company': {
      const companies = await CompanyService.listCompanies(context.workspaceId);
      const q = (args.query || '').toLowerCase().trim();
      const results = q 
        ? companies.filter(c => 
            c.name.toLowerCase().includes(q) || 
            c.cin.toLowerCase().includes(q) ||
            (c.email && c.email.toLowerCase().includes(q))
          )
        : companies;

      const finalResults = results.length > 0 ? results : companies;
      return { companies: finalResults, total: finalResults.length, workspace_id: context.workspaceId || 'universal' };
    }
    case 'get_company_profile': {
      const target = (args.cin || args.company_name || args.name || args.query || args.company || args.id || 'U72900KA2021PTC145892').trim();
      const company = await CompanyService.getCompanyByCin(target) || (await CompanyService.listCompanies())[0];
      if (!company) return { error: `Company "${target}" not found in database.` };
      const directors = await CompanyService.getCompanyDirectors(company.id);
      return { company: { ...company, directors } };
    }
    case 'get_company_directors': {
      const target = (args.cin || args.company_name || args.name || args.query || args.company || args.id || 'U72900KA2021PTC145892').trim();
      const directors = await CompanyService.getCompanyDirectors(target);
      return { directors, total: directors.length };
    }
    case 'get_compliance_status': {
      const target = (args.cin || args.company_name || args.name || args.query || args.company || args.id || 'U72900KA2021PTC145892').trim();
      const deadlines = await ComplianceService.listCompliance({
        companyId: target,
        urgency: args.urgency
      });
      const criticalCount = deadlines.filter(d => d.urgency === 'critical').length;
      const actionCount = deadlines.filter(d => d.urgency === 'action_required').length;
      return {
        deadlines,
        summary: {
          critical: criticalCount,
          action_required: actionCount,
          upcoming: deadlines.filter(d => d.urgency === 'upcoming').length,
          risk_level: criticalCount > 0 ? 'HIGH_RISK' : actionCount > 0 ? 'ATTENTION_NEEDED' : 'HEALTHY'
        }
      };
    }
    case 'get_upcoming_deadlines': {
      const target = (args.cin || args.company_name || args.name || args.query || args.company || args.id || 'U72900KA2021PTC145892').trim();
      const deadlines = await ComplianceService.getUpcomingDeadlines(target);
      return { deadlines, total: deadlines.length };
    }
    case 'get_next_required_action': {
      const target = (args.cin || args.company_name || args.name || args.query || args.company || args.id || 'U72900KA2021PTC145892').trim();
      const company = await CompanyService.getCompanyByCin(target);
      const critical = await ComplianceService.getCriticalActions(target);
      if (critical.length > 0) {
        return {
          priority: 'CRITICAL',
          action: critical[0],
          message: `Immediate action required: ${critical[0].title} (${critical[0].form_code}) due on ${critical[0].due_date}. Estimated penalty if delayed: INR ${critical[0].penalty_per_day}/day.`
        };
      }
      return {
        priority: 'NORMAL',
        message: 'No immediate critical filings overdue. Next scheduled review is on track.',
        company: company?.name || 'Ziggers Private Limited'
      };
    }

    case 'identify_required_filing': {
      const match = FilingService.matchIntentByQuery(args.event_description || '');
      if (!match) {
        return {
          identified: false,
          message: 'Could not directly map event. Please provide additional details or browse the Filing Catalog.'
        };
      }
      return {
        identified: true,
        confidence: match.confidence,
        intent: match.intent,
        explanation: match.explanation,
        recommended_form: match.intent.form_code,
        statutory_section: match.intent.section,
        deadline_rule: match.intent.deadline_rule,
        next_step: `Call prepare_director_change or prepare_filing to prepare this workflow for review.`
      };
    }
    case 'get_filing_requirements': {
      const intent = FilingService.getIntentById(args.form_code_or_intent);
      if (!intent) return { error: `Requirements for "${args.form_code_or_intent}" not found.` };
      return {
        form_code: intent.form_code,
        section: intent.section,
        prerequisites: intent.prerequisites,
        required_info: intent.required_info,
        required_documents: intent.required_documents,
        steps: intent.steps
      };
    }
    case 'get_application_status': {
      const app = await FilingService.getApplicationByNumber(args.application_no);
      if (!app) return { error: `Application SRN "${args.application_no}" not found.` };
      return { application: app };
    }
    case 'get_application_timeline': {
      const app = await FilingService.getApplicationByNumber(args.application_no);
      if (!app) return { error: `Application "${args.application_no}" not found.` };
      return {
        application_no: app.application_no,
        title: app.title,
        status: app.status,
        events: app.events || []
      };
    }
    case 'diagnose_filing_error': {
      const diagnosis = DiagnosticService.diagnose(args.error_message_or_code || '');
      return diagnosis;
    }
    case 'search_mca_knowledge': {
      const docs = await KnowledgeService.searchKnowledge(args.query || '');
      return { query: args.query, results: docs.results, total: docs.results.length };
    }

    // ----------------------------------------------------
    // LEVEL 2: PREPARE TOOLS
    // ----------------------------------------------------
    case 'prepare_company_registration': {
      const action = await ActionService.prepareCompanyRegistration(args, context);
      return {
        action_id: action.id,
        status: action.status,
        action_summary: action.preview.action_summary,
        company: action.preview.company_name,
        deadline: action.preview.deadline,
        required_documents: action.preview.required_documents,
        missing_requirements: action.preview.missing_requirements,
        preview: action.preview,
        confirmation_token: action.confirmation_token,
        confirmation_required: true,
        security_notice: '⚠️ THIS ACTION HAS NOT BEEN EXECUTED. Show the user the action preview and ask for explicit confirmation before continuing.'
      };
    }
    case 'prepare_director_change': {
      const action = await ActionService.prepareDirectorChange(args, context);
      return {
        action_id: action.id,
        status: action.status,
        action_summary: action.preview.action_summary,
        company: action.preview.company_name,
        deadline: action.preview.deadline,
        required_documents: action.preview.required_documents,
        missing_requirements: action.preview.missing_requirements,
        preview: action.preview,
        confirmation_token: action.confirmation_token,
        confirmation_required: true,
        security_notice: '⚠️ THIS ACTION HAS NOT BEEN EXECUTED. Show the user the action preview and ask for explicit confirmation before continuing.'
      };
    }
    case 'prepare_registered_office_change': {
      const action = await ActionService.prepareRegisteredOfficeChange(args, context);
      return {
        action_id: action.id,
        status: action.status,
        action_summary: action.preview.action_summary,
        company: action.preview.company_name,
        deadline: action.preview.deadline,
        required_documents: action.preview.required_documents,
        missing_requirements: action.preview.missing_requirements,
        preview: action.preview,
        confirmation_token: action.confirmation_token,
        confirmation_required: true,
        security_notice: '⚠️ THIS ACTION HAS NOT BEEN EXECUTED. Show the user the action preview and ask for explicit confirmation before continuing.'
      };
    }
    case 'prepare_filing': {
      const action = await ActionService.prepareFiling(args, context);
      return {
        action_id: action.id,
        status: action.status,
        action_summary: action.preview.action_summary,
        company: action.preview.company_name,
        deadline: action.preview.deadline,
        required_documents: action.preview.required_documents,
        missing_requirements: action.preview.missing_requirements,
        preview: action.preview,
        confirmation_token: action.confirmation_token,
        confirmation_required: true,
        security_notice: '⚠️ THIS ACTION HAS NOT BEEN EXECUTED. Show the user the action preview and ask for explicit confirmation before continuing.'
      };
    }
    case 'prepare_compliance_submission': {
      const action = await ActionService.prepareComplianceSubmission(args, context);
      return {
        action_id: action.id,
        status: action.status,
        action_summary: action.preview.action_summary,
        company: action.preview.company_name,
        deadline: action.preview.deadline,
        required_documents: action.preview.required_documents,
        missing_requirements: action.preview.missing_requirements,
        preview: action.preview,
        confirmation_token: action.confirmation_token,
        confirmation_required: true,
        security_notice: '⚠️ THIS ACTION HAS NOT BEEN EXECUTED. Show the user the action preview and ask for explicit confirmation before continuing.'
      };
    }

    // ----------------------------------------------------
    // LEVEL 3: EXECUTION & LIFECYCLE TOOLS
    // ----------------------------------------------------
    case 'get_action_status': {
      const action = await ActionService.getAction(args.action_id);
      if (!action) return { error: `Action "${args.action_id}" not found.` };
      const auditLogs = await ActionService.getActionAuditLogs(action.id);
      return { action, audit_trail: auditLogs };
    }
    case 'get_action_preview': {
      const action = await ActionService.getAction(args.action_id);
      if (!action) return { error: `Action "${args.action_id}" not found.` };
      return {
        action_id: action.id,
        status: action.status,
        preview: action.preview,
        authorization_required: action.authorization_required,
        authorization_status: action.authorization_status
      };
    }
    case 'confirm_action': {
      const result = await ActionService.confirmAction(args.action_id, args.confirmation_token, context);
      return {
        action_id: result.action.id,
        status: result.status,
        authorization_required: result.authorization_required,
        authorization_url: result.authorization_url,
        message: result.message,
        next_step: result.authorization_required 
          ? `Tell user: Please complete secure authorization/DSC signature at: ${result.authorization_url}`
          : `Action confirmed. You may now call execute_action when ready.`
      };
    }
    case 'cancel_action': {
      const action = await ActionService.cancelAction(args.action_id, args.reason, context);
      return {
        action_id: action.id,
        status: action.status,
        message: 'Action was successfully cancelled.'
      };
    }
    case 'execute_action': {
      const execution = await ActionService.executeAction(args.action_id, args.idempotency_key, context);
      return {
        status: execution.status,
        reference_number: execution.reference_number,
        submitted_at: execution.submitted_at,
        receipt: execution.receipt,
        disclaimer: 'DEMO EXECUTION MODE: Internal Future MCA workflow registered and validated.'
      };
    }

    default:
      throw new Error(`Tool "${name}" is not implemented.`);
  }
}
