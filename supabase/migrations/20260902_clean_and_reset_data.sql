-- Future MCA: Database Purge & Tenant Isolation Setup
-- Run this SQL in your Supabase SQL Editor to wipe test data and enforce workspace-level access control.

-- 1. Wipe all test logs, actions, applications, filings, deadlines, directors, and companies
DELETE FROM public.mcp_action_audit_logs;
DELETE FROM public.mcp_actions;
DELETE FROM public.application_events;
DELETE FROM public.applications;
DELETE FROM public.filings;
DELETE FROM public.compliance_deadlines;
DELETE FROM public.directors;
DELETE FROM public.companies;

-- 2. Ensure companies table has workspace_id foreign key constraint and index
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'companies_workspace_id_fkey'
  ) THEN
    ALTER TABLE public.companies 
      ADD CONSTRAINT companies_workspace_id_fkey 
      FOREIGN KEY (workspace_id) 
      REFERENCES public.workspaces(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_companies_workspace_id ON public.companies(workspace_id);
CREATE INDEX IF NOT EXISTS idx_directors_company_id ON public.directors(company_id);
CREATE INDEX IF NOT EXISTS idx_compliance_deadlines_company_id ON public.compliance_deadlines(company_id);
CREATE INDEX IF NOT EXISTS idx_filings_company_id ON public.filings(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_company_id ON public.applications(company_id);
