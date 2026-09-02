-- =========================================================================
-- FUTURE MCA: COMPLETE USER & WORKSPACE DATABASE PURGE SCRIPT
-- =========================================================================
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- to delete ALL registered users, auth accounts, workspaces, and memberships.

-- 1. Disable triggers temporarily if needed
SET session_replication_role = 'replica';

-- 2. Delete all application data associated with workspaces
DELETE FROM public.mcp_action_audit_logs;
DELETE FROM public.mcp_actions;
DELETE FROM public.application_events;
DELETE FROM public.applications;
DELETE FROM public.filings;
DELETE FROM public.compliance_deadlines;
DELETE FROM public.directors;
DELETE FROM public.companies;

-- 3. Delete workspace memberships and workspaces
DELETE FROM public.workspace_members;
DELETE FROM public.workspaces;

-- 4. Delete user profiles in public schema (if exists)
DELETE FROM public.profiles;

-- 5. Delete all registered auth users in Supabase Auth schema
-- This removes all accounts, passwords, sessions, identities, and tokens
DELETE FROM auth.identities;
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.mfa_factors;
DELETE FROM auth.mfa_challenges;
DELETE FROM auth.audit_log_entries;
DELETE FROM auth.users;

-- 6. Re-enable standard trigger replication
SET session_replication_role = 'DEFAULT';

-- Confirmation Output
SELECT count(*) AS remaining_auth_users FROM auth.users;
SELECT count(*) AS remaining_workspaces FROM public.workspaces;
SELECT count(*) AS remaining_companies FROM public.companies;
