'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Zap, 
  Lock, 
  ChevronRight,
  Terminal
} from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function LandingPage() {
  const { setRole } = useWorkspace();

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] font-sans selection:bg-[#2563EB] selection:text-white">
      
      {/* Top Banner & Header */}
      <nav className="border-b border-[#E5E5E5] bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center font-bold text-xs tracking-wider">
              MCA
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-black">Future MCA</span>
              <span className="ml-2 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#F7F7F5] text-[#525252] border border-[#E5E5E5]">
                AI-Native Reimagination
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/overview"
              className="text-xs font-medium text-[#525252] hover:text-black transition-colors hidden sm:inline"
            >
              Live Demo
            </Link>
            <Link
              href="/settings/ai-clients"
              className="text-xs font-medium text-[#525252] hover:text-black transition-colors hidden sm:inline"
            >
              MCP Endpoint
            </Link>
            <Link
              href="/overview"
              className="px-3.5 py-1.5 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded transition-colors"
            >
              Open Future MCA
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 border-b border-[#E5E5E5] bg-[#FFFFFF]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F7F7F5] border border-[#E5E5E5] text-xs text-[#525252]">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
            <span>Government services, ready for humans and AI agents</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black max-w-3xl mx-auto leading-[1.12]">
            MCA, ready for the way you work.
          </h1>

          <p className="text-base sm:text-lg text-[#525252] max-w-2xl mx-auto leading-relaxed">
            Manage companies, understand compliance and connect your authorised MCA workspace directly to AI agents.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/overview"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 text-sm font-medium bg-black hover:bg-[#0A0A0A] text-white rounded transition-all shadow-sm"
            >
              <span>Open Future MCA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/settings/ai-clients"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 text-sm font-medium bg-[#F7F7F5] hover:bg-[#EFF6FF] text-[#0A0A0A] border border-[#E5E5E5] hover:border-[#2563EB] rounded transition-all"
            >
              <Cpu className="w-4 h-4 text-[#2563EB]" />
              <span>Connect an AI agent</span>
            </Link>
          </div>

        </div>

        {/* Clean Interface Preview (PRD Specification) */}
        <div className="max-w-4xl mx-auto mt-12 bg-white border border-[#E5E5E5] rounded-xl shadow-xl overflow-hidden">
          <div className="bg-[#F7F7F5] border-b border-[#E5E5E5] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]"></div>
              <span className="text-[11px] font-mono text-[#737373] ml-2">Future MCA Attention Matrix</span>
            </div>
            <span className="text-[10px] font-mono bg-white px-2 py-0.5 border border-[#E5E5E5] rounded text-[#2563EB]">
              Ziggers Private Limited
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-black tracking-tight">What needs your attention?</h2>
              <p className="text-xs text-[#525252] mt-1">3 actions require review across your company portfolio.</p>
            </div>

            <div className="space-y-3">
              
              <div className="p-4 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-between hover:border-[#2563EB] transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-[#DC2626] mt-1.5 shrink-0"></div>
                  <div>
                    <div className="text-xs font-semibold text-[#0A0A0A] flex items-center space-x-2">
                      <span>Annual Financial Statement (AOC-4)</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20">
                        Due in 2 days
                      </span>
                    </div>
                    <p className="text-[11px] text-[#525252] mt-0.5">Required balance sheet information incomplete under Section 137.</p>
                  </div>
                </div>
                <Link
                  href="/compliance"
                  className="px-3 py-1.5 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded transition-colors shrink-0 ml-3"
                >
                  Review actions
                </Link>
              </div>

              <div className="p-4 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-between hover:border-[#2563EB] transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-[#D97706] mt-1.5 shrink-0"></div>
                  <div>
                    <div className="text-xs font-semibold text-[#0A0A0A] flex items-center space-x-2">
                      <span>Director KYC (DIR-3 KYC)</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20">
                        Action Required
                      </span>
                    </div>
                    <p className="text-[11px] text-[#525252] mt-0.5">Director Ananya Sharma has pending web OTP verification.</p>
                  </div>
                </div>
                <Link
                  href="/compliance"
                  className="px-3 py-1.5 text-xs font-medium bg-[#F7F7F5] hover:bg-[#EFF6FF] text-[#0A0A0A] border border-[#E5E5E5] hover:border-[#2563EB] rounded transition-colors shrink-0 ml-3"
                >
                  Continue
                </Link>
              </div>

              <div className="p-4 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-between hover:border-[#2563EB] transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-1.5 shrink-0"></div>
                  <div>
                    <div className="text-xs font-semibold text-[#0A0A0A] flex items-center space-x-2">
                      <span>Registered Office Filing (INC-22)</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
                        Resubmission
                      </span>
                    </div>
                    <p className="text-[11px] text-[#525252] mt-0.5">ROC flagged utility bill recency. Upload latest electricity bill within 15 days.</p>
                  </div>
                </div>
                <Link
                  href="/applications"
                  className="px-3 py-1.5 text-xs font-medium bg-[#F7F7F5] hover:bg-[#EFF6FF] text-[#0A0A0A] border border-[#E5E5E5] hover:border-[#2563EB] rounded transition-colors shrink-0 ml-3"
                >
                  View journey
                </Link>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* Two Personas Selection Section */}
      <section className="py-16 px-4 sm:px-6 bg-[#F7F7F5] border-b border-[#E5E5E5]">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
              Tailored for how you operate
            </h2>
            <p className="text-xs sm:text-sm text-[#525252] max-w-xl mx-auto">
              Whether you are a founder who needs plain-language guidance or a CA/CS managing 50 client entities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Business Owner Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 flex flex-col justify-between hover:border-[#2563EB] transition-colors">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">Founder & Business Owner</h3>
                  <p className="text-xs text-[#525252] mt-1 italic">"Tell me what I need to do."</p>
                </div>
                <ul className="text-xs text-[#525252] space-y-2 pt-2 border-t border-[#E5E5E5]">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Intent-driven filing ("A director resigned")</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Zero form number memorization required</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Visual timeline for pending RoC applications</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/overview"
                onClick={() => setRole('founder')}
                className="mt-6 w-full py-2 px-3 text-xs font-medium text-center bg-black hover:bg-[#0A0A0A] text-white rounded transition-colors"
              >
                Enter Founder Workspace
              </Link>
            </div>

            {/* CA / CS Professional Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 flex flex-col justify-between hover:border-[#2563EB] transition-colors">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">CA / CS / Professional</h3>
                  <p className="text-xs text-[#525252] mt-1 italic">"Show me everything that needs attention."</p>
                </div>
                <ul className="text-xs text-[#525252] space-y-2 pt-2 border-t border-[#E5E5E5]">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Multi-client risk matrix and bulk deadline sorting</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Instant error code & DSC mismatch diagnosis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Direct form power tools & statutory validation</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/overview"
                onClick={() => setRole('professional')}
                className="mt-6 w-full py-2 px-3 text-xs font-medium text-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded transition-colors"
              >
                Enter Professional Workspace
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* Model Context Protocol (MCP) Section */}
      <section className="py-16 px-4 sm:px-6 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] text-[11px] font-mono font-medium">
                <Cpu className="w-3 h-3" />
                <span>Remote MCP Server</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-black mt-2">
                Built for autonomous AI agents
              </h2>
              <p className="text-xs text-[#525252] mt-1 max-w-lg">
                Connect Claude Desktop, Cursor, or your internal agents to Future MCA with 12 structured compliance tools and strict OAuth permission boundaries.
              </p>
            </div>

            <Link
              href="/settings/ai-clients"
              className="px-4 py-2 text-xs font-medium bg-[#F7F7F5] hover:bg-[#EFF6FF] border border-[#E5E5E5] hover:border-[#2563EB] text-[#0A0A0A] rounded transition-all flex items-center space-x-1.5"
            >
              <span>Explore MCP Playground</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#0A0A0A] rounded-lg p-4 sm:p-6 text-white font-mono text-xs overflow-x-auto shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-[11px] text-[#737373]">
              <span>claude_desktop_config.json</span>
              <span className="text-[#2563EB]">Streamable HTTP Protocol</span>
            </div>
            <pre className="mt-3 text-[#EFF6FF] leading-relaxed">
{`{
  "mcpServers": {
    "future-mca": {
      "url": "https://mcp.futuremca.in/api/mcp",
      "headers": {
        "Authorization": "Bearer mca_live_sec_token"
      }
    }
  }
}`}
            </pre>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 bg-[#F7F7F5] text-xs text-[#525252]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-black text-white flex items-center justify-center font-bold text-[10px]">
              MCA
            </div>
            <span className="font-semibold text-black">Future MCA</span>
            <span>— Corporate government services for humans and AI.</span>
          </div>
          <div className="flex items-center space-x-6 text-[11px]">
            <Link href="/overview" className="hover:text-black">Dashboard</Link>
            <Link href="/compliance" className="hover:text-black">Compliance</Link>
            <Link href="/diagnostics" className="hover:text-black">Diagnostics</Link>
            <Link href="/settings/ai-clients" className="hover:text-black">MCP Settings</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
