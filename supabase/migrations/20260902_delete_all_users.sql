-- =========================================================================
-- FUTURE MCA: SAFE USER & DATABASE PURGE SCRIPT
-- =========================================================================
-- This script safely checks for table existence before deleting data,
-- wiping all registered users and test entities without throwing errors.

DO $$ 
DECLARE
  r RECORD;
BEGIN
  -- Disable foreign key constraints temporarily
  SET session_replication_role = 'replica';

  -- Safely truncate/delete from public tables if they exist
  FOR r IN (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name IN (
        'mcp_action_audit_logs',
        'mcp_actions',
        'application_events',
        'applications',
        'filings',
        'compliance_deadlines',
        'directors',
        'companies',
        'workspace_members',
        'workspaces',
        'profiles'
      )
  ) LOOP
    EXECUTE 'DELETE FROM public.' || quote_ident(r.table_name);
  END LOOP;

  -- Delete all Supabase Auth user accounts, identities, and sessions
  DELETE FROM auth.identities;
  DELETE FROM auth.sessions;
  DELETE FROM auth.refresh_tokens;
  DELETE FROM auth.mfa_factors;
  DELETE FROM auth.mfa_challenges;
  DELETE FROM auth.audit_log_entries;
  DELETE FROM auth.users;

  -- Restore foreign key checks
  SET session_replication_role = 'DEFAULT';
END $$;

-- Verify all users are purged
SELECT count(*) AS remaining_auth_users FROM auth.users;
