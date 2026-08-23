'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace } from '@/context/WorkspaceContext';
import { MOCK_CONNECTED_CLIENTS } from '@/lib/mockData';
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
  Trash2, 
  Plus,
  ChevronRight,
  Code
} from 'lucide-react';

export default function AiClientsAndMcpPage() {
  const { selectedCompany } = useWorkspace();
  const [clients, setClients] = useState(MOCK_CONNECTED_CLIENTS);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [selectedTool, setSelectedTool] = useState(MCP_TOOLS[0].name);
  const [toolArgs, setToolArgs] = useState('{\n  "query": "Ziggers"\n}');
  const [toolOutput, setToolOutput] = useState<string | null>(null);
  const [isRunningTool, setIsRunningTool] = useState(false);

  const mcpUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/mcp` : 'https://mcp.futuremca.in/api/mcp';

  const claudeConfigJson = JSON.stringify({
    mcpServers: {
      "future-mca": {
        url: mcpUrl,
        headers: {
          Authorization: "Bearer mca_live_sec_token"
        }
      }
    }
  }, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(claudeConfigJson);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleToolSelect = (toolName: string) => {
    setSelectedTool(toolName);
    switch (toolName) {
      case 'search_company':
        setToolArgs('{\n  "query": "Ziggers"\n}');
        break;
      case 'get_company_profile':
        setToolArgs(`{\n  "cin": "${selectedCompany?.cin || 'U72900KA2021PTC145892'}"\n}`);
        break;
      case 'get_company_directors':
        setToolArgs(`{\n  "cin": "${selectedCompany?.cin || 'U72900KA2021PTC145892'}"\n}`);
        break;
      case 'get_compliance_status':
        setToolArgs(`{\n  "cin": "${selectedCompany?.cin || 'U72900KA2021PTC145892'}",\n  "urgency": "critical"\n}`);
        break;
      case 'identify_required_filing':
        setToolArgs('{\n  "event_description": "A director resigned from our board"\n}');
        break;
      case 'diagnose_filing_error':
        setToolArgs('{\n  "error_message_or_code": "DSC inserted does not match registered DSC"\n}');
        break;
      case 'get_application_status':
        setToolArgs('{\n  "application_no": "SRN-Y81920311"\n}');
        break;
      default:
        setToolArgs('{}');
    }
  };

  const handleExecuteTool = async () => {
    setIsRunningTool(true);
    setToolOutput(null);
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
      setToolOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setToolOutput(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsRunningTool(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <div className="text-[10px] font-mono uppercase text-[#737373] tracking-wider">
            Model Context Protocol (MCP) Integration
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-black mt-0.5">
            Connected AI Clients & Permissions
          </h1>
          <p className="text-xs text-[#525252] mt-1">
            Grant authorized AI agents like Claude or Cursor structured access to company master data, compliance status, and error diagnosis.
          </p>
        </div>

        {/* Server Endpoint & Quick Config Card */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5E5] pb-4">
            <div>
              <div className="text-xs font-semibold text-black flex items-center space-x-2">
                <span>Remote MCP Server Endpoint</span>
                <span className="text-[10px] font-mono bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded font-bold">
                  Streamable HTTP
                </span>
              </div>
              <p className="text-xs text-[#525252] mt-0.5">Compatible with Anthropic Claude Desktop, Cursor, Windsurf, and custom agentic frameworks.</p>
            </div>

            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 text-xs font-medium bg-[#0A0A0A] hover:bg-black text-white rounded transition-colors flex items-center space-x-1.5 self-start sm:self-auto shrink-0"
            >
              {copiedConfig ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedConfig ? 'Copied Config' : 'Copy Claude Config'}</span>
            </button>
          </div>

          <div className="bg-[#0A0A0A] rounded-lg p-4 font-mono text-xs text-[#EFF6FF] overflow-x-auto">
            <pre>{claudeConfigJson}</pre>
          </div>
        </div>

        {/* Active Connected Clients Roster */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Authorized AI Clients ({clients.length})
            </h2>
            <span className="text-xs text-[#525252]">OAuth 2.1 Enforced</span>
          </div>

          <div className="space-y-3">
            {clients.map(client => (
              <div
                key={client.id}
                className="bg-white border border-[#E5E5E5] rounded-xl p-5 hover:border-[#2563EB] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-xs">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-black">{client.name}</h3>
                        <div className="text-[11px] text-[#737373]">{client.client_type}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0FDF4] text-[#16A34A] font-bold">
                        {client.status}
                      </span>
                    </div>

                    <div className="pt-1">
                      <div className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider mb-1">
                        Permitted Scopes:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {client.scopes.map(scope => (
                          <span
                            key={scope}
                            className="text-[10px] font-mono bg-[#F7F7F5] border border-[#E5E5E5] text-[#0A0A0A] px-2 py-0.5 rounded"
                          >
                            ✓ {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setClients(prev => prev.filter(c => c.id !== client.id))}
                      className="px-3 py-1.5 text-xs text-[#DC2626] hover:bg-[#FEF2F2] border border-[#E5E5E5] rounded transition-colors flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Revoke Access</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Interactive In-Browser MCP Tool Playground */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <div>
              <h2 className="text-base font-bold text-black flex items-center space-x-2">
                <Code className="w-4 h-4 text-[#2563EB]" />
                <span>Interactive MCP Tool Simulator</span>
              </h2>
              <p className="text-xs text-[#525252] mt-0.5">
                Simulate how Claude or Cursor invokes Future MCA tools directly via JSON-RPC 2.0.
              </p>
            </div>
            <span className="text-xs font-mono text-[#737373]">12 Tools Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Tool Selection (4 cols) */}
            <div className="md:col-span-4 space-y-1.5 max-h-80 overflow-y-auto pr-1">
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

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isRunningTool}
                  onClick={handleExecuteTool}
                  className="px-4 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white rounded transition-colors flex items-center space-x-1.5"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isRunningTool ? 'Executing Tool...' : 'Execute Tool via MCP RPC'}</span>
                </button>
              </div>

              {toolOutput && (
                <div className="space-y-1 pt-2">
                  <div className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                    Live Response Payload (JSON-RPC)
                  </div>
                  <pre className="p-3 bg-[#0A0A0A] text-[#EFF6FF] rounded-lg font-mono text-[11px] overflow-x-auto max-h-64 leading-relaxed">
                    {toolOutput}
                  </pre>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </AppShell>
  );
}
