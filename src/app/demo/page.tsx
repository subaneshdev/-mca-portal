'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  User, 
  Sparkles, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  RefreshCw, 
  Lock, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Send,
  AlertTriangle
} from 'lucide-react';
import { ActionService } from '@/lib/services/actionService';
import { McpAction } from '@/types/actions';
import { PRIMARY_DEMO_COMPANY } from '@/lib/services/seedService';

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loadingStep, setLoadingStep] = useState<boolean>(false);
  const [action, setAction] = useState<McpAction | null>(null);
  const [tokenPin, setTokenPin] = useState('12345678');
  const [srnResult, setSrnResult] = useState<string | null>(null);

  // Step 1: Initialize Chat & Event
  const runStep1Identify = async () => {
    setLoadingStep(true);
    setTimeout(() => {
      setLoadingStep(false);
      setCurrentStep(2);
    }, 500);
  };

  // Step 2: Prepare Action (Rahul Menon Resignation)
  const runStep2Prepare = async () => {
    setLoadingStep(true);
    try {
      const act = await ActionService.prepareDirectorChange({
        company_id_or_cin: PRIMARY_DEMO_COMPANY.cin,
        change_type: 'RESIGNATION',
        director_name: 'Rahul Menon',
        din: '09124589',
        effective_date: '2026-08-25',
        reason: 'Personal reasons'
      }, {
        workspaceId: PRIMARY_DEMO_COMPANY.workspace_id || undefined,
        userId: 'usr_varun_maya',
        actorType: 'AI_CLIENT',
        clientName: 'Claude Desktop / Code',
        clientType: 'Anthropic Claude'
      });
      setAction(act);
      setCurrentStep(3);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingStep(false);
    }
  };

  // Step 3: Explicit User Confirmation
  const runStep3Confirm = async () => {
    if (!action) return;
    setLoadingStep(true);
    try {
      const res = await ActionService.confirmAction(action.id, action.confirmation_token || undefined, {
        actorType: 'USER',
        clientName: 'Varun Maya (Claude User Confirmation)'
      });
      setAction(res.action);
      setCurrentStep(4);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingStep(false);
    }
  };

  // Step 4: Digital Signature (DSC) Authorization
  const runStep4Authorize = async () => {
    if (!action) return;
    setLoadingStep(true);
    try {
      const updated = await ActionService.authorizeAction(action.id, {
        signed_by: 'Varun Maya (Managing Director)',
        din: '08945120',
        dsc_serial: 'SHA256-EMUDHRA-IND-84920482',
        remarks: 'Digitally authenticated in browser token sandbox'
      });
      setAction(updated);
      setCurrentStep(5);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingStep(false);
    }
  };

  // Step 5: Execute Action (SRN generation)
  const runStep5Execute = async () => {
    if (!action) return;
    setLoadingStep(true);
    try {
      const res = await ActionService.executeAction(action.id, `demo_idemp_${Date.now()}`);
      setAction(res.action);
      setSrnResult(res.reference_number);
      setCurrentStep(6);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingStep(false);
    }
  };

  const resetSimulator = () => {
    setAction(null);
    setCurrentStep(1);
    setSrnResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                MCP POST-ACTION PROTOCOL v2
              </span>
              <span className="text-xs text-slate-400">• Interactive End-to-End Simulation</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-2">
              Future MCA Action Protocol Simulator
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Demonstrating the 7-step lifecycle for <strong>Aeos Labs Private Limited</strong> &rarr; <strong>Director Resignation (Rahul Menon)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetSimulator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Simulator
            </button>
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-white text-slate-950 hover:bg-slate-200 transition-colors shadow-sm"
            >
              Open Live Founder Chat &rarr;
            </Link>
          </div>
        </div>

        {/* 6-Step Visual Timeline */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { num: 1, name: '1. Read Context', desc: 'Fetch entity & directors' },
            { num: 2, name: '2. Prepare Draft', desc: 'Validate & draft DIR-12' },
            { num: 3, name: '3. Preview & Review', desc: 'Zero silent mutations' },
            { num: 4, name: '4. Explicit Confirm', desc: 'Advance state machine' },
            { num: 5, name: '5. DSC Sandbox', desc: 'Browser-isolated PIN' },
            { num: 6, name: '6. Execute & SRN', desc: 'Immutable submission' },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-3 rounded-xl border text-left transition-all ${
                currentStep === s.num
                  ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-md ring-1 ring-blue-500'
                  : currentStep > s.num
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <div className="text-[10px] font-mono font-bold">{s.name}</div>
              <div className="text-[11px] truncate mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Split Screen Simulator UI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: AI Client Interface (Claude Desktop / Cursor View) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">AI Agent Interface</h3>
                    <div className="text-[10px] font-mono text-slate-400">Claude Desktop / Cursor MCP Client</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  Tool: JSON-RPC 2.0
                </span>
              </div>

              {/* Chat Simulation Transcript */}
              <div className="space-y-3 font-mono text-xs">
                {/* User message */}
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 space-y-1">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-blue-400" /> Varun Maya (Founder)
                  </div>
                  <div>&ldquo;My director Rahul Menon resigned yesterday. What should I do for Aeos Labs?&rdquo;</div>
                </div>

                {/* AI response Step 1 */}
                {currentStep >= 2 && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 space-y-2">
                    <div className="text-[10px] text-orange-400 flex items-center gap-1">
                      <Bot className="w-3 h-3" /> Claude Assistant (calling MCP tools)
                    </div>
                    <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      Under Section 168 of Companies Act 2013, director cessation requires <strong>Form DIR-12</strong> within 30 days.
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-blue-400 font-mono">
                      &rarr; call_tool(&ldquo;prepare_director_change&rdquo;, director=&ldquo;Rahul Menon&rdquo;, din=&ldquo;09124589&rdquo;)
                    </div>
                  </div>
                )}

                {/* AI response Step 2 & 3 */}
                {currentStep >= 3 && action && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-200 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-400">
                      <span>Action Draft Prepared (act_dir_demo_001)</span>
                      <span>Awaiting Confirmation</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans">
                      &ldquo;I have prepared the Form DIR-12 draft for Director Rahul Menon with 30-day statutory deadline (24 September 2026). This action has <strong>NOT</strong> been executed yet. Do you want to confirm?&rdquo;
                    </div>
                  </div>
                )}

                {/* AI response Step 4 */}
                {currentStep >= 4 && (
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200">
                    <div className="text-[10px] text-slate-400">Varun Maya:</div>
                    <div>&ldquo;Yes, confirm this action.&rdquo; &rarr; <code>confirm_action(act_dir_demo_001)</code></div>
                  </div>
                )}

                {/* AI response Step 5 & 6 */}
                {currentStep >= 5 && (
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 text-purple-200 space-y-1 font-sans text-[11px]">
                    <div className="font-bold text-purple-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Isolated Authorization Required
                    </div>
                    <div>AI cannot receive private keys or DSC PIN. Directing user to browser authorization page.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Trigger Buttons */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              {currentStep === 1 && (
                <button
                  onClick={runStep1Identify}
                  disabled={loadingStep}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4" /> Trigger: &ldquo;My director resigned&rdquo;
                </button>
              )}

              {currentStep === 2 && (
                <button
                  onClick={runStep2Prepare}
                  disabled={loadingStep}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4" /> Call Level 2 Tool: prepare_director_change()
                </button>
              )}

              {currentStep === 3 && (
                <button
                  onClick={runStep3Confirm}
                  disabled={loadingStep}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" /> User Confirms: confirm_action()
                </button>
              )}

              {currentStep >= 4 && currentStep < 6 && (
                <div className="text-center text-xs text-slate-400 py-1 font-mono">
                  State Machine Advanced &rarr; Complete browser signing on right panel
                </div>
              )}

              {currentStep === 6 && (
                <div className="text-center text-xs text-emerald-400 font-bold py-1 flex items-center justify-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SRN Generated &rarr; Submission Finalized
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Future MCA Isolated Browser Sandbox & Actions Engine */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Future MCA Isolated Sandbox</h3>
                    <div className="text-[10px] font-mono text-slate-400">Browser Security Boundary (/actions/act_dir_demo_001)</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                  State: {action ? action.status : 'IDLE'}
                </span>
              </div>

              {/* Status Display Area */}
              {!action && (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl space-y-2">
                  <Key className="w-8 h-8 text-slate-600 mx-auto" />
                  <div className="text-xs font-semibold">No Active MCP Action Envelope</div>
                  <div className="text-[11px]">Click Step 1 on the left to initiate the workflow.</div>
                </div>
              )}

              {action && (
                <div className="space-y-4">
                  {/* Action Envelope Preview */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-slate-400">Action ID: {action.id}</span>
                      <span className="text-blue-400">Form: DIR-12</span>
                    </div>
                    <div className="font-bold text-slate-200">{action.preview.action_summary}</div>
                    <div className="text-[11px] text-slate-400">
                      Entity: <strong>Aeos Labs Private Limited</strong> | Deadline: 24 September 2026
                    </div>
                  </div>

                  {/* Browser-Isolated DSC Signing Step */}
                  {currentStep >= 4 && currentStep < 6 && (
                    <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-xl space-y-3">
                      <div className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-purple-400" />
                        Class 3 DSC Token Authentication (Isolated Sandbox)
                      </div>
                      <div className="text-[11px] text-purple-300 leading-relaxed font-sans">
                        Managing Director <strong>Varun Maya (DIN: 08945120)</strong> token detected. PIN is verified strictly in local browser memory.
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">DSC Signer</label>
                          <input
                            disabled
                            value="Varun Maya (Managing Director)"
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-300 text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Token PIN</label>
                          <input
                            type="password"
                            value={tokenPin}
                            onChange={(e) => setTokenPin(e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-300 text-[11px]"
                          />
                        </div>
                      </div>

                      {currentStep === 4 && (
                        <button
                          onClick={runStep4Authorize}
                          disabled={loadingStep}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-all"
                        >
                          Sign Envelope & Authorize
                        </button>
                      )}

                      {currentStep === 5 && (
                        <button
                          onClick={runStep5Execute}
                          disabled={loadingStep}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all"
                        >
                          Execute Submission & Generate SRN
                        </button>
                      )}
                    </div>
                  )}

                  {/* Submission Finalized Receipt */}
                  {currentStep === 6 && (
                    <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl space-y-3 text-xs">
                      <div className="flex items-center gap-2 font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        Official Submission Receipt Generated
                      </div>
                      <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                        <div className="p-2 bg-slate-950 rounded border border-emerald-900/60">
                          <span className="text-slate-500 block text-[9px]">SRN Reference:</span>
                          <span className="text-white font-bold">{srnResult}</span>
                        </div>
                        <div className="p-2 bg-slate-950 rounded border border-emerald-900/60">
                          <span className="text-slate-500 block text-[9px]">Director Status:</span>
                          <span className="text-amber-400 font-bold">RESIGNATION SUBMITTED</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-emerald-300">
                        Aeos Labs master data and compliance timeline updated with confirmed DIR-12 filing.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Security Guarantee: Zero Silent Execution</span>
              <Link href="/actions" className="text-blue-400 hover:underline">
                View Actions Hub &rarr;
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
