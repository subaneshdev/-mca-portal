'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Cpu 
} from 'lucide-react';

export function Navbar() {
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

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] h-14">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        
        {/* Left: Brand & Company Selector */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-7 h-7 rounded bg-black text-white flex items-center justify-center font-semibold text-xs tracking-wider">
              MCA
            </div>
            <span className="font-semibold text-sm tracking-tight text-black group-hover:text-[#2563EB] transition-colors">
              Future MCA
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#F7F7F5] text-[#525252] border border-[#E5E5E5]">
              Gov 2.0
            </span>
          </Link>

          {/* Company Switcher */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
              className="flex items-center space-x-2 px-2.5 py-1 text-xs font-medium bg-[#F7F7F5] hover:bg-[#EFF6FF] border border-[#E5E5E5] hover:border-[#2563EB] rounded transition-all text-[#0A0A0A]"
            >
              <Building2 className="w-3.5 h-3.5 text-[#525252]" />
              <span className="max-w-[180px] truncate font-medium">
                {selectedCompany?.name || 'Select Company'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#737373]" />
            </button>

            {isCompanyDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-72 bg-white border border-[#E5E5E5] rounded-lg shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[11px] font-medium text-[#737373] uppercase tracking-wider flex items-center justify-between">
                  <span>Workspace Companies</span>
                  <span className="text-[10px] text-[#2563EB] font-mono">{allCompanies.length} Active</span>
                </div>
                {allCompanies.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCompany(c);
                      setIsCompanyDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F7F7F5] transition-colors"
                  >
                    <div>
                      <div className="font-medium text-[#0A0A0A]">{c.name}</div>
                      <div className="text-[11px] text-[#737373] font-mono">{c.cin}</div>
                    </div>
                    {selectedCompany?.id === c.id && (
                      <Check className="w-4 h-4 text-[#2563EB]" />
                    )}
                  </button>
                ))}
                
                <div className="p-2 border-t border-[#E5E5E5] mt-1">
                  <Link
                    href="/companies"
                    onClick={() => setIsCompanyDropdownOpen(false)}
                    className="block text-center py-1 text-xs text-[#2563EB] hover:underline font-medium"
                  >
                    + Manage All Companies
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center/Right: Persona Switcher, Quick Search & AI Launcher */}
        <div className="flex items-center space-x-3">
          
          {/* Workspace Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded border border-[#E5E5E5] bg-white hover:bg-[#F7F7F5] text-[#0A0A0A]"
            >
              <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
              <span className="font-medium">
                {role === 'founder' ? 'Founder Workspace' : 'CA / CS Professional'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#737373]" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white border border-[#E5E5E5] rounded shadow-lg py-1.5 z-50">
                <div className="px-3 py-1 text-[11px] font-medium text-[#737373] uppercase tracking-wider">
                  Select Workspace Persona
                </div>
                <button
                  onClick={() => {
                    setRole('founder');
                    setIsRoleDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-[#F7F7F5] transition-colors"
                >
                  <div className="font-medium text-[#0A0A0A] flex items-center justify-between">
                    <span>Business Owner / Founder</span>
                    {role === 'founder' && <Check className="w-3.5 h-3.5 text-[#2563EB]" />}
                  </div>
                  <div className="text-[11px] text-[#737373]">Intent-first, guided workflows & simple actions.</div>
                </button>
                <button
                  onClick={() => {
                    setRole('professional');
                    setIsRoleDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-[#F7F7F5] transition-colors border-t border-[#E5E5E5]"
                >
                  <div className="font-medium text-[#0A0A0A] flex items-center justify-between">
                    <span>CA / CS Professional</span>
                    {role === 'professional' && <Check className="w-3.5 h-3.5 text-[#2563EB]" />}
                  </div>
                  <div className="text-[11px] text-[#737373]">Multi-client risk matrix, form power tools & bulk checks.</div>
                </button>
              </div>
            )}
          </div>

          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-2 px-3 py-1 text-xs text-[#737373] bg-[#F7F7F5] hover:bg-[#EFF6FF] border border-[#E5E5E5] rounded transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search CIN, Form, or Rule...</span>
            <kbd className="hidden sm:inline font-mono text-[10px] bg-white px-1 py-0.5 border border-[#E5E5E5] rounded">⌘K</kbd>
          </button>

          {/* Contextual Ask AI Button */}
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium">Ask AI</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold hover:opacity-90 transition-opacity"
            >
              {displayInitial}
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E5E5] rounded-lg shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-[#E5E5E5]">
                  <div className="font-bold text-black">{displayName}</div>
                  <div className="text-[11px] text-[#737373] truncate">{user?.email || 'Authenticated User'}</div>
                </div>

                <div className="py-1">
                  <Link
                    href="/connect-ai"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="px-3 py-2 flex items-center space-x-2 text-[#0A0A0A] hover:bg-[#F7F7F5] transition-colors"
                  >
                    <Cpu className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Connect AI Clients (MCP)</span>
                  </Link>
                  <Link
                    href="/settings/developer"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="px-3 py-2 flex items-center space-x-2 text-[#0A0A0A] hover:bg-[#F7F7F5] transition-colors"
                  >
                    <Code className="w-3.5 h-3.5 text-[#737373]" />
                    <span>Developer Sandbox</span>
                  </Link>
                  <Link
                    href="/system-status"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="px-3 py-2 flex items-center space-x-2 text-[#0A0A0A] hover:bg-[#F7F7F5] transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>System Status</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="px-3 py-2 flex items-center space-x-2 text-[#0A0A0A] hover:bg-[#F7F7F5] transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#737373]" />
                    <span>Settings</span>
                  </Link>
                </div>

                <div className="border-t border-[#E5E5E5] pt-1">
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full px-3 py-2 text-left text-[#DC2626] hover:bg-[#FEF2F2] flex items-center space-x-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Quick Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-20 px-4">
          <div className="bg-white border border-[#E5E5E5] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center px-4 border-b border-[#E5E5E5]">
              <Search className="w-4 h-4 text-[#737373]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies, CIN, directors, forms (AOC-4, DIR-12)..."
                className="w-full px-3 py-3 text-sm outline-none text-[#0A0A0A] placeholder-[#737373]"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-xs text-[#737373] hover:text-black font-medium"
              >
                ESC
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              <div className="text-[11px] font-medium text-[#737373] px-2 py-1 uppercase">Companies</div>
              {filteredCompanies.map(c => (
                <Link
                  key={c.id}
                  href={`/companies/${c.cin}`}
                  onClick={() => {
                    setSelectedCompany(c);
                    setIsSearchOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 text-xs rounded hover:bg-[#F7F7F5] transition-colors"
                >
                  <div>
                    <div className="font-medium text-[#0A0A0A]">{c.name}</div>
                    <div className="text-[11px] text-[#737373] font-mono">{c.cin}</div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] font-medium">
                    {c.status}
                  </span>
                </Link>
              ))}

              <div className="text-[11px] font-medium text-[#737373] px-2 py-1 mt-2 uppercase">Quick MCA Form Workflows</div>
              <Link
                href="/filings/new?intent=director-resigned"
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-xs rounded hover:bg-[#F7F7F5] transition-colors"
              >
                <span className="font-medium text-[#0A0A0A]">Director Resignation Workflow</span>
                <span className="text-[11px] text-[#525252] font-mono">DIR-12</span>
              </Link>
              <Link
                href="/filings/new?intent=address-changed"
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-xs rounded hover:bg-[#F7F7F5] transition-colors"
              >
                <span className="font-medium text-[#0A0A0A]">Change Registered Office Address</span>
                <span className="text-[11px] text-[#525252] font-mono">INC-22</span>
              </Link>
              <Link
                href="/diagnostics"
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-xs rounded hover:bg-[#F7F7F5] transition-colors"
              >
                <span className="font-medium text-[#0A0A0A]">Something Went Wrong? Error Diagnosis</span>
                <span className="text-[11px] text-[#2563EB]">Diagnostics</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
