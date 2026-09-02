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
  setUserSession: (userData: any, userProfile: UserProfile) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  aiInitialQuery: string;
  openAiWithQuery: (query: string) => void;
  isLoading: boolean;
  dbError: string | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  // Synchronously initialize from localStorage to prevent auth race conditions
  const [user, setUser] = useState<any | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('future_mca_user');
      if (stored) {
        try { return JSON.parse(stored); } catch { return null; }
      }
    }
    return null;
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('future_mca_profile');
      if (stored) {
        try { return JSON.parse(stored); } catch { return null; }
      }
    }
    return null;
  });

  const [role, setRoleState] = useState<WorkspaceRole>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('future_mca_role') as WorkspaceRole) || 'founder';
    }
    return 'founder';
  });

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompanyState] = useState<Company | null>(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  // Helper to synchronously update user session
  const setUserSession = useCallback((userData: any, userProfile: UserProfile) => {
    setUser(userData);
    setProfile(userProfile);
    setRoleState(userProfile.persona);
    if (typeof window !== 'undefined') {
      localStorage.setItem('future_mca_user', JSON.stringify(userData));
      localStorage.setItem('future_mca_profile', JSON.stringify(userProfile));
      localStorage.setItem('future_mca_role', userProfile.persona);
    }
  }, []);

  // Initialize Auth, Workspace, and Company state
  const loadInitialData = useCallback(async (sessionUser?: any) => {
    try {
      setDbError(null);

      // 1. Check current Supabase Auth session
      let activeUser = sessionUser;
      if (!activeUser) {
        const { data: sessionData } = await supabase.auth.getSession();
        activeUser = sessionData?.session?.user || null;
      }

      // Check local storage backup if Supabase is offline
      if (!activeUser && typeof window !== 'undefined') {
        const stored = localStorage.getItem('future_mca_user');
        if (stored) {
          try { activeUser = JSON.parse(stored); } catch { activeUser = null; }
        }
      }

      setUser(activeUser);

      if (!activeUser) {
        setProfile(null);
        setWorkspaces([]);
        setCurrentWorkspace(null);
        setAllCompanies([]);
        setSelectedCompanyState(null);
        return;
      }

      // 2. Build profile from authentic session
      const localRole = (typeof window !== 'undefined' ? localStorage.getItem('future_mca_role') : null) as WorkspaceRole || 'founder';
      const userProfile: UserProfile = {
        id: activeUser.id || 'usr-default',
        email: activeUser.email || 'user@futuremca.in',
        full_name: activeUser.user_metadata?.full_name || activeUser.email?.split('@')[0] || 'User',
        persona: activeUser.user_metadata?.persona || localRole
      };
      setProfile(userProfile);
      setRoleState(userProfile.persona);

      if (typeof window !== 'undefined') {
        localStorage.setItem('future_mca_user', JSON.stringify(activeUser));
        localStorage.setItem('future_mca_profile', JSON.stringify(userProfile));
      }

      // 3. Fetch user's workspaces from Supabase
      const { data: dbWorkspaces } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: true });

      let activeWs: Workspace | null = null;
      if (dbWorkspaces && dbWorkspaces.length > 0) {
        setWorkspaces(dbWorkspaces);
        activeWs = dbWorkspaces[0];
        setCurrentWorkspace(activeWs);
      } else {
        const defaultWs: Workspace = {
          id: 'ws-default',
          name: `${userProfile.full_name}'s Workspace`,
          type: userProfile.persona,
          created_at: new Date().toISOString()
        };
        setWorkspaces([defaultWs]);
        activeWs = defaultWs;
        setCurrentWorkspace(defaultWs);
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
          setSelectedCompanyState(companies[0]);
          localStorage.setItem('future_mca_selected_company_id', companies[0].id || companies[0].cin);
        }
      } else if (companies.length === 0) {
        setSelectedCompanyState(null);
      }
    } catch (err: any) {
      console.warn('Initialization notice:', err);
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
            localStorage.removeItem('future_mca_user');
            localStorage.removeItem('future_mca_profile');
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
    if (profile) {
      const updatedProfile = { ...profile, persona: newRole };
      setProfile(updatedProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('future_mca_profile', JSON.stringify(updatedProfile));
      }
    }
  };

  // Switch active workspace
  const switchWorkspace = async (workspaceId: string) => {
    const ws = workspaces.find(w => w.id === workspaceId);
    if (ws) {
      setCurrentWorkspace(ws);
      setRoleState(ws.type);
      if (typeof window !== 'undefined') {
        localStorage.setItem('future_mca_role', ws.type);
      }
      const companies = await CompanyService.listCompanies(ws.id);
      setAllCompanies(companies);
      if (companies.length > 0) {
        setSelectedCompany(companies[0]);
      } else {
        setSelectedCompany(null);
      }
    }
  };

  // Create new workspace
  const createWorkspace = async (name: string, type: WorkspaceRole): Promise<Workspace> => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({ name, type })
        .select()
        .single();

      if (error) throw error;
      const newWs = data as Workspace;
      setWorkspaces(prev => [...prev, newWs]);
      setCurrentWorkspace(newWs);
      setRoleState(type);
      return newWs;
    } catch {
      const fallbackWs: Workspace = {
        id: `ws-${Date.now()}`,
        name,
        type,
        created_at: new Date().toISOString()
      };
      setWorkspaces(prev => [...prev, fallbackWs]);
      setCurrentWorkspace(fallbackWs);
      setRoleState(type);
      return fallbackWs;
    }
  };

  // Refresh companies
  const refreshCompanies = async () => {
    const companies = await CompanyService.listCompanies(currentWorkspace?.id);
    setAllCompanies(companies);
    if (companies.length > 0 && !selectedCompany) {
      setSelectedCompany(companies[0]);
    }
  };

  // Load realistic demo company
  const loadDemoCompany = async (preset: 'ziggers' | 'unfounded' | 'futurefoods' = 'ziggers'): Promise<Company> => {
    const created = await CompanyService.seedDemoCompany(currentWorkspace?.id, preset);
    await refreshCompanies();
    setSelectedCompany(created);
    return created;
  };

  // Create custom company
  const createCompany = async (
    data: Partial<Company>,
    directors: Partial<Director>[] = []
  ): Promise<Company> => {
    const created = await CompanyService.createCompany({
      ...data,
      workspace_id: currentWorkspace?.id || null
    }, directors);
    await refreshCompanies();
    setSelectedCompany(created);
    return created;
  };

  // Sign out cleanly
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    setUser(null);
    setProfile(null);
    setCurrentWorkspace(null);
    setWorkspaces([]);
    setAllCompanies([]);
    setSelectedCompanyState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('future_mca_user');
      localStorage.removeItem('future_mca_profile');
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
        setUserSession,
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
