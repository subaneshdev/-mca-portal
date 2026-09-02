export type McpActionStatus = 
  | 'DRAFT'
  | 'PREVIEW_READY'
  | 'AWAITING_USER_CONFIRMATION'
  | 'CONFIRMED'
  | 'AUTHORIZATION_REQUIRED'
  | 'AUTHORIZED'
  | 'PROCESSING'
  | 'SUBMITTED'
  | 'CANCELLED'
  | 'FAILED'
  | 'EXPIRED';

export type AuthorizationType = 
  | 'DSC_SIGNATURE'
  | 'OTP'
  | 'MCA_LOGIN'
  | 'DOCUMENT_APPROVAL'
  | 'BOARD_APPROVAL';

export type AuthorizationStatus = 
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'AUTHORIZED'
  | 'REJECTED'
  | 'EXPIRED';

export type ActorType = 'USER' | 'AI_CLIENT' | 'SYSTEM';

export type ActionAuditEventType = 
  | 'ACTION_CREATED'
  | 'ACTION_PREVIEWED'
  | 'USER_CONFIRMATION_REQUESTED'
  | 'USER_CONFIRMED'
  | 'SIGNATURE_REQUIRED'
  | 'SIGNATURE_COMPLETED'
  | 'ACTION_EXECUTED'
  | 'ACTION_FAILED'
  | 'ACTION_CANCELLED';

export interface ActionPreview {
  form_code?: string;
  action_summary: string;
  company_name?: string;
  cin?: string;
  deadline?: string;
  statutory_section?: string;
  required_documents: string[];
  missing_requirements: string[];
  prerequisites: string[];
  form_fields: Record<string, any>;
  estimated_fee?: number;
  estimated_penalty_per_day?: number;
  notice?: string;
}

export interface McpAction {
  id: string;
  workspace_id?: string | null;
  company_id?: string | null;
  company_name?: string;
  user_id?: string | null;
  action_type: 
    | 'COMPANY_REGISTRATION'
    | 'FILING_SUBMISSION'
    | 'DIRECTOR_CHANGE'
    | 'REGISTERED_OFFICE_CHANGE'
    | 'COMPLIANCE_SUBMISSION'
    | 'GENERIC_ACTION';
  status: McpActionStatus;
  payload: Record<string, any>;
  preview: ActionPreview;
  confirmation_token?: string | null;
  confirmation_expires_at?: string | null;
  authorization_required: boolean;
  authorization_type?: AuthorizationType | null;
  authorization_status?: AuthorizationStatus;
  authorization_details?: {
    signed_by?: string;
    din?: string;
    dsc_serial?: string;
    signed_at?: string;
    remarks?: string;
  } | null;
  external_reference?: string | null; // e.g., SRN123456789
  idempotency_key?: string | null;
  execution_receipt?: {
    reference_number: string;
    submitted_at: string;
    mode: 'SIMULATED_DEMO_EXECUTION' | 'INTERNAL_WORKFLOW';
    statutory_filing_fee: number;
    challan_receipt?: string;
    confirmation_message: string;
  } | null;
  client_metadata?: {
    client_name?: string;
    client_type?: string;
    initiated_via?: string;
  } | null;
  created_at: string;
  updated_at: string;
  executed_at?: string | null;
}

export interface McpActionAuditLog {
  id: string;
  action_id: string;
  user_id?: string | null;
  event_type: ActionAuditEventType;
  actor_type: ActorType;
  client_name?: string;
  client_type?: string;
  details: Record<string, any>;
  created_at: string;
}
