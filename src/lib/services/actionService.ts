import { supabase } from '@/lib/supabase';
import { 
  McpAction, 
  McpActionStatus, 
  McpActionAuditLog, 
  ActionAuditEventType, 
  ActorType, 
  AuthorizationType,
  ActionPreview
} from '@/types/actions';
import { CompanyService } from './companyService';
import { FilingService } from './filingService';

// In-memory cache for fast responsive fallbacks and test environments
const ACTION_STORE = new Map<string, McpAction>();
const AUDIT_STORE: McpActionAuditLog[] = [];

export interface ActionContext {
  workspaceId?: string;
  userId?: string;
  actorType?: ActorType;
  clientName?: string;
  clientType?: string;
}

export class ActionService {
  /**
   * Generate a secure, unique confirmation token with expiration
   */
  private static generateToken(): string {
    const randomHex = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return `act_tok_${Date.now().toString(36)}_${randomHex}`;
  }

  /**
   * Log an audit event in Supabase and local store
   */
  static async logAuditEvent(params: {
    actionId: string;
    userId?: string | null;
    eventType: ActionAuditEventType;
    actorType: ActorType;
    clientName?: string;
    clientType?: string;
    details: Record<string, any>;
  }): Promise<McpActionAuditLog> {
    const logEntry: McpActionAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action_id: params.actionId,
      user_id: params.userId || null,
      event_type: params.eventType,
      actor_type: params.actorType,
      client_name: params.clientName || 'AI_AGENT',
      client_type: params.clientType || 'MCP_CLIENT',
      details: params.details,
      created_at: new Date().toISOString()
    };

    AUDIT_STORE.unshift(logEntry);

    try {
      await supabase.from('mcp_action_audit_logs').insert({
        action_id: logEntry.action_id,
        user_id: logEntry.user_id,
        event_type: logEntry.event_type,
        actor_type: logEntry.actor_type,
        client_name: logEntry.client_name,
        client_type: logEntry.client_type,
        details: logEntry.details
      });
    } catch {
      // Supabase table fallback handled
    }

