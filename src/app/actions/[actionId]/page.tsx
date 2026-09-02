'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ActionService } from '@/lib/services/actionService';
import { McpAction, McpActionAuditLog } from '@/types/actions';
import { 
  ShieldCheck, 
  Key, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Building2, 
  Calendar, 
  UserCheck, 
  Lock, 
  ArrowLeft, 
  Sparkles, 
  RefreshCw,
  XCircle,
  FileCheck,
  Send,
  ExternalLink,
  Bot
} from 'lucide-react';

export default function ActionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const actionId = params.actionId as string;

  const [action, setAction] = useState<McpAction | null>(null);
  const [auditLogs, setAuditLogs] = useState<McpActionAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Authorization Form States
  const [selectedDsc, setSelectedDsc] = useState('dsc-token-01');
  const [dscPin, setDscPin] = useState('12345678');
  const [authorizing, setAuthorizing] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadActionData = async () => {
    if (!actionId) return;
    setLoading(true);
    try {
      const act = await ActionService.getAction(actionId);
      if (act) {
        setAction(act);
        const logs = await ActionService.getActionAuditLogs(actionId);
        setAuditLogs(logs);
      } else {
        setErrorMsg(`Action "${actionId}" was not found.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load action.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActionData();
  }, [actionId]);

  const handleConfirm = async () => {
    if (!action) return;
    setConfirming(true);
    try {
      const res = await ActionService.confirmAction(action.id, action.confirmation_token || undefined, {
        actorType: 'USER',
        clientName: 'Future MCA Web Portal'
      });
      setAction(res.action);
      setSuccessToast(res.message);
      await loadActionData();
    } catch (err: any) {
      alert(err.message || 'Confirmation failed');
    } finally {
      setConfirming(false);
    }
  };

  const handleAuthorize = async () => {
    if (!action) return;
    setAuthorizing(true);
    try {
      const updated = await ActionService.authorizeAction(action.id, {
        signed_by: action.payload?.director_name || 'Subanesh (Director)',
        din: action.payload?.din || '08947219',
        dsc_serial: 'SHA256-EMUDHRA-IND-84920482',
        remarks: 'Digitally authenticated in secure browser token environment'
      });
      setAction(updated);
      setSuccessToast('Digital Signature Certificate authorization completed successfully! You can now execute the submission or return to your AI assistant.');
      await loadActionData();
    } catch (err: any) {
      alert(err.message || 'Authorization failed');
    } finally {
      setAuthorizing(false);
    }
  };

  const handleExecute = async () => {
    if (!action) return;
    setExecuting(true);
    try {
      const res = await ActionService.executeAction(action.id, undefined, {
        actorType: 'USER',
        clientName: 'Future MCA Web Portal'
      });
      setAction(res.action);
      setSuccessToast(`Action successfully executed! Assigned Reference SRN: ${res.reference_number}`);
      await loadActionData();
    } catch (err: any) {
      alert(err.message || 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  const handleCancel = async () => {
    if (!action) return;
    if (!confirm('Are you sure you want to cancel this prepared action?')) return;
    try {
      const cancelled = await ActionService.cancelAction(action.id, 'User cancelled from Action Review Portal');
      setAction(cancelled);
      setSuccessToast('Action cancelled.');
      await loadActionData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel action.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs text-[#64748B] font-semibold">Loading secure action envelope...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !action) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-red-200 p-8 text-center space-y-4 shadow-sm">
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-[#0F172A]">Action Not Found</h2>
          <p className="text-xs text-[#64748B]">{errorMsg || 'The requested action does not exist or has expired.'}</p>
          <Link
            href="/actions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0F172A] text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Actions Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans">
      {/* Top Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/actions"
              className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-100 text-blue-800">
                  {action.preview.form_code || action.action_type}
                </span>
                <span className="text-xs font-mono text-[#64748B]">ID: {action.id}</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-[#0F172A]">
                {action.preview.action_summary}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadActionData}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-6">

        {/* Success Toast */}
        {successToast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Honest Demo Mode Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-bold">Future MCA Secure Post-Action Protocol</span>
              <span className="text-amber-700 ml-1.5">
                (Internal Pre-Scrutiny & Simulated RoC Execution Demo)
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full font-bold">
            Zero-Credential AI Isolation
          </span>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Columns: Action Review & Execution Stage */}
          <div className="lg:col-span-2 space-y-6">

            {/* Status Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Current Action Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-black text-[#0F172A]">{action.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700">
                    Created: {new Date(action.created_at).toLocaleDateString()}
                  </span>
                  {action.client_metadata?.client_name && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" />
                      {action.client_metadata.client_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Flow Stepper */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
                <div className={`p-3 rounded-xl border ${
                  ['DRAFT', 'PREVIEW_READY', 'AWAITING_USER_CONFIRMATION', 'CONFIRMED', 'AUTHORIZATION_REQUIRED', 'AUTHORIZED', 'SUBMITTED'].includes(action.status)
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <div className="text-[10px] uppercase text-blue-600 font-mono">Step 1</div>
                  <div>Draft Prepared</div>
                </div>

                <div className={`p-3 rounded-xl border ${
                  ['CONFIRMED', 'AUTHORIZATION_REQUIRED', 'AUTHORIZED', 'SUBMITTED'].includes(action.status)
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : action.status === 'AWAITING_USER_CONFIRMATION'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 ring-2 ring-amber-400/30 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <div className="text-[10px] uppercase text-amber-600 font-mono">Step 2</div>
                  <div>User Confirmed</div>
                </div>

                <div className={`p-3 rounded-xl border ${
                  ['AUTHORIZED', 'SUBMITTED'].includes(action.status)
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : action.status === 'AUTHORIZATION_REQUIRED'
                    ? 'bg-purple-50 border-purple-300 text-purple-800 ring-2 ring-purple-400/30 font-bold animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <div className="text-[10px] uppercase text-purple-600 font-mono">Step 3</div>
                  <div>DSC Authorized</div>
                </div>

                <div className={`p-3 rounded-xl border ${
                  action.status === 'SUBMITTED'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-400/30 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <div className="text-[10px] uppercase text-emerald-600 font-mono">Step 4</div>
                  <div>Executed (SRN)</div>
                </div>
              </div>

              {/* ACTION EXECUTION SUBMITTED RECEIPT */}
              {action.status === 'SUBMITTED' && action.execution_receipt && (
                <div className="p-6 rounded-2xl bg-emerald-50/90 border border-emerald-200 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-600 text-white">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-emerald-900">
                        Statutory Filing Successfully Executed
                      </h3>
                      <p className="text-xs text-emerald-700">
                        Service Request Number (SRN) generated and locked in compliance ledger.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-white rounded-xl border border-emerald-200">
                      <div className="text-[10px] uppercase text-[#64748B] font-bold">Assigned SRN</div>
                      <div className="text-sm font-black font-mono text-[#0F172A]">{action.execution_receipt.reference_number}</div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-emerald-200">
                      <div className="text-[10px] uppercase text-[#64748B] font-bold">Challan Ref</div>
                      <div className="text-sm font-black font-mono text-[#0F172A]">{action.execution_receipt.challan_receipt}</div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 col-span-2 sm:col-span-1">
                      <div className="text-[10px] uppercase text-[#64748B] font-bold">Statutory Fee</div>
                      <div className="text-sm font-black text-[#0F172A]">INR {action.execution_receipt.statutory_filing_fee}</div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <Link
                      href="/applications"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-all"
                    >
                      Track in Applications Hub <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/filings"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 transition-all"
                    >
                      View Filings Catalog
                    </Link>
                  </div>
                </div>
              )}

              {/* STEP 2: USER CONFIRMATION REQUIRED */}
              {action.status === 'AWAITING_USER_CONFIRMATION' && (
                <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">
                        Explicit User Confirmation Required
                      </h4>
                      <p className="text-xs text-amber-800 mt-1">
                        An AI agent prepared this action draft. Under the Future MCA zero silent execution policy, you must explicitly confirm the draft before digital signing or submission.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={handleConfirm}
                      disabled={confirming}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {confirming ? 'Confirming Action...' : 'Confirm & Proceed to Authorization'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100"
                    >
                      Cancel Action
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DIGITAL SIGNATURE (DSC) AUTHORIZATION SANDBOX */}
              {action.status === 'AUTHORIZATION_REQUIRED' && (
                <div className="p-6 rounded-2xl bg-purple-50/90 border border-purple-200 space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-purple-600 text-white flex-shrink-0">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-purple-950">
                        Secure Digital Signature Certificate (DSC) Authorization
                      </h4>
                      <p className="text-xs text-purple-800 mt-1 leading-relaxed">
                        This filing requires a Class 3 SHA-256 DSC token. To protect your credentials, signing is conducted in this browser-isolated sandbox and is <strong>NEVER</strong> shared with ChatGPT, Claude, Cursor, or any external AI agent.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-purple-200 p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-[#64748B] mb-1">
                          Detected USB / Cloud DSC Token
                        </label>
                        <select
                          value={selectedDsc}
                          onChange={(e) => setSelectedDsc(e.target.value)}
                          className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-mono text-[#0F172A]"
                        >
                          <option value="dsc-token-01">Subanesh (DIN: 08947219) - eMudhra Class 3 (Valid till 2028)</option>
                          <option value="dsc-token-02">Authorized Director - Capricorn SHA-256 (Valid till 2027)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-[#64748B] mb-1">
                          DSC Token User PIN / Passphrase
                        </label>
                        <input
                          type="password"
                          value={dscPin}
                          onChange={(e) => setDscPin(e.target.value)}
                          className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-mono text-[#0F172A]"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg text-[11px] font-mono text-[#64748B] flex items-center justify-between">
                      <span>Envelope Payload Hash: SHA256({action.id})</span>
                      <span className="text-purple-700 font-bold">emSigner Port 8080 Active</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={handleAuthorize}
                        disabled={authorizing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-all"
                      >
                        <Key className="w-4 h-4" />
                        {authorizing ? 'Verifying Token & Signing...' : 'Authorize & Digitally Sign Envelope'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: READY TO EXECUTE */}
              {(action.status === 'AUTHORIZED' || action.status === 'CONFIRMED') && (
                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-blue-950">
                        Action Authorized & Ready for Final Execution
                      </h4>
                      <p className="text-xs text-blue-800 mt-1">
                        All statutory prerequisites, user confirmation, and DSC token signatures are verified. You can execute submission now directly or ask your AI agent to call <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">execute_action</code>.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={handleExecute}
                      disabled={executing}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
                    >
                      <Send className="w-4 h-4" />
                      {executing ? 'Processing Submission...' : 'Submit & Execute Action Now'}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Form Payload & Data Preview Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Statutory e-Form Specification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div className="text-[10px] uppercase font-bold text-[#64748B]">Target Entity</div>
                  <div className="text-xs font-bold text-[#0F172A] mt-0.5">{action.company_name}</div>
                  <div className="text-[11px] font-mono text-[#64748B]">{action.preview.cin || 'Entity Registration'}</div>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div className="text-[10px] uppercase font-bold text-[#64748B]">Statutory Act & Section</div>
                  <div className="text-xs font-bold text-[#0F172A] mt-0.5">{action.preview.statutory_section}</div>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div className="text-[10px] uppercase font-bold text-[#64748B]">Statutory Deadline</div>
                  <div className="text-xs font-bold text-[#0F172A] mt-0.5">{action.preview.deadline}</div>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div className="text-[10px] uppercase font-bold text-[#64748B]">Statutory Government Fee</div>
                  <div className="text-xs font-bold text-[#0F172A] mt-0.5">INR {action.preview.estimated_fee || 500}</div>
                </div>
              </div>

              {/* Document Checklist */}
              <div className="pt-2 space-y-2">
                <div className="text-xs font-bold text-[#0F172A]">Mandatory Filing Attachments:</div>
                <div className="space-y-1.5">
                  {action.preview.required_documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[#334155] p-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                      <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Payload Accordion / Preview */}
              <div className="pt-2">
                <details className="text-xs text-[#64748B]">
                  <summary className="font-semibold cursor-pointer text-blue-600 hover:underline">
                    View Technical JSON Payload
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto font-mono text-[11px]">
                    {JSON.stringify(action.payload, null, 2)}
                  </pre>
                </details>
              </div>

            </div>

          </div>

          {/* Right Column: Security Controls & Audit Log Timeline */}
          <div className="space-y-6">

            {/* Security Guarantee Box */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                <Lock className="w-4 h-4 text-emerald-600" />
                Security Invariants
              </div>
              <ul className="text-xs text-[#64748B] space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Payload is immutable once preview is generated</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Token expires in 30 minutes to prevent replay</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Idempotency protection prevents duplicate submissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>No private keys or credentials stored on AI client</span>
                </li>
              </ul>
            </div>

            {/* Audit Trail Timeline */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Action Audit Trail
                </h3>
                <span className="text-[10px] font-mono text-[#64748B]">{auditLogs.length} events</span>
              </div>

              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="relative pl-5 pb-3 border-l-2 border-blue-100 last:border-l-0 text-xs">
                    <div className="absolute -left-[5px] top-0.5 w-2 h-2 rounded-full bg-blue-600"></div>
                    <div className="font-bold text-[#0F172A]">{log.event_type.replace(/_/g, ' ')}</div>
                    <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mt-0.5">
                      <span>Actor: {log.actor_type}</span>
                      <span>•</span>
                      <span>{log.client_name || 'Agent'}</span>
                    </div>
                    <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
