"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  PlusIcon,
  Code2,
  Palette,
  Layers,
  Rocket,
  Sparkles,
  Building2,
  ShieldAlert,
  FileText,
  UserX,
  Search
} from "lucide-react";
import { useRouter } from "next/navigation";

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

      textarea.style.height = `${minHeight}px`; // reset first
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

interface RuixenMoonChatProps {
  onSendMessage?: (msg: string) => void;
  title?: string;
  subtitle?: string;
  bgImageUrl?: string;
  quickActions?: { icon: React.ReactNode; label: string; query?: string }[];
}

export default function RuixenMoonChat({
  onSendMessage,
  title = "Founders AI",
  subtitle = "Understand, incorporate and manage your company with autonomous intelligence.",
  bgImageUrl = "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png",
  quickActions
}: RuixenMoonChatProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  });

  const handleSend = () => {
    if (!message.trim()) return;
    if (onSendMessage) {
      onSendMessage(message);
    } else {
      router.push(`/chat?query=${encodeURIComponent(message)}`);
    }
    setMessage("");
    adjustHeight(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (label: string, query?: string) => {
    const q = query || label;
    if (onSendMessage) {
      onSendMessage(q);
    } else {
      router.push(`/chat?query=${encodeURIComponent(q)}`);
    }
  };

  const defaultQuickActions = [
    { icon: <Building2 className="w-4 h-4 text-[#60A5FA]" />, label: "Start a Company", query: "I want to start a company" },
    { icon: <UserX className="w-4 h-4 text-[#F87171]" />, label: "A Director Resigned", query: "A director resigned from our board" },
    { icon: <ShieldAlert className="w-4 h-4 text-[#FBBF24]" />, label: "Know What's Due", query: "What filings and compliances are due this month?" },
    { icon: <FileText className="w-4 h-4 text-[#34D399]" />, label: "Prepare DIR-12", query: "Prepare DIR-12 director cessation requirements" },
    { icon: <Search className="w-4 h-4 text-[#A78BFA]" />, label: "Diagnose Filing Error", query: "Diagnose MCA rejection error" },
    { icon: <Sparkles className="w-4 h-4 text-[#38BDF8]" />, label: "Connect MCP AI", query: "How do I connect Claude or Cursor via MCP?" },
    { icon: <Rocket className="w-4 h-4 text-[#EC4899]" />, label: "Track SRN Application", query: "Track application status for my SRN" },
    { icon: <Layers className="w-4 h-4 text-[#94A3B8]" />, label: "Annual Compliance (AOC-4)", query: "What is required for AOC-4 and MGT-7 filings?" },
  ];

  const actions = quickActions || defaultQuickActions;

  return (
    <div
      className="relative w-full h-full min-h-screen bg-cover bg-center flex flex-col items-center justify-between p-4 sm:p-6"
      style={{
        backgroundImage: `url('${bgImageUrl}')`,
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay for optimal text contrast */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-none z-0" />

      {/* Centered AI Title */}
      <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-center pt-12 pb-6">
        <div className="text-center max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span className="font-medium">Future MCA &bull; Founder Autonomous Copilot</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight drop-shadow-md">
            {title}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-300 max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Input Box Section */}
      <div className="relative z-10 w-full max-w-3xl mb-[8vh] sm:mb-[12vh]">
        <div className="relative bg-black/75 backdrop-blur-xl rounded-2xl border border-neutral-700/80 shadow-2xl focus-within:border-neutral-500 transition-colors">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your company, filings, ROC compliance or incorporation..."
            className={cn(
              "w-full px-5 py-4 resize-none border-none",
              "bg-transparent text-white text-sm sm:text-base",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-neutral-400 min-h-[52px]"
            )}
            style={{ overflow: "hidden" }}
          />

          {/* Footer Buttons */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-full h-8 w-8"
                title="Attach Document or Board Resolution"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <span className="text-[11px] text-neutral-400 hidden sm:inline font-mono">
                Press Enter ↵ to send
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSend}
                disabled={!message.trim()}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                  message.trim()
                    ? "bg-white text-black hover:bg-neutral-200 cursor-pointer shadow-sm"
                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                )}
              >
                <span>Ask AI</span>
                <ArrowUpIcon className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-2.5 mt-6">
          {actions.map((act, idx) => (
            <QuickAction
              key={idx}
              icon={act.icon}
              label={act.label}
              onClick={() => handleQuickAction(act.label, act.query)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function QuickAction({ icon, label, onClick }: QuickActionProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border-neutral-700/80 bg-black/60 backdrop-blur-md text-neutral-200 hover:text-white hover:bg-neutral-800/90 hover:border-neutral-500 transition-all text-xs py-1.5 px-3.5 h-auto shadow-sm"
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}
