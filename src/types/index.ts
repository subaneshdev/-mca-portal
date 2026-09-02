export type UserRole =
  | 'FOUNDER'
  | 'BUSINESS_OWNER'
  | 'CA'
  | 'CS'
  | 'COMPLIANCE_PROFESSIONAL';

export type WorkspaceRole = 'founder' | 'professional';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  persona: WorkspaceRole;
  role?: UserRole;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceRole;
  owner_id?: string;
  created_at?: string;
}

export interface Company {
  id: string;
  cin: string;
  name: string;
  legal_type: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DORMANT' | 'STRIKE_OFF';
  paid_up_capital: number;
  authorized_capital: number;
  incorporation_date: string;
  roc_jurisdiction: string;
  registered_office: string;
  email: string;
  pan?: string;
  gst?: string;
  workspace_id?: string | null;
  created_at?: string;
  directors?: Director[];
  compliance_count?: {
    critical: number;
    action_required: number;
    upcoming: number;
  };
  next_action?: string;
}

export interface Director {
  id: string;
  company_id: string;
  din: string;
  full_name: string;
  designation: string;
  appointment_date: string;
  cessation_date?: string | null;
  status?: 'ACTIVE' | 'RESIGNED';
  din_status: 'APPROVED' | 'DEACTIVATED' | 'DISQUALIFIED';
  dsc_status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NOT_ASSOCIATED';
  dsc_expiry?: string;
  kyc_status: 'COMPLIANT' | 'INCOMPLETE' | 'OVERDUE';
  email?: string;
  phone?: string;
  created_at?: string;
}

export interface ComplianceDeadline {
  id: string;
  company_id: string;
  company_name?: string;
  workspace_id?: string | null;
  title: string;
  form_code: string;
  due_date: string;
  urgency: 'critical' | 'action_required' | 'upcoming' | 'completed';
  penalty_per_day: number;
  description: string;
  status: 'PENDING' | 'FILED' | 'IN_PROGRESS';
  section?: string;
  created_at?: string;
}

export interface Filing {
  id: string;
  company_id: string;
  company_name?: string;
  workspace_id?: string | null;
  form_code: string;
  form_title: string;
  category: string;
  financial_year: string;
  due_date: string;
  filed_date?: string | null;
  status: 'NOT_STARTED' | 'PENDING' | 'IN_PROGRESS' | 'ACTION_REQUIRED' | 'READY_FOR_REVIEW' | 'FILED' | 'OVERDUE' | 'REJECTED';
  srn?: string;
  fee_paid: number;
  late_fee: number;
  created_at?: string;
}

export interface Application {
  id: string;
  company_id?: string | null;
  company_name?: string;
  workspace_id?: string | null;
  application_no: string;
  title: string;
  type: 'INCORPORATION' | 'DIRECTOR_CHANGE' | 'ADDRESS_CHANGE' | 'NAME_RESERVATION' | 'CHARGE_REGISTRATION' | 'ANNUAL_FILING';
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'RESUBMISSION_REQUIRED' | 'REJECTED';
  current_step: number;
  total_steps: number;
  submitted_at: string;
  updated_at: string;
  remarks?: string;
  events?: ApplicationEvent[];
  created_at?: string;
}

export interface ApplicationEvent {
  id: string;
  application_id: string;
  step_name: string;
  description?: string;
  status: 'COMPLETED' | 'CURRENT' | 'PENDING' | 'ALERT';
  completed_at?: string | null;
  sort_order: number;
  created_at?: string;
}

export interface ErrorDiagnosis {
  id: string;
  error_code: string;
  category: string;
  title: string;
  symptoms: string;
  root_cause: string;
  resolution_steps: string[];
  affected_forms: string[];
}

export interface DiagnosticCase {
  id: string;
  error_code: string;
  category: string;
  symptoms: string;
  user_input: string;
  analysis: string;
  resolution_steps: string[];
  created_at?: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  act_section?: string;
  summary: string;
  official_guidance: string;
  penalties?: string;
  relevant_forms: string[];
}

export interface ConnectedClient {
  id: string;
  name: string;
  client_type: string;
  mcp_endpoint: string;
  scopes: string[];
  status: 'ACTIVE' | 'PAUSED' | 'REVOKED';
  last_active_at: string;
  created_at: string;
}

export interface FilingIntent {
  id: string;
  title: string;
  subtitle: string;
  form_code: string;
  section: string;
  deadline_rule: string;
  required_info: string[];
  required_documents: string[];
  prerequisites: string[];
  steps: {
    number: number;
    title: string;
    description: string;
  }[];
}

export * from './actions';

