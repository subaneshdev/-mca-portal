'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace } from '@/context/WorkspaceContext';
import { ComplianceService } from '@/lib/services/complianceService';
import { CompanyService } from '@/lib/services/companyService';
import { ComplianceDeadline, Application, Company } from '@/types';
import { FilingService } from '@/lib/services/filingService';
import { 
  AlertTriangle, 
  Building2, 
  Plus, 
  Search, 
  ShieldCheck, 
  Briefcase, 
  Bot, 
  ArrowRight,
  Clock,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function OverviewDashboard() {
  const router = useRouter();
  const { 
    profile, 
    user, 
    allCompanies, 
    dbError 
  } = useWorkspace();

  useEffect(() => {
    if (profile && profile.onboarding_completed === false) {
      router.push('/onboarding');
    }
  }, [profile, router]);

  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'critical' | 'action_required' | 'upcoming'>('all');
  const [extraCompanies, setExtraCompanies] = useState<Company[]>([]);

  useEffect(() => {
    CompanyService.listCompanies().then((res: Company[]) => {
      if (res && res.length > 0) setExtraCompanies(res);
    }).catch(() => {});
  }, []);

  const combinedList = [...extraCompanies, ...allCompanies];
  const seenNames = new Set<string>();
  const companiesList = combinedList.filter(c => {
    const key = (c.name || '').toLowerCase().trim();
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    return true;
  });
  const displayName = profile?.full_name || 'there';

  useEffect(() => {
    const load = async () => {
      try {
        const [compData, appData] = await Promise.all([
          ComplianceService.listCompliance().catch(() => []),
          FilingService.listApplications().catch(() => [])
        ]);
        setDeadlines(compData);
        setApplications(appData);
      } catch {
        // graceful
      }
    };
    load();
  }, []);

  const criticalItems = deadlines.filter(d => d.urgency === 'critical');
  const actionRequiredItems = deadlines.filter(d => d.urgency === 'action_required');
  const upcomingItems = deadlines.filter(d => d.urgency === 'upcoming');

  const standardFormsCatalogue = [
    { code: 'DIR-12', name: 'Director Resignation / Appointment', cat: 'Board Governance', section: 'Sec 168/170' },
    { code: 'SPICe+ Part B', name: 'Company Incorporation Suite', cat: 'Incorporation', section: 'Sec 7, Rule 38' },
    { code: 'AOC-4', name: 'Annual Financial Statements', cat: 'Annual Return', section: 'Sec 137' },
    { code: 'MGT-7A', name: 'Annual Return of Company', cat: 'Annual Return', section: 'Sec 92' },
    { code: 'INC-22', name: 'Registered Office Change', cat: 'Office', section: 'Sec 12' },
    { code: 'PAS-3', name: 'Return of Allotment of Shares', cat: 'Capital', section: 'Sec 39/42' },
    { code: 'DPT-3', name: 'Return of Deposits & Exemptions', cat: 'Compliance', section: 'Sec 73' },
    { code: 'DIR-3 KYC', name: 'Director Annual KYC Verification', cat: 'Director DIN', section: 'Rule 12A' }
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
        
        {/* DB Error Alert if any */}
        {dbError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-bold">Database Notice</div>
              <div className="text-[11px] mt-0.5">{dbError}</div>
            </div>
          </div>
        )}

        {/* Operational Header Bar */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                {profile?.persona === 'professional' ? 'CA / CS Workspace' : 'Founder Workspace'}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-neutral-900 mt-1.5">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {displayName}.
            </h1>
            <p className="text-xs text-neutral-600 mt-0.5">
              {companiesList.length > 0
                ? `Managing ${companiesList.length} ${companiesList.length === 1 ? 'company' : 'companies'} in your portfolio.`
                : 'Start by adding a company or using Founders AI to register one.'}
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <Link
              href="/chat"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-900 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <Bot className="w-4 h-4 text-neutral-700" />
              <span>Founders AI</span>
            </Link>

            <Link
              href="/actions"
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Actions Hub</span>
            </Link>
          </div>
        </div>

        {/* Operational Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Companies Managed</div>
            <div className="text-3xl font-black text-neutral-900">{companiesList.length}</div>
            <div className="text-[11px] text-neutral-500">Active portfolio entities</div>
          </div>

          <div className={`p-5 ${criticalItems.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-neutral-200'} border rounded-2xl shadow-xs space-y-1`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Urgent Actions</div>
            <div className="text-3xl font-black text-amber-700">{criticalItems.length}</div>
            <div className="text-[11px] text-amber-800">{criticalItems.length > 0 ? criticalItems[0].title : 'No urgent items'}</div>
          </div>

          <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-2xl shadow-xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">Upcoming Deadlines</div>
            <div className="text-3xl font-black text-neutral-800">{upcomingItems.length}</div>
            <div className="text-[11px] text-neutral-500">Scheduled next 30-60 days</div>
          </div>

          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">Action Required</div>
            <div className="text-3xl font-black text-emerald-700">{actionRequiredItems.length}</div>
            <div className="text-[11px] text-emerald-800">{actionRequiredItems.length > 0 ? 'Pending review' : 'All clear'}</div>
          </div>
        </div>

        {/* COMPANY PORTFOLIO MATRIX */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              {companiesList.length > 0 ? `Client Portfolio Overview (${companiesList.length} Entities)` : 'Client Portfolio Overview'}
            </h2>
            <Link href="/companies" className="text-xs font-bold text-neutral-900 hover:underline">
              View All Companies &rarr;
            </Link>
          </div>

          {companiesList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {companiesList.map((c) => (
                <div key={c.id} className="p-4 bg-neutral-50 border border-neutral-200 hover:border-neutral-400 rounded-xl transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-neutral-900 truncate">{c.name}</div>
                    <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {c.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono">{c.cin}</div>
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60 text-xs">
                    <span className="text-[11px] text-neutral-600 truncate">{c.next_action || 'No pending actions'}</span>
                    <Link href={`/filings/new?company=${encodeURIComponent(c.cin)}`} className="text-[11px] font-bold text-neutral-900 hover:underline">
                      Prepare &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto border border-neutral-200">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-neutral-900">No companies yet</h4>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Add a company manually or use Founders AI to incorporate a new entity through MCA.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link
                  href="/companies"
                  className="px-4 py-2 text-xs font-bold bg-neutral-900 text-white rounded-lg hover:bg-black transition-all"
                >
                  Add Company
                </Link>
                <Link
                  href="/chat?query=I+want+to+start+a+company"
                  className="px-4 py-2 text-xs font-bold bg-white text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all"
                >
                  Start with AI
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* COMPLIANCE DEADLINES */}
        {deadlines.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Compliance Deadlines ({deadlines.length})
              </h2>
              <Link href="/compliance" className="text-xs font-bold text-neutral-900 hover:underline">
                View All &rarr;
              </Link>
            </div>
            <div className="space-y-2">
              {filteredDeadlines.slice(0, 5).map((d) => (
                <div key={d.id} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-neutral-900">{d.title}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{d.form_code} • Due: {d.due_date}</div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    d.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                    d.urgency === 'action_required' ? 'bg-amber-100 text-amber-700' :
                    'bg-neutral-100 text-neutral-600'
                  }`}>
                    {d.urgency?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DIRECT E-FORMS CATALOGUE */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                Direct e-Forms & Statutory Workflows
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Launch statutory workflows directly into the MCP preparation layer.
              </p>
            </div>
            <Link
              href="/filings/new"
              className="text-xs font-bold text-neutral-900 hover:underline flex items-center space-x-1"
            >
              <span>View All 42 MCA Forms &rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {standardFormsCatalogue.map((form) => (
              <Link
                key={form.code}
                href={`/filings/new?form=${form.code}`}
                className="p-3.5 bg-white border border-neutral-200 hover:border-neutral-900 rounded-xl transition-all shadow-xs group block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-neutral-900 group-hover:text-black">
                    {form.code}
                  </span>
                  <span className="text-[9px] text-neutral-400 font-mono">{form.section}</span>
                </div>
                <div className="text-xs font-semibold text-neutral-800 mt-1 truncate">
                  {form.name}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  {form.cat}
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
