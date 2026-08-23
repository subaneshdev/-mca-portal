'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
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
  UserCheck
} from 'lucide-react';

export default function ConnectAiPage() {
  const { selectedCompany, currentWorkspace, profile } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'claude-oauth' | 'claude-desktop' | 'cursor' | 'sdk'>('claude-oauth');
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
            
            # Query active company master data
            result = await session.call_tool("get_company_profile", {
                "cin": "${selectedCompany?.cin || 'U72900KA2021PTC145892'}"
            })
            print("Company Profile:", result.content[0].text)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())`;

  const handleToolSelect = (toolName: string) => {
    setSelectedTool(toolName);
    const cin = selectedCompany?.cin || 'U72900KA2021PTC145892';
    switch (toolName) {
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
        setToolArgs('{\n  "event_description": "A director resigned from our board"\n}');
        break;
      case 'get_filing_requirements':
        setToolArgs('{\n  "form_code_or_intent": "DIR-12"\n}');
        break;
      case 'validate_filing':
        setToolArgs('{\n  "form_code": "DIR-12",\n  "data": {\n    "resigning_din": "08945120",\n    "effective_date": "2026-08-20"\n  }\n}');
        break;
      case 'get_application_status':
        setToolArgs('{\n  "application_no": "SRN-Y81920311"\n}');
        break;
      case 'get_application_timeline':
        setToolArgs('{\n  "application_no": "SRN-Y81920311"\n}');
        break;
      case 'diagnose_filing_error':
        setToolArgs('{\n  "error_message_or_code": "DSC inserted does not match registered DSC"\n}');
        break;
      case 'search_mca_knowledge':
        setToolArgs('{\n  "query": "Section 137 financial statements"\n}');
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

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#737373] tracking-wider flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Model Context Protocol (MCP) Integration</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-black mt-0.5">
              Connecting to AI Clients
            </h1>
            <p className="text-xs text-[#525252] mt-1">
              Connect Anthropic Claude, Cursor, Windsurf, or custom autonomous agents to Future MCA's real-time government service layer.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-white text-xs">
              <span className={`w-2 h-2 rounded-full ${
                serverPing.status === 'online' ? 'bg-[#16A34A] animate-pulse' : 'bg-[#D97706]'
              }`} />
              <span className="font-medium text-black">
                {serverPing.status === 'online' ? 'MCP Server Live' : 'Checking Server...'}
              </span>
              {serverPing.latency !== null && (
                <span className="text-[10px] text-[#737373] font-mono">({serverPing.latency}ms)</span>
              )}
            </div>
          </div>
        </div>

        {/* Server Endpoint Card */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E5] pb-4">
            <div>
              <div className="text-xs font-semibold text-black flex items-center space-x-2">
                <span>Remote MCP Server Endpoint</span>
                <span className="text-[10px] font-mono bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded font-bold">
                  OAuth 2.1 & Streamable JSON-RPC
                </span>
              </div>
              <p className="text-xs text-[#525252] mt-0.5 font-mono select-all text-[#2563EB]">
                {mcpUrl}
              </p>
            </div>

            <button
              onClick={() => handleCopy(mcpUrl, 'url')}
              className="px-3.5 py-1.5 text-xs font-medium bg-[#0A0A0A] hover:bg-black text-white rounded transition-colors flex items-center space-x-1.5 self-start sm:self-auto shrink-0"
            >
              {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'url' ? 'Copied URL' : 'Copy Endpoint'}</span>
            </button>
          </div>

          {/* Client Selection Tabs */}
          <div className="space-y-4">
            <div className="flex items-center space-x-1 border-b border-[#E5E5E5] pb-2 text-xs overflow-x-auto">
              {[
                { id: 'claude-oauth', label: 'Claude Web / Connector (OAuth 2.1)' },
                { id: 'claude-desktop', label: 'Claude Desktop App' },
                { id: 'cursor', label: 'Cursor IDE' },
                { id: 'sdk', label: 'Custom Python / Node SDK' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-black text-white'
                      : 'text-[#525252] hover:bg-[#F7F7F5] hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Claude Web / Connector with OAuth 2.1 (RECOMMENDED) */}
            {activeTab === 'claude-oauth' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 bg-[#EFF6FF] border border-[#2563EB]/20 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#2563EB]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Recommended: Automated Multi-Tenant Workspace Isolation</span>
                  </div>
                  <p className="text-xs text-[#0A0A0A] leading-relaxed">
                    When connecting Claude via OAuth, Claude opens a secure login popup where you select your workspace (e.g. <em>Ziggers Startup</em> or <em>CA Firm</em>). Claude will only access data belonging to that specific workspace.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="font-bold text-black uppercase tracking-wider text-[11px]">
                    Step-by-Step Connection Guide in Claude:
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl space-y-1.5">
                      <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px]">1</div>
                      <div className="font-bold text-black">Add Connector in Claude</div>
                      <div className="text-[11px] text-[#525252]">
                        Paste Server URL:<br />
                        <code className="font-mono text-[10px] bg-white px-1 py-0.5 border border-[#E5E5E5] rounded text-[#2563EB]">{mcpUrl}</code>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl space-y-1.5">
                      <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px]">2</div>
                      <div className="font-bold text-black">Select OAuth Options</div>
                      <div className="text-[11px] text-[#525252]">
                        • Auth: <strong>Required when server asks</strong> (or Always)<br />
                        • OAuth Client: <strong>Use Anthropic's hosted client metadata</strong>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#F7F7F5] border border-[#E5E5E5] rounded-xl space-y-1.5">
                      <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px]">3</div>
                      <div className="font-bold text-black">Sign In & Authorize</div>
                      <div className="text-[11px] text-[#525252]">
                        Claude opens popup &rarr; select your Workspace &rarr; Click <strong>Authorize Claude</strong> &rarr; Complete!
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center space-x-2">
                    <a
                      href="/oauth/authorize"
                      target="_blank"
                      className="px-3.5 py-1.5 bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#0A0A0A] rounded font-medium text-xs flex items-center space-x-1.5"
                    >
                      <ExternalLink className="w-3 h-3 text-[#2563EB]" />
                      <span>Preview OAuth Consent Screen</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Claude Desktop */}
            {activeTab === 'claude-desktop' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-[#525252]">
                    Add to your <code className="font-mono text-black font-semibold">claude_desktop_config.json</code>:
                  </div>
                  <button
                    onClick={() => handleCopy(claudeDesktopConfigJson, 'claude')}
                    className="text-xs text-[#2563EB] hover:underline flex items-center space-x-1"
                  >
                    {copiedKey === 'claude' ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'claude' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#0A0A0A] text-[#EFF6FF] rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
                  {claudeDesktopConfigJson}
                </pre>
                <div className="text-[11px] text-[#737373] space-y-1">
                  <div><strong>macOS Location:</strong> <code className="font-mono bg-[#F7F7F5] px-1 py-0.5 border border-[#E5E5E5] rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code></div>
                  <div><strong>Windows Location:</strong> <code className="font-mono bg-[#F7F7F5] px-1 py-0.5 border border-[#E5E5E5] rounded">%APPDATA%\Claude\claude_desktop_config.json</code></div>
                </div>
              </div>
            )}

            {/* Tab 3: Cursor IDE */}
            {activeTab === 'cursor' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-[#525252]">
                    Add to your Cursor project settings or <code className="font-mono text-black font-semibold">.cursor/mcp.json</code>:
                  </div>
                  <button
                    onClick={() => handleCopy(cursorConfigJson, 'cursor')}
                    className="text-xs text-[#2563EB] hover:underline flex items-center space-x-1"
                  >
                    {copiedKey === 'cursor' ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'cursor' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#0A0A0A] text-[#EFF6FF] rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
                  {cursorConfigJson}
                </pre>
                <p className="text-[11px] text-[#737373]">
                  In Cursor: Go to <strong>Cursor Settings &rarr; Features &rarr; MCP</strong> and add new remote MCP server with URL <code className="font-mono text-black">{mcpUrl}</code>.
                </p>
              </div>
            )}

            {/* Tab 4: Custom Python & Node SDK */}
            {activeTab === 'sdk' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-black">Python Client (@modelcontextprotocol)</span>
                    <button
                      onClick={() => handleCopy(pythonSdkCode, 'py')}
                      className="text-xs text-[#2563EB] hover:underline flex items-center space-x-1"
                    >
                      {copiedKey === 'py' ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'py' ? 'Copied Python' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-[#0A0A0A] text-[#EFF6FF] rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
                    {pythonSdkCode}
                  </pre>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Live Interactive In-Browser MCP Tool Playground */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <div>
              <h2 className="text-base font-bold text-black flex items-center space-x-2">
                <Code className="w-4 h-4 text-[#2563EB]" />
                <span>Live Interactive MCP Tool Tester</span>
              </h2>
              <p className="text-xs text-[#525252] mt-0.5">
                Simulate how Claude or Cursor calls Future MCA tools via JSON-RPC 2.0 against the live Supabase database.
              </p>
            </div>
            <span className="text-xs font-mono text-[#737373]">{MCP_TOOLS.length} Tools Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Tool Selection (4 cols) */}
            <div className="md:col-span-4 space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {MCP_TOOLS.map(tool => (
                <button
                  key={tool.name}
                  onClick={() => handleToolSelect(tool.name)}
                  className={`w-full text-left p-2.5 rounded text-xs transition-colors border ${
                    selectedTool === tool.name
                      ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] font-semibold'
                      : 'bg-[#F7F7F5] border-[#E5E5E5] text-[#0A0A0A] hover:bg-white'
                  }`}
                >
                  <div className="font-mono">{tool.name}</div>
                  <div className="text-[10px] text-[#737373] line-clamp-1 mt-0.5">{tool.description}</div>
                </button>
              ))}
            </div>

            {/* Tool Arguments & Live Runner (8 cols) */}
            <div className="md:col-span-8 space-y-3">
              <div>
                <label className="text-xs font-semibold text-black block mb-1">
                  JSON Arguments for <code className="text-[#2563EB]">{selectedTool}</code>
                </label>
                <textarea
                  rows={4}
                  value={toolArgs}
                  onChange={(e) => setToolArgs(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono bg-[#F7F7F5] border border-[#E5E5E5] rounded outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-[11px] text-[#737373] font-mono">
                  {toolLatency !== null && <span>Execution Latency: {toolLatency}ms</span>}
                </div>
                <button
                  type="button"
                  disabled={isRunningTool}
                  onClick={handleExecuteTool}
                  className="px-4 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white rounded transition-colors flex items-center space-x-1.5"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isRunningTool ? 'Executing via RPC...' : 'Execute Tool on Server'}</span>
                </button>
              </div>

              {toolOutput && (
                <div className="space-y-1 pt-2">
                  <div className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider flex items-center justify-between">
                    <span>Live JSON-RPC 2.0 Response</span>
                    <button
                      onClick={() => handleCopy(toolOutput, 'output')}
                      className="text-xs text-[#2563EB] hover:underline"
                    >
                      {copiedKey === 'output' ? 'Copied' : 'Copy Output'}
                    </button>
                  </div>
                  <pre className="p-3 bg-[#0A0A0A] text-[#EFF6FF] rounded-lg font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed">
                    {toolOutput}
                  </pre>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Complete Tools Catalog & Permissions */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <h2 className="text-sm font-bold text-black flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>Government Compliance Tools Catalog ({MCP_TOOLS.length})</span>
            </h2>
            <span className="text-xs text-[#737373]">Permissioned Read-Only</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MCP_TOOLS.map(tool => (
              <div key={tool.name} className="p-3.5 rounded-lg border border-[#E5E5E5] bg-[#F7F7F5] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#0A0A0A]">{tool.name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white text-[#2563EB] border border-[#E5E5E5] font-semibold">
                    READ
                  </span>
                </div>
                <p className="text-[11px] text-[#525252]">{tool.description}</p>
                {tool.inputSchema.required && (
                  <div className="text-[10px] text-[#737373] font-mono">
                    Required: {tool.inputSchema.required.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
