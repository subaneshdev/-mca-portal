'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWorkspace } from '@/context/WorkspaceContext';
import { ActionService } from '@/lib/services/actionService';
import { McpAction } from '@/types/actions';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Key, 
  ArrowRight, 
  ExternalLink,
  Bot,
  Filter,
  RefreshCw,
  Search,
  Building2,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export default function ActionsHubPage() {
  const { selectedCompany, currentWorkspace, role } = useWorkspace();
  const [actions, setActions] = useState<McpAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadActions = async () => {
    setLoading(true);
    try {
      const data = await ActionService.listActions();
      setActions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, [currentWorkspace?.id, selectedCompany?.id]);


  const filteredActions = actions.filter(act => {
    if (filterStatus !== 'ALL' && act.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSummary = act.preview?.action_summary?.toLowerCase().includes(q);
      const matchForm = act.preview?.form_code?.toLowerCase().includes(q);
      const matchId = act.id.toLowerCase().includes(q);
      const matchCompany = act.company_name?.toLowerCase().includes(q);
      return matchSummary || matchForm || matchId || matchCompany;
    }
    return true;
  });

  const pendingConfirmationCount = actions.filter(a => a.status === 'AWAITING_USER_CONFIRMATION').length;
  const authRequiredCount = actions.filter(a => a.status === 'AUTHORIZATION_REQUIRED').length;
  const readyToExecuteCount = actions.filter(a => a.status === 'AUTHORIZED' || a.status === 'CONFIRMED').length;
  const submittedCount = actions.filter(a => a.status === 'SUBMITTED').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AWAITING_USER_CONFIRMATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Awaiting Confirmation
          </span>
        );
      case 'AUTHORIZATION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 animate-pulse">
            <Key className="w-3.5 h-3.5 text-purple-600" />
            Signature Required
          </span>
        );
      case 'AUTHORIZED':
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Ready for Execution
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Executed (SRN Active)
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
                  MCP Actions & Approvals
                </h1>
                <p className="text-xs text-[#64748B]">
                  Autonomous Agent Post-Action Protocol • Human-in-the-Loop Security Architecture
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadActions}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#334155] bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/connect-ai"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
            >
              <Bot className="w-4 h-4" />
              Connect AI Agent
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-6">
        
        {/* Core Principles Banner */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-[#334155] relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold tracking-wide uppercase border border-blue-400/30">
                <Sparkles className="w-3 h-3" />
                Zero Silent Execution Principle
              </div>
              <h2 className="text-base sm:text-lg font-bold">
                Ask AI to securely get things done for your company.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                External agents (Claude, Cursor, ChatGPT) can read company context and prepare filings, but every consequential action requires your explicit confirmation and secure browser-isolated Digital Signature Certificate (DSC) authorization.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-300">
              <span className="px-2.5 py-1 bg-slate-800/80 rounded-lg border border-slate-700">1. Read Context</span>
              <span className="text-slate-500">→</span>
              <span className="px-2.5 py-1 bg-slate-800/80 rounded-lg border border-slate-700">2. Prepare Draft</span>
              <span className="text-slate-500">→</span>
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/40">3. User Confirm</span>
              <span className="text-slate-500">→</span>
              <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/40">4. DSC Sign</span>
              <span className="text-slate-500">→</span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/40">5. Execute</span>
            </div>
          </div>
        </div>

        {/* Action Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => setFilterStatus('AWAITING_USER_CONFIRMATION')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === 'AWAITING_USER_CONFIRMATION' 
                ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/40' 
                : 'bg-white border-[#E2E8F0] hover:border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Awaiting Confirmation</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-[#0F172A]">{pendingConfirmationCount}</div>
            <p className="text-[11px] text-[#64748B] mt-1">Prepared by AI agent</p>
          </div>

          <div 
            onClick={() => setFilterStatus('AUTHORIZATION_REQUIRED')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === 'AUTHORIZATION_REQUIRED' 
                ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/40' 
                : 'bg-white border-[#E2E8F0] hover:border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between text-purple-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Signature Required</span>
              <Key className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-[#0F172A]">{authRequiredCount}</div>
            <p className="text-[11px] text-[#64748B] mt-1">Pending DSC signing</p>
          </div>

          <div 
            onClick={() => setFilterStatus('AUTHORIZED')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === 'AUTHORIZED' 
                ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/40' 
                : 'bg-white border-[#E2E8F0] hover:border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between text-blue-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Ready for Execution</span>
              <ShieldCheck className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-[#0F172A]">{readyToExecuteCount}</div>
            <p className="text-[11px] text-[#64748B] mt-1">Authorized & approved</p>
          </div>

          <div 
            onClick={() => setFilterStatus('SUBMITTED')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterStatus === 'SUBMITTED' 
                ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/40' 
                : 'bg-white border-[#E2E8F0] hover:border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Executed & Logged</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-[#0F172A]">{submittedCount}</div>
            <p className="text-[11px] text-[#64748B] mt-1">With active SRN reference</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actions by form, summary, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['ALL', 'AWAITING_USER_CONFIRMATION', 'AUTHORIZATION_REQUIRED', 'AUTHORIZED', 'SUBMITTED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === st 
                    ? 'bg-[#0F172A] text-white shadow-sm' 
                    : 'text-[#64748B] hover:bg-[#F1F5F9]'
                }`}
              >
                {st === 'ALL' ? 'All Actions' : st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Actions List */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A]">Action Registry Queue</h3>
            <span className="text-xs text-[#64748B] font-mono">{filteredActions.length} actions</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#64748B] text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
              Loading action state machine...
            </div>
          ) : filteredActions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#0F172A]">No Actions Found</h4>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                No MCP actions match the current filter. Ask your AI Assistant or connect Claude/Cursor to prepare a statutory corporate action.
              </p>
              <div className="pt-2">
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Try Action Lifecycle Demo
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {filteredActions.map((action) => (
                <div key={action.id} className="p-5 sm:p-6 hover:bg-[#F8FAFC] transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-blue-100 text-blue-800">
                          {action.preview?.form_code || action.action_type}
                        </span>
                        {getStatusBadge(action.status)}
                        <span className="text-xs font-mono text-[#64748B]">ID: {action.id}</span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-[#0F172A]">
                        {action.preview?.action_summary || 'Corporate Action Draft'}
                      </h4>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#64748B]">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                          {action.company_name || 'Authorized Entity'}
                        </span>
                        {action.preview?.deadline && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                            Deadline: {action.preview.deadline}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Bot className="w-3.5 h-3.5 text-blue-600" />
                          Prepared via {action.client_metadata?.client_name || 'AI Copilot'}
                        </span>
                      </div>

                      {action.external_reference && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-mono font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          SRN Reference: {action.external_reference}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/actions/${action.id}`}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          action.status === 'AUTHORIZATION_REQUIRED'
                            ? 'bg-purple-600 text-white hover:bg-purple-700 ring-2 ring-purple-400/30'
                            : action.status === 'AWAITING_USER_CONFIRMATION'
                            ? 'bg-amber-600 text-white hover:bg-amber-700'
                            : 'bg-white text-[#0F172A] border border-[#CBD5E1] hover:bg-[#F1F5F9]'
                        }`}
                      >
                        <span>
                          {action.status === 'AUTHORIZATION_REQUIRED' 
                            ? 'Review & Sign (DSC)' 
                            : action.status === 'AWAITING_USER_CONFIRMATION'
                            ? 'Review & Confirm'
                            : 'View Action Details'}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
