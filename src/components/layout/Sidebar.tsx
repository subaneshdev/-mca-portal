'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';
import { 
  LayoutDashboard, 
  Building2, 
  ShieldAlert, 
  FileText, 
  GitPullRequest, 
  HelpCircle, 
  Cpu, 
  Settings, 
  Sparkles,
  ArrowRight,
  Code,
  Activity
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { role, selectedCompany, setIsAiDrawerOpen } = useWorkspace();

  const navItems = [
    {
      label: 'Overview',
      href: '/overview',
      icon: LayoutDashboard
    },
    {
      label: role === 'founder' ? 'My Company' : 'Client Portfolio',
      href: '/companies',
      icon: Building2
    },
    {
      label: 'Compliance',
      href: '/compliance',
      icon: ShieldAlert,
      badge: selectedCompany?.compliance_count?.critical ? `${selectedCompany.compliance_count.critical}` : undefined
    },
    {
      label: 'What Changed?',
      href: '/filings',
      icon: FileText
    },
    {
      label: 'Applications',
      href: '/applications',
      icon: GitPullRequest
    },
    {
      label: 'Error Diagnostics',
      href: '/diagnostics',
      icon: HelpCircle
    },
    {
      label: 'Connected AI & MCP',
      href: '/settings/ai-clients',
      icon: Cpu
    }
  ];

  return (
    <aside className="w-56 bg-white border-r border-[#E5E5E5] flex flex-col justify-between h-[calc(100vh-3.5rem)] sticky top-14">
      
      {/* Navigation Links */}
      <div className="py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] uppercase font-mono tracking-wider text-[#737373]">
          {role === 'founder' ? 'Company Operations' : 'Professional Practice'}
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition-colors ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                  : 'text-[#0A0A0A] hover:bg-[#F7F7F5] hover:text-black'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-[#525252]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#DC2626] text-white font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 border-t border-[#E5E5E5] mt-3">
          <div className="px-3 pb-1.5 text-[10px] uppercase font-mono tracking-wider text-[#737373]">
            Testing & Observability
          </div>
          <Link
            href="/settings/developer"
            className={`flex items-center space-x-2.5 px-3 py-1.5 text-xs rounded transition-colors ${
              pathname === '/settings/developer'
                ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                : 'text-[#525252] hover:bg-[#F7F7F5] hover:text-black'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Developer Sandbox</span>
          </Link>
          <Link
            href="/system-status"
            className={`flex items-center space-x-2.5 px-3 py-1.5 text-xs rounded transition-colors ${
              pathname === '/system-status'
                ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                : 'text-[#525252] hover:bg-[#F7F7F5] hover:text-black'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>System Health</span>
          </Link>
        </div>
      </div>

      {/* Bottom Context Box: Active Attention Banner */}
      <div className="p-3 border-t border-[#E5E5E5] space-y-2">
        <div className="p-2.5 rounded bg-[#F7F7F5] border border-[#E5E5E5]">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#0A0A0A]">
            <span>MCP Agent Server</span>
            <span className="w-2 h-2 rounded-full bg-[#16A34A] inline-block animate-pulse"></span>
          </div>
          <p className="text-[10px] text-[#525252] mt-1 line-clamp-2">
            13 tools live on <code className="font-mono text-[9px] bg-white px-1 py-0.5 border border-[#E5E5E5] rounded">/api/mcp</code>
          </p>
          <Link
            href="/settings/ai-clients"
            className="text-[11px] text-[#2563EB] font-medium hover:underline flex items-center space-x-1 mt-2"
          >
            <span>Connect AI Agent</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-medium text-black bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] rounded transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Ask AI Context</span>
        </button>
      </div>

    </aside>
  );
}
