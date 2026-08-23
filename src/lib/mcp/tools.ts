import { CompanyService } from '@/lib/services/companyService';
import { ComplianceService } from '@/lib/services/complianceService';
import { FilingService } from '@/lib/services/filingService';
import { DiagnosticService } from '@/lib/services/diagnosticService';
import { KnowledgeService } from '@/lib/services/knowledgeService';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export const MCP_TOOLS: ToolDefinition[] = [
  {
    name: 'search_company',
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
    name: 'validate_filing',
    description: 'Validate draft filing data against MCA V3 business rules and attachment specifications.',
    inputSchema: {
      type: 'object',
      properties: {
        form_code: { type: 'string', description: 'e.g. DIR-12, AOC-4' },
        data: { type: 'object', description: 'Form data payload to validate' }
      },
      required: ['form_code', 'data']
    }
  },
  {
    name: 'get_application_status',
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
    description: 'Search official MCA guidance, Companies Act 2013 rules, circulars, and FAQs.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Topic or legal question to search' }
      },
      required: ['query']
    }
  }
];

export async function executeMcpTool(
  name: string, 
  args: any = {}, 
  context: { workspaceId?: string; userId?: string } = {}
): Promise<any> {
  switch (name) {
    case 'search_company': {
      const companies = context.workspaceId 
        ? await CompanyService.listCompanies(context.workspaceId)
        : await CompanyService.searchCompanies(args.query || '');

      const q = (args.query || '').toLowerCase().trim();
      const results = q 
        ? companies.filter(c => c.name.toLowerCase().includes(q) || c.cin.toLowerCase().includes(q))
        : companies;

      return { companies: results, total: results.length, workspace_id: context.workspaceId || 'universal' };
    }
    case 'get_company_profile': {
      const target = (args.cin || args.company_name || args.name || args.query || args.company || args.id || '').trim();
      const company = await CompanyService.getCompanyByCin(target);
      if (!company) return { error: `Company "${target}" not found in database.` };
      const directors = await CompanyService.getCompanyDirectors(company.id);
      return { company: { ...company, directors } };
    }
    case 'get_company_directors': {
      const target = (args.cin || args.company_name || args.name || args.query || args.company || args.id || '').trim();
      const directors = await CompanyService.getCompanyDirectors(target);
      return { directors, total: directors.length };
    }
    case 'get_compliance_status': {
      const target = (args.cin || args.company_name || args.name || args.query || args.company || args.id || '').trim();
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
      const target = (args.cin || args.company_name || args.name || args.query || args.company || args.id || '').trim();
      const deadlines = await ComplianceService.getUpcomingDeadlines(target);
      return { deadlines, total: deadlines.length };
    }
    case 'get_next_required_action': {
      const target = (args.cin || args.company_name || args.name || args.query || args.company || args.id || '').trim();
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
        company: company?.name
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
        deadline_rule: match.intent.deadline_rule
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
    case 'validate_filing': {
      const formCode = (args.form_code || '').toUpperCase();
      const issues: string[] = [];
      if (formCode === 'DIR-12') {
        if (!args.data?.resigning_din && !args.data?.new_din) {
          issues.push('Director Identification Number (DIN) is mandatory.');
        }
        if (!args.data?.effective_date) {
          issues.push('Effective date of change is required.');
        }
      } else if (formCode === 'INC-22') {
        if (!args.data?.pin_code || args.data.pin_code.length !== 6) {
          issues.push('Valid 6-digit postal PIN code is required.');
        }
        if (!args.data?.utility_bill_date) {
          issues.push('Utility bill date must be provided (must be within 60 days).');
        }
      }
      return {
        form_code: formCode,
        is_valid: issues.length === 0,
        validation_status: issues.length === 0 ? 'PASSED_PRE_SCRUTINY' : 'FAILED_VALIDATION',
        issues
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
    default:
      throw new Error(`Tool "${name}" is not implemented.`);
  }
}
