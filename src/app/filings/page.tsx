'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace } from '@/context/WorkspaceContext';
import { FilingService } from '@/lib/services/filingService';
import { 
  FileText, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  UserMinus, 
  UserPlus, 
  MapPin, 
  Coins, 
  Calendar,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export default function FilingsHubPage() {
  const { openAiWithQuery } = useWorkspace();
  const [naturalQuery, setNaturalQuery] = useState('');
  const [matchedIntent, setMatchedIntent] = useState<any>(null);

  const intents = FilingService.getIntents();

  const handleMatchIntent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalQuery.trim()) return;
    const match = FilingService.matchIntentByQuery(naturalQuery);
    setMatchedIntent(match);
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'director-resigned': return UserMinus;
      case 'director-joined': return UserPlus;
      case 'address-changed': return MapPin;
      case 'issued-shares': return Coins;
      case 'annual-compliance': return Calendar;
      default: return FileText;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">What changed in your company?</h1>
          <p className="text-xs text-[#525252] mt-1">
            You don't need to know which form or section is required. Simply describe what happened, and Future MCA configures the filing journey.
          </p>
        </div>

        {/* Natural Language Intent Input */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm space-y-4">
          <form onSubmit={handleMatchIntent} className="space-y-3">
            <label className="text-xs font-semibold text-black uppercase tracking-wider block">
              Describe a corporate event in plain language
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={naturalQuery}
                onChange={(e) => setNaturalQuery(e.target.value)}
                placeholder="e.g. 'A director resigned', 'We moved our office to Mumbai', 'We raised funding and allotted equity'..."
                className="flex-1 px-3.5 py-2.5 text-xs bg-[#F7F7F5] border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB] text-[#0A0A0A]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg transition-colors flex items-center space-x-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Identify Workflow</span>
              </button>
            </div>
          </form>

          {/* If Intent Matched via NLP */}
          {matchedIntent && (
            <div className="p-4 bg-[#EFF6FF] border border-[#2563EB]/30 rounded-lg space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2563EB]">Workflow Identified</span>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded text-[#2563EB] border border-[#2563EB]/20">
                  {Math.round(matchedIntent.confidence * 100)}% Confidence
                </span>
              </div>
              <h3 className="text-sm font-bold text-black">{matchedIntent.intent.title}</h3>
              <p className="text-xs text-[#525252]">{matchedIntent.explanation}</p>
              
              <div className="pt-2 flex items-center space-x-3">
                <Link
                  href={`/filings/new?intent=${matchedIntent.intent.id}`}
                  className="px-3.5 py-1.5 text-xs font-medium bg-[#2563EB] text-white rounded hover:bg-[#1D4ED8] transition-colors flex items-center space-x-1"
                >
                  <span>Start {matchedIntent.intent.form_code} Guided Workflow</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <button
                  onClick={() => openAiWithQuery(`Why is ${matchedIntent.intent.form_code} required when ${naturalQuery}?`)}
                  className="text-xs text-[#2563EB] hover:underline"
                >
                  Why is this required?
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Catalog of Common Corporate Events */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
            Or select from frequent corporate events
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {intents.map(intent => {
              const Icon = getIcon(intent.id);

              return (
                <div
                  key={intent.id}
                  className="bg-white border border-[#E5E5E5] rounded-xl p-5 hover:border-[#2563EB] transition-colors flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded bg-[#F7F7F5] text-[#0A0A0A] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#2563EB]" />
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#F7F7F5] text-black border border-[#E5E5E5]">
                        {intent.form_code}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-black">{intent.title}</h3>
                    <p className="text-xs text-[#525252] leading-relaxed">{intent.subtitle}</p>

                    <div className="text-[11px] text-[#737373] font-mono pt-1">
                      Deadline: {intent.deadline_rule}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between">
                    <button
                      onClick={() => openAiWithQuery(`What are the prerequisites for ${intent.title} (${intent.form_code})?`)}
                      className="text-xs text-[#737373] hover:text-[#2563EB] flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#2563EB]" />
                      <span>Requirements</span>
                    </button>

                    <Link
                      href={`/filings/new?intent=${intent.id}`}
                      className="px-3.5 py-1.5 text-xs font-medium bg-[#0A0A0A] hover:bg-black text-white rounded transition-colors flex items-center space-x-1"
                    >
                      <span>Start Journey</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
