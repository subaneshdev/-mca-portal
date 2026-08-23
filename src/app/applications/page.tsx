'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace } from '@/context/WorkspaceContext';
import { FilingService } from '@/lib/services/filingService';
import { Application } from '@/types';
import { 
  GitPullRequest, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  Search, 
  Filter, 
  FileText, 
  ChevronRight,
  Info,
  FastForward,
  RefreshCw
} from 'lucide-react';

export default function ApplicationsPage() {
  const { openAiWithQuery, selectedCompany } = useWorkspace();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<'all' | 'UNDER_REVIEW' | 'RESUBMISSION_REQUIRED' | 'APPROVED'>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [advanceSuccess, setAdvanceSuccess] = useState<string | null>(null);

  const loadApplications = async () => {
    setLoading(true);
    const data = await FilingService.listApplications(selectedCompany?.id);
    setApplications(data);
    if (data.length > 0) {
      // Preserve selection if still exists, else pick first
      const preserved = selectedApp ? data.find(a => a.id === selectedApp.id) : null;
      setSelectedApp(preserved || data[0]);
    } else {
      setSelectedApp(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadApplications();
  }, [selectedCompany?.id]);

  const handleAdvanceStatus = async () => {
    if (!selectedApp || advancing) return;
    setAdvancing(true);
    setAdvanceSuccess(null);

    try {
      const updated = await FilingService.advanceApplicationStatus(selectedApp.id);
      if (updated) {
        setAdvanceSuccess(`${selectedApp.application_no} advanced to ${updated.status}`);
        await loadApplications();
      }
    } catch (err) {
      console.error('Advance failed:', err);
    } finally {
      setAdvancing(false);
      setTimeout(() => setAdvanceSuccess(null), 4000);
    }
  };

  const filtered = applications.filter(app => {
    if (filter !== 'all' && app.status !== filter) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-black">Applications & Journeys</h1>
            <p className="text-xs text-[#525252] mt-1">
              Real-time Service Request Number (SRN) tracking, RoC officer scrutiny, and resubmission windows for <strong className="text-black">{selectedCompany?.name || 'All Workspace Entities'}</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => openAiWithQuery('What is the status of my ongoing MCA applications?')}
              className="px-3.5 py-2 text-xs font-medium bg-[#F7F7F5] hover:bg-[#EFF6FF] text-[#0A0A0A] border border-[#E5E5E5] hover:border-[#2563EB] rounded transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Ask AI Status Check</span>
            </button>
            <Link
              href="/filings/new"
              className="px-3.5 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded transition-colors"
            >
              New Filing
            </Link>
          </div>
        </div>

        {/* Success banner */}
        {advanceSuccess && (
          <div className="p-3 bg-[#F0FDF4] border border-[#16A34A]/30 text-[#16A34A] text-xs font-medium rounded-lg flex items-center space-x-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{advanceSuccess}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 bg-white border border-[#E5E5E5] rounded-xl p-2 text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All Applications' },
            { id: 'UNDER_REVIEW', label: 'Under Review' },
            { id: 'RESUBMISSION_REQUIRED', label: 'Action Needed / Resubmission' },
            { id: 'APPROVED', label: 'Approved' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-black text-white'
                  : 'text-[#525252] hover:bg-[#F7F7F5] hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dual Layout: Application Roster on Left, Selected Journey on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Applications List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {filtered.length === 0 && !loading && (
              <div className="text-center py-12 bg-white border border-[#E5E5E5] rounded-xl">
                <p className="text-xs text-[#525252]">No applications found. Submit a filing to create one.</p>
                <Link href="/filings/new" className="text-xs text-[#2563EB] hover:underline mt-2 inline-block">
                  Start a New Filing →
                </Link>
              </div>
            )}

            {filtered.map(app => {
              const isSelected = selectedApp?.id === app.id;

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`bg-white rounded-xl p-4 border transition-all cursor-pointer ${
                    isSelected ? 'border-[#2563EB] ring-1 ring-[#2563EB] shadow-sm' : 'border-[#E5E5E5] hover:border-[#737373]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#737373]">{app.application_no}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        app.status === 'UNDER_REVIEW' ? 'bg-[#EFF6FF] text-[#2563EB]' :
                        app.status === 'RESUBMISSION_REQUIRED' ? 'bg-[#FFFBEB] text-[#D97706]' :
                        app.status === 'APPROVED' ? 'bg-[#F0FDF4] text-[#16A34A]' :
                        'bg-[#F7F7F5] text-[#525252]'
                      }`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-black">{app.title}</h3>
                    
                    {app.company_name && (
                      <div className="text-[11px] text-[#737373]">{app.company_name}</div>
                    )}

                    {/* Progress Bar */}
                    <div className="flex items-center space-x-1 pt-1">
                      {Array.from({ length: app.total_steps }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${
                            i < app.current_step ? 'bg-[#2563EB]' : 'bg-[#E5E5E5]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Application Journey Timeline (7 cols) */}
          {selectedApp && (
            <div className="lg:col-span-7 bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-6">
              
              <div className="border-b border-[#E5E5E5] pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#737373]">SRN: {selectedApp.application_no}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    selectedApp.status === 'APPROVED' ? 'bg-[#F0FDF4] text-[#16A34A]' :
                    selectedApp.status === 'UNDER_REVIEW' ? 'bg-[#EFF6FF] text-[#2563EB]' : 
                    'bg-[#FFFBEB] text-[#D97706]'
                  }`}>
                    {selectedApp.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-black">{selectedApp.title}</h2>
                <p className="text-xs text-[#525252] bg-[#F7F7F5] p-3 rounded border border-[#E5E5E5]">
                  <strong className="text-black">Officer Remarks:</strong> {selectedApp.remarks}
                </p>
              </div>

              {/* Step-by-Step Journey Timeline */}
              <div className="space-y-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                  Journey Progress Timeline
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E5E5]">
                  {selectedApp.events?.map((event, idx) => {
                    const isDone = event.status === 'COMPLETED';
                    const isCurrent = event.status === 'CURRENT';
                    const isAlert = event.status === 'ALERT';

                    return (
                      <div key={event.id} className="relative space-y-1">
                        
                        {/* Status Dot */}
                        <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                          isDone ? 'bg-[#16A34A] text-white' :
                          isCurrent ? 'bg-[#2563EB] text-white ring-4 ring-[#EFF6FF]' :
                          isAlert ? 'bg-[#DC2626] text-white ring-4 ring-[#FEF2F2]' :
                          'bg-white border-2 border-[#E5E5E5] text-[#737373]'
                        }`}>
                          {isDone ? '✓' : idx + 1}
                        </div>

                        <div>
                          <div className="text-xs font-bold text-black flex items-center space-x-2">
                            <span>{event.step_name}</span>
                            {event.completed_at && (
                              <span className="text-[10px] font-mono text-[#737373] font-normal">
                                ({new Date(event.completed_at).toLocaleDateString()})
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-xs text-[#525252] mt-0.5">{event.description}</p>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Row: Simulate + AI */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F7F7F5] border border-[#E5E5E5] rounded-lg">
                <div>
                  <div className="text-xs font-semibold text-black">Test Application Lifecycle</div>
                  <div className="text-[11px] text-[#737373]">Advance to the next RoC scrutiny stage, or ask AI for help.</div>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedApp.status !== 'APPROVED' && (
                    <button
                      type="button"
                      disabled={advancing}
                      onClick={handleAdvanceStatus}
                      className="px-3.5 py-1.5 text-xs font-medium bg-[#0A0A0A] hover:bg-black disabled:opacity-40 text-white rounded transition-colors flex items-center space-x-1.5"
                    >
                      {advancing ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Advancing...</span>
                        </>
                      ) : (
                        <>
                          <FastForward className="w-3 h-3" />
                          <span>Simulate Next Status</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => openAiWithQuery(`Diagnose application ${selectedApp.application_no} (${selectedApp.title})`)}
                    className="px-3 py-1.5 text-xs font-medium bg-[#2563EB] text-white rounded hover:bg-[#1D4ED8] transition-colors shrink-0"
                  >
                    Ask AI
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </AppShell>
  );
}
