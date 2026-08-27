'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CompanyService } from '@/lib/services/companyService';
import { Workspace, Company } from '@/types';
import { 
  Cpu, 
  ShieldCheck, 
  Building2, 
  Check, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Layers,
  UserCheck
} from 'lucide-react';

function AuthorizeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const clientId = searchParams.get('client_id') || 'claude_connector';
  const redirectUri = searchParams.get('redirect_uri') || 'https://claude.ai/api/mcp/oauth/callback';
  const state = searchParams.get('state') || '';
  const responseType = searchParams.get('response_type') || 'code';
  const scope = searchParams.get('scope') || 'mca:read mca:compliance';

  const [user, setUser] = useState<any | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorizing, setAuthorizing] = useState(false);

  // Login form state if unauthenticated
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        // Fetch workspaces
        const { data: wsData } = await supabase
          .from('workspaces')
          .select('*')
          .order('created_at', { ascending: true });

        const availableWs = wsData || [];
        setWorkspaces(availableWs);
        if (availableWs.length > 0) {
          setSelectedWorkspace(availableWs[0]);
          const comps = await CompanyService.listCompanies(availableWs[0].id).catch(() => []);
          setCompanies(comps);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return;
    }

    setUser(data.user);
    const { data: wsData } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: true });

    const availableWs = wsData || [];
    setWorkspaces(availableWs);
    if (availableWs.length > 0) {
      setSelectedWorkspace(availableWs[0]);
      const comps = await CompanyService.listCompanies(availableWs[0].id).catch(() => []);
      setCompanies(comps);
    }
    setLoading(false);
  };

  const handleQuickDemoLogin = async (role: 'founder' | 'professional') => {
    setLoading(true);
    setAuthError(null);
    const demoEmail = 'c.subanesh@gmail.com';
    
    // Auto-create workspace if needed
    const { data: wsData } = await supabase
      .from('workspaces')
      .select('*')
      .limit(1);

    let activeWs = wsData?.[0];
    if (!activeWs) {
      const { data: newWs } = await supabase
        .from('workspaces')
        .insert({
          name: role === 'founder' ? 'Ziggers Startup Workspace' : 'CA Professional Practice',
          type: role
        })
        .select()
        .single();
      activeWs = newWs;
    }

    setUser({
      id: `usr_${role}_${Date.now()}`,
      email: demoEmail,
      user_metadata: { full_name: 'Subanesh M.' }
    });

    if (activeWs) {
      setWorkspaces([activeWs]);
      setSelectedWorkspace(activeWs);
      const comps = await CompanyService.listCompanies(activeWs.id).catch(() => []);
      setCompanies(comps);
    }
    setLoading(false);
  };

  const handleApprove = () => {
    setAuthorizing(true);
    const wsId = selectedWorkspace?.id || 'ws-default';
    const usrId = user?.id || 'user-default';
    const authCode = `auth_code_${Math.random().toString(36).substring(2, 10)}::${wsId}::${usrId}`;

    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set('code', authCode);
    if (state) redirectUrl.searchParams.set('state', state);

    window.location.href = redirectUrl.toString();
  };

  const handleDeny = () => {
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set('error', 'access_denied');
    redirectUrl.searchParams.set('error_description', 'User cancelled authorization');
    if (state) redirectUrl.searchParams.set('state', state);

    window.location.href = redirectUrl.toString();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top App Pairing Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm">
              MCA
            </div>
            <div className="w-6 h-6 rounded-full bg-[#F7F7F5] border border-[#E5E5E5] flex items-center justify-center text-[#737373] text-xs">
              &harr;
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
          </div>

          <div>
            <h1 className="text-lg font-bold text-black">Authorize AI Connector</h1>
            <p className="text-xs text-[#525252] mt-0.5">
              <strong>Anthropic Claude</strong> wants to connect to your Future MCA workspace.
            </p>
          </div>
        </div>

        {/* If Not Logged In &rarr; Sign In Form */}
        {!user && !loading && (
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#2563EB]/20 text-xs text-[#2563EB] flex items-start space-x-2">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Please sign in to your Future MCA account to select which workspace to connect to Claude.</span>
            </div>

            {authError && (
              <div className="p-3 bg-[#FEF2F2] border border-[#DC2626]/30 text-xs text-[#DC2626] rounded-lg">
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-black block mb-1">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@company.io"
                  className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="font-semibold text-black block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg transition-colors"
              >
                Sign In & Continue
              </button>
            </form>

            <div className="border-t border-[#E5E5E5] pt-3 text-center space-y-2">
              <span className="text-[11px] text-[#737373]">Or 1-click test authorization:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('founder')}
                  className="py-1.5 px-2 bg-[#F7F7F5] hover:bg-[#EFF6FF] border border-[#E5E5E5] rounded text-xs font-medium text-[#0A0A0A]"
                >
                  Founder Persona
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('professional')}
                  className="py-1.5 px-2 bg-[#F7F7F5] hover:bg-[#EFF6FF] border border-[#E5E5E5] rounded text-xs font-medium text-[#0A0A0A]"
                >
                  CA Firm Persona
                </button>
              </div>
            </div>
          </div>
        )}

        {/* If Logged In &rarr; Scope & Workspace Approval */}
        {user && (
          <div className="space-y-5">
            
            {/* Authenticated User Banner */}
            <div className="p-3 bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-bold text-black">{user.user_metadata?.full_name || 'Authenticated User'}</div>
                  <div className="text-[10px] text-[#737373]">{user.email}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0FDF4] text-[#16A34A] font-bold">
                Signed In
              </span>
            </div>

            {/* Workspace Selection Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-black block">
                Select Workspace to Share with Claude:
              </label>
              {workspaces.length > 0 ? (
                <div className="space-y-1.5">
                  {workspaces.map(ws => (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={async () => {
                        setSelectedWorkspace(ws);
                        const comps = await CompanyService.listCompanies(ws.id).catch(() => []);
                        setCompanies(comps);
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-colors flex items-center justify-between ${
                        selectedWorkspace?.id === ws.id
                          ? 'bg-[#EFF6FF] border-[#2563EB]'
                          : 'bg-[#F7F7F5] border-[#E5E5E5] hover:border-[#737373]'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-black block">{ws.name}</span>
                        <span className="text-[10px] text-[#737373] capitalize font-mono">{ws.type} Workspace</span>
                      </div>
                      {selectedWorkspace?.id === ws.id && (
                        <Check className="w-4 h-4 text-[#2563EB]" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-[#F7F7F5] rounded-lg text-xs text-[#737373]">
                  Default Workspace (All accessible entities)
                </div>
              )}
            </div>

            {/* Permission Scopes */}
            <div className="space-y-2 border-t border-[#E5E5E5] pt-4">
              <div className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                Claude will be granted:
              </div>
              <div className="space-y-1.5 text-xs text-[#0A0A0A]">
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>Read company master profiles & active Board of Directors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>Inspect upcoming compliance deadlines & statutory penalty risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>Execute MCA error diagnostics and legal knowledge queries</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleDeny}
                className="w-1/3 py-2.5 px-3 bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#525252] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={authorizing}
                onClick={handleApprove}
                className="w-2/3 py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>{authorizing ? 'Connecting...' : 'Authorize Claude'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function AuthorizePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-[#737373]">Loading authorization...</div>}>
      <AuthorizeContent />
    </Suspense>
  );
}
