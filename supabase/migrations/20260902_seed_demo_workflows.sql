-- =========================================================================
-- FUTURE MCA: SEED DEMO WORKFLOWS (TYPE COMPATIBLE)
-- =========================================================================

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  persona TEXT DEFAULT 'founder',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, persona)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Varun Maya'),
    COALESCE(NEW.raw_user_meta_data->>'persona', 'founder')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. WORKSPACES TABLE
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'founder',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WORKSPACE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- 4. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS public.companies (
  id TEXT PRIMARY KEY,
  workspace_id UUID,
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

-- 5. DIRECTORS TABLE
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

-- 6. COMPLIANCE DEADLINES TABLE
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

-- 7. APPLICATIONS TABLE
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

CREATE TABLE IF NOT EXISTS public.application_events (
  id TEXT PRIMARY KEY,
  application_id TEXT REFERENCES public.applications(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL
);

-- 8. MCP ACTIONS & AUDIT LOGS TABLE
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

-- 9. KNOWLEDGE DOCUMENTS TABLE
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
-- SEED PRIMARY AEOS LABS & PORTFOLIO DATA
-- =========================================================================
DO $$
DECLARE
  v_ws_id UUID;
BEGIN
  -- Insert or fetch workspace UUID
  INSERT INTO public.workspaces (name, type)
  VALUES ('Aeos Labs Workspace', 'founder')
  RETURNING id INTO v_ws_id;

  -- Insert Companies
  INSERT INTO public.companies (
    id, workspace_id, cin, name, legal_type, status,
    paid_up_capital, authorized_capital, incorporation_date,
    roc_jurisdiction, registered_office, email, pan, gst
  ) VALUES
  (
    'comp_aeos_001',
    v_ws_id,
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
    v_ws_id,
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
    v_ws_id,
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
    v_ws_id,
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
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert Directors
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
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert Compliance Deadlines
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
  )
  ON CONFLICT (id) DO NOTHING;

END $$;
