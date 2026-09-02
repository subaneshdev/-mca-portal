"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  FileUp,
  MonitorIcon,
  CircleUserRound,
  ArrowUpIcon,
  Paperclip,
  Code2,
  Palette,
  Layers,
  Rocket,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Bot,
  User,
  Plus,
  ArrowRight,
  RefreshCw,
  Building2
} from "lucide-react";
import { PRIMARY_DEMO_COMPANY } from "@/lib/services/seedService";
import { CompanyService } from "@/lib/services/companyService";

interface AutoResizeProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  type?: "general" | "action_prepared" | "compliance_summary" | "chat_response";
  action?: {
    label: string;
    url: string;
  };
  action_preview?: any;
  tools_used?: string[];
}

interface QuickActionItem {
  icon: React.ReactNode;
  label: string;
  query?: string;
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border-neutral-700/80 bg-black/60 backdrop-blur-md text-neutral-200 hover:text-white hover:bg-neutral-800 hover:border-neutral-500 transition-all text-xs py-1.5 px-3.5 h-auto shadow-sm cursor-pointer"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  );
}

export function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedCompany, profile, signOut } = useWorkspace();

  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 160,
  });

  const activeCompany = selectedCompany || PRIMARY_DEMO_COMPANY;
  const founderName = profile?.full_name || "Varun Maya";

  // Auto-scroll on new messages
  useEffect(() => {
    if (hasStartedChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, hasStartedChat]);

  // Handle URL query parameter on mount
  useEffect(() => {
    const initialQuery = searchParams.get("query");
    if (initialQuery && !hasStartedChat) {
      handleSendMessage(initialQuery);
    }
  }, [searchParams]);

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || inputMessage;
    if (!messageToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: messageToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    adjustHeight(true);
    setHasStartedChat(true);
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          context: {
            companyName: activeCompany.name,
            cin: activeCompany.cin,
            workspaceId: activeCompany.workspace_id || "ws_aeos_labs_001",
          },
        }),
      });

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: data.text || "I have processed your request.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: data.type || "general",
        action: data.action,
        action_preview: data.action_preview,
        tools_used: data.tools_used,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "assistant",
          text: "I could not connect to the MCA Action Engine. Please check your network or try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConfirmAction = async (actionId: string, actionPreview: any) => {
    setExecutingActionId(actionId);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "confirm and directly add",
          context: {
            companyName: activeCompany.name,
            cin: activeCompany.cin,
            workspaceId: activeCompany.workspace_id || "ws_aeos_labs_001",
          },
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-conf-${Date.now()}`,
          sender: "assistant",
          text: data.text || `Action ${actionId} successfully executed!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "assistant",
          text: "Error executing action. Please try again or check the Actions Hub.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setExecutingActionId(null);
    }
  };

  const quickActions: QuickActionItem[] = [
    { icon: <CircleUserRound className="w-4 h-4 text-emerald-400" />, label: "Add X person as Director", query: "Add X person as an director create din number ask confirmation and directly add" },
    { icon: <FileUp className="w-4 h-4 text-amber-400" />, label: "My director resigned", query: "My director resigned." },
    { icon: <Building2 className="w-4 h-4 text-blue-400" />, label: "I want to start a company", query: "I want to start a company." },
    { icon: <MonitorIcon className="w-4 h-4 text-purple-400" />, label: "What deadlines are coming up?", query: "What are my upcoming statutory deadlines?" },
    { icon: <Code2 className="w-4 h-4 text-cyan-400" />, label: "Generate Code", query: "How do I integrate the MCA MCP server with Claude or Cursor?" },
    { icon: <Rocket className="w-4 h-4 text-pink-400" />, label: "Launch App", query: "Check company incorporation status and active filings" },
    { icon: <Layers className="w-4 h-4 text-indigo-400" />, label: "UI Components", query: "List verified master data for Aeos Labs Private Limited" },
    { icon: <Palette className="w-4 h-4 text-orange-400" />, label: "Theme Ideas", query: "Diagnose MCA rejection error codes" },
  ];

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center flex flex-col items-center justify-between text-white font-sans overflow-hidden"
      style={{
        backgroundImage: "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png')",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs pointer-events-none z-0" />

      {/* Sleek Minimal Top Navigation Bar */}
      <header className="relative z-10 w-full h-14 px-4 sm:px-8 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold text-xs group-hover:bg-white/20 transition-all">
              M
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">Ruixen AI</span>
          </Link>
          <span className="text-white/30 text-xs hidden sm:inline">•</span>
          <span className="text-xs text-neutral-300 font-medium hidden sm:inline truncate">
            {activeCompany.name}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/actions"
            className="text-xs font-medium text-neutral-200 hover:text-white flex items-center space-x-1.5 bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5 rounded-lg transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Actions & Approvals</span>
          </Link>

          {hasStartedChat && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMessages([]);
                setHasStartedChat(false);
              }}
              className="h-8 text-xs border-white/20 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>New Chat</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Center Area */}
      {!hasStartedChat ? (
        /* 1. Welcome Centered Title Section (Ruixen Moon Style) */
        <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-2xl px-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs mb-4 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Founder AI &bull; Autonomous Corporate Copilot</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-semibold text-white tracking-tight drop-shadow-md">
              Ruixen AI
            </h1>
            <p className="mt-3 text-sm sm:text-base text-neutral-200 max-w-xl mx-auto leading-relaxed">
              Build something amazing — just start typing below.
            </p>
          </div>
        </div>
      ) : (
        /* 2. Scrollable Active Chat Stream */
        <div className="relative z-10 flex-1 w-full overflow-y-auto px-4 sm:px-8 py-6 space-y-4 max-w-4xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-3 w-full",
                msg.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.sender === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4 text-cyan-300" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-2xl rounded-2xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed backdrop-blur-xl border shadow-xl transition-all",
                  msg.sender === "user"
                    ? "bg-blue-600/80 border-blue-400/40 text-white ml-auto"
                    : "bg-black/70 border-neutral-700/80 text-neutral-100"
                )}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                {/* Action Card Preview */}
                {msg.action && (
                  <div className="mt-4 p-4 rounded-xl bg-black/60 border border-neutral-700/90 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded">
                        Action Draft Prepared
                      </span>
                      <span className="text-neutral-400 text-[11px]">Zero Silent Execution</span>
                    </div>

                    <div className="text-sm font-bold text-white">{msg.action.label}</div>

                    {msg.action_preview?.payload && (
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-neutral-300 space-y-1">
                        {msg.action_preview.payload.director_name && (
                          <div>Director: <span className="text-white font-bold">{msg.action_preview.payload.director_name}</span></div>
                        )}
                        {msg.action_preview.payload.din && (
                          <div>DIN: <span className="text-cyan-400 font-bold">{msg.action_preview.payload.din}</span></div>
                        )}
                        {msg.action_preview.authorization_required === false && (
                          <div className="text-emerald-400 font-semibold">DSC: Not Required (Direct Addition)</div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.action_preview?.action_id && msg.action_preview?.authorization_required === false ? (
                        <Button
                          onClick={() => handleConfirmAction(msg.action_preview.action_id, msg.action_preview)}
                          disabled={executingActionId === msg.action_preview.action_id}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                        >
                          {executingActionId === msg.action_preview.action_id ? "Executing..." : "Confirm & Directly Add"}
                        </Button>
                      ) : null}

                      <Link
                        href={msg.action.url}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all"
                      >
                        <span>Review in Actions Hub</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-md">
                  {founderName.charAt(0)}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-cyan-300 animate-pulse" />
              </div>
              <div className="p-3.5 bg-black/70 border border-neutral-700/80 rounded-2xl backdrop-blur-md text-xs text-neutral-300 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 font-mono">Processing corporate request...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Box Section (Ruixen Moon Style) */}
      <div className={cn("relative z-10 w-full max-w-3xl px-4 transition-all duration-300", !hasStartedChat ? "mb-[10vh] sm:mb-[16vh]" : "mb-4")}>
        <div className="relative bg-black/60 backdrop-blur-md rounded-xl border border-neutral-700 shadow-2xl focus-within:border-neutral-500 transition-colors">
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your request..."
            className={cn(
              "w-full px-4 py-3 resize-none border-none",
              "bg-transparent text-white text-sm",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-neutral-400 min-h-[48px]"
            )}
            style={{ overflow: "hidden" }}
          />

          {/* Footer Buttons */}
          <div className="flex items-center justify-between p-3 border-t border-white/10">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-neutral-700 h-8 w-8 rounded-lg cursor-pointer"
              title="Attach Document"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                  inputMessage.trim()
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                )}
              >
                <ArrowUpIcon className="w-4 h-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions (Ruixen Style Pills) */}
        {!hasStartedChat && (
          <div className="flex items-center justify-center flex-wrap gap-2.5 sm:gap-3 mt-6">
            {quickActions.map((act, idx) => (
              <QuickAction
                key={idx}
                icon={act.icon}
                label={act.label}
                onClick={() => handleSendMessage(act.query || act.label)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center text-xs font-mono">Loading Ruixen AI...</div>}>
      <ChatContent />
    </Suspense>
  );
}
