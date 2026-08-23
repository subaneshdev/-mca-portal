'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace } from '@/context/WorkspaceContext';
import { DiagnosticService } from '@/lib/services/diagnosticService';
import { DiagnosticCase } from '@/types';
import { 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Terminal, 
  ShieldAlert, 
  RefreshCw,
  History,
  Clock,
  Trash2
} from 'lucide-react';

export default function DiagnosticsPage() {
  const { openAiWithQuery } = useWorkspace();
  const [inputMode, setInputMode] = useState<'text' | 'code' | 'upload'>('text');
  const [errorInput, setErrorInput] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [recentCases, setRecentCases] = useState<DiagnosticCase[]>([]);

  useEffect(() => {
    setRecentCases(DiagnosticService.listRecentCases());
  }, [diagnosisResult]);

  const sampleErrors = [
    'DSC inserted does not match the registered DSC for this User ID/Director',
    'Company status is ACTIVE-NON-COMPLIANT. e-Form filing restricted.',
    'Bank debited but SRN status remains Pending Payment on MCA V3',
    'Signatory DIN is deactivated due to non-filing of DIR-3 KYC',
    'SPICe+ Part A name rejected due to phonetic similarity with trademark'
  ];

  const handleRunDiagnosis = (textToDiagnose?: string) => {
    const query = textToDiagnose || errorInput;
    if (!query.trim()) return;

    setIsDiagnosing(true);
    setTimeout(() => {
      const result = DiagnosticService.diagnose(query);
      setDiagnosisResult(result);
      setIsDiagnosing(false);
    }, 600);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <div className="text-[10px] font-mono uppercase text-[#737373] tracking-wider">
            MCA V3 Diagnostic Engine
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-black mt-0.5">
            Something went wrong?
          </h1>
          <p className="text-xs text-[#525252] mt-1">
            Translate cryptic MCA error codes, pre-scrutiny rejections, and payment timeouts into plain English resolution paths.
          </p>
        </div>

        {/* Error Input Box */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#E5E5E5] pb-3 text-xs">
            <button
              onClick={() => setInputMode('text')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                inputMode === 'text' ? 'bg-black text-white' : 'text-[#525252] hover:bg-[#F7F7F5]'
              }`}
            >
              Paste Error / Describe Symptom
            </button>
            <button
              onClick={() => setInputMode('upload')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                inputMode === 'upload' ? 'bg-black text-white' : 'text-[#525252] hover:bg-[#F7F7F5]'
              }`}
            >
              Upload Screenshot / Log
            </button>
          </div>

          {inputMode === 'text' && (
            <div className="space-y-3">
              <textarea
                rows={4}
                value={errorInput}
                onChange={(e) => setErrorInput(e.target.value)}
                placeholder="Paste the exact error popup message, pre-scrutiny failure note, or describe what happened..."
                className="w-full p-3 text-xs bg-[#F7F7F5] border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB] text-[#0A0A0A] font-mono leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[11px] text-[#737373]">
                  Quick test with common MCA issues:
                </div>
                <button
                  type="button"
                  disabled={!errorInput.trim() || isDiagnosing}
                  onClick={() => handleRunDiagnosis()}
                  className="px-5 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white rounded transition-colors flex items-center space-x-1.5 self-end sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isDiagnosing ? 'Diagnosing...' : 'Start Guided Diagnosis'}</span>
                </button>
              </div>

              {/* Sample error buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {sampleErrors.map(sample => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setErrorInput(sample);
                      handleRunDiagnosis(sample);
                    }}
                    className="text-[11px] text-[#525252] hover:text-[#2563EB] bg-[#F7F7F5] hover:bg-[#EFF6FF] border border-[#E5E5E5] px-2.5 py-1 rounded transition-colors text-left"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          )}

          {inputMode === 'upload' && (
            <div
              onClick={() => {
                setErrorInput('DSC inserted does not match registered DSC for this User ID');
                handleRunDiagnosis('DSC inserted does not match registered DSC for this User ID');
              }}
              className="p-8 border-2 border-dashed border-[#E5E5E5] hover:border-[#2563EB] rounded-lg text-center cursor-pointer space-y-2 bg-[#F7F7F5] transition-colors"
            >
              <Upload className="w-6 h-6 text-[#737373] mx-auto" />
              <div className="text-xs font-semibold text-black">Click to upload MCA error screenshot or PDF log</div>
              <p className="text-[11px] text-[#737373]">Optical Character Recognition (OCR) will extract error codes automatically.</p>
            </div>
          )}
        </div>

        {/* Diagnosis Result Card */}
        {diagnosisResult && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-start justify-between border-b border-[#E5E5E5] pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
                    DIAGNOSIS COMPLETE ({Math.round(diagnosisResult.confidence * 100)}% Match)
                  </span>
                  {diagnosisResult.match?.category && (
                    <span className="text-xs font-mono text-[#737373]">• Category: {diagnosisResult.match.category}</span>
                  )}
                  {diagnosisResult.caseId && (
                    <span className="text-[10px] font-mono text-[#737373]">• Case: {diagnosisResult.caseId}</span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-black">
                  {diagnosisResult.match?.title || 'MCA Schema & Gateway Diagnosis'}
                </h2>
              </div>

              <button
                onClick={() => openAiWithQuery(`Walk me through step-by-step resolution for: ${diagnosisResult.analysis}`)}
                className="px-3 py-1.5 text-xs text-[#2563EB] hover:underline flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI to Guide Me</span>
              </button>
            </div>

            {/* What we found */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373]">What we found</h3>
              <p className="text-xs text-[#0A0A0A] leading-relaxed bg-[#F7F7F5] p-3.5 rounded border border-[#E5E5E5]">
                {diagnosisResult.analysis}
              </p>
            </div>

            {/* Recommended Next Steps */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
                Recommended Resolution Steps
              </h3>
              <div className="space-y-2">
                {diagnosisResult.suggestedActions.map((step: string, idx: number) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 rounded bg-white border border-[#E5E5E5]">
                    <div className="w-5 h-5 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="text-xs text-[#0A0A0A] leading-relaxed">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Affected forms */}
            {diagnosisResult.match?.affected_forms && (
              <div className="pt-2 border-t border-[#E5E5E5] flex items-center space-x-2 text-xs">
                <span className="text-[#737373]">Commonly Affects:</span>
                {diagnosisResult.match.affected_forms.map((form: string) => (
                  <span key={form} className="text-[10px] font-mono bg-[#F7F7F5] px-2 py-0.5 rounded border border-[#E5E5E5] text-black">
                    {form}
                  </span>
                ))}
              </div>
            )}

          </div>
        )}

        {/* Recent Diagnostic Cases */}
        {recentCases.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-[#737373]" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                Recent Diagnostic Cases ({recentCases.length})
              </h2>
            </div>

            <div className="space-y-2">
              {recentCases.slice(0, 10).map(c => (
                <div
                  key={c.id}
                  className="bg-white border border-[#E5E5E5] rounded-lg p-4 hover:border-[#2563EB] transition-colors cursor-pointer"
                  onClick={() => {
                    setErrorInput(c.user_input);
                    handleRunDiagnosis(c.user_input);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F7F7F5] border border-[#E5E5E5] text-[#525252] font-bold">
                          {c.error_code}
                        </span>
                        <span className="text-[10px] text-[#737373] font-mono">{c.category}</span>
                      </div>
                      <p className="text-xs text-black font-medium truncate">{c.symptoms}</p>
                      <p className="text-[11px] text-[#525252] truncate">{c.analysis}</p>
                    </div>

                    <div className="text-[10px] text-[#737373] font-mono whitespace-nowrap shrink-0 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(c.created_at || Date.now()).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
