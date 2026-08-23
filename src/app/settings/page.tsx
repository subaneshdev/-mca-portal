'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Cpu, ShieldCheck, User, Building2, Key, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const { role, setRole, selectedCompany } = useWorkspace();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Workspace Settings</h1>
          <p className="text-xs text-[#525252] mt-1">
            Manage your credentials, connected AI clients, and company permissions.
          </p>
        </div>

        <div className="space-y-4">
          
          <Link
            href="/settings/ai-clients"
            className="p-5 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-between hover:border-[#2563EB] transition-colors block"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-black">Connected AI Clients & Remote MCP</h2>
                <p className="text-xs text-[#525252]">Configure Claude Desktop, Cursor, and manage OAuth 2.1 scopes.</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#737373]" />
          </Link>

          <div className="p-5 bg-white border border-[#E5E5E5] rounded-xl space-y-4">
            <h2 className="text-sm font-bold text-black border-b border-[#E5E5E5] pb-2">Workspace Persona Mode</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setRole('founder')}
                className={`p-3.5 rounded-lg border text-left transition-colors ${
                  role === 'founder' ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#E5E5E5] hover:bg-[#F7F7F5]'
                }`}
              >
                <div className="font-semibold text-xs text-black">Founder & Business Owner</div>
                <p className="text-[11px] text-[#525252] mt-0.5">Intent-first actions, plain language guidance.</p>
              </button>
              <button
                onClick={() => setRole('professional')}
                className={`p-3.5 rounded-lg border text-left transition-colors ${
                  role === 'professional' ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#E5E5E5] hover:bg-[#F7F7F5]'
                }`}
              >
                <div className="font-semibold text-xs text-black">CA / CS / Compliance Professional</div>
                <p className="text-[11px] text-[#525252] mt-0.5">Multi-client risk matrix, form power tools.</p>
              </button>
            </div>
          </div>

        </div>

      </div>
    </AppShell>
  );
}
