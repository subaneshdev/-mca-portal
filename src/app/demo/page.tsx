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
    }, 600);
  };

  // Step 2: Prepare Action
  const runStep2Prepare = async () => {
    setLoadingStep(true);
    try {
      const act = await ActionService.prepareDirectorChange({
        company_id_or_cin: 'U72900KA2022PTC158942',
        change_type: 'RESIGNATION',
        director_name: 'Ananya Sharma',
        din: '08947219',
        effective_date: new Date().toISOString().split('T')[0],
        reason: 'Personal commitments and advisory focus'
      }, {
        actorType: 'AI_CLIENT',
        clientName: 'Claude Desktop',
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
        clientName: 'Claude Chat Interaction'
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
        signed_by: 'Subanesh R (Managing Director)',
        din: '08947219',
        dsc_serial: 'SHA256-EMUDHRA-IND-84920482',
        remarks: 'Digitally authenticated in secure browser token sandbox'
      });
      setAction(updated);
      setCurrentStep(5);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingStep(false);
    }
  };

  // Step 5: Execute Action
  const runStep5Execute = async () => {
    if (!action) return;
    setLoadingStep(true);
    try {
      const exec = await ActionService.executeAction(action.id, undefined, {
        actorType: 'AI_CLIENT',
        clientName: 'Claude Desktop'
      });
      setAction(exec.action);
      setSrnResult(exec.reference_number);
      setCurrentStep(6);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingStep(false);
    }
  };

  const resetDemo = () => {
    setCurrentStep(1);
    setAction(null);
    setSrnResult(null);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-16 font-sans">
      {/* Top Banner */}
      <div className="border-b border-slate-800 bg-[#1E293B]/60 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white">
                Interactive Post-Action Protocol Simulator
              </h1>
              <p className="text-xs text-slate-400">
                Witness how Claude Desktop securely prepares, validates, and executes corporate actions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Demo
            </button>
            <Link
              href="/actions"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              Live Actions Queue
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Stepper Header */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {[
            { num: 1, label: '1. Event Trigger' },
            { num: 2, label: '2. MCP Identify' },
            { num: 3, label: '3. Prepare Draft' },
            { num: 4, label: '4. User Confirm' },
            { num: 5, label: '5. DSC Sign' },
            { num: 6, label: '6. SRN Receipt' }
          ].map((st) => (
            <div
              key={st.num}
              className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                currentStep === st.num
                  ? 'bg-blue-600/30 border-blue-500 text-white shadow-lg ring-2 ring-blue-500/20'
                  : currentStep > st.num
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              <div>{st.label}</div>
            </div>
          ))}
        </div>

        {/* Split Screen Simulator: Claude / AI Agent (Left) & Future MCA Server Engine (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT: AI Agent Interface (Claude Simulation) */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[580px]">
            <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-slate-200">Claude Desktop Agent (MCP Client)</span>
              </div>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-700/50">
                Connected: Future MCA MCP
              </span>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              
              {/* Message 1: User Prompt */}
              <div className="flex gap-2.5 justify-end">
                <div className="bg-blue-600 text-white p-3.5 rounded-2xl rounded-tr-xs max-w-sm">
                  My director Ananya Sharma resigned yesterday. What should I do for Future Labs Pvt Ltd?
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  U
                </div>
              </div>

              {/* Message 2: Claude Identify */}
              {currentStep >= 2 && (
                <div className="flex gap-2.5 justify-start animate-in fade-in">
                  <div className="w-6 h-6 rounded-full bg-purple-900 text-purple-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 border border-purple-700">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-slate-800 border border-slate-700 text-slate-200 p-3.5 rounded-2xl rounded-tl-xs space-y-2 max-w-md">
                    <div className="text-[11px] text-purple-400 font-mono">
                      ⚙️ Calling Tool: <code className="bg-slate-900 px-1 py-0.5 rounded">identify_required_filing</code>
                    </div>
                    <p>
                      Under <strong>Section 168 of the Companies Act 2013</strong>, director cessation requires filing <strong>Form DIR-12</strong> with the Registrar of Companies (RoC) within <strong>30 days</strong>.
                    </p>
                    <p>
                      Would you like me to prepare the DIR-12 action draft envelope for Future Labs Private Limited?
                    </p>
                  </div>
                </div>
              )}

              {/* Message 3: Prepare Draft Output */}
              {currentStep >= 3 && action && (
                <div className="flex gap-2.5 justify-start animate-in fade-in">
                  <div className="w-6 h-6 rounded-full bg-purple-900 text-purple-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 border border-purple-700">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-slate-800 border border-slate-700 text-slate-200 p-4 rounded-2xl rounded-tl-xs space-y-3 max-w-md">
                    <div className="text-[11px] text-purple-400 font-mono">
                      ⚙️ Calling Tool: <code className="bg-slate-900 px-1 py-0.5 rounded">prepare_director_change</code>
                    </div>

                    {/* Claude Preview Card */}
                    <div className="p-3.5 bg-slate-900/90 rounded-xl border border-amber-500/40 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-amber-400 font-bold">
                        <span>READY FOR REVIEW (Action Draft)</span>
                        <span className="font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded">DIR-12</span>
                      </div>
                      <div className="text-[11px] space-y-1 text-slate-300">
                        <div><strong>Target Company:</strong> Future Labs Private Limited</div>
                        <div><strong>Director:</strong> Ananya Sharma (DIN: 08947219)</div>
                        <div><strong>Deadline:</strong> Within 30 days of cessation</div>
                        <div><strong>Required Attachments:</strong> Resignation Letter, Board Resolution</div>
                      </div>
                      <div className="text-[10px] text-amber-300/90 bg-amber-950/40 p-2 rounded border border-amber-900/50">
                        ⚠️ <strong>Zero Silent Execution:</strong> This action has NOT been submitted. Please review and provide explicit confirmation to proceed.
                      </div>
                    </div>

                    <p className="font-medium text-slate-200">
                      The filing is prepared. Do you want to confirm and continue with digital signing?
                    </p>
                  </div>
                </div>
              )}

              {/* Message 4: User Explicit Confirmation */}
              {currentStep >= 4 && (
                <div className="flex gap-2.5 justify-end animate-in fade-in">
                  <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-xs max-w-sm font-semibold">
                    Yes, confirm and proceed with filing DIR-12.
                  </div>
                  <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                    U
                  </div>
                </div>
              )}

              {/* Message 5: Authorization Prompt */}
              {currentStep >= 4 && action && (
                <div className="flex gap-2.5 justify-start animate-in fade-in">
                  <div className="w-6 h-6 rounded-full bg-purple-900 text-purple-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 border border-purple-700">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-slate-800 border border-slate-700 text-slate-200 p-4 rounded-2xl rounded-tl-xs space-y-3 max-w-md">
                    <div className="text-[11px] text-purple-400 font-mono">
                      ⚙️ Tool Result: <code className="bg-slate-900 px-1 py-0.5 rounded">AUTHORIZATION_REQUIRED</code>
                    </div>
                    <p>
                      This corporate filing requires an authorized <strong>Class 3 Digital Signature Certificate (DSC)</strong>. For your security, private keys and tokens are never shared with AI chat.
                    </p>
                    <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl space-y-2">
                      <div className="text-purple-300 font-bold flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5" />
                        Complete Secure Signing in Future MCA
                      </div>
                      <Link
                        href={`/actions/${action.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg transition-all"
                      >
                        Open /actions/{action.id} <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Message 6: Final Execution Receipt */}
              {currentStep >= 6 && srnResult && (
                <div className="flex gap-2.5 justify-start animate-in fade-in">
                  <div className="w-6 h-6 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 border border-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 p-4 rounded-2xl rounded-tl-xs space-y-2 max-w-md">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Filing Successfully Executed
                    </div>
                    <p className="text-xs">
                      Form DIR-12 has been recorded in the statutory compliance ledger.
                    </p>
                    <div className="p-2.5 bg-slate-950/80 rounded-lg border border-emerald-500/30 font-mono text-xs">
                      <div>Assigned SRN: <strong>{srnResult}</strong></div>
                      <div>Status: <strong>SUBMITTED & APPROVED</strong></div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT: Future MCA Server & Secure Authorization Sandbox */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[580px]">
            <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">Future MCA Security & State Machine</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/50">
                State: {action ? action.status : 'DRAFT'}
              </span>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">

              {/* Step Controls */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-3">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Interactive Protocol Triggers</span>
                  <span className="text-[10px] font-mono text-slate-400">Step {currentStep} of 6</span>
                </div>

                {currentStep === 1 && (
                  <button
                    onClick={runStep1Identify}
                    disabled={loadingStep}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {loadingStep ? 'Calling identify_required_filing...' : '1. Simulate User Inquiry & Map Event'}
                  </button>
                )}

                {currentStep === 2 && (
                  <button
                    onClick={runStep2Prepare}
                    disabled={loadingStep}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {loadingStep ? 'Preparing Draft in Supabase...' : '2. Call prepare_director_change'}
                  </button>
                )}

                {currentStep === 3 && (
                  <button
                    onClick={runStep3Confirm}
                    disabled={loadingStep}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {loadingStep ? 'Confirming Token...' : '3. Simulate Explicit User Confirmation'}
                  </button>
                )}

                {currentStep === 4 && (
                  <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-xl space-y-3">
                    <div className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Key className="w-4 h-4" />
                      Browser-Isolated Digital Signature (DSC) Sandbox
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Signing Token PIN</label>
                      <input
                        type="password"
                        value={tokenPin}
                        onChange={(e) => setTokenPin(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-white text-xs"
                      />
                    </div>
                    <button
                      onClick={runStep4Authorize}
                      disabled={loadingStep}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      {loadingStep ? 'Verifying Certificate...' : '4. Authorize & Digitally Sign Envelope'}
                    </button>
                  </div>
                )}

                {currentStep === 5 && (
                  <button
                    onClick={runStep5Execute}
                    disabled={loadingStep}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {loadingStep ? 'Validating Invariants & Submitting...' : '5. Call execute_action (With Idempotency)'}
                  </button>
                )}

                {currentStep === 6 && (
                  <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center space-y-2 text-emerald-300">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <div className="font-bold text-white">Full Post-Action Lifecycle Complete</div>
                    <p className="text-xs text-emerald-400">
                      The action moved securely through DRAFT &rarr; AWAITING_CONFIRMATION &rarr; AUTHORIZATION_REQUIRED &rarr; AUTHORIZED &rarr; SUBMITTED.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Object Inspection Box */}
              {action && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Live Supabase Action State:
                  </div>
                  <pre className="p-3.5 bg-slate-950 text-slate-300 rounded-xl border border-slate-800 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
                    {JSON.stringify({
                      id: action.id,
                      status: action.status,
                      confirmation_required: action.authorization_required,
                      authorization_status: action.authorization_status,
                      external_reference: action.external_reference || 'PENDING',
                      audit_invariants_passed: true
                    }, null, 2)}
                  </pre>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
