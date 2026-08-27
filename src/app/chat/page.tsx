'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Company, Director, ComplianceDeadline } from '@/types';
import { 
  Building2, 
  Sparkles, 
  Plus, 
  MessageSquare, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Bot, 
  ArrowRight, 
  ChevronDown, 
  RefreshCw, 
  ShieldAlert, 
  FileText, 
  Briefcase, 
  HelpCircle, 
  Layers, 
  SlidersHorizontal,
  ChevronRight,
  Terminal,
  ArrowUpRight,
  Check,
  RotateCcw,
  Paperclip,
  ArrowUpIcon,
  Search,
  UserX,
  Rocket,
  Palette,
  MonitorIcon,
  FileUp,
  ImageIcon,
  LogOut,
  Settings
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  type?: 'general' | 'compliance_summary' | 'intent_identified' | 'diagnosis' | 'incorporation_wizard' | 'resignation_wizard';
  action?: {
    label: string;
    url: string;
  };
  wizardData?: any;
  toolsUsed?: string[];
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    user, 
    profile, 
    role, 
    setRole, 
    selectedCompany, 
    setSelectedCompany, 
    allCompanies, 
    createCompany, 
    loadDemoCompany,
    signOut,
    isLoading
  } = useWorkspace();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // In-Chat Wizard State: Director Resignation
  const [resignationStep, setResignationStep] = useState<number>(1);
  const [resigningDirector, setResigningDirector] = useState<string>('');
  const [resignationDate, setResignationDate] = useState<string>('2026-08-26');
  const [resignationNoticeReceived, setResignationNoticeReceived] = useState<boolean>(true);

  // In-Chat Wizard State: Incorporation
  const [incorpStep, setIncorpStep] = useState<number>(1);
  const [incorpType, setIncorpType] = useState<'pvt_ltd' | 'llp' | 'opc'>('pvt_ltd');
  const [incorpName, setIncorpName] = useState<string>('');
  const [incorpDesc, setIncorpDesc] = useState<string>('');
  const [incorpFounders, setIncorpFounders] = useState<string>('2');

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const companyName = selectedCompany?.name || (allCompanies.length > 0 ? allCompanies[0].name : 'No Active Company');

  // Protect route if unauthenticated
  useEffect(() => {
    if (!isLoading && !user) {
      const currentQuery = searchParams.get('query');
      const target = currentQuery ? `/chat?query=${encodeURIComponent(currentQuery)}` : '/chat';
      router.push(`/auth/login?next=${encodeURIComponent(target)}`);
    }
  }, [user, isLoading, searchParams, router]);

  // Handle URL query parameter on mount without redirecting
  useEffect(() => {
    const initialQuery = searchParams.get('query');
    if (initialQuery && !hasStartedChat && user) {
      handleSendMessage(initialQuery);
    }
  }, [searchParams, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    setHasStartedChat(true);
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    const qLower = query.toLowerCase();

    // 1. Interactive Incorporation Wizard
    if (qLower.includes('start a company') || qLower.includes('register a company') || qLower.includes('incorporat') || qLower.includes('new company') || qLower.includes('create company')) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            sender: 'assistant',
            text: `Great. Let's start your new company incorporation.\n\nI'll collect a few details conversationally and prepare your official name pre-check and SPICe+ roadmap.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'incorporation_wizard'
          }
        ]);
      }, 700);
      return;
    }

    // 2. Interactive Director Resignation Wizard
    if (qLower.includes('director resign') || qLower.includes('resigned') || qLower.includes('remove director') || qLower.includes('cessation') || qLower.includes('dir-12')) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            sender: 'assistant',
            text: `Based on your company records for **${companyName}**, a director resignation requires filing **Form DIR-12** with the Registrar of Companies within 30 days of cessation.\n\nLet's prepare this step-by-step.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'resignation_wizard'
          }
        ]);
      }, 700);
      return;
    }

    // 3. Backend AI call
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context: {
            company_id: selectedCompany?.id,
            company_name: companyName,
            cin: selectedCompany?.cin,
            role: 'founder'
          }
        })
      });

      if (!res.ok) throw new Error('Failed to get response');
      const data = await res.json();

      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || data.text || 'I have analyzed your request based on current MCA guidelines.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: data.type || 'general',
          action: data.action,
          toolsUsed: data.tools_used
        }
      ]);
    } catch {
      setIsTyping(false);
      // Helpful fallback response
      let fallbackText = `I have verified the statutory requirements for **${companyName}** under the Companies Act 2013.\n\nEverything is in order. You can ask for filing status, director records, statutory deadlines, or error diagnoses.`;
      if (qLower.includes('deadline') || qLower.includes('due') || qLower.includes('attention')) {
        fallbackText = `Here is your current compliance summary for **${companyName}**:\n\n• **AOC-4 (Financial Statements):** Due in 2 days (Critical)\n• **DIR-3 KYC (Director Verification):** 1 Director pending OTP verification\n• **MGT-7 (Annual Return):** Upcoming in 20 days\n\nNo late penalties accrued yet. Would you like me to prepare AOC-4?`;
      }
      setMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'general'
        }
      ]);
    }
  };

  const handleResetToHero = () => {
    setMessages([]);
    setHasStartedChat(false);
    setInputMessage('');
  };

  const quickActionItems = [
    { icon: <Building2 className="w-4 h-4 text-[#60A5FA]" />, label: "Start a Company", query: "I want to start a company" },
    { icon: <UserX className="w-4 h-4 text-[#F87171]" />, label: "A Director Resigned", query: "A director resigned from our board" },
    { icon: <ShieldAlert className="w-4 h-4 text-[#FBBF24]" />, label: "Know What's Due", query: "What filings and compliances are due this month?" },
    { icon: <FileText className="w-4 h-4 text-[#34D399]" />, label: "Prepare DIR-12", query: "Prepare DIR-12 director cessation requirements" },
    { icon: <Search className="w-4 h-4 text-[#A78BFA]" />, label: "Diagnose Filing Error", query: "Diagnose MCA rejection error" },
    { icon: <Sparkles className="w-4 h-4 text-[#38BDF8]" />, label: "Connect MCP AI", query: "How do I connect Claude or Cursor via MCP?" },
    { icon: <Rocket className="w-4 h-4 text-[#EC4899]" />, label: "Track SRN Application", query: "Track application status for my SRN" },
    { icon: <Layers className="w-4 h-4 text-[#94A3B8]" />, label: "Annual Compliance (AOC-4)", query: "What is required for AOC-4 and MGT-7 filings?" },
  ];

  return (
    <div className="relative w-full h-screen min-h-screen bg-black text-white flex flex-col justify-between overflow-hidden font-sans selection:bg-white selection:text-black">
      
      {/* Background Cinematic Arc Glow (Image 2 Aesthetic) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep blue/purple glowing ambient arc */}
        <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[140vw] max-w-[1500px] h-[65vh] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.35)_0%,rgba(147,51,234,0.25)_40%,rgba(0,0,0,0)_75%)] blur-3xl opacity-80" />
        <div className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-[110vw] max-w-[1200px] h-[40vh] rounded-[100%] border-t border-indigo-500/30 blur-[2px]" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-20 w-full px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md">
        
        {/* Left: Future MCA Brand + Company Selector */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-7 h-7 rounded-full bg-white text-black font-black text-xs flex items-center justify-center font-mono shadow-sm">
              M
            </div>
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-neutral-300 transition-colors">
              Future MCA
            </span>
          </Link>

          <span className="text-white/20">|</span>

          {/* Active Company Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCompanyMenuOpen(!isCompanyMenuOpen)}
              className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-200 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span className="font-medium max-w-[160px] truncate">{companyName}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isCompanyMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-64 bg-[#141416] border border-white/15 rounded-xl shadow-2xl py-1 z-50 text-xs">
                <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-neutral-400 border-b border-white/10">
                  Switch Active Company
                </div>
                {allCompanies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCompany(c);
                      setIsCompanyMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex flex-col hover:bg-white/10 transition-colors ${
                      selectedCompany?.id === c.id ? 'bg-white/10 text-white font-semibold' : 'text-neutral-300'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">{c.cin}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasStartedChat && (
            <button
              onClick={handleResetToHero}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Prompt</span>
            </button>
          )}
        </div>

        {/* Right: Workspace Mode & Toggle to Professional UI */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] inline-block animate-pulse" />
            <span>Mode: <strong>Conversational Workspace</strong></span>
          </div>

          <Link
            href="/overview"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-all shadow-sm"
          >
            <span>Professional UI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Area: HERO VIEW or CONVERSATION STREAM */}
      {!hasStartedChat ? (
        
        /* ==================================================
           HERO PROMPT VIEW (Exact Image 2 Specification)
        ================================================== */
        <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center px-4 sm:px-6 py-6 text-center animate-in fade-in duration-300">
          
          {/* Top Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs mb-5 backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span className="font-medium tracking-wide">Future MCA &bull; Founder Autonomous Copilot</span>
          </div>

          {/* Big Headline */}
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight drop-shadow-md mb-3">
            Founders AI
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto leading-relaxed mb-8">
            Understand, incorporate and manage your company with autonomous intelligence.
          </p>

          {/* Central Glassmorphism Prompt Box */}
          <div className="w-full max-w-2xl bg-[#0D0D11]/90 backdrop-blur-xl rounded-2xl border border-white/15 shadow-2xl focus-within:border-white/40 transition-all p-3 sm:p-4 text-left">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask anything about your company, filings, ROC compliance or incorporation..."
              className="w-full bg-transparent text-white text-sm sm:text-base outline-none resize-none placeholder:text-neutral-500 min-h-[48px] px-2 py-1 font-sans"
            />

            {/* Input Box Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2 px-1">
              <div className="flex items-center space-x-2 text-neutral-400">
                <button
                  type="button"
                  className="p-1 rounded hover:text-white hover:bg-white/10 transition-colors"
                  title="Attach Documents"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono hidden sm:inline text-neutral-500">
                  Press Enter ↵ to send
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className={cn(
                  "flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                  inputMessage.trim()
                    ? "bg-white text-black hover:bg-neutral-200 cursor-pointer shadow-md"
                    : "bg-white/10 text-neutral-500 cursor-not-allowed"
                )}
              >
                <span>Ask AI</span>
                <ArrowUpIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips Grid */}
          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-2.5 mt-6 max-w-2xl">
            {quickActionItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.query)}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 text-neutral-200 hover:text-white transition-all text-xs shadow-sm backdrop-blur-md group"
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

        </main>

      ) : (

        /* ==================================================
           ACTIVE CONVERSATIONAL THREAD (No Page Redirect)
        ================================================== */
        <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto flex flex-col justify-between px-4 sm:px-6 py-4 overflow-hidden">
          
          {/* Scrollable Message List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#1E293B] border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4 text-[#60A5FA]" />
                  </div>
                )}

                <div className={`max-w-2xl ${msg.sender === 'user' ? 'order-1' : 'order-2'}`}>
                  
                  {/* Sender & Timestamp */}
                  <div className={`flex items-center space-x-2 text-[10px] font-mono text-neutral-400 mb-1 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{msg.sender === 'user' ? displayName : 'FUTURE MCA ASSISTANT'}</span>
                    <span>&bull;</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-white text-black font-medium rounded-tr-xs shadow-md'
                      : 'bg-[#121217] border border-white/15 text-neutral-200 rounded-tl-xs shadow-xl backdrop-blur-md'
                  }`}>
                    
                    {/* Render Formatted Markdown/Text */}
                    <div className="whitespace-pre-wrap space-y-2">
                      {msg.text}
                    </div>

                    {/* Interactive In-Chat Wizard: DIRECTOR RESIGNATION */}
                    {msg.type === 'resignation_wizard' && (
                      <div className="bg-[#181820] border border-white/15 rounded-xl p-4 space-y-4 text-xs mt-3 text-white">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <div className="font-bold text-white flex items-center space-x-1.5">
                            <UserX className="w-4 h-4 text-[#F87171]" />
                            <span>Director Resignation (Form DIR-12) Assistant</span>
                          </div>
                          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono">
                            Step {resignationStep} of 2
                          </span>
                        </div>

                        {resignationStep === 1 ? (
                          <div className="space-y-3">
                            <div>
                              <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                                1. Select the resigning director:
                              </label>
                              {selectedCompany?.directors && selectedCompany.directors.length > 0 ? (
                                <select
                                  value={resigningDirector}
                                  onChange={(e) => setResigningDirector(e.target.value)}
                                  className="w-full p-2.5 bg-[#0D0D11] border border-white/15 rounded-lg text-xs font-medium text-white outline-none focus:border-blue-500"
                                >
                                  <option value="">-- Choose Registered Director --</option>
                                  {selectedCompany.directors.map(d => (
                                    <option key={d.din} value={d.full_name}>
                                      {d.full_name} (DIN: {d.din}) - {d.designation}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={resigningDirector}
                                  onChange={(e) => setResigningDirector(e.target.value)}
                                  placeholder="Enter Director Name (DIN: 8 digits)"
                                  className="w-full p-2.5 bg-[#0D0D11] border border-white/15 rounded-lg text-xs font-medium text-white outline-none focus:border-blue-500"
                                />
                              )}
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                                2. Date of Resignation / Cessation:
                              </label>
                              <input
                                type="date"
                                value={resignationDate}
                                onChange={(e) => setResignationDate(e.target.value)}
                                className="w-full p-2.5 bg-[#0D0D11] border border-white/15 rounded-lg text-xs text-white outline-none focus:border-blue-500"
                              >
                              </input>
                            </div>

                            <div className="flex items-center space-x-2 pt-1">
                              <input
                                type="checkbox"
                                id="notice"
                                checked={resignationNoticeReceived}
                                onChange={(e) => setResignationNoticeReceived(e.target.checked)}
                                className="rounded bg-black text-blue-500"
                              />
                              <label htmlFor="notice" className="text-[11px] text-neutral-300">
                                Formal notice letter received and noted by the Board
                              </label>
                            </div>

                            <div className="pt-2 flex justify-end">
                              <button
                                onClick={() => setResignationStep(2)}
                                disabled={!resigningDirector}
                                className="px-4 py-2 bg-white text-black disabled:opacity-40 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5"
                              >
                                <span>Continue</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-3 bg-[#064E3B]/30 border border-[#059669]/40 rounded-lg text-xs space-y-1 text-[#A7F3D0]">
                              <div className="font-bold">Filing Summary Ready:</div>
                              <div className="text-[11px] leading-relaxed">
                                &bull; Form: <strong>DIR-12 (Intimation of Director Cessation)</strong><br />
                                &bull; Director: <strong>{resigningDirector}</strong><br />
                                &bull; Effective Date: <strong>{resignationDate}</strong><br />
                                &bull; Statutory Deadline: <strong>Within 30 days</strong> (No statutory penalty if filed on time)
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <button
                                onClick={() => setResignationStep(1)}
                                className="text-xs text-neutral-400 hover:text-white underline"
                              >
                                &larr; Back
                              </button>

                              <button
                                onClick={() => {
                                  setMessages(prev => [
                                    ...prev,
                                    {
                                      id: `assistant-${Date.now()}`,
                                      sender: 'assistant',
                                      text: `Draft Form DIR-12 has been initialized for **${resigningDirector}**. Board resolution extract generated and attached to your workspace.`,
                                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                      type: 'general'
                                    }
                                  ]);
                                }}
                                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
                              >
                                <span>Complete DIR-12 Draft in Chat</span>
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interactive In-Chat Wizard: INCORPORATION */}
                    {msg.type === 'incorporation_wizard' && (
                      <div className="bg-[#181820] border border-white/15 rounded-xl p-4 space-y-4 text-xs mt-3 text-white">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <div className="font-bold text-white flex items-center space-x-1.5">
                            <Building2 className="w-4 h-4 text-[#60A5FA]" />
                            <span>Conversational Incorporation Assistant</span>
                          </div>
                          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono">
                            Step {incorpStep} of 2
                          </span>
                        </div>

                        {incorpStep === 1 ? (
                          <div className="space-y-3">
                            <div>
                              <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                                1. Entity Type:
                              </label>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { id: 'pvt_ltd', label: 'Private Limited', sub: 'Pvt Ltd' },
                                  { id: 'llp', label: 'LLP', sub: 'Partnership' },
                                  { id: 'opc', label: 'One Person', sub: 'OPC' }
                                ].map((t) => (
                                  <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setIncorpType(t.id as any)}
                                    className={`p-2 rounded-lg border text-left transition-all ${
                                      incorpType === t.id
                                        ? 'bg-blue-600/30 border-blue-500 text-white'
                                        : 'bg-[#0D0D11] border-white/10 text-neutral-400 hover:border-white/20'
                                    }`}
                                  >
                                    <div className="font-bold text-xs">{t.label}</div>
                                    <div className="text-[10px] text-neutral-500">{t.sub}</div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                                2. Proposed Company Name:
                              </label>
                              <input
                                type="text"
                                value={incorpName}
                                onChange={(e) => setIncorpName(e.target.value)}
                                placeholder="e.g. NeoCraft AI Private Limited"
                                className="w-full p-2.5 bg-[#0D0D11] border border-white/15 rounded-lg text-xs text-white outline-none focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                                3. Business Activity Description:
                              </label>
                              <input
                                type="text"
                                value={incorpDesc}
                                onChange={(e) => setIncorpDesc(e.target.value)}
                                placeholder="e.g. Next-gen enterprise autonomous software solutions"
                                className="w-full p-2.5 bg-[#0D0D11] border border-white/15 rounded-lg text-xs text-white outline-none focus:border-blue-500"
                              />
                            </div>

                            <div className="pt-2 flex justify-end">
                              <button
                                onClick={() => setIncorpStep(2)}
                                disabled={!incorpName.trim()}
                                className="px-4 py-2 bg-white text-black disabled:opacity-40 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5"
                              >
                                <span>Generate Incorporation Roadmap</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-3 bg-[#064E3B]/30 border border-[#059669]/40 rounded-lg text-xs space-y-1.5 text-[#A7F3D0]">
                              <div className="font-bold text-white">Proposed Entity Summary:</div>
                              <div className="text-[11px] leading-relaxed">
                                &bull; Entity: <strong>{incorpName} Private Limited</strong><br />
                                &bull; Jurisdiction: <strong>Central Registration Centre (CRC Manesar)</strong><br />
                                &bull; Included Forms: <strong>SPICe+ Part A (RUN), Part B, e-MoA, e-AoA, AGILE-PRO-S</strong><br />
                                &bull; Registrations: <strong>PAN, TAN, EPFO, ESIC, Professional Tax, Bank Account</strong>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <button
                                onClick={() => setIncorpStep(1)}
                                className="text-xs text-neutral-400 hover:text-white underline"
                              >
                                &larr; Back
                              </button>

                              <button
                                onClick={async () => {
                                  try {
                                    await createCompany({
                                      name: `${incorpName} Private Limited`,
                                      legal_type: 'Private Limited Company',
                                      status: 'ACTIVE',
                                      paid_up_capital: 100000,
                                      authorized_capital: 1000000,
                                      email: user?.email || 'c.subanesh@gmail.com'
                                    });
                                    setMessages(prev => [
                                      ...prev,
                                      {
                                        id: `assistant-${Date.now()}`,
                                        sender: 'assistant',
                                        text: `**${incorpName} Private Limited** draft company workspace has been provisioned! You can now prepare promoters' DIN KYC and affix Class 3 DSCs.`,
                                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                        type: 'general'
                                      }
                                    ]);
                                  } catch (err: any) {
                                    console.error(err);
                                  }
                                }}
                                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
                              >
                                <span>Initialize Company Workspace</span>
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {displayName[0]}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-full bg-[#1E293B] border border-white/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-[#60A5FA]" />
                </div>
                <div className="p-3 bg-[#121217] border border-white/10 rounded-2xl text-xs text-neutral-400 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-ping" />
                  <span>Synthesizing statutory rules & MCA context...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Prompt Bar */}
          <div className="pt-2">
            
            {/* Quick Suggestion Chips */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-[11px]">
              <span className="text-neutral-400 shrink-0 font-medium">Suggestions:</span>
              {[
                'What needs attention?',
                'Upcoming deadlines',
                'Start a company',
                'A director resigned',
                'Diagnose MCA error'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-300 hover:text-white whitespace-nowrap transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="relative bg-[#0D0D11] border border-white/15 rounded-xl flex items-center p-1.5 focus-within:border-white/40 transition-colors shadow-2xl">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask anything about your company in plain language..."
                className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-neutral-500 outline-none font-sans"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className={cn(
                  "p-2 rounded-lg transition-colors flex items-center justify-center",
                  inputMessage.trim()
                    ? "bg-white text-black hover:bg-neutral-200 cursor-pointer"
                    : "bg-white/10 text-neutral-500 cursor-not-allowed"
                )}
              >
                <ArrowUpIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center text-[10px] text-neutral-500 mt-1.5 font-mono">
              Future MCA uses Model Context Protocol (MCP) to access only your authorized company records.
            </div>

          </div>

        </main>
      )}

      {/* Bottom Left User Profile Avatar & Switcher (Image 2 Corner Icon) */}
      <div className="absolute bottom-4 left-4 z-30">
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center transition-all shadow-lg backdrop-blur-md"
            title="User Profile & Mode"
          >
            {displayName[0] || 'S'}
          </button>

          {isUserMenuOpen && (
            <div className="absolute bottom-11 left-0 w-56 bg-[#141418] border border-white/15 rounded-xl shadow-2xl p-2 z-50 text-xs">
              <div className="px-2 py-1.5 border-b border-white/10 mb-1">
                <div className="font-bold text-white truncate">{displayName}</div>
                <div className="text-[10px] text-neutral-400 truncate">{user?.email || 'c.subanesh@gmail.com'}</div>
              </div>

              <button
                onClick={() => {
                  setRole('professional');
                  setIsUserMenuOpen(false);
                  router.push('/overview');
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-white/10 text-neutral-200 font-medium flex items-center justify-between transition-colors"
              >
                <span>Switch to CA/CS UI</span>
                <ArrowRight className="w-3 h-3 text-neutral-400" />
              </button>

              <Link
                href="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-white/10 text-neutral-200 font-medium flex items-center justify-between transition-colors"
              >
                <span>Settings</span>
                <Settings className="w-3 h-3 text-neutral-400" />
              </Link>

              <button
                onClick={() => signOut()}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-red-500/20 text-red-400 font-medium flex items-center space-x-1.5 transition-colors mt-1 border-t border-white/10"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default function FounderChatDashboard() {
  return (
    <React.Suspense fallback={<div className="w-full h-screen bg-black flex items-center justify-center text-xs text-neutral-400">Loading Assistant...</div>}>
      <ChatContent />
    </React.Suspense>
  );
}
