'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace } from '@/context/WorkspaceContext';
import { CompanyService } from '@/lib/services/companyService';
import { FilingService } from '@/lib/services/filingService';
import { supabase } from '@/lib/supabase';
import { getAppMode } from '@/lib/appMode';
import {
  FlaskConical,
  User,
  Building2,
  Layers,
  RefreshCw,
  Trash2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Database,
  FileText,
  ChevronRight,
  ShieldCheck,
  Clock,
  Server
} from 'lucide-react';

export default function DeveloperSandboxPage() {
  const {
    user,
    profile,
    role,
    currentWorkspace,
    selectedCompany,
    allCompanies,
    setSelectedCompany,
    loadDemoCompany,
    refreshCompanies,
    dbError
  } = useWorkspace();

  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [dbLatency, setDbLatency] = useState<number | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<string>(new Date().toLocaleTimeString());
  const [lastSeedTime, setLastSeedTime] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<{ message: string; type: 'success' | 'info' | 'error'; ts: string }[]>([]);

  const appMode = getAppMode();

  const checkDb = async () => {
    const start = Date.now();
    try {
      const { data, error } = await supabase.from('companies').select('id').limit(1);
      setDbLatency(Date.now() - start);
      if (error) {
        setDbStatus('error');
      } else {
        setDbStatus('connected');
        setLastFetchTime(new Date().toLocaleTimeString());
      }
    } catch {
      setDbStatus('error');
      setDbLatency(Date.now() - start);
    }
  };

  useEffect(() => {
    checkDb();
  }, []);

  const addLog = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setActionLog(prev => [{ message, type, ts: new Date().toLocaleTimeString() }, ...prev].slice(0, 20));
  };

  const handleLoadPreset = async (preset: 'ziggers' | 'unfounded' | 'futurefoods') => {
    setLoading(true);
    try {
      const company = await loadDemoCompany(preset);
      const now = new Date().toLocaleTimeString();
      setLastSeedTime(now);
      setLastFetchTime(now);
      addLog(`Demo company "${company.name}" inserted into Supabase (ID: ${company.id}, CIN: ${company.cin}).`);
    } catch (err: any) {
      addLog(`Failed to seed demo company: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerFiling = async () => {
    if (!selectedCompany?.id) {
      addLog('Please select or seed a company first.', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await FilingService.createFilingApplication({
        company_id: selectedCompany.id,
        form_code: 'DIR-12',
        title: 'Test Filing: Director Change (DIR-12)',
        fee_paid: 600,
        remarks: 'Auto-generated test filing in Supabase.'
      });
      addLog(`Test filing created in Supabase: ${result.srn} for ${selectedCompany.name}`);
    } catch (err: any) {
      addLog(`Filing failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceAll = async () => {
    if (!selectedCompany?.id) {
      addLog('Please select or seed a company first.', 'error');
      return;
    }
    setLoading(true);
    try {
      const apps = await FilingService.listApplications(selectedCompany.id);
      const pending = apps.filter(a => a.status !== 'APPROVED');
      let count = 0;
      for (const app of pending.slice(0, 5)) {
        await FilingService.advanceApplicationStatus(app.id);
        count++;
      }
      addLog(`Advanced ${count} application(s) in Supabase to next status.`);
    } catch (err: any) {
      addLog(`Advance failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#737373] tracking-wider flex items-center space-x-1.5">
              <FlaskConical className="w-3 h-3" />
              <span>Developer Sandbox & Observability</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-black mt-0.5">
              Data Provenance & Testing
            </h1>
            <p className="text-xs text-[#525252] mt-1">
              Verify database provenance, inspect authenticated session IDs, and seed test companies directly into Supabase.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 font-semibold">
              Mode: {appMode.toUpperCase()}
            </span>
          </div>
        </div>

        {/* DATA PROVENANCE PANEL */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#737373] flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Data Provenance & Live State</span>
            </h2>
            <button
              onClick={() => {
                checkDb();
                refreshCompanies();
              }}
              className="text-xs text-[#2563EB] hover:underline flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Verify & Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            
            {/* Database Connection */}
            <div className="p-3 bg-[#F7F7F5] rounded-lg border border-[#E5E5E5] space-y-1">
              <div className="text-[10px] text-[#737373] uppercase tracking-wider font-mono">Database Connection</div>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${
                  dbStatus === 'connected' ? 'bg-[#16A34A]' : dbStatus === 'error' ? 'bg-[#DC2626]' : 'bg-[#D97706]'
                }`} />
                <span className="font-bold text-black">
                  {dbStatus === 'connected' ? 'PostgreSQL (Supabase Live)' : dbStatus === 'error' ? 'Disconnected' : 'Checking...'}
                </span>
              </div>
              {dbLatency !== null && (
                <div className="text-[10px] text-[#737373] font-mono">Ping: {dbLatency}ms latency</div>
              )}
            </div>

            {/* Authenticated User ID */}
            <div className="p-3 bg-[#F7F7F5] rounded-lg border border-[#E5E5E5] space-y-1">
              <div className="text-[10px] text-[#737373] uppercase tracking-wider font-mono">Authenticated User ID</div>
              <div className="font-mono text-black font-semibold truncate">{user?.id || 'Anonymous / Unauthenticated'}</div>
              <div className="text-[10px] text-[#737373] truncate">{user?.email || 'No session'}</div>
            </div>

            {/* Active Workspace ID */}
            <div className="p-3 bg-[#F7F7F5] rounded-lg border border-[#E5E5E5] space-y-1">
              <div className="text-[10px] text-[#737373] uppercase tracking-wider font-mono">Active Workspace ID</div>
              <div className="font-mono text-black font-semibold truncate">{currentWorkspace?.id || 'None Selected'}</div>
              <div className="text-[10px] text-[#737373] truncate">{currentWorkspace?.name || 'No workspace'}</div>
            </div>

            {/* Selected Company ID */}
            <div className="p-3 bg-[#F7F7F5] rounded-lg border border-[#E5E5E5] space-y-1">
              <div className="text-[10px] text-[#737373] uppercase tracking-wider font-mono">Selected Company ID</div>
              <div className="font-mono text-black font-semibold truncate">{selectedCompany?.id || 'None Selected'}</div>
              <div className="text-[10px] text-[#737373] truncate">{selectedCompany?.cin || 'No CIN'}</div>
            </div>

            {/* Last Successful Fetch */}
            <div className="p-3 bg-[#F7F7F5] rounded-lg border border-[#E5E5E5] space-y-1">
              <div className="text-[10px] text-[#737373] uppercase tracking-wider font-mono">Last Database Fetch</div>
              <div className="font-mono text-black font-semibold">{lastFetchTime}</div>
              <div className="text-[10px] text-[#16A34A] flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Fresh from DB</span>
              </div>
            </div>

            {/* Last Seed Timestamp */}
            <div className="p-3 bg-[#F7F7F5] rounded-lg border border-[#E5E5E5] space-y-1">
              <div className="text-[10px] text-[#737373] uppercase tracking-wider font-mono">Last Seed Timestamp</div>
              <div className="font-mono text-black font-semibold">{lastSeedTime || 'No seed in this session'}</div>
              <div className="text-[10px] text-[#737373]">Demo presets insert into Supabase</div>
            </div>

          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Demo Company Presets */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-sm font-bold text-black">Seed Realistic Companies into Supabase</h2>
            </div>
            <p className="text-[11px] text-[#525252]">
              Inserts complete company master record, directors, and statutory compliance deadlines into Supabase.
            </p>

            <div className="space-y-2">
              {(['ziggers', 'unfounded', 'futurefoods'] as const).map(preset => (
                <button
                  key={preset}
                  disabled={loading}
                  onClick={() => handleLoadPreset(preset)}
                  className="w-full text-left p-3 bg-[#F7F7F5] hover:bg-[#EFF6FF] border border-[#E5E5E5] hover:border-[#2563EB] rounded-lg transition-colors text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-black capitalize">
                      {preset === 'futurefoods' ? 'Future Foods Consumer Private Limited' : 
                       preset === 'unfounded' ? 'Unfounded Technologies Private Limited' : 
                       'Ziggers Private Limited'}
                    </span>
                    <span className="text-[10px] text-[#737373] block mt-0.5 font-mono">
                      {preset === 'ziggers' ? 'U72900KA2021PTC145892 (ROC Bangalore)' :
                       preset === 'unfounded' ? 'U72200DL2022PTC394812 (ROC Delhi)' :
                       'U15130MH2023PTC401298 (ROC Mumbai)'}
                    </span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-[#2563EB]" />
                </button>
              ))}
            </div>
          </div>

          {/* Test Event Triggers */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-sm font-bold text-black">Trigger Test Mutations in Supabase</h2>
            </div>
            <p className="text-[11px] text-[#525252]">
              Submit test filings and simulate lifecycle advancement for the active company.
            </p>

            <div className="space-y-2">
              <button
                disabled={loading || !selectedCompany}
                onClick={handleTriggerFiling}
                className="w-full text-left p-3 bg-[#F7F7F5] hover:bg-[#EFF6FF] disabled:opacity-50 border border-[#E5E5E5] hover:border-[#2563EB] rounded-lg transition-colors text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-black">Create Test Filing (DIR-12)</span>
                  <span className="text-[10px] text-[#737373] block mt-0.5">
                    Generates a new SRN and application record in Supabase
                  </span>
                </div>
                <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
              </button>

              <button
                disabled={loading || !selectedCompany}
                onClick={handleAdvanceAll}
                className="w-full text-left p-3 bg-[#F7F7F5] hover:bg-[#EFF6FF] disabled:opacity-50 border border-[#E5E5E5] hover:border-[#2563EB] rounded-lg transition-colors text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-black">Advance Application Status (RoC Scrutiny)</span>
                  <span className="text-[10px] text-[#737373] block mt-0.5">
                    Advances pending applications in Supabase to next stage
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#2563EB]" />
              </button>

              <button
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  await refreshCompanies();
                  checkDb();
                  addLog('Company list and state refreshed from Supabase.', 'info');
                  setLoading(false);
                }}
                className="w-full text-left p-3 bg-[#F7F7F5] hover:bg-[#EFF6FF] border border-[#E5E5E5] hover:border-[#2563EB] rounded-lg transition-colors text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-black">Refresh State from Supabase</span>
                  <span className="text-[10px] text-[#737373] block mt-0.5">
                    Re-executes queries against PostgreSQL
                  </span>
                </div>
                <RefreshCw className="w-3.5 h-3.5 text-[#2563EB]" />
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Companies Roster */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
              Accessible Companies in Database ({allCompanies.length})
            </h2>
            <span className="text-xs text-[#737373] font-mono">Row-level isolation</span>
          </div>

          {allCompanies.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#737373]">
              No companies currently stored in database for this workspace. Use the seed tools above to insert a demo company.
            </div>
          ) : (
            <div className="space-y-2">
              {allCompanies.map(c => (
                <div
                  key={c.id || c.cin}
                  onClick={() => setSelectedCompany(c)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    selectedCompany?.id === c.id || selectedCompany?.cin === c.cin
                      ? 'bg-[#EFF6FF] border-[#2563EB]'
                      : 'bg-[#F7F7F5] border-[#E5E5E5] hover:border-[#737373]'
                  }`}
                >
                  <div>
                    <span className="font-bold text-black">{c.name}</span>
                    <span className="text-[10px] text-[#737373] font-mono block mt-0.5">ID: {c.id} • CIN: {c.cin} • {c.roc_jurisdiction}</span>
                  </div>
                  {(selectedCompany?.id === c.id || selectedCompany?.cin === c.cin) && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2563EB] text-white font-bold">SELECTED</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log */}
        {actionLog.length > 0 && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#737373]">Sandbox Activity Log</h2>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {actionLog.map((entry, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs">
                  <span className="text-[10px] font-mono text-[#737373] shrink-0 pt-0.5">{entry.ts}</span>
                  {entry.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />}
                  {entry.type === 'info' && <Sparkles className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />}
                  {entry.type === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626] shrink-0 mt-0.5" />}
                  <span className={`${
                    entry.type === 'error' ? 'text-[#DC2626]' : 'text-[#0A0A0A]'
                  }`}>
                    {entry.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
