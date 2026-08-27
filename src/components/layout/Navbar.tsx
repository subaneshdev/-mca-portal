'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';
import { 
  Sparkles, 
  Building2, 
  Search, 
  ChevronDown, 
  Check, 
  User, 
  ExternalLink, 
  ShieldCheck, 
  LogOut, 
  Layers, 
  Activity, 
  Code,
  Cpu,
  Bot,
  Briefcase
} from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const { 
    user,
    profile, 
    role, 
    setRole, 
    workspaces,
    currentWorkspace,
    switchWorkspace,
    selectedCompany, 
    setSelectedCompany, 
    allCompanies, 
    setIsAiDrawerOpen,
    signOut
  } = useWorkspace();

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = allCompanies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.cin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const displayInitial = displayName.charAt(0).toUpperCase();

  const handleSwitchPersona = async (targetRole: 'founder' | 'professional') => {
    await setRole(targetRole);
    setIsRoleDropdownOpen(false);
    if (targetRole === 'founder') {
      router.push('/chat');
    } else {
      router.push('/overview');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#CBD5E1] h-14 font-sans">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        
        {/* Left: Brand & Company Selector */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-[#0B2545] text-white flex items-center justify-center font-bold text-xs tracking-wider">
              MCA
            </div>
            <span className="font-bold text-sm tracking-tight text-[#0B2545] group-hover:text-[#0066CC] transition-colors">
              Future MCA
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#0066CC] border border-[#BFDBFE] font-bold">
              Gov 2.0
            </span>
          </Link>

          {/* Company Switcher */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
              className="flex items-center space-x-2 px-2.5 py-1 text-xs font-semibold bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#CBD5E1] hover:border-[#0B2545] rounded-xl transition-all text-[#0F172A]"
            >
              <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="max-w-[180px] truncate font-medium">
                {selectedCompany?.name || 'Select Company'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#64748B]" />
            </button>

            {isCompanyDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-72 bg-white border border-[#CBD5E1] rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center justify-between">
                  <span>Workspace Entities</span>
                  <span className="text-[10px] text-[#0066CC] font-mono">{allCompanies.length} Active</span>
                </div>
                {allCompanies.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCompany(c);
                      setIsCompanyDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-[#0F172A]">{c.name}</div>
                      <div className="text-[10px] text-[#64748B] font-mono">{c.cin}</div>
                    </div>
                    {selectedCompany?.id === c.id && (
                      <Check className="w-4 h-4 text-[#16A34A]" />
                    )}
                  </button>
                ))}
                
                <div className="p-2 border-t border-[#E2E8F0] mt-1">
                  <Link
                    href="/companies"
                    onClick={() => setIsCompanyDropdownOpen(false)}
                    className="block text-center py-1 text-xs text-[#0066CC] hover:underline font-bold"
                  >
                    + Manage All Companies
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Persona Switcher, Search, AI Launcher, User Profile */}
        <div className="flex items-center space-x-3">
          
          {/* Workspace Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#0B2545] text-[#0B2545] font-bold shadow-xs transition-all"
            >
              {role === 'founder' ? (
                <Bot className="w-3.5 h-3.5 text-[#0066CC]" />
              ) : (
                <Briefcase className="w-3.5 h-3.5 text-[#16A34A]" />
              )}
              <span>
                {role === 'founder' ? 'Founder Chat' : 'Professional UI'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#64748B]" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white border border-[#CBD5E1] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in duration-100">
                <div className="px-3.5 py-1 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  Switch Primary Workspace View
                </div>
                
                {/* Option 1: Founder Chat */}
                <button
                  onClick={() => handleSwitchPersona('founder')}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#F8FAFC] transition-colors flex items-start justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-[#0B2545] flex items-center space-x-1.5">
                      <Bot className="w-3.5 h-3.5 text-[#0066CC]" />
                      <span>Business Owner Assistant</span>
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      Conversational dashboard at <code className="text-[#0066CC]">/chat</code>
                    </p>
                  </div>
                  {role === 'founder' && <Check className="w-4 h-4 text-[#0066CC] shrink-0 mt-0.5" />}
                </button>

                {/* Option 2: Professional Operations */}
                <button
                  onClick={() => handleSwitchPersona('professional')}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#F8FAFC] transition-colors border-t border-[#E2E8F0] flex items-start justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-[#0B2545] flex items-center space-x-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>CA / CS Professional UI</span>
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      Operations dashboard at <code className="text-[#0066CC]">/overview</code>
                    </p>
                  </div>
                  {role === 'professional' && <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Quick Search */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 text-xs text-[#64748B] bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#CBD5E1] rounded-xl transition-all"
          >
            <Search className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="hidden sm:inline">Search CIN or Form...</span>
            <kbd className="hidden sm:inline font-mono text-[10px] bg-white px-1.5 py-0.5 border border-[#CBD5E1] rounded shadow-xs">⌘K</kbd>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="w-8 h-8 rounded-full bg-[#0B2545] text-white flex items-center justify-center text-xs font-bold hover:bg-[#07192F] transition-colors shadow-xs"
            >
              {displayInitial}
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-[#CBD5E1] rounded-xl shadow-xl py-1.5 z-50">
                <div className="px-3 py-2 border-b border-[#E2E8F0]">
                  <div className="font-bold text-xs text-[#0B2545]">{displayName}</div>
                  <div className="text-[11px] text-[#64748B] truncate">{user?.email || 'c.subanesh@gmail.com'}</div>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="block px-3 py-2 text-xs text-[#334155] hover:bg-[#F8FAFC] font-medium"
                >
                  Workspace Settings
                </Link>

                <Link
                  href="/connect-ai"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="block px-3 py-2 text-xs text-[#334155] hover:bg-[#F8FAFC] font-medium"
                >
                  Connected MCP Clients
                </Link>

                <div className="border-t border-[#E2E8F0] my-1"></div>

                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#DC2626] hover:bg-[#FEF2F2] font-semibold flex items-center space-x-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Global Quick Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-start justify-center pt-20 p-4 animate-in fade-in duration-100">
          <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-2xl max-w-xl w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center space-x-2 w-full">
                <Search className="w-4 h-4 text-[#64748B]" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search entities, forms (DIR-12, AOC-4), or laws..."
                  className="w-full text-sm outline-none text-[#0F172A]"
                />
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-xs text-[#64748B] hover:text-black font-bold"
              >
                ESC
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 text-xs">
              <div className="text-[10px] font-bold text-[#64748B] uppercase px-2 py-1">Quick Suggestions</div>
              <Link
                href="/chat"
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:bg-[#EFF6FF] rounded-lg block text-[#0B2545] font-semibold"
              >
                🤖 Ask Future MCA in plain English &rarr;
              </Link>
              <Link
                href="/filings/new?form=DIR-12"
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:bg-[#F8FAFC] rounded-lg block text-[#0F172A]"
              >
                📄 Form DIR-12 (Director Appointment / Resignation)
              </Link>
              <Link
                href="/filings/new?form=AOC-4"
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:bg-[#F8FAFC] rounded-lg block text-[#0F172A]"
              >
                📊 Form AOC-4 (Annual Financial Statements Filing)
              </Link>
              <Link
                href="/compliance"
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:bg-[#F8FAFC] rounded-lg block text-[#0F172A]"
              >
                📅 Statutory Compliance Deadlines & Penalty Matrix
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
