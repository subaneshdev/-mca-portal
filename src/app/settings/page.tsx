'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Cpu, ShieldCheck, User, Building2, Key, ChevronRight, Bot, Briefcase, ArrowRight, Check } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { role, setRole, selectedCompany } = useWorkspace();

  const handleSwitch = async (newRole: 'founder' | 'professional') => {
    await setRole(newRole);
    if (newRole === 'founder') {
      router.push('/chat');
    } else {
      router.push('/overview');
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 font-sans">
        
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#0B2545]">Workspace Settings</h1>
          <p className="text-xs text-[#64748B] mt-1">
            Configure your active workspace persona, connected AI clients, and statutory permissions.
          </p>
        </div>

        <div className="space-y-4">
          
          {/* Persona Selection */}
          <div className="p-6 bg-white border border-[#CBD5E1] rounded-2xl shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2545]">
                Primary Workspace View Mode
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Choose the primary interface for your day-to-day work. The underlying company data is identical.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option 1: Founder */}
              <div
                onClick={() => handleSwitch('founder')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  role === 'founder'
                    ? 'border-[#0066CC] ring-2 ring-[#0066CC]/20 bg-[#EFF6FF]'
                    : 'border-[#CBD5E1] hover:border-[#0B2545] bg-[#F8FAFC]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-white text-[#0066CC] border border-[#CBD5E1] flex items-center justify-center shadow-xs">
                      <Bot className="w-5 h-5" />
                    </div>
                    {role === 'founder' && (
                      <span className="text-[10px] font-bold text-[#0066CC] bg-white px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                        Active Mode
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-xs text-[#0B2545]">
                    Business Owner / Founder
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    Conversational AI dashboard at <code className="font-mono text-[#0066CC]">/chat</code>. Ask in plain English and follow guided workflows.
                  </p>
                </div>

                <div className="text-[11px] font-bold text-[#0066CC] flex items-center space-x-1 pt-1">
                  <span>Open Conversational UI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Option 2: Professional */}
              <div
                onClick={() => handleSwitch('professional')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  role === 'professional'
                    ? 'border-[#0066CC] ring-2 ring-[#0066CC]/20 bg-[#EFF6FF]'
                    : 'border-[#CBD5E1] hover:border-[#0B2545] bg-[#F8FAFC]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-white text-[#0066CC] border border-[#CBD5E1] flex items-center justify-center shadow-xs">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    {role === 'professional' && (
                      <span className="text-[10px] font-bold text-[#0066CC] bg-white px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                        Active Mode
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-xs text-[#0B2545]">
                    CA / CS Professional
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    Operational matrix at <code className="font-mono text-[#0066CC]">/overview</code>. Fast, form-first, multi-company overview.
                  </p>
                </div>

                <div className="text-[11px] font-bold text-[#0066CC] flex items-center space-x-1 pt-1">
                  <span>Open Professional UI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>
          </div>

          {/* Connected AI Clients Link */}
          <Link
            href="/connect-ai"
            className="p-5 bg-white border border-[#CBD5E1] hover:border-[#0066CC] rounded-2xl flex items-center justify-between shadow-xs transition-all block"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#0066CC] flex items-center justify-center shadow-xs">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0B2545]">Connected AI Clients & Remote MCP</h2>
                <p className="text-xs text-[#64748B]">Configure Claude Desktop, Cursor, and manage OAuth 2.1 scopes.</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#64748B]" />
          </Link>

        </div>

      </div>
    </AppShell>
  );
}
