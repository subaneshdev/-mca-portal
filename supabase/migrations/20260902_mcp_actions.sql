-- Supabase Migration: Create MCP Actions and Audit Logs Tables
-- Version: 20260902_mcp_actions

-- 1. Create mcp_actions table
CREATE TABLE IF NOT EXISTS public.mcp_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID,
    company_id UUID,
    user_id UUID,
    action_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    preview JSONB NOT NULL DEFAULT '{}'::jsonb,
    confirmation_token TEXT,
    confirmation_expires_at TIMESTAMPTZ,
    authorization_required BOOLEAN NOT NULL DEFAULT false,
    authorization_type TEXT,
    authorization_status TEXT DEFAULT 'NOT_REQUIRED',
    authorization_details JSONB,
    external_reference TEXT,
    idempotency_key TEXT,
    execution_receipt JSONB,
    client_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    executed_at TIMESTAMPTZ
);

-- 2. Create mcp_action_audit_logs table
CREATE TABLE IF NOT EXISTS public.mcp_action_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id UUID NOT NULL REFERENCES public.mcp_actions(id) ON DELETE CASCADE,
    user_id UUID,
    event_type TEXT NOT NULL,
    actor_type TEXT NOT NULL,
    client_name TEXT,
    client_type TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Indexes for fast query & lookups
CREATE INDEX IF NOT EXISTS idx_mcp_actions_workspace ON public.mcp_actions (workspace_id);
CREATE INDEX IF NOT EXISTS idx_mcp_actions_company ON public.mcp_actions (company_id);
CREATE INDEX IF NOT EXISTS idx_mcp_actions_status ON public.mcp_actions (status);
CREATE INDEX IF NOT EXISTS idx_mcp_actions_idempotency ON public.mcp_actions (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_mcp_actions_token ON public.mcp_actions (confirmation_token);
CREATE INDEX IF NOT EXISTS idx_mcp_audit_action ON public.mcp_action_audit_logs (action_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.mcp_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_action_audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Allow authenticated read actions" ON public.mcp_actions
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert actions" ON public.mcp_actions
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update actions" ON public.mcp_actions
    FOR UPDATE TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated read audit logs" ON public.mcp_action_audit_logs
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert audit logs" ON public.mcp_action_audit_logs
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);
