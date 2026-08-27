'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Activity,
  Bot,
  Briefcase
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole, selectedCompany, setIsAiDrawerOpen } = useWorkspace();

  const navItems = [
    {
      label: 'Overview',
      href: '/overview',
      icon: LayoutDashboard
    },
    {
      label: role === 'founder' ? 'My Company' : 'Companies',
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
      label: 'Filings',
      href: '/filings',
      icon: FileText
    },
    {
      label: 'Applications',
      href: '/applications',
      icon: GitPullRequest
    },
    {
      label: 'Diagnostics',
      href: '/diagnostics',
      icon: HelpCircle
    },
  ];

  const secondaryNavItems = [
    {
      label: 'AI Assistant',
      href: '/chat',
      icon: Bot,
      highlight: true
    },
    {
      label: 'MCP Connections',
      href: '/connect-ai',
      icon: Cpu
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ];

  return (
    <aside className="w-56 bg-white border-r border-[#CBD5E1] flex flex-col justify-between h-[calc(100vh-3.5rem)] sticky top-14 font-sans">
      
      {/* Navigation Links */}
      <div className="py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-[#64748B] flex items-center justify-between">
          <span>{role === 'founder' ? 'Founder Workspace' : 'Professional Practice'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#0066CC] font-bold border border-[#BFDBFE]'
                  : 'text-[#0F172A] hover:bg-[#F8FAFC] hover:text-[#0B2545]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0066CC]' : 'text-[#64748B]'}`} />
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

        {/* Secondary Links */}
        <div className="pt-3 border-t border-[#E2E8F0] mt-3 space-y-1">
          <div className="px-3 pb-1.5 text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
            Tools & Intelligence
          </div>

          {secondaryNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#0066CC] font-bold border border-[#BFDBFE]'
                    : item.highlight
                    ? 'text-[#0066CC] hover:bg-[#EFF6FF]'
                    : 'text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 text-[#0066CC]" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Developer Sandbox */}
        <div className="pt-2 border-t border-[#E2E8F0] mt-2 space-y-0.5">
          <Link
            href="/settings/developer"
            className={`flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
              pathname === '/settings/developer'
                ? 'bg-[#EFF6FF] text-[#0066CC] font-bold'
                : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0B2545]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Developer Tools</span>
          </Link>
          <Link
            href="/system-status"
            className={`flex items-center space-x-2 px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
              pathname === '/system-status'
                ? 'bg-[#EFF6FF] text-[#0066CC] font-bold'
                : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0B2545]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>System Status</span>
          </Link>
        </div>
      </div>

      {/* Bottom Context Box */}
      <div className="p-3 border-t border-[#E2E8F0] space-y-2">
        {/* Switch Persona Box */}
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#0B2545]">
            <span>Active Persona</span>
            <span className="text-[10px] text-[#0066CC] uppercase">{role}</span>
          </div>
          <p className="text-[10px] text-[#64748B] leading-tight">
            {role === 'founder'
              ? 'Conversational AI as primary dashboard'
              : 'Professional operations workspace'}
          </p>
          <button
            onClick={async () => {
              const nextRole = role === 'founder' ? 'professional' : 'founder';
              await setRole(nextRole);
              if (nextRole === 'founder') {
                router.push('/chat');
              } else {
                router.push('/overview');
              }
            }}
            className="w-full mt-1 py-1.5 px-2 bg-white hover:bg-[#0B2545] hover:text-white border border-[#CBD5E1] text-[#0B2545] font-bold text-[10px] rounded-lg transition-all flex items-center justify-center space-x-1"
          >
            <span>Switch to {role === 'founder' ? 'Professional UI' : 'Founder Chat'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

    </aside>
  );
}
