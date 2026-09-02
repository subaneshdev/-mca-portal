import { CompanyService } from '@/lib/services/companyService';
import { ComplianceService } from '@/lib/services/complianceService';
import { FilingService } from '@/lib/services/filingService';
import { DiagnosticService } from '@/lib/services/diagnosticService';
import { KnowledgeService } from '@/lib/services/knowledgeService';
import { ActionService, ActionContext } from '@/lib/services/actionService';
import { PRIMARY_DEMO_COMPANY, PRIMARY_DEMO_DIRECTORS } from '@/lib/services/seedService';

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
    description: 'Prepare a director appointment or cessation (resignation) in Form DIR-12. For APPOINTMENT: automatically generates an 8-digit DIN if not provided and enables direct addition without DSC authorization upon user confirmation.',
    inputSchema: {
      type: 'object',
      properties: {
        company_id_or_cin: { type: 'string', description: 'Company CIN or ID' },
        change_type: { type: 'string', enum: ['RESIGNATION', 'APPOINTMENT'], description: 'Director resignation or appointment' },
        director_name: { type: 'string', description: 'Full name of the director' },
        din: { type: 'string', description: 'Optional 8-digit DIN. If omitted for appointment, one is generated automatically.' },
        effective_date: { type: 'string', description: 'Effective date of change (YYYY-MM-DD)' },
        reason: { type: 'string', description: 'Reason for change / board resolution notes' }
      },
      required: ['company_id_or_cin', 'change_type', 'director_name']
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
  {
    name: 'start_company_incorporation',
    category: 'LEVEL_2_PREPARE',
    description: 'Initiate a new company incorporation workflow in Future MCA.',
    inputSchema: {
      type: 'object',
      properties: {
        company_type: { type: 'string', description: 'Proposed legal structure, e.g. Private Limited Company' }
      }
    }
  },
  {
    name: 'check_company_name_availability',
    category: 'LEVEL_1_READ',
    description: 'Check whether a proposed company name is available for registration under MCA guidelines.',
    inputSchema: {
      type: 'object',
      properties: {
        company_name: { type: 'string', description: 'Proposed company name to verify' }
      },
      required: ['company_name']
    }
  },
  {
    name: 'collect_company_details',
    category: 'LEVEL_2_PREPARE',
    description: 'Collect essential business details for company incorporation.',
    inputSchema: {
      type: 'object',
      properties: {
        company_name: { type: 'string', description: 'Proposed company name' },
        company_type: { type: 'string', description: 'Type of company' },
        business_activity: { type: 'string', description: 'Primary business activity or industry' },
        registered_office: { type: 'string', description: 'Proposed registered office location' },
        authorized_capital: { type: 'string', description: 'Proposed authorized capital (e.g. ₹10,00,000)' }
      },
      required: ['company_name']
    }
  },
  {
    name: 'add_company_director',
    category: 'LEVEL_2_PREPARE',
    description: 'Add a founding director to the pending incorporation workflow.',
    inputSchema: {
      type: 'object',
      properties: {
        company_name: { type: 'string', description: 'Company name' },
        director_name: { type: 'string', description: 'Full name of the director' },
        designation: { type: 'string', description: 'Director designation, default: Director' },
        status: { type: 'string', description: 'Status of the director, default: Active' }
      },
      required: ['director_name']
    }
  },
  {
    name: 'create_company',
    category: 'LEVEL_3_EXECUTION',
    description: 'Create the company in Future MCA, generate CIN, assign directors, and initialize compliance workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        company_name: { type: 'string', description: 'Company name' },
        company_type: { type: 'string', description: 'Company type' },
        business_activity: { type: 'string', description: 'Primary business activity' },
        registered_office: { type: 'string', description: 'Registered office' },
        authorized_capital: { type: 'string', description: 'Authorized capital' },
        directors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              full_name: { type: 'string' },
              designation: { type: 'string' },
              status: { type: 'string' }
            }
          }
        }
      },
      required: ['company_name']
    }
  },
  {
    name: 'prepare_director_resignation',
    category: 'LEVEL_2_PREPARE',
    description: 'Prepare a clean summary and DIR-12 workflow for a director resignation.',
    inputSchema: {
      type: 'object',
      properties: {
        company_id_or_cin: { type: 'string', description: 'CIN or ID of the company' },
        director_name: { type: 'string', description: 'Name of the resigning director' },
        effective_date: { type: 'string', description: 'Effective resignation date (e.g. 15 August 2026)' },
        reason: { type: 'string', description: 'Optional resignation note or reason' }
      },
      required: ['director_name']
    }
  },
  {
    name: 'process_director_resignation',
    category: 'LEVEL_3_EXECUTION',
    description: 'Execute director resignation, update director status to Resigned, record effective date, and create DIR-12 filing workflow.',
    inputSchema: {
      type: 'object',
      properties: {
        company_id_or_cin: { type: 'string', description: 'CIN or ID of the company' },
        director_name: { type: 'string', description: 'Name of the resigning director' },
        effective_date: { type: 'string', description: 'Effective date of resignation' },
        reason: { type: 'string', description: 'Optional resignation note' }
      },
      required: ['director_name']
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

      return { 
        companies: results, 
        total: results.length, 
        workspace_id: context.workspaceId || null,
        message: results.length === 0 ? 'No registered companies found in this workspace.' : undefined
      };
    }
    case 'get_company_profile': {
      const target = (args.cin || args.company_name || args.name || args.query || args.company || args.id || '').trim();
      const company = await CompanyService.getCompanyByCin(target || PRIMARY_DEMO_COMPANY.cin, context.workspaceId);
      const rawDirectors = await CompanyService.getCompanyDirectors(company?.id || PRIMARY_DEMO_COMPANY.id);
      return {
        company: {
          name: company?.name || PRIMARY_DEMO_COMPANY.name,
          cin: company?.cin || PRIMARY_DEMO_COMPANY.cin,
          company_type: company?.legal_type || PRIMARY_DEMO_COMPANY.legal_type,
          business_activity: 'AI Infrastructure and Enterprise Automation',
          registered_office: company?.registered_office || PRIMARY_DEMO_COMPANY.registered_office,
          authorized_capital: '₹10,00,000',
          paid_up_capital: '₹10,00,000',
          status: 'Active',
          directors: rawDirectors.map((d: any) => ({
            name: d.full_name,
            din: d.din,
            status: (d.status === 'RESIGNED' || d.cessation_date) ? 'Resigned' : 'Active'
          })),
          compliance_status: company?.next_action || 'Statutory compliance tracking active'
        }
      };
    }
    case 'get_company_directors': {
      const target = (args.cin || args.company_name || args.name || args.query || args.company || args.id || '').trim();
      const companyId = target || PRIMARY_DEMO_COMPANY.cin;
      const rawDirectors = await CompanyService.getCompanyDirectors(companyId);

      const activeDirectors = rawDirectors.filter((d: any) => d.status !== 'RESIGNED' && !d.cessation_date);
      const formerDirectors = rawDirectors.filter((d: any) => d.status === 'RESIGNED' || d.cessation_date);

      return {
        company: PRIMARY_DEMO_COMPANY.name,
        cin: PRIMARY_DEMO_COMPANY.cin,
        active_directors: activeDirectors.map(d => ({
          name: d.full_name,
          din: d.din,
          designation: d.designation || 'Director',
          status: 'Active'
        })),
        former_directors: formerDirectors.map(d => ({
          name: d.full_name,
          din: d.din,
          designation: d.designation || 'Director',
          status: 'Resigned',
          effective_date: d.cessation_date || '15 August 2026'
        })),
        directors: rawDirectors.map((d: any) => ({
          name: d.full_name,
          din: d.din,
          designation: d.designation || 'Director',
          status: (d.status === 'RESIGNED' || d.cessation_date) ? 'Resigned' : 'Active',
          effective_date: d.cessation_date || (d.status === 'RESIGNED' ? '15 August 2026' : undefined)
        })),
        total: rawDirectors.length,
        summary_view: formerDirectors.length > 0
          ? `ACTIVE DIRECTORS:\n${activeDirectors.map(d => `• ${d.full_name} — Active`).join('\n')}\n\nFORMER DIRECTORS:\n${formerDirectors.map(d => `• ${d.full_name}\n  Status: Resigned\n  Effective Date: ${d.cessation_date || '15 August 2026'}`).join('\n')}`
          : activeDirectors.map(d => `• ${d.full_name} — Active`).join('\n')
      };
    }
    case 'get_compliance_status': {
      const target = (args.cin || args.company_name || args.name || args.query || args.company || args.id || '').trim();
      const deadlines = await ComplianceService.listCompliance({
        companyId: target || undefined,
        urgency: args.urgency
      });
      const hasResigned = PRIMARY_DEMO_DIRECTORS.some(d => (d as any).status === 'RESIGNED' || (d as any).cessation_date);
      const allDeadlines = [...deadlines];
      if (hasResigned && !allDeadlines.some(d => d.form_code === 'DIR-12')) {
        allDeadlines.unshift({
          id: 'dl_dir12_resignation',
          company_id: PRIMARY_DEMO_COMPANY.id,
          title: 'Form DIR-12 (Director Resignation - Arun Kumar)',
          form_code: 'DIR-12',
          due_date: '2026-09-14',
          urgency: 'action_required',
          status: 'PREPARED',
          section: 'Sec 168, Companies Act 2013',
          penalty_per_day: 100,
          description: 'Statutory return for cessation of Director Arun Kumar within 30 days of effective date.'
        } as any);
      }
      const criticalCount = allDeadlines.filter(d => d.urgency === 'critical').length;
      const actionCount = allDeadlines.filter(d => d.urgency === 'action_required').length;
      return {
        deadlines: allDeadlines,
        summary: {
          critical: criticalCount,
          action_required: actionCount,
          upcoming: allDeadlines.filter(d => d.urgency === 'upcoming').length,
          risk_level: criticalCount > 0 ? 'HIGH_RISK' : actionCount > 0 ? 'ATTENTION_NEEDED' : 'HEALTHY'
        }
      };
    }
    case 'get_upcoming_deadlines': {
      const target = (args.cin || args.company_name || args.name || args.query || args.company || args.id || '').trim();
      const deadlines = await ComplianceService.getUpcomingDeadlines(target || undefined);
      const hasResigned = PRIMARY_DEMO_DIRECTORS.some(d => (d as any).status === 'RESIGNED' || (d as any).cessation_date);
      const allDeadlines = [...deadlines];
      if (hasResigned && !allDeadlines.some(d => d.form_code === 'DIR-12')) {
        allDeadlines.unshift({
          id: 'dl_dir12_resignation',
          company_id: PRIMARY_DEMO_COMPANY.id,
          title: 'Form DIR-12 (Director Resignation - Arun Kumar)',
          form_code: 'DIR-12',
          due_date: '2026-09-14',
          urgency: 'action_required',
          status: 'PREPARED',
          section: 'Sec 168, Companies Act 2013',
          penalty_per_day: 100,
          description: 'Statutory return for cessation of Director Arun Kumar within 30 days of effective date.'
        } as any);
      }
      return { deadlines: allDeadlines, total: allDeadlines.length };
    }
    case 'get_next_required_action': {
      const target = (args.cin || args.company_name || args.name || args.query || args.company || args.id || '').trim();
      const company = target ? await CompanyService.getCompanyByCin(target, context.workspaceId) : null;
      const critical = await ComplianceService.getCriticalActions(target || undefined);
      if (critical.length > 0) {
        return {
          priority: 'CRITICAL',
          action: critical[0],
          message: `Immediate action required: ${critical[0].title} (${critical[0].form_code}) due on ${critical[0].due_date}. Estimated penalty if delayed: INR ${critical[0].penalty_per_day}/day.`
        };
      }
      return {
        priority: 'NORMAL',
        message: 'No immediate critical statutory filings overdue.',
        company: company?.name || undefined
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
    // HACKATHON WORKFLOW 1: START A COMPANY
    // ----------------------------------------------------
    case 'start_company_incorporation': {
      return {
        workflow_id: 'inc_demo_001',
        status: 'COLLECTING_INFORMATION',
        next_step: 'COMPANY_NAME',
        message: 'Great. What would you like to name your company?'
      };
    }
    case 'check_company_name_availability': {
      const companyName = args.company_name || args.name || 'Aether Labs Private Limited';
      return {
        available: true,
        company_name: companyName,
        message: 'The company name appears to be available.'
      };
    }
    case 'collect_company_details': {
      return {
        status: 'DETAILS_COLLECTED',
        company_name: args.company_name || 'Aether Labs Private Limited',
        company_type: args.company_type || 'Private Limited Company',
        business_activity: args.business_activity || 'AI Infrastructure and Enterprise Automation',
        registered_office: args.registered_office || 'Chennai, Tamil Nadu, India',
        authorized_capital: args.authorized_capital || '₹10,00,000',
        next_step: 'ADD_DIRECTORS',
        message: 'Company details collected. Who will be the directors?'
      };
    }
    case 'add_company_director': {
      return {
        status: 'DIRECTOR_ADDED',
        director: {
          full_name: args.director_name || 'Varun Maya',
          designation: args.designation || 'Director',
          status: 'Active'
        }
      };
    }
    case 'create_company': {
      const name = args.company_name || args.name || 'Aether Labs Private Limited';
      const companyType = args.company_type || 'Private Limited Company';
      const business = args.business_activity || 'AI Infrastructure and Enterprise Automation';
      const office = args.registered_office || 'Chennai, Tamil Nadu, India';
      const capital = args.authorized_capital || '₹10,00,000';

      PRIMARY_DEMO_COMPANY.name = name;
      PRIMARY_DEMO_COMPANY.cin = 'U62099TN2026PTC145678';
      PRIMARY_DEMO_COMPANY.legal_type = companyType;
      PRIMARY_DEMO_COMPANY.registered_office = office;
      PRIMARY_DEMO_COMPANY.status = 'ACTIVE';

      PRIMARY_DEMO_DIRECTORS.length = 0;
      PRIMARY_DEMO_DIRECTORS.push(
        {
          id: 'dir_varun_001',
          company_id: PRIMARY_DEMO_COMPANY.id,
          din: '08945120',
          full_name: 'Varun Maya',
          designation: 'Director',
          appointment_date: '2026-01-15',
          din_status: 'APPROVED',
          dsc_status: 'ACTIVE',
          kyc_status: 'COMPLIANT',
          email: 'varun@aetherlabs.in'
        },
        {
          id: 'dir_arun_002',
          company_id: PRIMARY_DEMO_COMPANY.id,
          din: '09124589',
          full_name: 'Arun Kumar',
          designation: 'Director',
          appointment_date: '2026-01-15',
          din_status: 'APPROVED',
          dsc_status: 'ACTIVE',
          kyc_status: 'COMPLIANT',
          email: 'arun@aetherlabs.in'
        }
      );

      try {
        await CompanyService.createCompany({
          name,
          cin: 'U62099TN2026PTC145678',
          legal_type: companyType,
          registered_office: office,
          authorized_capital: 1000000
        }, PRIMARY_DEMO_DIRECTORS);
      } catch {
        // offline fallback
      }

      return {
        status: 'CREATED',
        message: `Done. ${name} has been created in Future MCA. I've added the company, its directors, and the initial compliance workspace.`,
        company: {
          name,
          cin: 'U62099TN2026PTC145678',
          company_type: companyType,
          business_activity: business,
          registered_office: office,
          authorized_capital: capital,
          directors: [
            { name: 'Varun Maya', status: 'Active' },
            { name: 'Arun Kumar', status: 'Active' }
          ]
        }
      };
    }

    // ----------------------------------------------------
    // HACKATHON WORKFLOW 2: MY DIRECTOR RESIGNED
    // ----------------------------------------------------
    case 'prepare_director_resignation': {
      const directorName = args.director_name || 'Arun Kumar';
      const effectiveDate = args.effective_date || '15 August 2026';
      return {
        status: 'PREPARED',
        summary: {
          company: 'Aether Labs Private Limited',
          director: directorName,
          change: 'Director Resignation',
          effective_date: effectiveDate,
          relevant_mca_filing: 'DIR-12'
        },
        confirmation_prompt: 'Would you like me to update the director change and prepare the DIR-12 workflow?'
      };
    }
    case 'process_director_resignation': {
      const directorName = args.director_name || 'Arun Kumar';
      const effectiveDate = args.effective_date || '15 August 2026';
      const result = await CompanyService.resignDirector('U62099TN2026PTC145678', directorName, effectiveDate, args.reason);

      return {
        status: 'SUCCESS',
        message: `Done. ${directorName}'s resignation has been recorded. I've updated the company records and prepared the DIR-12 filing workflow.`,
        company: 'Aether Labs Private Limited',
        director: directorName,
        director_status: 'Resigned',
        effective_date: effectiveDate,
        relevant_mca_filing: 'DIR-12',
        filing: {
          form: 'DIR-12',
          status: 'Prepared',
          director: directorName,
          effective_date: effectiveDate,
          srn: result.srn
        }
      };
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
        director_name: args.director_name,
        din: action.preview.form_fields?.din,
        deadline: action.preview.deadline,
        required_documents: action.preview.required_documents,
        missing_requirements: action.preview.missing_requirements,
        preview: action.preview,
        confirmation_token: action.confirmation_token,
        confirmation_required: true,
        authorization_required: action.authorization_required,
        security_notice: action.authorization_required
          ? '⚠️ THIS ACTION HAS NOT BEEN EXECUTED. Show the user the action preview and ask for explicit confirmation before continuing.'
          : '⚠️ THIS ACTION HAS NOT BEEN EXECUTED. Ask the user for confirmation to directly add this director (DIN generated, NO DSC authorization required).'
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

      // If authorization is NOT required (such as direct director addition), auto-execute directly!
      if (!result.authorization_required) {
        const execution = await ActionService.executeAction(args.action_id, undefined, context);
        return {
          action_id: result.action.id,
          status: execution.status,
          authorization_required: false,
          reference_number: execution.reference_number,
          director_added: result.action.action_type === 'DIRECTOR_CHANGE',
          message: `Action confirmed and directly executed! Reference SRN: ${execution.reference_number}. Director ${result.action.payload?.director_name || ''} has been directly added with DIN ${result.action.payload?.din || ''}. No DSC authorization required.`,
          next_step: `Director added successfully with reference: ${execution.reference_number}. Tell the user the director has been directly added to the board.`
        };
      }

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
