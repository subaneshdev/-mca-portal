'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace } from '@/context/WorkspaceContext';
import { ComplianceService } from '@/lib/services/complianceService';
import { FilingService } from '@/lib/services/filingService';
import { ComplianceDeadline, Application } from '@/types';
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
  Database
} from 'lucide-react';

export default function OverviewDashboard() {
  const { profile, user, role, selectedCompany, allCompanies, openAiWithQuery, loadDemoCompany, dbError } = useWorkspace();
  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!selectedCompany?.id) {
      setDeadlines([]);
      setApplications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [compData, appData] = await Promise.all([
        ComplianceService.listCompliance({ companyId: selectedCompany.id }),
        FilingService.listApplications(selectedCompany.id)
      ]);
      setDeadlines(compData);
      setApplications(appData);
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
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* DB Error Notification if any */}
        {dbError && (
          <div className="p-4 bg-[#FEF2F2] border border-[#DC2626]/30 rounded-xl text-xs text-[#DC2626] flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-bold">Database Connectivity Alert</div>
              <div className="text-[11px] mt-0.5">{dbError}</div>
            </div>
          </div>
        )}

        {/* Top Attention Header */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-[#737373] uppercase tracking-wider">
                {role === 'founder' ? 'Founder Command Centre' : 'Professional Practice Overview'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black mt-1">
                Good morning, {displayName}.
              </h1>
              <p className="text-xs sm:text-sm text-[#525252] mt-1">
                {selectedCompany ? (
                  <>
                    Active Entity: <strong className="text-black font-semibold">{selectedCompany.name}</strong> •{' '}
                    <span className="font-semibold text-black">{criticalItems.length + actionItems.length} actions</span> requiring attention.
                  </>
                ) : (
                  <>No company selected in your active workspace.</>
                )}
              </p>
            </div>

            {selectedCompany ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openAiWithQuery(`What compliance items need my attention for ${selectedCompany.name}?`)}
                  className="px-3.5 py-2 text-xs font-medium bg-[#F7F7F5] hover:bg-[#EFF6FF] text-[#0A0A0A] border border-[#E5E5E5] hover:border-[#2563EB] rounded transition-all flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Ask AI to Summarize</span>
                </button>
                <Link
                  href="/filings/new"
                  className="px-3.5 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded transition-colors flex items-center space-x-1.5"
                >
                  <span>Report Company Change</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loadDemoCompany('ziggers')}
                  className="px-3.5 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded transition-colors flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Seed Ziggers Demo Company</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* If no company exists in workspace, show onboarding seeding card */}
        {!selectedCompany && !loading && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 text-center space-y-4 max-w-xl mx-auto my-8">
            <Building2 className="w-10 h-10 text-[#2563EB] mx-auto" />
            <div className="space-y-1">
              <h2 className="text-base font-bold text-black">No Companies in Workspace</h2>
              <p className="text-xs text-[#525252]">
                Your workspace is ready. Seed a realistic test company into Supabase or create a custom company to begin managing filings.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => loadDemoCompany('ziggers')}
                className="px-4 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded transition-colors"
              >
                Seed Ziggers (Private Ltd)
              </button>
              <Link
                href="/onboarding"
                className="px-4 py-2 text-xs font-medium bg-[#F7F7F5] hover:bg-[#EFF6FF] text-[#0A0A0A] border border-[#E5E5E5] rounded transition-colors"
              >
                Run Onboarding Wizard
              </Link>
            </div>
          </div>
        )}

        {/* What Needs Attention? Section */}
        {selectedCompany && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#737373]">
                What needs your attention?
              </h2>
              <div className="flex items-center space-x-3 text-xs text-[#525252]">
                <span className="font-mono">Sorted by statutory urgency</span>
                <button onClick={loadData} className="hover:text-black flex items-center space-x-1">
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              
              {/* CRITICAL BLOCK */}
              {criticalItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white border-l-4 border-l-[#DC2626] border-y border-r border-[#E5E5E5] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20 uppercase">
                        Critical
                      </span>
                      <span className="text-xs font-mono font-medium text-[#737373]">{item.company_name}</span>
                    </div>
                    <h3 className="text-sm font-bold text-black flex items-center space-x-2">
                      <span>{item.title}</span>
                      <span className="text-xs font-mono font-normal text-[#525252]">({item.form_code})</span>
                    </h3>
                    <p className="text-xs text-[#525252] max-w-2xl">{item.description}</p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-semibold text-[#DC2626]">Due Date: {item.due_date}</div>
                      <div className="text-[10px] text-[#737373] font-mono">Penalty: ₹{item.penalty_per_day}/day</div>
                    </div>
                    <Link
                      href={`/filings/new?form=${item.form_code}`}
                      className="px-4 py-2 text-xs font-medium bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded transition-colors flex items-center space-x-1"
                    >
                      <span>Start Preparation</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}

              {/* ACTION REQUIRED BLOCK */}
              {actionItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white border-l-4 border-l-[#D97706] border-y border-r border-[#E5E5E5] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20 uppercase">
                        Action Required
                      </span>
                      <span className="text-xs font-mono font-medium text-[#737373]">{item.company_name}</span>
                    </div>
                    <h3 className="text-sm font-bold text-black flex items-center space-x-2">
                      <span>{item.title}</span>
                      <span className="text-xs font-mono font-normal text-[#525252]">({item.form_code})</span>
                    </h3>
                    <p className="text-xs text-[#525252] max-w-2xl">{item.description}</p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-semibold text-[#D97706]">Due: {item.due_date}</div>
                      <div className="text-[10px] text-[#737373] font-mono">Late fee: ₹{item.penalty_per_day}/day</div>
                    </div>
                    <Link
                      href={`/filings/new?form=${item.form_code}`}
                      className="px-4 py-2 text-xs font-medium bg-[#0A0A0A] hover:bg-black text-white rounded transition-colors flex items-center space-x-1"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}

              {/* UPCOMING BLOCK */}
              {upcomingItems.slice(0, 2).map(item => (
                <div
                  key={item.id}
                  className="bg-white border-l-4 border-l-[#E5E5E5] border-y border-r border-[#E5E5E5] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-l-[#2563EB] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded bg-[#F7F7F5] text-[#525252] border border-[#E5E5E5] uppercase">
                        Upcoming
                      </span>
                      <span className="text-xs font-mono font-medium text-[#737373]">{item.company_name}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-black flex items-center space-x-2">
                      <span>{item.title}</span>
                      <span className="text-xs font-mono font-normal text-[#525252]">({item.form_code})</span>
                    </h3>
                    <p className="text-xs text-[#525252] max-w-2xl">{item.description}</p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-[#525252]">Due Date: {item.due_date}</div>
                      <div className="text-[10px] text-[#737373] font-mono">Routine Filing</div>
                    </div>
                    <Link
                      href={`/filings/new?form=${item.form_code}`}
                      className="px-3 py-1.5 text-xs font-medium bg-[#F7F7F5] hover:bg-[#EFF6FF] text-[#0A0A0A] border border-[#E5E5E5] hover:border-[#2563EB] rounded transition-colors"
                    >
                      Prepare
                    </Link>
                  </div>
                </div>
              ))}

              {deadlines.length === 0 && !loading && (
                <div className="p-8 text-center bg-white border border-[#E5E5E5] rounded-xl space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto" />
                  <h3 className="text-sm font-bold text-black">All statutory compliances are up to date!</h3>
                  <p className="text-xs text-[#525252]">No pending actions found for this company in your workspace.</p>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Dual Grid: Ongoing Application Journeys & Quick Diagnostic Launcher */}
        {selectedCompany && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Ongoing Applications */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                  Active Application Journeys ({applications.length})
                </h2>
                <Link href="/applications" className="text-xs text-[#2563EB] hover:underline flex items-center space-x-1">
                  <span>View all</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {applications.slice(0, 2).map(app => (
                  <div key={app.id} className="p-3.5 rounded bg-[#F7F7F5] border border-[#E5E5E5] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-black">{app.title}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                        app.status === 'APPROVED' ? 'bg-[#F0FDF4] text-[#16A34A]' :
                        app.status === 'UNDER_REVIEW' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#FFFBEB] text-[#D97706]'
                      }`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#525252]">
                      SRN: <span className="font-mono text-black font-medium">{app.application_no}</span>
                    </div>
                    <p className="text-[11px] text-[#737373] italic line-clamp-1">{app.remarks}</p>
                    
                    {/* Step Progress */}
                    <div className="flex items-center space-x-1 pt-1">
                      {Array.from({ length: app.total_steps || 4 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${
                            i < (app.current_step || 1) ? 'bg-[#2563EB]' : 'bg-[#E5E5E5]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {applications.length === 0 && !loading && (
                  <div className="p-4 text-center text-xs text-[#737373]">
                    No active RoC applications currently in progress.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Problem Diagnosis Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                    Something Went Wrong?
                  </h2>
                  <span className="text-[10px] font-mono text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded">
                    AI Diagnosis
                  </span>
                </div>
                <h3 className="text-sm font-bold text-black">
                  Translate MCA errors into instant recovery steps.
                </h3>
                <p className="text-xs text-[#525252] leading-relaxed">
                  Paste any error message, failed DSC verification, or CIN status alert. Our diagnostics engine checks known MCA V3 issues and provides resolution pathways.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/diagnostics"
                  className="w-full py-2.5 px-3 text-xs font-medium bg-[#0A0A0A] hover:bg-black text-white rounded transition-colors flex items-center justify-center space-x-2"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Start Guided Diagnosis</span>
                </Link>
              </div>
            </div>

          </div>
        )}

      </div>
    </AppShell>
  );
}