    return logEntry;
  }

  /**
   * Retrieve all audit logs for a specific action
   */
  static async getActionAuditLogs(actionId: string): Promise<McpActionAuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('mcp_action_audit_logs')
        .select('*')
        .eq('action_id', actionId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch {
      // fallback to memory
    }

    return AUDIT_STORE.filter(a => a.action_id === actionId).reverse();
  }

  /**
  /**
   * List all actions for workspace or company
   */
  static async listActions(workspaceId?: string, companyId?: string): Promise<McpAction[]> {
    try {
      let query = supabase.from('mcp_actions').select('*').order('created_at', { ascending: false });
      
      if (companyId) {
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        data.forEach((act: McpAction) => ACTION_STORE.set(act.id, act));
        return data;
      }
    } catch (err) {
      console.error('Error fetching mcp_actions from Supabase:', err);
    }

    const memoryActions = Array.from(ACTION_STORE.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (companyId) {
      return memoryActions.filter(a => !a.company_id || a.company_id === companyId);
    }
    return memoryActions;
  }

  /**
   * Get the most recently prepared action awaiting confirmation
   */
  static async getLatestPendingAction(companyIdOrCin?: string): Promise<McpAction | null> {
    const memoryActions = Array.from(ACTION_STORE.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const pending = memoryActions.filter(a =>
      a.status === 'AWAITING_USER_CONFIRMATION' ||
      a.status === 'CONFIRMED' ||
      a.status === 'AUTHORIZATION_REQUIRED'
    );

    if (companyIdOrCin) {
      const matched = pending.find(a =>
        a.company_id === companyIdOrCin ||
        a.payload?.company_cin === companyIdOrCin ||
        (a.company_name && a.company_name.toLowerCase().includes(companyIdOrCin.toLowerCase()))
      );
      if (matched) return matched;
    }

    return pending[0] || null;
  }

  /**
   * Get an action by its ID
   */
  static async getAction(actionId: string): Promise<McpAction | null> {
    if (!actionId) return null;

    try {
      const { data, error } = await supabase
        .from('mcp_actions')
        .select('*')
        .eq('id', actionId)
        .single();

      if (!error && data) {
        ACTION_STORE.set(data.id, data);
        return data;
      }
    } catch {
      // fallback
    }

    return ACTION_STORE.get(actionId) || null;
  }

  /**
   * LEVEL 2: Prepare a Company Registration Draft
   */
  static async prepareCompanyRegistration(
    payload: {
      proposed_names: string[];
      company_type: 'PVT_LTD' | 'LLP' | 'OPC' | 'PUBLIC_LTD';
      authorized_capital?: number;
      paid_up_capital?: number;
      registered_state: string;
      directors: Array<{ full_name: string; email: string; pan?: string; din?: string }>;
      business_activity_code?: string;
    },
    context: ActionContext = {}
  ): Promise<McpAction> {
    const actionId = `act_reg_${Date.now()}`;
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 mins

    const primaryName = payload.proposed_names[0] || 'Proposed Enterprise Pvt Ltd';
    const preview: ActionPreview = {
      form_code: 'SPICe+ (INC-32 / AGILE-PRO-S)',
      action_summary: `Incorporate new ${payload.company_type} entity: "${primaryName}"`,
      company_name: primaryName,
      statutory_section: 'Section 7 of Companies Act 2013 read with Rule 12',
      deadline: 'Name approval reservation valid for 20 days upon approval',
      required_documents: [
        'Memorandum of Association (SPICe+ MOA / INC-33)',
        'Articles of Association (SPICe+ AOA / INC-34)',
        'Director KYC Proofs & PAN Copy',
        'Registered Office Proof (Electricity Bill + NOC within 60 days)',
        'Director Consent to Act in Form DIR-2'
      ],
      missing_requirements: payload.directors.length < 2 && payload.company_type === 'PVT_LTD'
        ? ['Private Limited requires minimum 2 directors (only 1 provided)']
        : [],
      prerequisites: [
        'Class 3 Digital Signature Certificate (DSC) for all subscribing directors',
        'Active MCA V3 portal Business User account'
      ],
      form_fields: {
        proposed_names: payload.proposed_names,
        entity_type: payload.company_type,
        authorized_capital_inr: payload.authorized_capital || 100000,
        paid_up_capital_inr: payload.paid_up_capital || 100000,
        state_jurisdiction: payload.registered_state,
        promoters_count: payload.directors.length
      },
      estimated_fee: 1000,
      notice: 'DEMO EXECUTION MODE: Preparing official SPICe+ Part A/B electronic submission pack for MCA V3.'
    };

    const action: McpAction = {
      id: actionId,
      workspace_id: context.workspaceId || null,
      company_id: null,
      company_name: primaryName,
      user_id: context.userId || null,
      action_type: 'COMPANY_REGISTRATION',
      status: 'AWAITING_USER_CONFIRMATION',
      payload,
      preview,
      confirmation_token: token,
      confirmation_expires_at: expiresAt,
      authorization_required: true,
      authorization_type: 'DSC_SIGNATURE',
      authorization_status: 'PENDING',
      client_metadata: {
        client_name: context.clientName || 'Claude',
        client_type: context.clientType || 'mcp',
        initiated_via: 'prepare_company_registration'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.persistAction(action);
    await this.logAuditEvent({
      actionId: action.id,
      userId: context.userId,
      eventType: 'ACTION_CREATED',
      actorType: context.actorType || 'AI_CLIENT',
      clientName: context.clientName,
      clientType: context.clientType,
      details: { action_type: action.action_type, proposed_name: primaryName }
    });

    return action;
  }

  /**
   * LEVEL 2: Prepare Director Change (DIR-12 Appointment or Resignation)
   */
  static async prepareDirectorChange(
    payload: {
      company_id_or_cin: string;
      change_type: 'RESIGNATION' | 'APPOINTMENT';
      director_name: string;
      din?: string;
      effective_date: string;
      reason?: string;
      documents?: string[];
    },
    context: ActionContext = {}
  ): Promise<McpAction> {
    const company = await CompanyService.getCompanyByCin(payload.company_id_or_cin);
    const actionId = `act_dir_${Date.now()}`;
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const isResignation = payload.change_type === 'RESIGNATION';
    const formCode = 'DIR-12';
    const statutorySection = isResignation 
      ? 'Section 168 of Companies Act 2013 read with Rule 15 of Companies (Appointment and Qualification of Directors) Rules'
      : 'Section 152 / 161 of Companies Act 2013 read with Rule 18';

    // Auto-generate a valid 8-digit DIN for appointments if not provided
    const dinNumber = payload.din || (isResignation ? '09124589' : `09${Math.floor(100000 + Math.random() * 900000)}`);
    payload.din = dinNumber;

    // Calculate deadline: 30 days from effective date
    const effDate = new Date(payload.effective_date || Date.now());
    const deadlineDate = new Date(effDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const deadlineStr = deadlineDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const requiredDocs = isResignation ? [
      'Formal Resignation Notice / Letter from Director',
      'Certified True Copy of Board Resolution noting the cessation',
      'Proof of dispatch / receipt of resignation notice'
    ] : [
      'Consent to Act as Director in Form DIR-2',
      'Board Resolution approving appointment',
      'PAN / Identity verification proof'
    ];

    // For direct appointments, DSC authorization is NOT required
    const isAuthRequired = isResignation;

    const preview: ActionPreview = {
      form_code: formCode,
      action_summary: isResignation 
        ? `Submit Form DIR-12 for cessation of Director ${payload.director_name} (DIN: ${dinNumber})`
        : `Directly add ${payload.director_name} as Director (DIN: ${dinNumber})`,
      company_name: company?.name || 'Your Company',
      cin: company?.cin,
      statutory_section: statutorySection,
      deadline: `${deadlineStr} (Strict 30 days statutory window)`,
      required_documents: requiredDocs,
      missing_requirements: [],
      prerequisites: isResignation ? [
        'Director Identification Number (DIN) must be in APPROVED active status',
        'Signing Director / Company Secretary must have active Class 3 DSC mapped on MCA V3'
      ] : [
        `DIN ${dinNumber} generated and pre-allocated for ${payload.director_name}`,
        'Direct Addition Mode: No DSC token authorization required upon user confirmation'
      ],
      form_fields: {
        company_cin: company?.cin,
        company_name: company?.name,
        director_name: payload.director_name,
        din: dinNumber,
        change_category: payload.change_type,
        effective_date: payload.effective_date,
        reason: payload.reason || (isResignation ? 'Personal commitments' : 'Strategic board expansion')
      },
      estimated_fee: 300,
      estimated_penalty_per_day: 100,
      notice: isResignation
        ? 'DEMO EXECUTION MODE: Prepares standard e-Form DIR-12 schema with statutory compliance safeguards.'
        : `DIRECT ADDITION MODE: DIN ${dinNumber} allocated. Directly adds to company records upon confirmation (no DSC authorization required).`
    };

    const action: McpAction = {
      id: actionId,
      workspace_id: company?.workspace_id || context.workspaceId || null,
      company_id: company?.id || null,
      company_name: company?.name || 'Authorized Entity',
      user_id: context.userId || null,
      action_type: 'DIRECTOR_CHANGE',
      status: 'AWAITING_USER_CONFIRMATION',
      payload: { ...payload, din: dinNumber, company_cin: company?.cin, company_name: company?.name },
      preview,
      confirmation_token: token,
      confirmation_expires_at: expiresAt,
      authorization_required: isAuthRequired,
      authorization_type: isAuthRequired ? 'DSC_SIGNATURE' : undefined,
      authorization_status: isAuthRequired ? 'PENDING' : 'NOT_REQUIRED',
      client_metadata: {
        client_name: context.clientName || 'Claude',
        client_type: context.clientType || 'mcp',
        initiated_via: 'prepare_director_change'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.persistAction(action);
    await this.logAuditEvent({
      actionId: action.id,
      userId: context.userId,
      eventType: 'ACTION_CREATED',
      actorType: context.actorType || 'AI_CLIENT',
      clientName: context.clientName,
      clientType: context.clientType,
      details: { form: 'DIR-12', director: payload.director_name, change_type: payload.change_type }
    });

    return action;
  }

  /**
   * LEVEL 2: Prepare Registered Office Change (INC-22)
   */
  static async prepareRegisteredOfficeChange(
    payload: {
      company_id_or_cin: string;
      new_address_line1: string;
      new_address_line2?: string;
      city: string;
      state: string;
      pincode: string;
      effective_date: string;
      is_within_local_limits?: boolean;
    },
    context: ActionContext = {}
  ): Promise<McpAction> {
    const company = await CompanyService.getCompanyByCin(payload.company_id_or_cin);
    const actionId = `act_off_${Date.now()}`;
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const fullNewAddress = `${payload.new_address_line1}, ${payload.new_address_line2 || ''}, ${payload.city}, ${payload.state} - ${payload.pincode}`;
    const effDate = new Date(payload.effective_date || Date.now());
    const deadlineDate = new Date(effDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const deadlineStr = deadlineDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const preview: ActionPreview = {
      form_code: 'INC-22',
      action_summary: `Change Registered Office of ${company?.name || 'Company'} to "${fullNewAddress}"`,
      company_name: company?.name || 'Your Company',
      cin: company?.cin,
      statutory_section: 'Section 12(2) & 12(4) of Companies Act 2013 read with Rule 25 & 27',
      deadline: `${deadlineStr} (Must be filed within 30 days of office relocation)`,
      required_documents: [
        'Proof of Registered Office Address (Electricity bill / Gas bill / Telephone bill not older than 2 months)',
        'Notarized Lease Deed / Rent Agreement or Conveyance Deed',
        'NOC (No Objection Certificate) from property owner to use premises',
        'Board Resolution authorizing change of registered office'
      ],
      missing_requirements: payload.pincode.length !== 6 ? ['Invalid 6-digit postal PIN code'] : [],
      prerequisites: ['Company status must be ACTIVE-COMPLIANT', 'Premises must be physically accessible by RoC notices'],
      form_fields: {
        old_office: company?.registered_office || 'Existing registered address',
        new_office: fullNewAddress,
        effective_date: payload.effective_date,
        pincode: payload.pincode,
        local_limits_preserved: payload.is_within_local_limits ?? true
      },
      estimated_fee: 600,
      estimated_penalty_per_day: 1000,
      notice: 'DEMO EXECUTION MODE: Prepares INC-22 statutory address validation workflow.'
    };

    const action: McpAction = {
      id: actionId,
      workspace_id: company?.workspace_id || context.workspaceId || null,
      company_id: company?.id || null,
      company_name: company?.name || 'Authorized Entity',
      user_id: context.userId || null,
      action_type: 'REGISTERED_OFFICE_CHANGE',
      status: 'AWAITING_USER_CONFIRMATION',
      payload: { ...payload, full_new_address: fullNewAddress, company_cin: company?.cin },
      preview,
      confirmation_token: token,
      confirmation_expires_at: expiresAt.toISOString(),
      authorization_required: true,
      authorization_type: 'DSC_SIGNATURE',
      authorization_status: 'PENDING',
      client_metadata: {
        client_name: context.clientName || 'Claude',
        client_type: context.clientType || 'mcp',
        initiated_via: 'prepare_registered_office_change'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.persistAction(action);
    await this.logAuditEvent({
      actionId: action.id,
      userId: context.userId,
      eventType: 'ACTION_CREATED',
      actorType: context.actorType || 'AI_CLIENT',
      clientName: context.clientName,
      clientType: context.clientType,
      details: { form: 'INC-22', new_address: fullNewAddress }
    });

    return action;
  }

  /**
   * LEVEL 2: Prepare General Filing (e.g. DIR-12, INC-22, PAS-3, AOC-4, MGT-7)
   */
  static async prepareFiling(
    payload: {
      company_id_or_cin: string;
      form_code: string;
      reason: string;
      filing_data?: Record<string, any>;
    },
    context: ActionContext = {}
  ): Promise<McpAction> {
    const company = await CompanyService.getCompanyByCin(payload.company_id_or_cin);
    const formCode = (payload.form_code || 'GEN-FORM').toUpperCase();
    const intent = FilingService.getIntentById(formCode);

    const actionId = `act_fil_${Date.now()}`;
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const preview: ActionPreview = {
      form_code: formCode,
      action_summary: `File Form ${formCode} for ${company?.name || 'Company'} (${payload.reason})`,
      company_name: company?.name || 'Your Company',
      cin: company?.cin,
      statutory_section: intent?.section || 'Companies Act 2013 statutory filing rules',
      deadline: intent?.deadline_rule || 'Within 30 days of corporate event trigger',
      required_documents: intent?.required_documents || ['Board Resolution', 'Statutory Attachment PDF signed via DSC'],
      missing_requirements: [],
      prerequisites: intent?.prerequisites || ['Active MCA V3 credential & mapped director DSC'],
      form_fields: {
        form_code: formCode,
        company_cin: company?.cin,
        reason: payload.reason,
        custom_data: payload.filing_data || {}
      },
      estimated_fee: 500,
      estimated_penalty_per_day: 100,
      notice: 'DEMO EXECUTION MODE: Prepares verified statutory e-Form envelope.'
    };

    const action: McpAction = {
      id: actionId,
      workspace_id: company?.workspace_id || context.workspaceId || null,
      company_id: company?.id || null,
      company_name: company?.name || 'Authorized Entity',
      user_id: context.userId || null,
      action_type: 'FILING_SUBMISSION',
      status: 'AWAITING_USER_CONFIRMATION',
      payload: { ...payload, company_cin: company?.cin, company_name: company?.name },
      preview,
      confirmation_token: token,
      confirmation_expires_at: expiresAt.toISOString(),
      authorization_required: true,
      authorization_type: 'DSC_SIGNATURE',
      authorization_status: 'PENDING',
      client_metadata: {
        client_name: context.clientName || 'Claude',
        client_type: context.clientType || 'mcp',
        initiated_via: 'prepare_filing'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.persistAction(action);
    await this.logAuditEvent({
      actionId: action.id,
      userId: context.userId,
      eventType: 'ACTION_CREATED',
      actorType: context.actorType || 'AI_CLIENT',
      clientName: context.clientName,
      clientType: context.clientType,
      details: { form_code: formCode, reason: payload.reason }
    });

    return action;
  }

  /**
   * LEVEL 2: Prepare Compliance Submission (e.g. Annual Filings AOC-4 / MGT-7 / DIR-3 KYC)
   */
  static async prepareComplianceSubmission(
    payload: {
      company_id_or_cin: string;
      compliance_type: 'AOC-4' | 'MGT-7' | 'DIR-3-KYC' | 'DPT-3' | 'MSME-1';
      financial_year: string;
      agm_date?: string;
    },
    context: ActionContext = {}
  ): Promise<McpAction> {
    const company = await CompanyService.getCompanyByCin(payload.company_id_or_cin);
    const actionId = `act_comp_${Date.now()}`;
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const isAoc4 = payload.compliance_type === 'AOC-4';
    const isMgt7 = payload.compliance_type === 'MGT-7';

    const requiredDocs = isAoc4 ? [
      'Audited Balance Sheet & Profit and Loss Statement',
      'Board of Directors Report under Section 134',
      'Auditor Report with CARO 2020 disclosures',
      'Notice of Annual General Meeting (AGM)'
    ] : isMgt7 ? [
      'List of Shareholders & Debenture Holders',
      'Details of Promoters and Key Managerial Personnel',
      'Certificate from Practicing Company Secretary (Form MGT-8 if applicable)'
    ] : [
      'Self-attested PAN and AADHAAR card copy',
      'Active mobile number and email OTP verification'
    ];

    const preview: ActionPreview = {
      form_code: payload.compliance_type,
      action_summary: `Statutory Annual Compliance Filing ${payload.compliance_type} for FY ${payload.financial_year}`,
      company_name: company?.name || 'Your Company',
      cin: company?.cin,
      statutory_section: isAoc4 ? 'Section 137 of Companies Act 2013' : isMgt7 ? 'Section 92 of Companies Act 2013' : 'Section 152 / Rule 12A',
      deadline: isAoc4 ? 'Within 30 days of AGM' : isMgt7 ? 'Within 60 days of AGM' : 'Strict 30 September Annual cut-off',
      required_documents: requiredDocs,
      missing_requirements: [],
      prerequisites: ['Statutory audit complete', 'Board resolution approving annual statements'],
      form_fields: {
        compliance_type: payload.compliance_type,
        financial_year: payload.financial_year,
        agm_date: payload.agm_date || '2026-09-30',
        company_cin: company?.cin
      },
      estimated_fee: isAoc4 ? 600 : isMgt7 ? 600 : 0,
      estimated_penalty_per_day: 100,
      notice: 'DEMO EXECUTION MODE: Prepares annual statutory compliance bundle.'
    };

    const action: McpAction = {
      id: actionId,
      workspace_id: company?.workspace_id || context.workspaceId || null,
      company_id: company?.id || null,
      company_name: company?.name || 'Authorized Entity',
      user_id: context.userId || null,
      action_type: 'COMPLIANCE_SUBMISSION',
      status: 'AWAITING_USER_CONFIRMATION',
      payload: { ...payload, company_cin: company?.cin, company_name: company?.name },
      preview,
      confirmation_token: token,
      confirmation_expires_at: expiresAt.toISOString(),
      authorization_required: true,
      authorization_type: 'DSC_SIGNATURE',
      authorization_status: 'PENDING',
      client_metadata: {
        client_name: context.clientName || 'Claude',
        client_type: context.clientType || 'mcp',
        initiated_via: 'prepare_compliance_submission'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.persistAction(action);
    await this.logAuditEvent({
      actionId: action.id,
      userId: context.userId,
      eventType: 'ACTION_CREATED',
      actorType: context.actorType || 'AI_CLIENT',
      clientName: context.clientName,
      clientType: context.clientType,
      details: { compliance_type: payload.compliance_type, fy: payload.financial_year }
    });

    return action;
  }

  /**
   * LEVEL 3: Confirm an Action
   */
  static async confirmAction(
    actionId: string,
    confirmationToken?: string,
    context: ActionContext = {}
  ): Promise<{
    action: McpAction;
    status: McpActionStatus;
    authorization_required: boolean;
    authorization_url?: string;
    message: string;
  }> {
    const action = await this.getAction(actionId);
    if (!action) {
      throw new Error(`Action "${actionId}" not found.`);
    }

    if (action.status === 'SUBMITTED' || action.status === 'PROCESSING') {
      throw new Error(`Action "${actionId}" is already submitted.`);
    }

    if (action.status === 'CANCELLED') {
      throw new Error(`Action "${actionId}" was cancelled and cannot be confirmed.`);
    }

    // Verify token if provided
    if (confirmationToken && action.confirmation_token && confirmationToken !== action.confirmation_token) {
      throw new Error('Invalid confirmation token for this action.');
    }

    // Check expiration
    if (action.confirmation_expires_at && new Date() > new Date(action.confirmation_expires_at)) {
      action.status = 'EXPIRED';
      await this.persistAction(action);
      await this.logAuditEvent({
        actionId: action.id,
        userId: context.userId,
        eventType: 'ACTION_FAILED',
        actorType: context.actorType || 'SYSTEM',
        clientName: context.clientName,
        clientType: context.clientType,
        details: { reason: 'Confirmation token expired' }
      });
      throw new Error('Action confirmation token has expired. Please prepare a fresh action draft.');
    }

    // Move to next state based on authorization requirement
    let nextStatus: McpActionStatus = 'CONFIRMED';
    let authUrl: string | undefined = undefined;

    if (action.authorization_required && action.authorization_status !== 'AUTHORIZED') {
      nextStatus = 'AUTHORIZATION_REQUIRED';
      action.authorization_status = 'PENDING';
      authUrl = `/actions/${action.id}`;
    }

    action.status = nextStatus;
    action.updated_at = new Date().toISOString();
    await this.persistAction(action);

    await this.logAuditEvent({
      actionId: action.id,
      userId: context.userId,
      eventType: 'USER_CONFIRMED',
      actorType: context.actorType || 'USER',
      clientName: context.clientName,
      clientType: context.clientType,
      details: { new_status: nextStatus, auth_required: action.authorization_required }
    });

    return {
      action,
      status: nextStatus,
      authorization_required: action.authorization_required && action.authorization_status !== 'AUTHORIZED',
      authorization_url: authUrl,
      message: nextStatus === 'AUTHORIZATION_REQUIRED'
        ? 'Action confirmed! This corporate action requires an authorized Digital Signature Certificate (DSC) / approval before final execution. Please complete authorization securely in Future MCA.'
        : 'Action confirmed and ready for final execution.'
    };
  }

  /**
   * Authorize an Action (Executed securely on /actions/[id] web UI)
   */
  static async authorizeAction(
    actionId: string,
    authPayload: {
      signed_by: string;
      din?: string;
      dsc_serial?: string;
      remarks?: string;
    },
    context: ActionContext = {}
  ): Promise<McpAction> {
    const action = await this.getAction(actionId);
    if (!action) throw new Error(`Action "${actionId}" not found.`);

    action.authorization_status = 'AUTHORIZED';
    action.status = 'AUTHORIZED';
    action.authorization_details = {
      ...authPayload,
      signed_at: new Date().toISOString()
    };
    action.updated_at = new Date().toISOString();

    await this.persistAction(action);
    await this.logAuditEvent({
      actionId: action.id,
      userId: context.userId,
      eventType: 'SIGNATURE_COMPLETED',
      actorType: 'USER',
      clientName: 'Future MCA Web Portal',
      clientType: 'SECURE_BROWSER_ISOLATION',
      details: {
        signed_by: authPayload.signed_by,
        din: authPayload.din,
        dsc_serial: authPayload.dsc_serial,
        method: action.authorization_type || 'DSC_SIGNATURE'
      }
    });

    return action;
  }

  /**
   * LEVEL 3: Cancel an Action
   */
  static async cancelAction(
    actionId: string,
    reason?: string,
    context: ActionContext = {}
  ): Promise<McpAction> {
    const action = await this.getAction(actionId);
    if (!action) throw new Error(`Action "${actionId}" not found.`);

    if (action.status === 'SUBMITTED') {
      throw new Error(`Cannot cancel action "${actionId}" because it has already been submitted.`);
    }

    action.status = 'CANCELLED';
    action.updated_at = new Date().toISOString();

    await this.persistAction(action);
    await this.logAuditEvent({
      actionId: action.id,
      userId: context.userId,
      eventType: 'ACTION_CANCELLED',
      actorType: context.actorType || 'USER',
      clientName: context.clientName,
      clientType: context.clientType,
      details: { reason: reason || 'User requested cancellation' }
    });

    return action;
  }

  /**
   * LEVEL 3: Execute an Action (Strict Invariant Validation & Idempotency)
   */
  static async executeAction(
    actionId: string,
    idempotencyKey?: string,
    context: ActionContext = {}
  ): Promise<{
    status: 'SUBMITTED' | 'ALREADY_EXECUTED';
    reference_number: string;
    submitted_at: string;
    action: McpAction;
    receipt: any;
  }> {
    const action = await this.getAction(actionId);
    if (!action) throw new Error(`Action "${actionId}" not found.`);

    // 1. Idempotency check: Already executed
    if (action.status === 'SUBMITTED' && action.external_reference) {
      return {
        status: 'ALREADY_EXECUTED',
        reference_number: action.external_reference,
        submitted_at: action.executed_at || action.updated_at,
        action,
        receipt: action.execution_receipt
      };
    }

    // 2. Strict Validation: Must be CONFIRMED or AUTHORIZED
    if (action.status === 'AWAITING_USER_CONFIRMATION' || action.status === 'DRAFT') {
      throw new Error(
        `Action "${actionId}" cannot be executed because it is still in "${action.status}". Explicit user confirmation is required before execution.`
      );
    }

    if (action.authorization_required && action.authorization_status !== 'AUTHORIZED') {
      throw new Error(
        `Action "${actionId}" requires authorization (${action.authorization_type || 'DSC_SIGNATURE'}). Please complete signature at /actions/${action.id} first.`
      );
    }

    if (action.status === 'CANCELLED') {
      throw new Error(`Action "${actionId}" was cancelled and cannot be executed.`);
    }

    // 3. Mark as PROCESSING -> SUBMITTED
    action.status = 'PROCESSING';
    const srn = `DEMO-SRN-2026-${Date.now().toString().slice(-6)}`;
    const submittedAt = new Date().toISOString();

    const receipt = {
      reference_number: srn,
      submitted_at: submittedAt,
      mode: 'SIMULATED_DEMO_EXECUTION' as const,
      statutory_filing_fee: action.preview.estimated_fee || 300,
      challan_receipt: `CHALLAN-TN-${Date.now().toString().slice(-6)}`,
      confirmation_message: `Statutory e-Form ${action.preview.form_code || 'DIR-12'} has been securely processed. Internal workflow recorded with Reference: ${srn}.`
    };

    action.status = 'SUBMITTED';
    action.external_reference = srn;
    action.idempotency_key = idempotencyKey || action.idempotency_key || `idemp_${Date.now()}`;
    action.executed_at = submittedAt;
    action.execution_receipt = receipt;
    action.updated_at = submittedAt;

    await this.persistAction(action);

    // 4. Update director status if this was a director appointment or resignation
    try {
      if (action.action_type === 'DIRECTOR_CHANGE') {
        const changeType = action.payload?.change_type || 'RESIGNATION';
        const din = action.payload?.din || '09124589';

        if (changeType === 'APPOINTMENT') {
          const companyId = action.company_id || 'comp_aeos_001';
          await CompanyService.addDirector(companyId, {
            full_name: action.payload?.director_name || 'New Director',
            din: din,
            designation: 'Director',
            appointment_date: action.payload?.effective_date || new Date().toISOString().split('T')[0],
            din_status: 'APPROVED',
            dsc_status: 'ACTIVE',
            kyc_status: 'COMPLIANT'
          });

          receipt.confirmation_message = `Successfully appointed ${action.payload?.director_name || 'New Director'} (DIN: ${din}) as Director of ${action.company_name}. Direct addition completed without requiring DSC authorization.`;
          action.execution_receipt = receipt;
          await this.persistAction(action);
        } else {
          await supabase
            .from('directors')
            .update({ status: 'RESIGNED', din_status: 'CESSATION_FILED' })
            .eq('din', din);

          await supabase
            .from('compliance_deadlines')
            .update({ status: 'FILED', urgency: 'completed' })
            .eq('form_code', 'DIR-12');
        }
      }
    } catch {
      // offline fallback
    }

    // 5. Also register into applications / filings in Supabase so it shows on the UI dashboards
    try {
      if (action.company_id || action.payload.company_cin) {
        await supabase.from('filings').insert({
          company_id: action.company_id || 'comp_aeos_001',
          form_code: action.preview.form_code || 'DIR-12',
          form_title: action.preview.action_summary,
          category: action.action_type,
          financial_year: '2026-2027',
          due_date: new Date().toISOString().split('T')[0],
          filed_date: new Date().toISOString().split('T')[0],
          status: 'FILED',
          srn,
          fee_paid: action.preview.estimated_fee || 300,
          late_fee: 0
        });

        await supabase.from('applications').insert({
          company_id: action.company_id || 'comp_aeos_001',
          application_no: srn,
          title: action.preview.action_summary,
          type: action.action_type === 'DIRECTOR_CHANGE' ? 'DIRECTOR_CHANGE' : 'ANNUAL_FILING',
          status: 'APPROVED',
          current_step: 4,
          total_steps: 4,
          submitted_at: submittedAt,
          updated_at: submittedAt,
          remarks: 'Submitted via Future MCA MCP Post-Action Protocol with verified DSC signature'
        });
      }
    } catch {
      // ignore db hook errors
    }

    await this.logAuditEvent({
      actionId: action.id,
      userId: context.userId,
      eventType: 'ACTION_EXECUTED',
      actorType: context.actorType || 'AI_CLIENT',
      clientName: context.clientName,
      clientType: context.clientType,
      details: { srn, status: 'SUBMITTED', form: action.preview.form_code }
    });

    return {
      status: 'SUBMITTED',
      reference_number: srn,
      submitted_at: submittedAt,
      action,
      receipt
    };
  }

  /**
   * Internal helper to persist action to Supabase and memory store
   */
  private static async persistAction(action: McpAction): Promise<void> {
    ACTION_STORE.set(action.id, action);

    try {
      const { error } = await supabase.from('mcp_actions').upsert({
        id: action.id,
        workspace_id: action.workspace_id,
        company_id: action.company_id,
        company_name: action.company_name,
        user_id: action.user_id,
        action_type: action.action_type,
        status: action.status,
        payload: action.payload,
        preview: action.preview,
        confirmation_token: action.confirmation_token,
        confirmation_expires_at: action.confirmation_expires_at,
        authorization_required: action.authorization_required,
        authorization_type: action.authorization_type,
        authorization_status: action.authorization_status,
        authorization_details: action.authorization_details,
        external_reference: action.external_reference,
        idempotency_key: action.idempotency_key,
        execution_receipt: action.execution_receipt,
        client_metadata: action.client_metadata,
        created_at: action.created_at,
        updated_at: action.updated_at,
        executed_at: action.executed_at
      });

      if (error) {
        console.error('Error persisting mcp_action to Supabase:', error);
      }
    } catch (err) {
      console.error('Exception in persistAction:', err);
    }
  }
}
