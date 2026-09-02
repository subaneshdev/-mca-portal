'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';
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
  ShieldCheck,
  FileText, 
  Briefcase, 
  ChevronRight,
  Terminal,
  Check,
  Paperclip,
  ArrowUpIcon,
  LogOut,
  Settings,
  Users,
  ExternalLink,
  Layers,
  FileUp
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PRIMARY_DEMO_COMPANY, PRIMARY_DEMO_DIRECTORS } from '@/lib/services/seedService';
import { CompanyService } from '@/lib/services/companyService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  type?: 'general' | 'action_prepared' | 'compliance_summary' | 'chat_response';
  action?: {
    label: string;
    url: string;
  };
  action_preview?: any;
  tools_used?: string[];
}

export function ChatContent() {
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
    signOut,
    isLoading
  } = useWorkspace();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string>('conv-1');
  const [directorsList, setDirectorsList] = useState<any[]>(PRIMARY_DEMO_DIRECTORS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeCompany = selectedCompany || PRIMARY_DEMO_COMPANY;
  const founderName = profile?.full_name || 'Varun Maya';

  // Live fetch board of directors
  useEffect(() => {
    CompanyService.getCompanyDirectors(activeCompany.cin || 'comp_aeos_001').then(dirs => {
      if (dirs && dirs.length > 0) {
        setDirectorsList(dirs);
      }
    });
  }, [activeCompany, messages]);

  // Seed default recent conversations
  const conversations = [
    { id: 'conv-1', title: 'Director resignation (Rahul Menon)', time: 'Just now', active: activeConversation === 'conv-1' },
    { id: 'conv-2', title: 'Incorporate Aeos Labs (SPICe+)', time: '2 hours ago', active: activeConversation === 'conv-2' },
    { id: 'conv-3', title: 'Annual compliance review', time: 'Yesterday', active: activeConversation === 'conv-3' }
  ];

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle URL query parameter on mount
  useEffect(() => {
    const initialQuery = searchParams.get('query');
    if (initialQuery && !hasStartedChat) {
      handleSendMessage(initialQuery);
    }
  }, [searchParams]);

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || inputMessage;
    if (!messageToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: messageToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customMessage) setInputMessage('');
    setHasStartedChat(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          context: {
            companyName: activeCompany.name,
            cin: activeCompany.cin,
            workspaceId: activeCompany.workspace_id || 'ws_aeos_labs_001'
          }
        })
      });

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'I have processed your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: data.type || 'general',
        action: data.action,
        action_preview: data.action_preview,
        tools_used: data.tools_used
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'I could not connect to the MCA Action Engine. Please check your network or try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFDFC] text-neutral-900 font-sans antialiased overflow-hidden selection:bg-neutral-200">
      
      {/* 1. LEFT SIDEBAR (ChatGPT Style) */}
      <aside className="w-64 border-r border-neutral-200/80 bg-neutral-50/50 flex flex-col justify-between p-3 shrink-0 hidden md:flex">
        <div className="space-y-3">
          {/* Future MCA Logo */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-black text-xs">
                M
              </div>
              <span className="font-bold text-sm tracking-tight text-neutral-900">Future MCA</span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-neutral-200/80 text-neutral-600 px-1.5 py-0.5 rounded">
                AI
              </span>
            </Link>
          </div>

          {/* New Conversation Button */}
          <button
            onClick={() => {
              setMessages([]);
              setHasStartedChat(false);
              setActiveConversation(`conv-${Date.now()}`);
            }}
            className="w-full py-2 px-3 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-900 font-medium text-xs rounded-xl transition-all shadow-xs flex items-center justify-between group"
          >
            <span className="flex items-center space-x-2">
              <Plus className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-900" />
              <span>New conversation</span>
            </span>
            <kbd className="text-[10px] text-neutral-400 font-mono">⌘K</kbd>
          </button>

          {/* Recent Conversations */}
          <div className="space-y-1 pt-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 py-1">
              Recent Workflows
            </div>
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setActiveConversation(c.id);
                  if (c.title.includes('resignation')) {
                    handleSendMessage('My director resigned.');
                  } else if (c.title.includes('Incorporate')) {
                    handleSendMessage('I want to start a company.');
                  } else {
                    handleSendMessage('What are my upcoming deadlines?');
                  }
                }}
                className={cn(
                  "w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-all truncate",
                  c.active ? "bg-neutral-200/60 font-medium text-neutral-900" : "text-neutral-600 hover:bg-neutral-100/70"
                )}
              >
                <div className="flex items-center space-x-2 truncate">
                  <MessageSquare className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{c.title}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Active Companies List */}
          <div className="space-y-1 pt-3 border-t border-neutral-200/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 py-1">
              Active Company
            </div>
            <div className="p-2.5 bg-white border border-neutral-200 rounded-xl shadow-xs space-y-1">
              <div className="flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-neutral-700" />
                <span className="text-xs font-bold text-neutral-900 truncate">Aeos Labs Private Limited</span>
              </div>
              <div className="text-[10px] text-neutral-500 font-mono">U62099TN2026PTCDEMO001</div>
              <div className="flex items-center space-x-1 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span className="text-[10px] font-medium text-amber-700">DIR-12 Resignation Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Founder AI Mode Badge */}
        <div className="space-y-2 pt-3 border-t border-neutral-200/80">
          <div className="w-full p-2 bg-neutral-100 border border-neutral-200/80 rounded-xl text-xs text-neutral-700 flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold text-[11px]">Founder AI Mode</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-neutral-200 shadow-xs">
            <div className="flex items-center space-x-2 truncate">
              <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                {founderName.charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-neutral-900 truncate">{founderName}</div>
                <div className="text-[10px] text-neutral-500 truncate">Managing Director</div>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONVERSATIONAL AREA (ChatGPT Style) */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#FCFCFA] relative">
        
        {/* Top Header Bar */}
        <header className="h-14 border-b border-neutral-200/70 bg-white/70 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-neutral-900">Conversational Workspace</span>
            <span className="text-xs text-neutral-400">•</span>
            <span className="text-xs font-medium text-neutral-600 truncate">Aeos Labs Private Limited</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/actions"
              className="text-xs font-bold text-neutral-700 hover:text-neutral-900 flex items-center space-x-1.5 bg-neutral-100 hover:bg-neutral-200/70 px-3 py-1.5 rounded-lg transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Actions & Approvals</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
          
          {/* Welcome Card if Chat Not Started */}
          {!hasStartedChat && messages.length === 0 && (
            <div className="py-12 text-center space-y-6 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                  Good afternoon, {founderName}.
                </h1>
                <p className="text-sm text-neutral-500">
                  Tell me what you want to do with your company.
                </p>
              </div>

              {/* Quick Action Suggestion Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-4">
                <button
                  onClick={() => handleSendMessage('Add X person as an director create din number ask confirmation and directly add')}
                  className="p-3.5 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-400 rounded-xl transition-all shadow-xs group"
                >
                  <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                    <span>&ldquo;Add X person as Director&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Auto-generate DIN, ask confirmation, and directly add (no DSC needed)
                  </div>
                </button>

                <button
                  onClick={() => handleSendMessage('My director resigned.')}
                  className="p-3.5 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-400 rounded-xl transition-all shadow-xs group"
                >
                  <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                    <span>&ldquo;My director resigned&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Prepare Form DIR-12 for Rahul Menon with 30-day statutory window
                  </div>
                </button>

                <button
                  onClick={() => handleSendMessage('I want to start a company.')}
                  className="p-3.5 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-400 rounded-xl transition-all shadow-xs group"
                >
                  <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                    <span>&ldquo;I want to start a company&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Launch conversational SPICe+ Part A/B incorporation journey
                  </div>
                </button>

                <button
                  onClick={() => handleSendMessage('What are my upcoming statutory deadlines?')}
                  className="p-3.5 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-400 rounded-xl transition-all shadow-xs group"
                >
                  <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                    <span>&ldquo;What deadlines are coming up?&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Check DIR-12, AOC-4, and MGT-7 cutoffs & penalty exposure
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Render Active Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex space-x-3 text-sm",
                msg.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4 text-amber-300" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-2xl rounded-2xl p-4.5 space-y-3",
                  msg.sender === 'user'
                    ? "bg-neutral-900 text-white font-medium"
                    : "bg-white border border-neutral-200/90 text-neutral-900 shadow-xs"
                )}
              >
                {/* Tools Used Pill */}
                {msg.tools_used && msg.tools_used.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pb-2 border-b border-neutral-100">
                    {msg.tools_used.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md flex items-center space-x-1"
                      >
                        <Terminal className="w-2.5 h-2.5 text-neutral-400" />
                        <span>{t}()</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Message Body */}
                <div className="prose prose-neutral prose-sm max-w-none text-xs leading-relaxed whitespace-pre-line">
                  {msg.text}
                </div>

                {/* Structured Action Preview Card */}
                {msg.action && (
                  <div className="pt-2 border-t border-neutral-100 space-y-2.5">
                    <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          State: Awaiting User Confirmation
                        </span>
                        <span className="text-[10px] font-bold text-neutral-500">Zero Silent Execution</span>
                      </div>
                      <div className="text-xs font-bold text-neutral-900">
                        {msg.action.label}
                      </div>
                      <p className="text-[11px] text-neutral-600">
                        Review the complete statutory form draft, document checklist, and authorize isolated digital signing.
                      </p>
                    </div>

                    <Link
                      href={msg.action.url}
                      className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 text-center"
                    >
                      <span>{msg.action.label} &rarr;</span>
                    </Link>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-neutral-200 text-neutral-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  {founderName.charAt(0)}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex space-x-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
              <div className="p-3 bg-white border border-neutral-200 rounded-2xl flex items-center space-x-1.5 text-xs text-neutral-500 shadow-xs">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 text-[11px] font-mono">Verifying MCA statutory rules...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Fixed Bottom */}
        <div className="p-4 md:p-6 border-t border-neutral-200/80 bg-white/80 backdrop-blur-md shrink-0">
          <div className="max-w-3xl mx-auto relative bg-white border border-neutral-300 focus-within:border-neutral-900 rounded-2xl shadow-sm transition-all p-2">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me what you want to do with your company..."
              rows={2}
              className="w-full resize-none border-0 focus-visible:ring-0 text-xs text-neutral-900 placeholder:text-neutral-400 p-2 outline-none shadow-none"
            />

            <div className="flex items-center justify-between pt-1 px-1 border-t border-neutral-100">
              <div className="flex items-center space-x-2 text-[11px] text-neutral-500">
                <span className="inline-flex items-center space-x-1 font-mono text-[10px] bg-neutral-100 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Zero Silent Execution Active</span>
                </span>
              </div>

              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                size="sm"
                className="bg-neutral-900 hover:bg-black text-white rounded-xl font-bold text-xs h-8 px-3"
              >
                <span>Send</span>
                <ArrowUpIcon className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>

      </main>

      {/* 3. RIGHT CONTEXT PANEL (Linear / Stripe Style) */}
      <aside className="w-80 border-l border-neutral-200/80 bg-neutral-50/40 p-5 shrink-0 hidden lg:flex flex-col justify-between overflow-y-auto space-y-6">
        <div className="space-y-5">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Active Company Context
            </div>
            <h2 className="text-sm font-black text-neutral-900 mt-1">
              Aeos Labs Private Limited
            </h2>
            <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
              CIN: U62099TN2026PTCDEMO001
            </div>
          </div>

          {/* Pending Action Card */}
          <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                High Priority
              </span>
              <span className="text-[10px] font-bold text-amber-700">Form DIR-12</span>
            </div>
            <div className="text-xs font-bold text-neutral-900">
              Director Resignation (Rahul Menon)
            </div>
            <p className="text-[11px] text-neutral-600 leading-tight">
              Effective date: 25 August 2026. Action draft prepared in Actions Hub.
            </p>
            <Link
              href="/actions/act_dir_demo_001"
              className="block w-full py-1.5 bg-neutral-900 hover:bg-black text-white text-center font-bold text-[11px] rounded-lg transition-all"
            >
              Review Action Draft &rarr;
            </Link>
          </div>

          {/* Board of Directors */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Board of Directors ({directorsList.length})
            </div>
            <div className="space-y-2">
              {directorsList.map((d: any, idx: number) => {
                const isResigned = d.status === 'RESIGNED';
                return (
                  <div 
                    key={d.din || idx} 
                    className={cn(
                      "p-2.5 bg-white border rounded-xl space-y-0.5",
                      isResigned ? "border-amber-300" : "border-neutral-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900">{d.full_name}</span>
                      <span className={cn(
                        "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded",
                        isResigned 
                          ? "bg-amber-100 text-amber-800" 
                          : d.designation?.includes('Managing') 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-blue-100 text-blue-800"
                      )}>
                        {isResigned ? 'Resigned' : d.designation || 'Director'}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      DIN: {d.din} | {isResigned ? 'Cessation Filed' : 'Active'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Registered Office */}
          <div className="space-y-1.5 text-xs text-neutral-600">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Registered Office
            </div>
            <p className="text-[11px] leading-relaxed">
              Level 4, IITM Research Park, Kanagam Road, Taramani, Chennai, Tamil Nadu – 600113
            </p>
          </div>
        </div>

        {/* Security Assurance Badge */}
        <div className="p-3 bg-neutral-100/80 border border-neutral-200 rounded-xl text-[10px] text-neutral-500 space-y-1">
          <div className="font-bold text-neutral-800 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero Credential Exposure</span>
          </div>
          <div>DSC PINs, tokens & passwords are never accessible to AI. Authorization occurs in browser sandbox.</div>
        </div>
      </aside>

    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs font-mono">Loading Future MCA Conversational Workspace...</div>}>
      <ChatContent />
    </Suspense>
  );
}
