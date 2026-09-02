'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWorkspace } from '@/context/WorkspaceContext';
import { MCP_TOOLS } from '@/lib/mcp/tools';
import { 
  Cpu, 
  Sparkles, 
  Check, 
  Copy, 
  Terminal, 
  ShieldCheck, 
  Play, 
  ExternalLink, 
  Code,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCode2,
  Workflow,
  Lock,
  ArrowRight,
  UserCheck,
  Key,
  Clock,
  Send
} from 'lucide-react';

export default function ConnectAiPage() {
  const { selectedCompany, currentWorkspace, role } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'claude-desktop' | 'cursor' | 'sdk'>('claude-desktop');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Interactive Tester State
  const [selectedTool, setSelectedTool] = useState(MCP_TOOLS[0].name);
  const [toolArgs, setToolArgs] = useState('{\n  "query": "Ziggers"\n}');
  const [toolOutput, setToolOutput] = useState<string | null>(null);
  const [isRunningTool, setIsRunningTool] = useState(false);
  const [toolLatency, setToolLatency] = useState<number | null>(null);

  // Live Server Ping
  const [serverPing, setServerPing] = useState<{ status: 'online' | 'checking' | 'error'; latency: number | null }>({
    status: 'checking',
    latency: null
  });

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mca-portal-ten.vercel.app';
  const mcpUrl = `${origin}/api/mcp`;

  // Check live server ping on mount
  useEffect(() => {
    async function checkServer() {
      const start = Date.now();
      try {
        const res = await fetch('/api/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping', params: {} })
        });
        const latency = Date.now() - start;
        if (res.ok) {
          setServerPing({ status: 'online', latency });
        } else {
          setServerPing({ status: 'error', latency });
        }
      } catch {
        setServerPing({ status: 'error', latency: null });
      }
    }
    checkServer();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Configurations
  const claudeDesktopConfigJson = JSON.stringify({
    mcpServers: {
      "future-mca": {
        url: mcpUrl
      }
    }
  }, null, 2);

  const cursorConfigJson = JSON.stringify({
    mcpServers: {
      "future-mca": {
        url: mcpUrl
      }
    }
  }, null, 2);

  const pythonSdkCode = `from mcp import ClientSession
from mcp.client.sse import sse_client

async def main():
    async with sse_client("${mcpUrl}") as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # Step 1: Read company context
            profile = await session.call_tool("get_company_profile", {
                "cin": "${selectedCompany?.cin || 'U72900KA2022PTC158942'}"
            })
            print("Company Profile:", profile.content[0].text)
            
            # Step 2: Prepare a director change action draft (NEVER executes silently)
            draft = await session.call_tool("prepare_director_change", {
                "company_id_or_cin": "${selectedCompany?.cin || 'U72900KA2022PTC158942'}",
                "change_type": "RESIGNATION",
                "director_name": "Ananya Sharma",
                "effective_date": "2026-08-20"
            })
            print("Prepared Draft Envelope:", draft.content[0].text)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())`;

  const handleToolSelect = (toolName: string) => {
    setSelectedTool(toolName);
    const cin = selectedCompany?.cin || 'U72900KA2022PTC158942';
    switch (toolName) {
      // Level 1: Read
      case 'search_company':
        setToolArgs('{\n  "query": "Ziggers"\n}');
        break;
      case 'get_company_profile':
        setToolArgs(`{\n  "cin": "${cin}"\n}`);
        break;
      case 'get_company_directors':
        setToolArgs(`{\n  "cin": "${cin}"\n}`);
        break;
      case 'get_compliance_status':
        setToolArgs(`{\n  "cin": "${cin}",\n  "urgency": "critical"\n}`);
        break;
      case 'get_upcoming_deadlines':
        setToolArgs(`{\n  "cin": "${cin}"\n}`);
        break;
      case 'get_next_required_action':
        setToolArgs(`{\n  "cin": "${cin}"\n}`);
        break;
      case 'identify_required_filing':
        setToolArgs('{\n  "event_description": "Our director resigned yesterday"\n}');
        break;
      case 'get_filing_requirements':
        setToolArgs('{\n  "form_code_or_intent": "DIR-12"\n}');
        break;
      case 'get_application_status':
        setToolArgs('{\n  "application_no": "SRN902819203"\n}');
        break;
      case 'get_application_timeline':
        setToolArgs('{\n  "application_no": "SRN902819203"\n}');
        break;
      case 'diagnose_filing_error':
        setToolArgs('{\n  "error_message_or_code": "DSC certificate thumbprint not registered in MCA V3"\n}');
        break;
      case 'search_mca_knowledge':
        setToolArgs('{\n  "query": "Section 168 director resignation rules"\n}');
        break;

      // Level 2: Prepare
      case 'prepare_company_registration':
        setToolArgs('{\n  "proposed_names": [\n    "Future AI Labs Private Limited",\n    "AI Labs India Private Limited"\n  ],\n  "company_type": "PVT_LTD",\n  "registered_state": "Karnataka",\n  "authorized_capital": 1000000,\n  "paid_up_capital": 100000,\n  "directors": [\n    { "full_name": "Subanesh R", "email": "founder@example.com" },\n    { "full_name": "Co-Founder", "email": "director@example.com" }\n  ]\n}');
        break;
      case 'prepare_director_change':
        setToolArgs(`{\n  "company_id_or_cin": "${cin}",\n  "change_type": "RESIGNATION",\n  "director_name": "Ananya Sharma",\n  "din": "08947219",\n  "effective_date": "2026-08-20",\n  "reason": "Personal commitments"\n}`);
        break;
      case 'prepare_registered_office_change':
        setToolArgs(`{\n  "company_id_or_cin": "${cin}",\n  "new_address_line1": "9th Floor, Brigade Tech Park",\n  "city": "Bengaluru",\n  "state": "Karnataka",\n  "pincode": "560066",\n  "effective_date": "2026-08-25"\n}`);
        break;
      case 'prepare_filing':
        setToolArgs(`{\n  "company_id_or_cin": "${cin}",\n  "form_code": "DIR-12",\n  "reason": "Director cessation"\n}`);
        break;
      case 'prepare_compliance_submission':
        setToolArgs(`{\n  "company_id_or_cin": "${cin}",\n  "compliance_type": "AOC-4",\n  "financial_year": "2025-2026"\n}`);
        break;

      // Level 3: Lifecycle & Execution
      case 'get_action_status':
      case 'get_action_preview':
        setToolArgs('{\n  "action_id": "act_dir_example"\n}');
        break;
      case 'confirm_action':
        setToolArgs('{\n  "action_id": "act_dir_example",\n  "confirmation_token": "act_tok_sample"\n}');
        break;
      case 'cancel_action':
        setToolArgs('{\n  "action_id": "act_dir_example",\n  "reason": "No longer needed"\n}');
        break;
      case 'execute_action':
        setToolArgs('{\n  "action_id": "act_dir_example",\n  "idempotency_key": "idemp_test_123"\n}');
        break;
      default:
        setToolArgs('{}');
    }
  };

  const handleExecuteTool = async () => {
    setIsRunningTool(true);
    setToolOutput(null);
    setToolLatency(null);
    const start = Date.now();

    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(toolArgs);
      } catch {
        parsedArgs = {};
      }

      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: selectedTool,
            arguments: parsedArgs
          }
        })
      });

      const data = await res.json();
      setToolLatency(Date.now() - start);
      setToolOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setToolLatency(Date.now() - start);
      setToolOutput(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsRunningTool(false);
    }
  };

  const readTools = MCP_TOOLS.filter(t => t.category === 'LEVEL_1_READ');
  const prepareTools = MCP_TOOLS.filter(t => t.category === 'LEVEL_2_PREPARE');
  const executionTools = MCP_TOOLS.filter(t => t.category === 'LEVEL_3_EXECUTION');

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600">
                Model Context Protocol (MCP) 2.0
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
              AI Agent Connectivity & Secure Actions
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Connect Claude Desktop, Cursor IDE, ChatGPT, and autonomous agents with Future MCA's secure Post-Action layer.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs">
              <span className={`w-2 h-2 rounded-full ${
                serverPing.status === 'online' ? 'bg-[#16A34A] animate-pulse' : 'bg-[#D97706]'
              }`} />
              <span className="font-semibold text-[#0F172A]">
                {serverPing.status === 'online' ? 'Remote Server Live' : 'Checking Server...'}
              </span>
              {serverPing.latency !== null && (
                <span className="text-[10px] text-[#64748B] font-mono">({serverPing.latency}ms)</span>
              )}
            </div>
            <Link
              href="/actions"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0F172A] hover:bg-slate-800 transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Actions & Approvals Hub
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-8">

        {/* 3-Level Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                LEVEL 1
              </span>
              <span className="text-xs font-mono text-[#64748B]">{readTools.length} tools</span>
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Context & Read Tools</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Safe, immediate information retrieval. Agent inspects company master records, active directors, compliance risks, and Companies Act rules.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm space-y-3 bg-gradient-to-b from-white to-amber-50/20">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                LEVEL 2
              </span>
              <span className="text-xs font-mono text-[#64748B]">{prepareTools.length} tools</span>
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Prepare Action Tools</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Creates validated action drafts and requirements checklists (DIR-12, INC-22, SPICe+). <strong>NEVER</strong> submits directly.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-purple-200 p-5 shadow-sm space-y-3 bg-gradient-to-b from-white to-purple-50/20">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                LEVEL 3
              </span>
              <span className="text-xs font-mono text-[#64748B]">{executionTools.length} tools</span>
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Lifecycle & Execution</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Requires explicit confirmation, isolated DSC signing, unexpired tokens, and idempotency protection before executing submissions.
            </p>
          </div>
        </div>

        {/* Server Endpoint Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
            <div>
              <div className="text-xs font-bold text-[#0F172A] flex items-center space-x-2">
                <span>Remote MCP Server Endpoint</span>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-200">
                  Streamable JSON-RPC 2.0
                </span>
              </div>
              <p className="text-xs mt-1 font-mono select-all text-blue-600 font-semibold">
                {mcpUrl}
              </p>
            </div>

            <button
              onClick={() => handleCopy(mcpUrl, 'url')}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-white text-[#0F172A] flex items-center space-x-1.5 transition-all self-start sm:self-auto"
            >
              {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'url' ? 'Copied URL' : 'Copy Endpoint'}</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[#E2E8F0] space-x-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('claude-desktop')}
              className={`pb-2.5 transition-all flex items-center gap-1.5 ${
                activeTab === 'claude-desktop'
                  ? 'border-b-2 border-blue-600 text-blue-600 font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Claude Desktop / Code
            </button>
            <button
              onClick={() => setActiveTab('cursor')}
              className={`pb-2.5 transition-all flex items-center gap-1.5 ${
                activeTab === 'cursor'
                  ? 'border-b-2 border-blue-600 text-blue-600 font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Cursor AI IDE
            </button>
            <button
              onClick={() => setActiveTab('sdk')}
              className={`pb-2.5 transition-all flex items-center gap-1.5 ${
                activeTab === 'sdk'
                  ? 'border-b-2 border-blue-600 text-blue-600 font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Python / Node SDK
            </button>
          </div>

          {/* Tab 1: Claude Desktop */}
          {activeTab === 'claude-desktop' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-[#64748B]">
                  Add to your <code className="font-mono text-[#0F172A] font-semibold bg-slate-100 px-1 py-0.5 rounded">claude_desktop_config.json</code>:
                </div>
                <button
                  onClick={() => handleCopy(claudeDesktopConfigJson, 'claude')}
                  className="text-xs text-blue-600 hover:underline flex items-center space-x-1 font-semibold"
                >
                  {copiedKey === 'claude' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'claude' ? 'Copied' : 'Copy Configuration'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
                {claudeDesktopConfigJson}
              </pre>
            </div>
          )}

          {/* Tab 2: Cursor */}
          {activeTab === 'cursor' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-[#64748B]">
                  Add to your Cursor settings or <code className="font-mono text-[#0F172A] font-semibold bg-slate-100 px-1 py-0.5 rounded">.cursor/mcp.json</code>:
                </div>
                <button
                  onClick={() => handleCopy(cursorConfigJson, 'cursor')}
                  className="text-xs text-blue-600 hover:underline flex items-center space-x-1 font-semibold"
                >
                  {copiedKey === 'cursor' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'cursor' ? 'Copied' : 'Copy Configuration'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
                {cursorConfigJson}
              </pre>
            </div>
          )}

          {/* Tab 3: Python SDK */}
          {activeTab === 'sdk' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0F172A]">Python MCP Client Script</span>
                <button
                  onClick={() => handleCopy(pythonSdkCode, 'py')}
                  className="text-xs text-blue-600 hover:underline flex items-center space-x-1 font-semibold"
                >
                  {copiedKey === 'py' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'py' ? 'Copied Python' : 'Copy Script'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
                {pythonSdkCode}
              </pre>
            </div>
          )}

        </div>

        {/* Live Interactive In-Browser MCP Tool Playground */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] flex items-center space-x-2">
                <Code className="w-4 h-4 text-blue-600" />
                <span>Live Interactive MCP Tool Playground</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Simulate how Claude, ChatGPT, or Cursor executes Read, Prepare, and Action tools against Future MCA.
              </p>
            </div>
            <span className="text-xs font-mono text-[#64748B]">{MCP_TOOLS.length} Registered Tools</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Tool Selection (4 cols) */}
            <div className="md:col-span-4 space-y-2 max-h-[460px] overflow-y-auto pr-1">
              
              <div className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Level 1: Read Tools</div>
              {readTools.map(tool => (
                <button
                  key={tool.name}
                  onClick={() => handleToolSelect(tool.name)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                    selectedTool === tool.name
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] hover:bg-white'
                  }`}
                >
                  <div className="font-mono text-[11px]">{tool.name}</div>
                  <div className="text-[10px] text-[#64748B] line-clamp-1 mt-0.5">{tool.description}</div>
                </button>
              ))}

              <div className="text-[10px] uppercase font-bold text-amber-700 tracking-wider pt-2">Level 2: Prepare Tools</div>
              {prepareTools.map(tool => (
                <button
                  key={tool.name}
                  onClick={() => handleToolSelect(tool.name)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                    selectedTool === tool.name
                      ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] hover:bg-white'
                  }`}
                >
                  <div className="font-mono text-[11px]">{tool.name}</div>
                  <div className="text-[10px] text-[#64748B] line-clamp-1 mt-0.5">{tool.description}</div>
                </button>
              ))}

              <div className="text-[10px] uppercase font-bold text-purple-700 tracking-wider pt-2">Level 3: Action Execution</div>
              {executionTools.map(tool => (
                <button
                  key={tool.name}
                  onClick={() => handleToolSelect(tool.name)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                    selectedTool === tool.name
                      ? 'bg-purple-50 border-purple-300 text-purple-700 font-bold'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] hover:bg-white'
                  }`}
                >
                  <div className="font-mono text-[11px]">{tool.name}</div>
                  <div className="text-[10px] text-[#64748B] line-clamp-1 mt-0.5">{tool.description}</div>
                </button>
              ))}

            </div>

            {/* Tool Arguments & Live Runner (8 cols) */}
            <div className="md:col-span-8 space-y-3">
              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">
                  JSON Arguments for <code className="text-blue-600 font-mono">{selectedTool}</code>
                </label>
                <textarea
                  rows={6}
                  value={toolArgs}
                  onChange={(e) => setToolArgs(e.target.value)}
                  className="w-full p-3 text-xs font-mono bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 text-[#0F172A]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-[11px] text-[#64748B] font-mono">
                  {toolLatency !== null && <span>Execution Latency: {toolLatency}ms</span>}
                </div>
                <button
                  type="button"
                  disabled={isRunningTool}
                  onClick={handleExecuteTool}
                  className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-sm flex items-center space-x-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isRunningTool ? 'Executing via RPC...' : 'Execute Tool on Server'}</span>
                </button>
              </div>

              {toolOutput && (
                <div className="space-y-1 pt-2">
                  <div className="text-[11px] font-bold uppercase text-[#64748B]">JSON-RPC Response Output:</div>
                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto max-h-72 leading-relaxed">
                    {toolOutput}
                  </pre>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
