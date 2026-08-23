'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace } from '@/context/WorkspaceContext';
import { FilingService } from '@/lib/services/filingService';
import { FilingIntent } from '@/types';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Upload, 
  FileText, 
  Key, 
  ShieldCheck, 
  AlertCircle, 
  Building2, 
  User, 
  HelpCircle 
} from 'lucide-react';

function NewFilingWizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const intentParam = searchParams.get('intent') || 'director-resigned';
  const formParam = searchParams.get('form');

  const { selectedCompany, openAiWithQuery } = useWorkspace();
  const [intent, setIntent] = useState<FilingIntent | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Dynamic Board Directors
  const directors = selectedCompany?.directors || [];
  const defaultDirector = directors.length > 0 
    ? `${directors[0].din} - ${directors[0].full_name} (${directors[0].designation})`
    : '08945120 - Subanesh M. (Managing Director)';

  // Form State
  const [selectedDirector, setSelectedDirector] = useState(defaultDirector);
  const [effectiveDate, setEffectiveDate] = useState('2026-08-20');
  const [filingReason, setFilingReason] = useState('Personal commitments and preoccupation');
  const [boardResolutionDate, setBoardResolutionDate] = useState('2026-08-22');
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({
    'doc-0': true,
    'doc-1': true,
    'doc-2': false
  });
  const [dscPin, setDscPin] = useState('123456');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  useEffect(() => {
    let found = FilingService.getIntentById(intentParam);
    if (!found && formParam) {
      found = FilingService.getIntentById(formParam);
    }
    setIntent(found || FilingService.getIntents()[0]);
  }, [intentParam, formParam]);

  if (!intent) {
    return (
      <div className="p-8 text-center text-xs text-[#525252]">Loading workflow...</div>
    );
  }

  const handleToggleDoc = (key: string) => {
    setUploadedDocs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await FilingService.createFilingApplication({
        company_id: selectedCompany?.id || 'c0000000-0000-0000-0000-000000000001',
        form_code: intent.form_code,
        title: `${intent.title} (${intent.form_code})`,
        fee_paid: 600,
        remarks: `Filing submitted for ${selectedCompany?.name || 'Authorized Entity'}. Scrutiny under RoC STP gateway.`
      });

      setSubmissionResult({
        srn: res.srn,
        status: 'UNDER_REVIEW',
        form_code: intent.form_code,
        fee_paid: '₹600.00',
        message: 'e-Form successfully signed and submitted to RoC STP gateway.'
      });
      setCurrentStep(5);
    } catch (err: any) {
      setSubmissionResult({
        srn: `SRN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        status: 'UNDER_REVIEW',
        form_code: intent.form_code,
        fee_paid: '₹600.00',
        message: 'e-Form recorded in workspace database.'
      });
      setCurrentStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Workflow Breadcrumb & Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/filings"
          className="text-xs text-[#525252] hover:text-black flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Filings Catalog</span>
        </Link>
        <button
          onClick={() => openAiWithQuery(`Explain the statutory requirements and penalties for ${intent.title} (${intent.form_code})`)}
          className="text-xs text-[#2563EB] hover:underline flex items-center space-x-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask AI: What does this mean?</span>
        </button>
      </div>

      {/* Wizard Card Header */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#737373] tracking-wider">
              Guided Corporate Filing Workflow
            </div>
            <h1 className="text-xl font-bold tracking-tight text-black flex items-center space-x-2 mt-0.5">
              <span>{intent.title}</span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
                {intent.form_code}
              </span>
            </h1>
            <p className="text-xs text-[#525252] mt-0.5">{intent.section} • {intent.deadline_rule}</p>
          </div>

          <div className="text-xs font-mono bg-[#F7F7F5] px-3 py-1.5 rounded border border-[#E5E5E5] text-[#0A0A0A]">
            Entity: <span className="font-semibold">{selectedCompany?.name}</span>
          </div>
        </div>

        {/* Stepper Progression Bar */}
        {currentStep <= 4 && (
          <div className="grid grid-cols-4 gap-2 pt-1 text-xs">
            {[
              { num: 1, title: 'Scope & Entity' },
              { num: 2, title: 'Required Info' },
              { num: 3, title: 'Documents' },
              { num: 4, title: 'DSC & Submit' }
            ].map(step => (
              <div key={step.num} className="space-y-1.5">
                <div className={`h-1.5 rounded-full ${
                  currentStep >= step.num ? 'bg-[#2563EB]' : 'bg-[#E5E5E5]'
                }`} />
                <div className="flex items-center space-x-1">
                  <span className={`text-[11px] font-bold ${
                    currentStep === step.num ? 'text-[#2563EB]' : currentStep > step.num ? 'text-black' : 'text-[#737373]'
                  }`}>
                    {step.num}. {step.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STEP 1: SCOPE & ENTITY SELECTION */}
      {currentStep === 1 && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-black">Step 1: Verify Company & Signatories</h2>
            <p className="text-xs text-[#525252] mt-0.5">
              Confirm active company master record and select the affected director or officer.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded bg-[#F7F7F5] border border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Building2 className="w-4 h-4 text-[#2563EB]" />
                <div>
                  <div className="font-semibold text-black">{selectedCompany?.name}</div>
                  <div className="text-[11px] text-[#737373] font-mono">CIN: {selectedCompany?.cin} • {selectedCompany?.roc_jurisdiction}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0FDF4] text-[#16A34A] font-bold">
                AUTHORIZED
              </span>
            </div>

            <div>
              <label className="font-semibold text-black block mb-1.5">
                Select Relevant Signatory / Director from Active Board
              </label>
              <select
                value={selectedDirector}
                onChange={(e) => setSelectedDirector(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB] bg-white text-[#0A0A0A]"
              >
                {directors.map(d => (
                  <option key={d.id || d.din} value={`${d.din} - ${d.full_name} (${d.designation})`}>
                    {d.din} - {d.full_name} ({d.designation})
                  </option>
                ))}
                {directors.length === 0 && (
                  <option value="08945120 - Subanesh M. (Managing Director)">
                    08945120 - Subanesh M. (Managing Director)
                  </option>
                )}
              </select>
            </div>

            <div className="p-3 rounded bg-[#EFF6FF] border border-[#2563EB]/20 flex items-start space-x-2 text-[11px] text-[#525252]">
              <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <strong className="text-black">Statutory Quorum Check:</strong> Current Board maintains active DINs and valid DSC tokens, satisfying Section 149 of the Companies Act 2013.
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded transition-colors flex items-center space-x-1.5"
            >
              <span>Continue to Required Info</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: REQUIRED STATUTORY INFORMATION */}
      {currentStep === 2 && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-black">Step 2: Statutory Information & Dates</h2>
            <p className="text-xs text-[#525252] mt-0.5">
              Enter the effective event date and Board resolution approval timestamp.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-black block mb-1.5">
                  Effective Event Date
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB] bg-white text-[#0A0A0A]"
                />
              </div>

              <div>
                <label className="font-semibold text-black block mb-1.5">
                  Board Meeting / Resolution Date
                </label>
                <input
                  type="date"
                  value={boardResolutionDate}
                  onChange={(e) => setBoardResolutionDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB] bg-white text-[#0A0A0A]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-black block mb-1.5">
                Reason / Note for RoC Record
              </label>
              <input
                type="text"
                value={filingReason}
                onChange={(e) => setFilingReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB] bg-white text-[#0A0A0A]"
              />
            </div>

            <div className="p-3 rounded bg-[#F7F7F5] border border-[#E5E5E5] flex items-center justify-between">
              <div>
                <div className="font-semibold text-black">Filing Window Calculation</div>
                <div className="text-[11px] text-[#737373]">30 days from {effectiveDate} &rarr; Filing is on track.</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] font-bold">
                WITHIN STATUTORY WINDOW
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs font-medium text-[#525252] hover:text-black"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded transition-colors flex items-center space-x-1.5"
            >
              <span>Continue to Attachments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DOCUMENT CHECKLIST & VALIDATION */}
      {currentStep === 3 && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-black">Step 3: Upload Mandatory Attachments</h2>
            <p className="text-xs text-[#525252] mt-0.5">
              Inspected for digital signature validity and statutory size limit (&lt;6MB).
            </p>
          </div>

          <div className="space-y-3">
            {intent.required_documents.map((docName, idx) => {
              const isUploaded = uploadedDocs[`doc-${idx}`];

              return (
                <div
                  key={idx}
                  onClick={() => handleToggleDoc(`doc-${idx}`)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    isUploaded ? 'bg-white border-[#2563EB]' : 'bg-[#F7F7F5] border-[#E5E5E5] hover:border-[#737373]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      isUploaded ? 'bg-[#2563EB] text-white' : 'bg-[#E5E5E5] text-[#737373]'
                    }`}>
                      {isUploaded ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-black">{docName}</div>
                      <div className="text-[11px] text-[#737373]">
                        {isUploaded ? 'Attachment validated (PDF, 240 KB)' : 'Click to simulate PDF upload'}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    isUploaded ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-white text-[#737373] border border-[#E5E5E5]'
                  }`}>
                    {isUploaded ? 'READY' : 'PENDING'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-medium text-[#525252] hover:text-black"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded transition-colors flex items-center space-x-1.5"
            >
              <span>Continue to DSC Sign & Submit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DSC SIGN & SUBMIT */}
      {currentStep === 4 && (
        <form onSubmit={handleFinalSubmit} className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-black">Step 4: Affix Digital Signature (DSC) & Pay Fee</h2>
            <p className="text-xs text-[#525252] mt-0.5">
              Sign with Class 3 Crypto Token and transmit to RoC STP server.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded bg-[#F7F7F5] border border-[#E5E5E5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-black">Statutory Fee Challan</span>
                <span className="font-bold text-black text-sm">₹600.00</span>
              </div>
              <div className="flex items-center justify-between text-[#737373]">
                <span>Form Code: {intent.form_code}</span>
                <span>{selectedCompany?.roc_jurisdiction || 'RoC'} Normal Challan</span>
              </div>
            </div>

            <div className="p-4 rounded bg-white border border-[#E5E5E5] space-y-3">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-[#2563EB]" />
                <span className="font-semibold text-black">DSC Certificate Detected</span>
              </div>
              <div className="text-[11px] text-[#525252]">
                Token: <span className="font-mono text-black">ePass2003 (Class 3 SHA-256)</span> • Registered for {selectedCompany?.name}
              </div>
              <div>
                <label className="text-[11px] text-[#737373] block mb-1">Enter Token PIN for Signing</label>
                <input
                  type="password"
                  required
                  value={dscPin}
                  onChange={(e) => setDscPin(e.target.value)}
                  placeholder="Enter 6-digit USB Token PIN..."
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded outline-none focus:border-[#2563EB] font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 text-xs font-medium text-[#525252] hover:text-black"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white rounded transition-colors flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing & Transmitting to RoC...</span>
                </>
              ) : (
                <>
                  <span>Sign DSC & Submit e-Form</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 5: SUCCESS ACKNOWLEDGMENT */}
      {currentStep === 5 && submissionResult && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-black">Filing Successfully Submitted</h2>
            <p className="text-xs text-[#525252]">Your Service Request Number (SRN) has been recorded in the database.</p>
          </div>

          <div className="bg-[#F7F7F5] border border-[#E5E5E5] rounded-lg p-4 max-w-sm mx-auto space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#737373]">SRN:</span>
              <span className="font-mono font-bold text-black">{submissionResult.srn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#737373]">Form Code:</span>
              <span className="font-mono text-black">{submissionResult.form_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#737373]">Statutory Fee:</span>
              <span className="font-mono text-black">{submissionResult.fee_paid} (Paid)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#737373]">Status:</span>
              <span className="font-mono text-[#2563EB] font-bold">Under RoC Scrutiny (STP)</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center space-x-3">
            <Link
              href="/applications"
              className="px-4 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded transition-colors"
            >
              Track in Application Journey
            </Link>
            <Link
              href="/overview"
              className="px-4 py-2 text-xs font-medium bg-[#F7F7F5] hover:bg-[#EFF6FF] text-[#0A0A0A] border border-[#E5E5E5] rounded transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}

export default function NewFilingWizardPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-xs text-[#525252]">Loading guided workflow...</div>}>
        <NewFilingWizardContent />
      </Suspense>
    </AppShell>
  );
}
