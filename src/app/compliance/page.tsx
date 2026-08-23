'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace } from '@/context/WorkspaceContext';
import { ComplianceService } from '@/lib/services/complianceService';
import { ComplianceDeadline } from '@/types';
import { 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Filter, 
  Search, 
  ChevronRight,
  Info,
  Check
} from 'lucide-react';

function ComplianceContent() {
  const { openAiWithQuery, selectedCompany } = useWorkspace();
  const searchParams = useSearchParams();
  const focusId = searchParams.get('focus');

  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'action_required' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await ComplianceService.listCompliance({ companyId: selectedCompany?.id });
    setDeadlines(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedCompany?.id]);

  const handleMarkCompleted = async (item: ComplianceDeadline) => {
    await ComplianceService.updateComplianceStatus(item.id, 'FILED', 'completed');
    setActionSuccess(`Form ${item.form_code} marked as completed!`);
    await loadData();
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const filtered = deadlines.filter(d => {
    if (filter !== 'all') {
      if (filter === 'completed') {
        if (d.status !== 'FILED' && d.urgency !== 'completed') return false;
      } else if (d.urgency !== filter) {
        return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.form_code.toLowerCase().includes(q) ||
        (d.company_name && d.company_name.toLowerCase().includes(q)) ||
        d.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = deadlines.filter(d => d.urgency === 'critical').length;
  const actionCount = deadlines.filter(d => d.urgency === 'action_required').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Compliance Centre</h1>
          <p className="text-xs text-[#525252] mt-1">
            Statutory obligations and penalty projections for <strong className="text-black">{selectedCompany?.name}</strong> under Companies Act 2013.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => openAiWithQuery(`What statutory compliance is due this month for ${selectedCompany?.name}?`)}
            className="px-3.5 py-2 text-xs font-medium bg-[#F7F7F5] hover:bg-[#EFF6FF] text-[#0A0A0A] border border-[#E5E5E5] hover:border-[#2563EB] rounded transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Ask AI Compliance Check</span>
          </button>
          <Link
            href="/filings/new"
            className="px-3.5 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded transition-colors"
          >
            Start New Filing
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-[#F0FDF4] border border-[#16A34A]/30 text-[#16A34A] text-xs font-medium rounded-lg flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E5E5E5] rounded-xl p-3">
        <div className="flex items-center space-x-1 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Obligations' },
            { id: 'critical', label: 'Critical', badge: criticalCount > 0 ? `${criticalCount}` : undefined },
            { id: 'action_required', label: 'Action Required', badge: actionCount > 0 ? `${actionCount}` : undefined },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-black text-white'
                  : 'text-[#525252] hover:bg-[#F7F7F5] hover:text-black'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                  filter === tab.id ? 'bg-white text-black' : 'bg-[#DC2626] text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by form or keyword..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F7F5] border border-[#E5E5E5] rounded outline-none focus:border-[#2563EB] text-[#0A0A0A]"
          />
        </div>
      </div>

      {/* Compliance List */}
      <div className="space-y-3">
        {filtered.map(item => {
          const isHighlighted = focusId === item.id;
          const isCompleted = item.status === 'FILED' || item.urgency === 'completed';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-lg p-5 border transition-all ${
                isHighlighted ? 'border-[#2563EB] shadow-md ring-1 ring-[#2563EB]' : 'border-[#E5E5E5] hover:border-[#2563EB]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                      isCompleted ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20' :
                      item.urgency === 'critical' ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20' :
                      item.urgency === 'action_required' ? 'bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20' :
                      'bg-[#F7F7F5] text-[#525252] border border-[#E5E5E5]'
                    }`}>
                      {isCompleted ? 'COMPLETED' : item.urgency.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono font-bold text-black">{item.form_code}</span>
                    <span className="text-xs text-[#737373]">•</span>
                    <span className="text-xs font-mono text-[#737373]">{item.company_name}</span>
                  </div>

                  <h2 className="text-base font-bold text-black">{item.title}</h2>
                  <p className="text-xs text-[#525252] max-w-2xl">{item.description}</p>
                  
                  {item.section && (
                    <div className="text-[11px] text-[#737373] font-mono flex items-center space-x-1 pt-1">
                      <Info className="w-3 h-3 text-[#2563EB]" />
                      <span>Statutory Reference: {item.section}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0">
                  <div className="sm:text-right">
                    <div className="text-xs font-bold text-black">Due Date: {item.due_date}</div>
                    <div className="text-[11px] text-[#DC2626] font-medium">
                      {isCompleted ? 'Statutory requirement met' : item.penalty_per_day > 0 ? `Late penalty: ₹${item.penalty_per_day}/day` : 'No additional penalty'}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isCompleted ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleMarkCompleted(item)}
                          className="px-2.5 py-1.5 text-xs text-[#525252] hover:text-[#16A34A] bg-[#F7F7F5] hover:bg-[#F0FDF4] border border-[#E5E5E5] rounded transition-colors flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark Filed</span>
                        </button>

                        <Link
                          href={`/filings/new?form=${item.form_code}`}
                          className="px-3.5 py-1.5 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded transition-colors flex items-center space-x-1"
                        >
                          <span>Start Preparation</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </>
                    ) : (
                      <span className="text-xs text-[#16A34A] font-medium flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Filed with RoC</span>
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white border border-[#E5E5E5] rounded-lg">
            <p className="text-xs text-[#525252]">No compliance items found matching your filter.</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default function CompliancePage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-xs text-[#525252]">Loading compliance centre...</div>}>
        <ComplianceContent />
      </Suspense>
    </AppShell>
  );
}
