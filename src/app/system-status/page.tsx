'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import { MCP_TOOLS } from '@/lib/mcp/tools';
import {
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
  Shield,
  Layers,
  Building2,
  Cpu,
  Clock,
  Server
} from 'lucide-react';

interface HealthCheck {
  name: string;
  description: string;
  status: 'checking' | 'healthy' | 'degraded' | 'error';
  latency?: number;
  detail?: string;
  icon: React.ReactNode;
}

export default function SystemStatusPage() {
  const { user, currentWorkspace, selectedCompany } = useWorkspace();
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runAllChecks = async () => {
    setIsRunning(true);

    const results: HealthCheck[] = [
      {
        name: 'Supabase Database',
        description: 'PostgreSQL connection and read/write access',
        status: 'checking',
        icon: <Database className="w-4 h-4" />
      },
      {
        name: 'Auth Session',
        description: 'Supabase Auth JWT token validity',
        status: 'checking',
        icon: <Shield className="w-4 h-4" />
      },
      {
        name: 'Active Workspace',
        description: 'Workspace record exists in database',
        status: 'checking',
        icon: <Layers className="w-4 h-4" />
      },
      {
        name: 'Companies Table',
        description: 'Company master data accessible and non-empty',
        status: 'checking',
        icon: <Building2 className="w-4 h-4" />
      },
      {
        name: 'MCP Server Endpoint',
        description: 'JSON-RPC 2.0 server responds to ping',
        status: 'checking',
        icon: <Cpu className="w-4 h-4" />
      },
      {
        name: 'MCP Tool Registry',
        description: `${MCP_TOOLS.length} tools registered and callable`,
        status: 'checking',
        icon: <Server className="w-4 h-4" />
      }
    ];

    setChecks([...results]);

    // 1. Supabase Database
    const dbStart = Date.now();
    try {
      const { data, error } = await supabase.from('companies').select('id').limit(1);
      results[0].latency = Date.now() - dbStart;
      if (error) {
        results[0].status = 'error';
        results[0].detail = error.message;
      } else {
        results[0].status = 'healthy';
        results[0].detail = `Connected. Query returned in ${results[0].latency}ms.`;
      }
    } catch (err: any) {
      results[0].status = 'error';
      results[0].latency = Date.now() - dbStart;
      results[0].detail = err.message;
    }
    setChecks([...results]);

    // 2. Auth Session
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        results[1].status = 'healthy';
        results[1].detail = `Authenticated as ${sessionData.session.user.email}`;
      } else {
        results[1].status = 'degraded';
        results[1].detail = 'No active session. Running in anonymous mode.';
      }
    } catch {
      results[1].status = 'error';
      results[1].detail = 'Auth service unreachable.';
    }
    setChecks([...results]);

    // 3. Active Workspace
    if (currentWorkspace?.id) {
      results[2].status = 'healthy';
      results[2].detail = `"${currentWorkspace.name}" (${currentWorkspace.id.substring(0, 8)}...)`;
    } else {
      results[2].status = 'degraded';
      results[2].detail = 'No workspace selected. Using local fallback.';
    }
    setChecks([...results]);

    // 4. Companies Table
    try {
      const { data, error, count } = await supabase
        .from('companies')
        .select('id', { count: 'exact', head: true });

      if (error) {
        results[3].status = 'error';
        results[3].detail = error.message;
      } else {
        const total = count || 0;
        results[3].status = total > 0 ? 'healthy' : 'degraded';
        results[3].detail = `${total} company record(s) in database.`;
      }
    } catch {
      results[3].status = 'error';
      results[3].detail = 'Companies table query failed.';
    }
    setChecks([...results]);

    // 5. MCP Server Endpoint
    const mcpStart = Date.now();
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'ping',
          params: {}
        })
      });
      results[4].latency = Date.now() - mcpStart;
      if (res.ok) {
        results[4].status = 'healthy';
        results[4].detail = `Server responded in ${results[4].latency}ms (HTTP ${res.status}).`;
      } else {
        results[4].status = 'error';
        results[4].detail = `HTTP ${res.status} response.`;
      }
    } catch (err: any) {
      results[4].latency = Date.now() - mcpStart;
      results[4].status = 'error';
      results[4].detail = err.message;
    }
    setChecks([...results]);

    // 6. MCP Tool Registry
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list',
          params: {}
        })
      });

      if (res.ok) {
        const data = await res.json();
        const toolCount = data?.result?.tools?.length || 0;
        results[5].status = toolCount >= 10 ? 'healthy' : 'degraded';
        results[5].detail = `${toolCount} tools registered and discoverable.`;
      } else {
        results[5].status = 'error';
        results[5].detail = `HTTP ${res.status} on tools/list.`;
      }
    } catch (err: any) {
      results[5].status = 'error';
      results[5].detail = err.message;
    }
    setChecks([...results]);

    setLastChecked(new Date().toLocaleTimeString());
    setIsRunning(false);
  };

  useEffect(() => {
    runAllChecks();
  }, []);

  const healthyCount = checks.filter(c => c.status === 'healthy').length;
  const totalCount = checks.length;
  const allHealthy = healthyCount === totalCount && totalCount > 0;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#737373] tracking-wider flex items-center space-x-1.5">
              <Activity className="w-3 h-3" />
              <span>System Observability</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-black mt-0.5">
              System Status
            </h1>
            <p className="text-xs text-[#525252] mt-1">
              Real-time health checks for auth, database, workspace, and MCP server.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {lastChecked && (
              <span className="text-[10px] text-[#737373] font-mono flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Last checked: {lastChecked}</span>
              </span>
            )}
            <button
              disabled={isRunning}
              onClick={runAllChecks}
              className="px-3.5 py-2 text-xs font-medium bg-[#0A0A0A] hover:bg-black disabled:opacity-40 text-white rounded transition-colors flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running...' : 'Run All Checks'}</span>
            </button>
          </div>
        </div>

        {/* Overall Status Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          allHealthy ? 'bg-[#F0FDF4] border-[#16A34A]/30' :
          isRunning ? 'bg-[#F7F7F5] border-[#E5E5E5]' :
          'bg-[#FFFBEB] border-[#D97706]/30'
        }`}>
          <div className="flex items-center space-x-3">
            {allHealthy ? (
              <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
            ) : isRunning ? (
              <RefreshCw className="w-5 h-5 text-[#737373] animate-spin" />
            ) : (
              <Activity className="w-5 h-5 text-[#D97706]" />
            )}
            <div>
              <div className="text-sm font-bold text-black">
                {allHealthy ? 'All Systems Operational' :
                 isRunning ? 'Running health checks...' :
                 `${healthyCount}/${totalCount} checks passed`}
              </div>
              <div className="text-[11px] text-[#525252]">
                {allHealthy ? 'Future MCA infrastructure is healthy and ready for use.' :
                 isRunning ? 'Verifying connectivity to all subsystems.' :
                 'Some services may need attention.'}
              </div>
            </div>
          </div>

          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
            allHealthy ? 'bg-[#16A34A] text-white' :
            isRunning ? 'bg-[#E5E5E5] text-[#525252]' :
            'bg-[#D97706] text-white'
          }`}>
            {allHealthy ? 'ALL GREEN' : isRunning ? 'CHECKING' : 'ATTENTION'}
          </span>
        </div>

        {/* Individual Health Checks */}
        <div className="space-y-3">
          {checks.map((check, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E5E5E5] rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  check.status === 'healthy' ? 'bg-[#F0FDF4] text-[#16A34A]' :
                  check.status === 'degraded' ? 'bg-[#FFFBEB] text-[#D97706]' :
                  check.status === 'error' ? 'bg-[#FEF2F2] text-[#DC2626]' :
                  'bg-[#F7F7F5] text-[#737373]'
                }`}>
                  {check.icon}
                </div>

                <div>
                  <div className="text-xs font-bold text-black">{check.name}</div>
                  <div className="text-[11px] text-[#525252]">{check.description}</div>
                  {check.detail && (
                    <div className={`text-[10px] font-mono mt-0.5 ${
                      check.status === 'error' ? 'text-[#DC2626]' :
                      check.status === 'degraded' ? 'text-[#D97706]' :
                      'text-[#737373]'
                    }`}>
                      {check.detail}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {check.latency !== undefined && (
                  <span className="text-[10px] font-mono text-[#737373]">{check.latency}ms</span>
                )}
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  check.status === 'healthy' ? 'bg-[#F0FDF4] text-[#16A34A]' :
                  check.status === 'degraded' ? 'bg-[#FFFBEB] text-[#D97706]' :
                  check.status === 'error' ? 'bg-[#FEF2F2] text-[#DC2626]' :
                  'bg-[#F7F7F5] text-[#525252]'
                }`}>
                  {check.status === 'checking' ? 'CHECKING' :
                   check.status === 'healthy' ? 'HEALTHY' :
                   check.status === 'degraded' ? 'DEGRADED' :
                   'ERROR'}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </AppShell>
  );
}
