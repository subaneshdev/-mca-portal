'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AshokaEmblem, McaLogoBadge } from '@/components/brand/McaEmblem';
import { useWorkspace } from '@/context/WorkspaceContext';
import { 
  Search, 
  User, 
  ArrowRight, 
  Sparkles, 
  LogOut, 
  CheckCircle2, 
  Bot, 
  Code2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Zap, 
  Terminal,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function SingleViewportLandingPage() {
  const router = useRouter();
  const { user, profile, signOut } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<'product' | 'mcp' | 'professionals' | null>(null);
  const [mcpModalTab, setMcpModalTab] = useState<'tools' | 'steps' | 'config'>('tools');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success'>('idle');

  const isAuthenticated = !!user;

  // Close modals on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestPing = async () => {
    setPingStatus('testing');
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'ping-test',
          method: 'tools/list',
          params: {}
        })
      });
      if (res.ok) {
        setPingStatus('success');
      } else {
        setPingStatus('idle');
      }
    } catch {
      setPingStatus('idle');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (isAuthenticated) {
      router.push(`/chat?query=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push(`/auth/login?next=${encodeURIComponent(`/chat?query=${searchQuery}`)}`);
    }
  };

  const getProtectedUrl = (targetUrl: string) => {
    if (isAuthenticated) return targetUrl;
    return `/auth/login?next=${encodeURIComponent(targetUrl)}`;
  };

  const mcpToolsList = [
    {
      name: 'get_company_master_data',
      desc: 'Retrieves verified master records, CIN, capital structure, RoC jurisdiction, and active status.',
      category: 'Master Data'
    },
    {
      name: 'list_directors',
      desc: 'Lists Board of Directors with DIN validation, DSC expiry dates, and annual KYC compliance.',
      category: 'Governance'
    },
    {
      name: 'get_compliance_deadlines',
      desc: 'Calculates upcoming statutory deadlines (AOC-4, MGT-7, DIR-3 KYC) and daily penalty exposure.',
      category: 'Compliance'
    },
    {
      name: 'prepare_filing_draft',
      desc: 'Prepares validated draft e-Forms (DIR-12, INC-22, MGT-14) with real-time pre-scrutiny checks.',
      category: 'Filings'
    },
    {
      name: 'diagnose_mca_error',
      desc: 'Analyzes MCA V3 portal error codes and backend rejection notices with prescribed fix steps.',
      category: 'Diagnostics'
    },
    {
      name: 'track_application_status',
      desc: 'Tracks real-time SRN processing across Central Registration Centre (CRC) and RoC offices.',
      category: 'Tracking'
    }
  ];

  const claudeConfigJson = `{
  "mcpServers": {
    "future-mca": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-everything"
      ],
      "env": {
        "MCA_API_ENDPOINT": "https://mca-portal-ten.vercel.app/api/mcp"
      }
    }
  }
}`;

  return (
    <div className="relative w-full h-screen min-h-screen overflow-hidden bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col justify-between">
      
      {/* External CSS & Font Links */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      />
      <link
        href="https://db.onlinewebfonts.com/c/8cb707a9b8a73f8a7403336b861c3074?family=BubbledotICG-FinePos"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />

      {/* Embedded CSS for Exact Visual Specs & Animations */}
      <style jsx global>{`
        @font-face {
          font-family: "Geist Pixel Circle";
          src: url("/fonts/GeistPixel-Circle.woff2") format("woff2");
          font-weight: 400;
          font-display: swap;
        }

        :root {
          --bg: #000000;
          --text: #ffffff;
          --muted: #8e8e8e;
          --nav-text: #2e2e2e;
          --pill-dark: #28282a;
          --sign-in-text: #c8c8c8;
          --nav-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
          --trust-bg: #28282a;
          --trust-border: rgba(255, 255, 255, 0.4);
          --trust-text: #c4c2c3;
          --font-sans: "Inter", "Segoe UI", system-ui, sans-serif;
          --font-display: "BubbledotICG-FinePos", "Geist Pixel Circle", monospace;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes reveal {
          from {
            opacity: 0;
            transform: translateY(22px) scale(0.98);
            filter: blur(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .anim-slide-down {
          animation: slideDown 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .anim-reveal {
          opacity: 0;
          animation: reveal 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .display-font {
          font-family: var(--font-display);
        }

        .headline-responsive {
          font-family: var(--font-display);
          font-size: clamp(34px, 6.2vw, 76px);
          line-height: 1.12;
          letter-spacing: -0.04em;
          font-weight: 400;
        }

        @media (max-width: 720px) {
          .headline-responsive {
            letter-spacing: -0.08em;
            line-height: 1.05;
          }
        }

        @media (max-width: 420px) {
          .headline-responsive {
            letter-spacing: -0.09em;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          .anim-reveal, .anim-slide-down {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
        }
      `}</style>

      {/* Background Video */}
      <div className="absolute inset-0 bg-black overflow-hidden z-0 pointer-events-none">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.65)_100%)] bg-black/40 z-1" />
      </div>

      {/* ==================================================
         1. AUTHENTIC GOVERNMENT OF INDIA MCA HEADER BAR
      ================================================== */}
      <header className="relative z-30 w-full bg-white text-[#0B2545] shadow-md anim-slide-down">
        
        {/* Top Government Dark Navy Strip */}
        <div className="bg-[#0B2545] text-white py-1 px-4 sm:px-8 text-[11px] font-medium flex items-center justify-between border-b border-[#081B33]">
          <div className="flex items-center space-x-3">
            <span className="font-semibold tracking-wide">भारत सरकार • GOVERNMENT OF INDIA</span>
            <span className="hidden md:inline text-[#94A3B8]">|</span>
            <span className="hidden md:inline text-[#E2E8F0] font-normal">कार्पोरेट कार्य मंत्रालय • Ministry of Corporate Affairs</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <Link href="/system-status" className="text-[#93C5FD] hover:underline flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] inline-block animate-pulse"></span>
              <span>Services Operational</span>
            </Link>
            <span className="text-[#64748B]">|</span>
            <span className="text-[#E2E8F0] font-mono">Accessibility: A+ A-</span>
          </div>
        </div>

        {/* Main Header Bar Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Left: Ashoka Emblem + MCA Badge + Typography + Pillars */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            
            {/* Ashoka Stambh Lion Capital Emblem */}
            <Link href="/" className="shrink-0 group">
              <AshokaEmblem className="w-8 h-11 sm:w-10 sm:h-13 drop-shadow-sm group-hover:opacity-95 transition-opacity" />
            </Link>

            {/* MCA Logo Badge & Typography */}
            <Link href="/" className="flex items-center space-x-2.5 group">
              <McaLogoBadge className="w-8 h-8 sm:w-9 sm:h-9 rounded shadow-sm group-hover:scale-105 transition-transform" />
              <div className="leading-tight text-left">
                <div className="font-extrabold text-[11px] sm:text-[12.5px] tracking-tight text-[#0B2545] uppercase font-sans">
                  Ministry of Corporate Affairs
                </div>
                <div className="text-[9px] sm:text-[10px] font-bold text-[#0066CC] tracking-wider uppercase">
                  Government of India
                </div>
              </div>
            </Link>

            {/* Vertical Divider */}
            <div className="hidden xl:block w-px h-10 bg-[#CBD5E1]" />

            {/* Mottos & 4 Pillars */}
            <div className="hidden xl:flex flex-col justify-center text-left">
              <div className="text-[10.5px] font-bold text-[#0B2545] tracking-wider uppercase">
                Empowering Business, Protecting Investors
              </div>
              <div className="text-[9.5px] font-bold tracking-wide mt-0.5 flex items-center space-x-1.5">
                <span className="text-[#EA580C]">REGULATOR</span>
                <span className="text-[#94A3B8]">•</span>
                <span className="text-[#16A34A]">INTEGRATOR</span>
                <span className="text-[#94A3B8]">•</span>
                <span className="text-[#DC2626]">FACILITATOR</span>
                <span className="text-[#94A3B8]">•</span>
                <span className="text-[#0284C7]">EDUCATOR</span>
              </div>
            </div>
          </div>

          {/* Center: Search Input */}
          <div className="hidden lg:flex flex-1 max-w-md mx-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, companies, forms"
                className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0]/80 focus:bg-white text-xs text-[#0F172A] placeholder-[#64748B] pl-4 pr-9 py-2 rounded-full border border-[#CBD5E1] focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/20 outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B2545] transition-colors p-0.5"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Right: Login / Register / Sign Out & Open Portal Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] text-xs text-[#0B2545] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                  <span className="max-w-[130px] truncate">{profile?.full_name || user?.email || 'c.subanesh@gmail.com'}</span>
                </div>

                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-[#CBD5E1] hover:bg-[#FEF2F2] hover:border-[#DC2626]/30 text-[#DC2626] text-xs font-semibold transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-full border border-[#0066CC] bg-white hover:bg-[#EFF6FF] text-[#0066CC] text-xs font-semibold transition-all shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login / Register</span>
              </Link>
            )}

            {/* Open Portal Button */}
            <Link
              href={getProtectedUrl('/chat')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#0B2545] hover:bg-[#07192F] text-white text-xs font-semibold transition-all shadow-sm group"
            >
              <span>Open Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>

          </div>

        </div>

      </header>

      {/* Main Single-Viewport Page Container */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-between items-center px-[clamp(14px,3vw,32px)] py-[clamp(12px,2vh,24px)] overflow-hidden">
        
        {/* 2. Hero Region */}
        <main className="w-full max-w-[880px] my-auto flex flex-col items-center text-center py-[clamp(6px,1.5vh,16px)]">
          
          {/* Trust / Context Pill */}
          <div
            className="anim-reveal inline-flex items-center gap-2.5 bg-[#28282a] border border-white/40 px-3.5 py-1 rounded-full mb-[clamp(12px,2vh,20px)] backdrop-blur-md"
            style={{ animationDelay: '0.05s' }}
          >
            <div className="flex items-center">
              {/* Founder Avatar */}
              <div className="w-[26px] h-[26px] bg-[#18181a] border border-white/40 rounded-full p-1 flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-black text-[9px]">
                  <i className="fa-solid fa-user"></i>
                </div>
              </div>
              {/* CA / CS Avatar */}
              <div className="w-[26px] h-[26px] bg-[#18181a] border border-white/40 rounded-full p-1 flex items-center justify-center -ml-2">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-black text-[9px]">
                  <i className="fa-solid fa-user-tie"></i>
                </div>
              </div>
              {/* AI Avatar */}
              <div className="w-[26px] h-[26px] bg-[#18181a] border border-white/40 rounded-full p-1 flex items-center justify-center -ml-2">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-black text-[9px]">
                  <i className="fa-solid fa-bolt"></i>
                </div>
              </div>
            </div>
            <span className="text-[#c4c2c3] text-[clamp(11.5px,1.4vw,13px)] font-medium tracking-wide">
              One workspace. Humans and AI.
            </span>
          </div>

          {/* Solid White Display Headline */}
          <h1 className="headline-responsive text-white mb-[clamp(12px,1.8vh,20px)] select-none">
            <span className="block anim-reveal" style={{ animationDelay: '0.12s' }}>
              Your Company.
            </span>
            <span className="block anim-reveal" style={{ animationDelay: '0.30s' }}>
              Understood.
            </span>
          </h1>

          {/* Subhead */}
          <p
            className="anim-reveal text-[#d0d0d0] text-[clamp(14px,1.8vw,17px)] font-normal leading-[1.55] opacity-85 max-w-[min(560px,92%)] mb-[clamp(18px,2.5vh,28px)]"
            style={{ animationDelay: '0.45s' }}
          >
            Future MCA turns complex company compliance into simple conversations, guided workflows and secure context that AI agents can understand.
          </p>

          {/* CTA Group */}
          <div
            className="anim-reveal flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
            style={{ animationDelay: '0.60s' }}
          >
            <Link
              href={getProtectedUrl('/onboarding')}
              className="w-full sm:w-auto bg-white text-black text-[clamp(13.5px,1.4vw,14.5px)] font-semibold px-8 py-3 rounded-full shadow-[0_0_24px_rgba(255,255,255,0.18)] hover:shadow-[0_0_32px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 hover:scale-[1.02] transition-all inline-flex items-center justify-center"
            >
              Get Started
            </Link>

            <button
              type="button"
              onClick={() => setActiveModal('mcp')}
              className="w-full sm:w-auto text-[#d0d0d0] hover:text-white border border-white/20 hover:border-white/50 hover:bg-white/5 text-[clamp(13px,1.3vw,14px)] font-medium px-5 py-2.5 rounded-full transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span>Explore MCP</span>
            </button>
          </div>

        </main>

        {/* 3. Bottom Product Intelligence Footer */}
        <footer
          className="anim-reveal w-full max-w-[960px] grid grid-cols-2 md:grid-cols-4 gap-[clamp(12px,2.5vw,28px)] pt-[clamp(6px,1vh,12px)]"
          style={{ animationDelay: '0.75s' }}
        >
          
          {/* Capability 1: Start a Company */}
          <Link
            href={getProtectedUrl('/chat?query=I+want+to+start+a+company')}
            className="flex flex-col text-left gap-0.5 group hover:opacity-100 transition-all p-2 -m-2 rounded-xl hover:bg-white/5 cursor-pointer"
            title="Launch Guided Incorporation"
          >
            <span className="display-font text-white text-[clamp(14px,1.6vw,18px)] opacity-90 group-hover:scale-110 transition-transform origin-left">+</span>
            <div className="text-white text-[clamp(12.5px,1.4vw,14px)] font-semibold group-hover:text-white flex items-center gap-1">
              <span>Start a Company</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">&rarr;</span>
            </div>
            <div className="text-[#8e8e8e] group-hover:text-[#a8a8a8] text-[clamp(11px,1.2vw,12px)] leading-tight">Guided from idea to incorporation</div>
          </Link>

          {/* Capability 2: Know What's Due */}
          <Link
            href={getProtectedUrl('/compliance')}
            className="flex flex-col text-left gap-0.5 group hover:opacity-100 transition-all p-2 -m-2 rounded-xl hover:bg-white/5 cursor-pointer"
            title="View Compliance Deadlines & Schedules"
          >
            <span className="display-font text-white text-[clamp(14px,1.6vw,18px)] opacity-90 group-hover:scale-110 transition-transform origin-left">!</span>
            <div className="text-white text-[clamp(12.5px,1.4vw,14px)] font-semibold group-hover:text-white flex items-center gap-1">
              <span>Know What’s Due</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">&rarr;</span>
            </div>
            <div className="text-[#8e8e8e] group-hover:text-[#a8a8a8] text-[clamp(11px,1.2vw,12px)] leading-tight">Compliance explained in plain language</div>
          </Link>

          {/* Capability 3: File With Confidence */}
          <Link
            href={getProtectedUrl('/filings')}
            className="flex flex-col text-left gap-0.5 group hover:opacity-100 transition-all p-2 -m-2 rounded-xl hover:bg-white/5 cursor-pointer"
            title="Open e-Forms & Filing Hub"
          >
            <span className="display-font text-white text-[clamp(14px,1.6vw,18px)] opacity-90 group-hover:scale-110 transition-transform origin-left">&gt;</span>
            <div className="text-white text-[clamp(12.5px,1.4vw,14px)] font-semibold group-hover:text-white flex items-center gap-1">
              <span>File With Confidence</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">&rarr;</span>
            </div>
            <div className="text-[#8e8e8e] group-hover:text-[#a8a8a8] text-[clamp(11px,1.2vw,12px)] leading-tight">Forms, documents and validation in one flow</div>
          </Link>

          {/* Capability 4: Connect Your AI */}
          <Link
            href={getProtectedUrl('/connect-ai')}
            className="flex flex-col text-left gap-0.5 group hover:opacity-100 transition-all p-2 -m-2 rounded-xl hover:bg-white/5 cursor-pointer"
            title="Connect Claude, ChatGPT, Cursor via MCP"
          >
            <span className="display-font text-white text-[clamp(14px,1.6vw,18px)] opacity-90 group-hover:scale-110 transition-transform origin-left">*</span>
            <div className="text-white text-[clamp(12.5px,1.4vw,14px)] font-semibold group-hover:text-white flex items-center gap-1">
              <span>Connect Your AI</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">&rarr;</span>
            </div>
            <div className="text-[#8e8e8e] group-hover:text-[#a8a8a8] text-[clamp(11px,1.2vw,12px)] leading-tight">Secure company context through MCP</div>
          </Link>

        </footer>

      </div>

      {/* ==================================================
         EXPLORE MCP MODAL (Interactive Tools, Steps & Config)
      ================================================== */}
      {activeModal === 'mcp' && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111115] border border-white/20 rounded-3xl w-full max-w-[720px] max-h-[90vh] flex flex-col shadow-2xl relative text-left overflow-hidden"
          >
            
            {/* Modal Header */}
            <div className="p-6 sm:p-7 border-b border-white/10 relative">
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono uppercase tracking-wider text-blue-400 mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Model Context Protocol &bull; Remote JSON-RPC 2.0</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Connect AI Agents to Verified MCA Context
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 leading-relaxed max-w-xl">
                Allow Claude, Cursor, and custom AI assistants to safely query real-time statutory master data, calculate penalty deadlines, and prepare e-Forms.
              </p>

              {/* Navigation Tabs */}
              <div className="flex items-center space-x-2 mt-5 border-b border-white/10 pb-1">
                {[
                  { id: 'tools', label: '1. Available MCP Tools (6)', icon: <Cpu className="w-3.5 h-3.5" /> },
                  { id: 'steps', label: '2. Steps to Connect', icon: <Layers className="w-3.5 h-3.5" /> },
                  { id: 'config', label: '3. Copy Config & Ping', icon: <Terminal className="w-3.5 h-3.5" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setMcpModalTab(tab.id as any)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      mcpModalTab === tab.id
                        ? 'bg-white text-black shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-5 text-xs text-neutral-300 scrollbar-thin scrollbar-thumb-white/10">
              
              {/* TAB 1: AVAILABLE TOOLS */}
              {mcpModalTab === 'tools' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="text-[11px] text-neutral-400 font-mono">
                    All tools use JSON Schema parameter validation and enforce read/write workspace scoping:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {mcpToolsList.map((tool, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <code className="text-xs font-bold text-blue-400 font-mono">
                            {tool.name}
                          </code>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-400 font-mono uppercase">
                            {tool.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          {tool.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: STEPS TO CONNECT */}
              {mcpModalTab === 'steps' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  
                  {/* Step 1 */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-white text-xs">Choose your AI Assistant Client</div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Supports <strong>Claude Web (Custom MCP OAuth 2.1)</strong>, <strong>Claude Desktop</strong>, <strong>Cursor IDE</strong>, <strong>Windsurf</strong>, or any Python/TypeScript MCP Agent.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="space-y-1 w-full">
                      <div className="font-bold text-white text-xs">Copy the Remote MCP Server URL</div>
                      <div className="flex items-center justify-between bg-black/60 border border-white/15 px-3 py-2 rounded-lg font-mono text-[11px] text-neutral-200 mt-1">
                        <span className="truncate">https://mca-portal-ten.vercel.app/api/mcp</span>
                        <button
                          onClick={() => handleCopy('https://mca-portal-ten.vercel.app/api/mcp', 'url')}
                          className="text-neutral-400 hover:text-white ml-2 shrink-0 p-1 flex items-center space-x-1 cursor-pointer"
                        >
                          {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[10px]">{copiedKey === 'url' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-white text-xs">Authorize Workspace Scope</div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Authorize standard scopes (<code className="text-blue-300">companies:read</code>, <code className="text-blue-300">compliance:read</code>, <code className="text-blue-300">filings:draft</code>). External agents only see data explicitly permitted by your account.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      4
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-white text-xs">Execute Live Inquiries in Plain English</div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Ask Claude or Cursor: <em>"What filings are due for Ziggers Pvt Ltd?"</em> or <em>"Draft Form DIR-12 for resigning director John Doe"</em>.
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: CONFIG & PING */}
              {mcpModalTab === 'config' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Claude Desktop Configuration (<code className="text-neutral-400">claude_desktop_config.json</code>)</span>
                    <button
                      onClick={() => handleCopy(claudeConfigJson, 'json')}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white flex items-center space-x-1.5 text-[11px] cursor-pointer"
                    >
                      {copiedKey === 'json' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'json' ? 'Copied Config' : 'Copy JSON'}</span>
                    </button>
                  </div>

                  <pre className="p-3.5 bg-black/70 border border-white/15 rounded-xl font-mono text-[11px] text-blue-300 overflow-x-auto">
                    {claudeConfigJson}
                  </pre>

                  {/* Endpoint Live Ping Tool */}
                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-bold text-white text-xs">Test Live Endpoint Response</div>
                      <div className="text-[11px] text-neutral-400">Sends JSON-RPC 2.0 <code className="text-neutral-300">tools/list</code> request to server</div>
                    </div>
                    
                    <button
                      onClick={handleTestPing}
                      disabled={pingStatus === 'testing'}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      {pingStatus === 'testing' ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          <span>Pinging...</span>
                        </>
                      ) : pingStatus === 'success' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-300" />
                          <span>Active (200 OK)</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Ping Server</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 bg-black/40 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-neutral-400 font-mono">
                Endpoint: <strong className="text-white">/api/mcp</strong> &bull; Protocol: <strong>Model Context Protocol (v1.3)</strong>
              </div>

              <Link
                href={getProtectedUrl('/connect-ai')}
                onClick={() => setActiveModal(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Open Full AI Connection Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
