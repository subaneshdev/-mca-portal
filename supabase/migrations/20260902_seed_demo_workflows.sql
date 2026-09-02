-- =========================================================================
-- FUTURE MCA: REBUILD SEED FOR TWO CORE WORKFLOWS (AEOS LABS + MCP ACTIONS)
-- =========================================================================

-- 1. Create Workspaces Table if not exists
CREATE TABLE IF NOT EXISTS public.workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'founder',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Companies Table if not exists
CREATE TABLE IF NOT EXISTS public.companies (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE,
  cin TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  legal_type TEXT NOT NULL,
  status TEXT NOT NULL,
  paid_up_capital NUMERIC,
  authorized_capital NUMERIC,
  incorporation_date DATE,
  roc_jurisdiction TEXT,
  registered_office TEXT,
  email TEXT,
  pan TEXT,
  gst TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Directors Table if not exists
CREATE TABLE IF NOT EXISTS public.directors (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  din TEXT NOT NULL,
  full_name TEXT NOT NULL,
  designation TEXT NOT NULL,
  appointment_date DATE,
  din_status TEXT DEFAULT 'APPROVED',
  dsc_status TEXT DEFAULT 'ACTIVE',
  dsc_expiry DATE,
  kyc_status TEXT DEFAULT 'COMPLIANT',
  email TEXT,
  phone TEXT,
  resignation_date DATE,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Compliance Deadlines Table if not exists
CREATE TABLE IF NOT EXISTS public.compliance_deadlines (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  form_code TEXT NOT NULL,
  section TEXT,
  due_date DATE NOT NULL,
  urgency TEXT NOT NULL,
  penalty_per_day NUMERIC DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Applications Table if not exists
CREATE TABLE IF NOT EXISTS public.applications (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  application_no TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 4,
  submitted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  remarks TEXT
);

-- 6. Create Application Events Table if not exists
CREATE TABLE IF NOT EXISTS public.application_events (
  id TEXT PRIMARY KEY,
  application_id TEXT REFERENCES public.applications(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL
);

-- 7. Create MCP Actions and Audit Logs Table
CREATE TABLE IF NOT EXISTS public.mcp_actions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT,
  company_id TEXT,
  company_name TEXT,
  user_id TEXT,
  action_type TEXT NOT NULL,
  status TEXT NOT NULL,
  payload JSONB NOT NULL,
  preview JSONB NOT NULL,
  confirmation_token TEXT,
  confirmation_expires_at TIMESTAMPTZ,
  authorization_required BOOLEAN DEFAULT FALSE,
  authorization_type TEXT,
  authorization_status TEXT,
  authorized_by TEXT,
  authorized_at TIMESTAMPTZ,
  authorization_signature TEXT,
  client_metadata JSONB,
  execution_result JSONB,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mcp_action_audit_logs (
  id TEXT PRIMARY KEY,
  action_id TEXT REFERENCES public.mcp_actions(id) ON DELETE CASCADE,
  user_id TEXT,
  event_type TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  client_name TEXT,
  client_type TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create Knowledge Base Table
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  official_guidance TEXT NOT NULL,
  relevant_forms TEXT[],
  act_sections TEXT[],
  keywords TEXT[],
  source_type TEXT DEFAULT 'MCA_STATUTORY',
  last_reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- SEED DATA
-- =========================================================================

-- Clear previous test data cleanly
DELETE FROM public.mcp_action_audit_logs;
DELETE FROM public.mcp_actions;
DELETE FROM public.application_events;
DELETE FROM public.applications;
DELETE FROM public.compliance_deadlines;
DELETE FROM public.directors;
DELETE FROM public.companies;
DELETE FROM public.workspaces;
DELETE FROM public.knowledge_documents;

-- 1. Insert Workspace
INSERT INTO public.workspaces (id, name, type) VALUES
('ws_aeos_labs_001', 'Aeos Labs Workspace', 'founder');

-- 2. Insert Companies
INSERT INTO public.companies (
  id, workspace_id, cin, name, legal_type, status,
  paid_up_capital, authorized_capital, incorporation_date,
  roc_jurisdiction, registered_office, email, pan, gst
) VALUES
(
  'comp_aeos_001',
  'ws_aeos_labs_001',
  'U62099TN2026PTCDEMO001',
  'Aeos Labs Private Limited',
  'Private Limited Company',
  'ACTIVE',
  100000,
  1000000,
  '2026-01-15',
  'ROC Chennai',
  'Level 4, IITM Research Park, Kanagam Road, Taramani, Chennai, Tamil Nadu – 600113, India',
  'contact@aeoslabs.in',
  'AADCA1234F',
  '33AADCA1234F1Z5'
),
(
  'comp_novara_002',
  'ws_aeos_labs_001',
  'U72900KA2024PTCDEMO002',
  'Novara Technologies Private Limited',
  'Private Limited Company',
  'ACTIVE',
  500000,
  2500000,
  '2024-03-10',
  'ROC Bangalore',
  'Outer Ring Road, Bellandur, Bangalore, Karnataka - 560103',
  'legal@novaratech.io',
  'AABCN5566K',
  '29AABCN5566K1Z8'
),
(
  'comp_terraworks_003',
  'ws_aeos_labs_001',
  'U74999MH2023PTCDEMO003',
  'TerraWorks Private Limited',
  'Private Limited Company',
  'ACTIVE',
  200000,
  1000000,
  '2023-08-19',
  'ROC Mumbai',
  'Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra - 400051',
  'compliance@terraworks.in',
  'AAACT8899P',
  '27AAACT8899P1ZQ'
),
(
  'comp_pulsegrid_004',
  'ws_aeos_labs_001',
  'U35999DL2025PTCDEMO004',
  'PulseGrid Innovations Private Limited',
  'Private Limited Company',
  'ACTIVE',
  1000000,
  5000000,
  '2025-05-12',
  'ROC Delhi',
  'Aerocity Business Hub, New Delhi, Delhi - 110037',
  'admin@pulsegrid.io',
  'AABCP7788R',
  '07AABCP7788R1Z1'
);

-- 3. Insert Directors for Aeos Labs
INSERT INTO public.directors (
  id, company_id, din, full_name, designation,
  appointment_date, din_status, dsc_status, dsc_expiry,
  kyc_status, email, phone, status
) VALUES
(
  'dir_varun_001',
  'comp_aeos_001',
  '08945120',
  'Varun Maya',
  'Managing Director',
  '2026-01-15',
  'APPROVED',
  'ACTIVE',
  '2028-11-30',
  'COMPLIANT',
  'varun@aeoslabs.in',
  '+91 98401 23456',
  'ACTIVE'
),
(
  'dir_rahul_002',
  'comp_aeos_001',
  '09124589',
  'Rahul Menon',
  'Director',
  '2026-01-15',
  'APPROVED',
  'ACTIVE',
  '2026-09-15',
  'COMPLIANT',
  'rahul@aeoslabs.in',
  '+91 98402 34567',
  'RESIGNATION_IN_PROGRESS'
);

-- 4. Insert Compliance Deadlines for Aeos Labs
INSERT INTO public.compliance_deadlines (
  id, company_id, title, form_code, section,
  due_date, urgency, penalty_per_day, description, status
) VALUES
(
  'dl_dir12_001',
  'comp_aeos_001',
  'Director Cessation Filing (Rahul Menon)',
  'DIR-12',
  'Section 168, Companies Act 2013',
  '2026-09-24',
  'critical',
  100,
  'Statutory 30-day window following resignation of Director Rahul Menon on 25 Aug 2026. Action in progress.',
  'IN_PROGRESS'
),
(
  'dl_aoc4_002',
  'comp_aeos_001',
  'Annual Financial Statements Filing',
  'AOC-4',
  'Section 137, Companies Act 2013',
  '2026-10-30',
  'upcoming',
  100,
  'Filing of balance sheet and profit & loss statement.',
  'PENDING'
),
(
  'dl_mgt7_003',
  'comp_aeos_001',
  'Annual Return of Company',
  'MGT-7A',
  'Section 92, Companies Act 2013',
  '2026-11-29',
  'upcoming',
  100,
  'Annual return filing for small company / startup.',
  'PENDING'
);

-- 5. Insert Prepared MCP Action for Rahul Menon's Resignation
INSERT INTO public.mcp_actions (
  id, workspace_id, company_id, company_name, user_id,
  action_type, status, payload, preview,
  confirmation_token, confirmation_expires_at,
  authorization_required, authorization_type, authorization_status,
  client_metadata
) VALUES
(
  'act_dir_demo_001',
  'ws_aeos_labs_001',
  'comp_aeos_001',
  'Aeos Labs Private Limited',
  'usr_varun_maya',
  'DIRECTOR_CHANGE',
  'AWAITING_USER_CONFIRMATION',
  '{"company_id_or_cin": "U62099TN2026PTCDEMO001", "change_type": "RESIGNATION", "director_name": "Rahul Menon", "din": "09124589", "effective_date": "2026-08-25", "reason": "Personal reasons", "documents": ["Rahul_Menon_Resignation_Letter.pdf"]}'::jsonb,
  '{
    "form_code": "DIR-12",
    "action_summary": "Process statutory cessation of Director Rahul Menon (DIN: 09124589) from Aeos Labs Private Limited",
    "company_name": "Aeos Labs Private Limited",
    "statutory_section": "Section 168 of Companies Act 2013 read with Rule 15 of Companies Rules",
    "deadline": "24 September 2026 (Strict 30 days statutory window)",
    "required_documents": [
      "Formal Resignation Notice / Letter from Director (Rahul_Menon_Resignation_Letter.pdf)",
      "Certified True Copy of Board Resolution noting the cessation"
    ],
    "missing_requirements": [],
    "prerequisites": [
      "Director Identification Number (DIN: 09124589) in APPROVED status",
      "Signing Managing Director (Varun Maya) active Class 3 DSC token"
    ],
    "form_fields": {
      "director_name": "Rahul Menon",
      "din": "09124589",
      "change_category": "RESIGNATION",
      "effective_date": "2026-08-25",
      "reason": "Personal reasons"
    },
    "estimated_fee": 300,
    "estimated_penalty_per_day": 100,
    "notice": "DEMO EXECUTION MODE: Prepares standard e-Form DIR-12 schema with statutory compliance safeguards."
  }'::jsonb,
  'act_tok_demo_rahul_resignation_2026',
  NOW() + INTERVAL '30 days',
  TRUE,
  'DSC_SIGNATURE',
  'PENDING',
  '{"client_name": "Future MCA AI Assistant", "client_type": "Conversational Agent"}'::jsonb
);

-- 6. Insert Knowledge Base Records
INSERT INTO public.knowledge_documents (
  id, title, category, summary, official_guidance,
  relevant_forms, act_sections, keywords
) VALUES
(
  'kb_incorporation_001',
  'Company Incorporation & SPICe+ Workflow',
  'Company Incorporation',
  'Complete guide for incorporating a Private Limited company in India via integrated SPICe+ (INC-32) Part A and Part B suite.',
  'Under the Companies Act 2013, new company registration is processed through SPICe+ integrated form covering Name Reservation, Incorporation, DIN allocation, PAN, TAN, EPFO, ESIC, Professional Tax, and Bank Account opening.',
  ARRAY['SPICe+ Part A', 'SPICe+ Part B', 'INC-33 (e-MOA)', 'INC-34 (e-AOA)', 'AGILE-PRO-S'],
  ARRAY['Section 7, Companies Act 2013', 'Companies (Incorporation) Rules 2014'],
  ARRAY['incorporate', 'start company', 'new company', 'SPICe+', 'registration', 'incorporation']
),
(
  'kb_director_resignation_002',
  'Director Resignation and Company Record Update',
  'Director Changes',
  'When a director resigns, the company must update official MCA registry records via Form DIR-12 within 30 days.',
  'Under Section 168 of the Companies Act 2013, a director may resign by giving written notice. The company must hold a board meeting, take note of the resignation, and file Form DIR-12 with the Registrar of Companies within 30 days along with certified resolution copy and resignation letter.',
  ARRAY['DIR-12', 'DIR-11'],
  ARRAY['Section 168, Companies Act 2013', 'Rule 15, Companies (Appointment and Qualification of Directors) Rules 2014'],
  ARRAY['director resigned', 'director resignation', 'remove director', 'director change', 'DIR-12', 'cessation']
),
(
  'kb_annual_compliance_003',
  'Statutory Annual Compliance Schedule for Startups',
  'Compliance',
  'Annual statutory filings required for Private Limited companies including financial statements (AOC-4) and annual return (MGT-7A).',
  'All incorporated companies must file Form AOC-4 within 30 days of AGM (Section 137) and Form MGT-7/MGT-7A within 60 days of AGM (Section 92). Delay attracts standard additional fee of Rs 100 per day per form.',
  ARRAY['AOC-4', 'MGT-7A', 'DIR-3 KYC', 'DPT-3'],
  ARRAY['Section 92', 'Section 137'],
  ARRAY['compliance', 'annual return', 'financial statements', 'AOC-4', 'MGT-7', 'deadlines']
);
