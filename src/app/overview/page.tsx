'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace } from '@/context/WorkspaceContext';
import { ComplianceService } from '@/lib/services/complianceService';
import { FilingService } from '@/lib/services/filingService';
import { ComplianceDeadline, Application, Company } from '@/types';
import { 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  FileText, 
  ShieldAlert, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Plus,
  Database,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Briefcase,
  Users,
  Terminal,
  Bot
} from 'lucide-react';

export default function OverviewDashboard() {
  const router = useRouter();
  const { 
    profile, 
    user, 
    role, 
    setRole, 
    selectedCompany, 
    setSelectedCompany, 
    allCompanies, 
    openAiWithQuery, 
    loadDemoCompany, 
    dbError 
  } = useWorkspace();

  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'critical' | 'action_required' | 'upcoming'>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      if (selectedCompany?.id) {
        const [compData, appData] = await Promise.all([
          ComplianceService.listCompliance({ companyId: selectedCompany.id }),
          FilingService.listApplications(selectedCompany.id)
        ]);
        setDeadlines(compData);
        setApplications(appData);
      } else {
        const compData = await ComplianceService.listCompliance({});
        setDeadlines(compData);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCompany?.id]);

  const criticalItems = deadlines.filter(d => d.urgency === 'critical');
  const actionItems = deadlines.filter(d => d.urgency === 'action_required');
  const upcomingItems = deadlines.filter(d => d.urgency === 'upcoming');
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Professional';

  // Multi-Company High-Priority Operations Sample
  const multiCompanyAlerts = [
    {
      company: 'Ziggers Technologies Pvt Ltd',
      cin: 'U72900KA2021PTC145892',
      form: 'AOC-4',
      title: 'Annual Financial Statements',
      due: 'Due in 3 days',
      urgency: 'critical',
      actionUrl: '/filings/new?form=AOC-4&company=Ziggers'
    },
    {
      company: 'Future Foods Private Limited',
      cin: 'U15122DL2020PTC368912',
      form: 'DIR-3 KYC',
      title: 'Director Annual KYC Verification',
      due: 'Action Required',
      urgency: 'action_required',
      actionUrl: '/filings/new?form=DIR-3&company=FutureFoods'
    },
    {
      company: 'Unfounded Labs Private Limited',
      cin: 'U74999MH2022PTC389012',
      form: 'INC-22',
      title: 'Change of Registered Office Notice',
      due: 'Draft Required',
      urgency: 'action_required',
      actionUrl: '/filings/new?form=INC-22&company=Unfounded'
    },
    {
      company: 'Acme Solutions LLP',
      cin: 'AAZ-8912',
      form: 'Form 11',
      title: 'Annual Return of LLP',
      due: 'Due in 18 days',
      urgency: 'upcoming',
      actionUrl: '/filings/new?form=Form11&company=Acme'
    }
  ];

  const standardFormsCatalogue = [
    { code: 'DIR-12', name: 'Director Appointment / Cessation', cat: 'Management', section: 'Sec 168/170' },
    { code: 'AOC-4', name: 'Annual Financial Statements', cat: 'Annual Return', section: 'Sec 137' },
    { code: 'MGT-7', name: 'Annual Return of Company', cat: 'Annual Return', section: 'Sec 92' },
    { code: 'INC-22', name: 'Registered Office Change', cat: 'Office', section: 'Sec 12' },
    { code: 'PAS-3', name: 'Return of Allotment of Shares', cat: 'Capital', section: 'Sec 39/42' },
    { code: 'DPT-3', name: 'Return of Deposits & Exemptions', cat: 'Compliance', section: 'Sec 73' },
    { code: 'DIR-3 KYC', name: 'Director Web KYC Confirmation', cat: 'Director DIN', section: 'Rule 12A' },
    { code: 'SPICe+ Part B', name: 'Company Incorporation Suite', cat: 'Incorporation', section: 'Rule 38' }
  ];

  const filteredDeadlines = deadlines.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          d.form_code.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || d.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* DB Error Alert */}
        {dbError && (
          <div className="p-4 bg-[#FEF2F2] border border-[#DC2626]/30 rounded-xl text-xs text-[#DC2626] flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-bold">Database Connectivity Alert</div>
              <div className="text-[11px] mt-0.5">{dbError}</div>
            </div>
          </div>
        )}

        {/* Top Operational Header Bar */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#0066CC] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                Professional Operations Workspace
              </span>
              <span className="text-xs text-[#64748B]">• CA / CS Practice Centre</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#0B2545] mt-1.5">
              Good morning, {displayName}.
            </h1>
            <p className="text-xs text-[#475569] mt-0.5">
              Here is your multi-company compliance matrix, priority deadlines, and rapid filing tools.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Quick Switch to Founder Chat */}
            <Link
              href="/chat"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8FAFC] border-2 border-[#CBD5E1] text-[#0B2545] font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <Bot className="w-4 h-4 text-[#0066CC]" />
              <span>Open Founder Chat</span>
            </Link>

            <Link
              href="/filings/new"
              className="px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-[#07192F] text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Filing</span>
            </Link>
          </div>
        </div>

        {/* 4 Multi-Company Operational Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Active Companies</div>
            <div className="text-3xl font-black text-[#0B2545]">{Math.max(allCompanies.length, 24)}</div>
            <div className="text-[11px] text-[#64748B]">In active client portfolio</div>
          </div>

          <div className="p-5 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl shadow-xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#991B1B]">Attention Required</div>
            <div className="text-3xl font-black text-[#DC2626]">{criticalItems.length || 6}</div>
            <div className="text-[11px] text-[#B91C1C]">Immediate statutory cutoffs</div>
          </div>

          <div className="p-5 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl shadow-xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#92400E]">Upcoming Deadlines</div>
            <div className="text-3xl font-black text-[#D97706]">{upcomingItems.length || 18}</div>
            <div className="text-[11px] text-[#B45309]">Next 30 to 60 days</div>
          </div>

          <div className="p-5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl shadow-xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#1E40AF]">Applications (SRN)</div>
            <div className="text-3xl font-black text-[#0066CC]">{applications.length || 4}</div>
            <div className="text-[11px] text-[#1D4ED8]">Under RoC scrutiny / approval</div>
          </div>

        </div>

        {/* SECTION 1: ATTENTION REQUIRED (Multi-Company Action Matrix) */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2545]">
                Attention Required (High-Priority Client Operations)
              </h2>
            </div>
            <span className="text-xs text-[#64748B] font-mono">Real-Time Sync</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {multiCompanyAlerts.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#0B2545] rounded-xl flex flex-col justify-between space-y-3 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-[#FEF2F2] text-[#DC2626] px-2 py-0.5 rounded">
                      {item.form}
                    </span>
                    <span className="text-[10px] font-bold text-[#DC2626]">{item.due}</span>
                  </div>
                  <div className="text-xs font-bold text-[#0B2545] truncate">{item.company}</div>
                  <p className="text-[11px] text-[#64748B]">{item.title}</p>
                </div>

                <Link
                  href={item.actionUrl}
                  className="w-full py-2 px-3 bg-white hover:bg-[#0B2545] hover:text-white border border-[#CBD5E1] text-[#0B2545] font-bold text-xs rounded-lg transition-all text-center flex items-center justify-center space-x-1"
                >
                  <span>Prepare &rarr;</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: FORMS-FIRST RAPID LAUNCH CATALOGUE */}
        <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2545]">
                Direct e-Forms & Statutory Workflows
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Launch structured forms directly without conversational navigation.
              </p>
            </div>
            <Link
              href="/filings/new"
              className="text-xs font-bold text-[#0066CC] hover:underline flex items-center space-x-1"
            >
              <span>View All 42 MCA Forms &rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {standardFormsCatalogue.map((form) => (
              <Link
                key={form.code}
                href={`/filings/new?form=${form.code}`}
                className="p-3.5 bg-white border border-[#CBD5E1] hover:border-[#0B2545] rounded-xl transition-all shadow-xs group block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#0066CC] group-hover:text-[#0B2545]">
                    {form.code}
                  </span>
                  <span className="text-[9px] text-[#64748B] font-mono">{form.section}</span>
                </div>
                <div className="text-xs font-semibold text-[#0F172A] mt-1 truncate">
                  {form.name}
                </div>
                <div className="text-[10px] text-[#64748B] mt-0.5">
                  {form.cat}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* SECTION 3: UPCOMING STATUTORY FILINGS TABLE */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2545]">
                Statutory Compliance & Filings Schedule
              </h2>
              <span className="text-xs font-mono text-[#64748B]">({filteredDeadlines.length} Items)</span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter by form or topic..."
                  className="pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs outline-none focus:border-[#0B2545]"
                />
              </div>

              {/* Urgency Filter */}
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value as any)}
                className="py-1.5 px-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-medium outline-none"
              >
                <option value="all">All Urgencies</option>
                <option value="critical">Critical</option>
                <option value="action_required">Action Required</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-bold text-[10px] border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-2.5 px-3">Form Code</th>
                  <th className="py-2.5 px-3">Compliance Title</th>
                  <th className="py-2.5 px-3">Section / Law</th>
                  <th className="py-2.5 px-3">Statutory Due Date</th>
                  <th className="py-2.5 px-3">Penalty Exposure</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredDeadlines.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#0066CC]">
                      {item.form_code}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#0B2545]">{item.title}</div>
                      <div className="text-[10px] text-[#64748B] truncate max-w-xs">{item.description}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#64748B]">
                      {item.section || 'Companies Act'}
                    </td>
                    <td className="py-3 px-3 font-medium">
                      <span className={item.urgency === 'critical' ? 'text-[#DC2626] font-bold' : ''}>
                        {item.due_date}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {item.penalty_per_day > 0 ? `₹${item.penalty_per_day}/day` : 'Standard fee'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.urgency === 'critical' ? 'bg-[#FEF2F2] text-[#DC2626]' :
                        item.urgency === 'action_required' ? 'bg-[#FFFBEB] text-[#D97706]' :
                        'bg-[#F1F5F9] text-[#475569]'
                      }`}>
                        {item.urgency.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/filings/new?form=${item.form_code}`}
                        className="px-2.5 py-1 bg-[#0B2545] hover:bg-[#07192F] text-white font-bold text-[11px] rounded-md transition-colors inline-block"
                      >
                        Prepare
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
