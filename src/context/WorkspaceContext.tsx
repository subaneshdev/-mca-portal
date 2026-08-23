'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Company, Director, Workspace, WorkspaceRole, UserProfile } from '@/types';
import { supabase } from '@/lib/supabase';
import { CompanyService } from '@/lib/services/companyService';

interface WorkspaceContextType {
  user: any | null;
  profile: UserProfile | null;
  role: WorkspaceRole;
  setRole: (role: WorkspaceRole) => Promise<void>;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string, type: WorkspaceRole) => Promise<Workspace>;
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  allCompanies: Company[];
  refreshCompanies: () => Promise<void>;
  loadDemoCompany: (preset?: 'ziggers' | 'unfounded' | 'futurefoods') => Promise<Company>;
  createCompany: (data: Partial<Company>, directors?: Partial<Director>[]) => Promise<Company>;
  signOut: () => Promise<void>;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  aiInitialQuery: string;
  openAiWithQuery: (query: string) => void;
  isLoading: boolean;
  dbError: string | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRoleState] = useState<WorkspaceRole>('founder');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompanyState] = useState<Company | null>(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Set selected company with access preference verification
  const setSelectedCompany = useCallback((company: Company | null) => {
    setSelectedCompanyState(company);
    if (typeof window !== 'undefined') {
      if (company?.id) {
        localStorage.setItem('future_mca_selected_company_id', company.id);
      } else if (company?.cin) {
        localStorage.setItem('future_mca_selected_company_id', company.cin);
      } else {
        localStorage.removeItem('future_mca_selected_company_id');
      }
    }
  }, []);

  // Initialize Auth, Workspace, and Company state strictly from Supabase
  const loadInitialData = useCallback(async (sessionUser?: any) => {
    try {
      setIsLoading(true);
      setDbError(null);

      // 1. Check current Supabase Auth session
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) {
        throw new Error(`Auth session check failed: ${sessionErr.message}`);
      }

      const activeUser = sessionUser || sessionData?.session?.user || null;
      setUser(activeUser);

      if (!activeUser) {
        // Unauthenticated state: clear operational data
        setProfile(null);
        setWorkspaces([]);
        setCurrentWorkspace(null);
        setAllCompanies([]);
        setSelectedCompanyState(null);
        setIsLoading(false);
        return;
      }

      // 2. Build profile from authentic session
      const localRole = (localStorage.getItem('future_mca_role') as WorkspaceRole) || 'founder';
      const userProfile: UserProfile = {
        id: activeUser.id,
        email: activeUser.email || 'user@futuremca.in',
        full_name: activeUser.user_metadata?.full_name || activeUser.email?.split('@')[0] || 'User',
        persona: activeUser.user_metadata?.persona || localRole
      };
      setProfile(userProfile);
      setRoleState(userProfile.persona);

      // 3. Fetch user's workspaces from Supabase
      const { data: dbWorkspaces, error: wsError } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: true });

      if (wsError) {
        throw new Error(`Failed to load workspaces from database: ${wsError.message}`);
      }

      let activeWs: Workspace | null = null;
      if (dbWorkspaces && dbWorkspaces.length > 0) {
        setWorkspaces(dbWorkspaces);
        activeWs = dbWorkspaces[0];
        setCurrentWorkspace(activeWs);
      } else {
        setWorkspaces([]);
        setCurrentWorkspace(null);
      }

      // 4. Fetch accessible companies from Supabase
      const companies = await CompanyService.listCompanies(activeWs?.id);
      setAllCompanies(companies);

      // 5. Restore selected company using verified preference
      if (typeof window !== 'undefined' && companies.length > 0) {
        const persistedCompanyId = localStorage.getItem('future_mca_selected_company_id');
        const matched = persistedCompanyId 
          ? companies.find(c => c.id === persistedCompanyId || c.cin === persistedCompanyId)
          : null;

        if (matched) {
          setSelectedCompanyState(matched);
        } else {
          // Fallback to first accessible company and update preference
          setSelectedCompanyState(companies[0]);
          localStorage.setItem('future_mca_selected_company_id', companies[0].id || companies[0].cin);
        }
      } else if (companies.length === 0) {
        setSelectedCompanyState(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('future_mca_selected_company_id');
        }
      }
    } catch (err: any) {
      console.error('Database query failure during initialization:', err);
      setDbError(err.message || 'Database connection error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();

    // Listen for Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadInitialData(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setWorkspaces([]);
          setCurrentWorkspace(null);
          setAllCompanies([]);
          setSelectedCompanyState(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('future_mca_selected_company_id');
            localStorage.removeItem('future_mca_role');
          }
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [loadInitialData]);

  // Set persona
  const setRole = async (newRole: WorkspaceRole) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('future_mca_role', newRole);
    }
    if (user) {
      await supabase.auth.updateUser({
        data: { persona: newRole }
      });
      setProfile(prev => (prev ? { ...prev, persona: newRole } : null));
    }
  };

  // Switch active workspace
  const switchWorkspace = async (workspaceId: string) => {
    const ws = workspaces.find(w => w.id === workspaceId);
    if (ws) {
      setCurrentWorkspace(ws);
      await setRole(ws.type);
      // Refresh companies belonging to newly selected workspace
      const companies = await CompanyService.listCompanies(ws.id);
      setAllCompanies(companies);
      if (companies.length > 0) {
        setSelectedCompany(companies[0]);
      } else {
        setSelectedCompany(null);
      }
    }
  };

  // Create new workspace in Supabase
  const createWorkspace = async (name: string, type: WorkspaceRole): Promise<Workspace> => {
    const { data, error } = await supabase
      .from('workspaces')
      .insert({ name, type })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create workspace in database: ${error?.message}`);
    }

    const newWs = data as Workspace;
    setWorkspaces(prev => [...prev, newWs]);
    setCurrentWorkspace(newWs);
    await setRole(type);
    return newWs;
  };

  // Refresh companies list from Supabase
  const refreshCompanies = async () => {
    const companies = await CompanyService.listCompanies(currentWorkspace?.id);
    setAllCompanies(companies);
    if (companies.length > 0) {
      const currentSelected = selectedCompany;
      const stillExists = currentSelected 
        ? companies.find(c => c.id === currentSelected.id || c.cin === currentSelected.cin)
        : null;

      if (stillExists) {
        setSelectedCompany(stillExists);
      } else {
        setSelectedCompany(companies[0]);
      }
    } else {
      setSelectedCompany(null);
    }
  };

  // Load demo company: inserts real rows into Supabase for this workspace
  const loadDemoCompany = async (
    preset: 'ziggers' | 'unfounded' | 'futurefoods' = 'ziggers'
  ): Promise<Company> => {
    const company = await CompanyService.seedDemoCompany(currentWorkspace?.id, preset);
    await refreshCompanies();
    setSelectedCompany(company);
    return company;
  };

  // Create custom company in Supabase
  const createCompany = async (
    data: Partial<Company>,
    directors: Partial<Director>[] = []
  ): Promise<Company> => {
    const created = await CompanyService.createCompany(data, directors);
    await refreshCompanies();
    setSelectedCompany(created);
    return created;
  };

  // Sign out cleanly
  const signOut = async () => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('future_mca_selected_company_id');
      localStorage.removeItem('future_mca_role');
      window.location.href = '/auth/login';
    }
  };

  const openAiWithQuery = (query: string) => {
    setAiInitialQuery(query);
    setIsAiDrawerOpen(true);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        profile,
        role,
        setRole,
        workspaces,
        currentWorkspace,
        switchWorkspace,
        createWorkspace,
        selectedCompany,
        setSelectedCompany,
        allCompanies,
        refreshCompanies,
        loadDemoCompany,
        createCompany,
        signOut,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        aiInitialQuery,
        openAiWithQuery,
        isLoading,
        dbError
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
