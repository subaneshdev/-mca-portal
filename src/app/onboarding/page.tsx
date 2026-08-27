'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';
import { WorkspaceRole } from '@/types';
import { 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Zap, 
  Layers,
  ArrowLeft,
  MessageSquare,
  Briefcase
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { 
    user, 
    profile, 
    role, 
    setRole, 
    createWorkspace, 
    loadDemoCompany, 
    createCompany 
  } = useWorkspace();

  const [step, setStep] = useState(1);
  const [selectedPersona, setSelectedPersona] = useState<WorkspaceRole>(role || 'founder');
  const [workspaceName, setWorkspaceName] = useState(
    role === 'founder' ? 'My Business Workspace' : 'CA & Associates Practice'
  );
  const [companyName, setCompanyName] = useState('');
  const [companyCin, setCompanyCin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Determine destination based on selected persona
  const getDestinationUrl = (targetPersona: WorkspaceRole) => {
    return targetPersona === 'founder' ? '/chat' : '/overview';
  };

  // Step 1: Confirm Persona
  const handlePersonaNext = async () => {
    await setRole(selectedPersona);
    setWorkspaceName(
      selectedPersona === 'founder'
        ? `${profile?.full_name || 'My'} Business Workspace`
        : `${profile?.full_name || 'Professional'} & Associates Practice`
    );
    setStep(2);
  };

  // Step 2: Create Workspace
  const handleWorkspaceNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;
    setIsLoading(true);
    try {
      await createWorkspace(workspaceName.trim(), selectedPersona);
      setStep(3);
    } catch {
      setStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3A: Load Realistic Demo Company
  const handleLoadDemo = async (preset: 'ziggers' | 'unfounded' | 'futurefoods' = 'ziggers') => {
    setIsLoading(true);
    try {
      await loadDemoCompany(preset);
      router.push(getDestinationUrl(selectedPersona));
    } catch (err) {
      router.push(getDestinationUrl(selectedPersona));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3B: Custom Company Creation
  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    setIsLoading(true);
    try {
      await createCompany({
        name: companyName.trim(),
        cin: companyCin.trim().toUpperCase() || undefined
      });
      router.push(getDestinationUrl(selectedPersona));
    } catch {
      router.push(getDestinationUrl(selectedPersona));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#0B2545] text-white flex items-center justify-center font-black text-xs">
            MCA
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0B2545]">Future MCA Onboarding</span>
        </div>

        {/* Progression Dots */}
        <div className="flex items-center justify-center space-x-2 pt-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                step === s ? 'w-8 bg-[#0066CC]' : step > s ? 'w-4 bg-[#0B2545]' : 'w-4 bg-[#CBD5E1]'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white p-6 sm:p-8 shadow-md border border-[#CBD5E1] rounded-2xl space-y-6">
          
          {/* STEP 1: PERSONA SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider">
                  Step 1 of 3
                </div>
                <h1 className="text-2xl font-black tracking-tight text-[#0B2545] mt-1">
                  How do you want to use Future MCA?
                </h1>
                <p className="text-xs text-[#475569] mt-0.5">
                  Future MCA adapts its primary interface to match how you work. You can change this at any time in Settings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Option 1: Business Owner */}
                <div
                  onClick={() => setSelectedPersona('founder')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    selectedPersona === 'founder'
                      ? 'border-[#0066CC] ring-2 ring-[#0066CC]/20 bg-[#EFF6FF]'
                      : 'border-[#CBD5E1] hover:border-[#0B2545] bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-white text-[#0066CC] border border-[#CBD5E1] flex items-center justify-center shadow-xs">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#0B2545]">
                        BUSINESS OWNER
                      </h3>
                      <p className="text-xs font-semibold text-[#0066CC] mt-0.5">
                        Tell me what needs my attention.
                      </p>
                    </div>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      Ask questions in plain language and let Future MCA guide you through compliance, changes, and applications.
                    </p>
                  </div>
                  <div className="text-[10px] text-[#0066CC] font-bold pt-1 border-t border-[#CBD5E1]/50">
                    Primary: Conversational Workspace
                  </div>
                </div>

                {/* Option 2: CA / CS Professional */}
                <div
                  onClick={() => setSelectedPersona('professional')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    selectedPersona === 'professional'
                      ? 'border-[#0066CC] ring-2 ring-[#0066CC]/20 bg-[#EFF6FF]'
                      : 'border-[#CBD5E1] hover:border-[#0B2545] bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-white text-[#0066CC] border border-[#CBD5E1] flex items-center justify-center shadow-xs">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#0B2545]">
                        CA / CS PROFESSIONAL
                      </h3>
                      <p className="text-xs font-semibold text-[#0066CC] mt-0.5">
                        Show me everything I need to manage.
                      </p>
                    </div>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      Work with companies, filings, forms, deadlines and compliance workflows across your client portfolio.
                    </p>
                  </div>
                  <div className="text-[10px] text-[#0066CC] font-bold pt-1 border-t border-[#CBD5E1]/50">
                    Primary: Professional Operations UI
                  </div>
                </div>

              </div>

              <button
                type="button"
                onClick={handlePersonaNext}
                className="w-full py-3 px-4 text-xs font-bold bg-[#0B2545] hover:bg-[#07192F] text-white rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Continue to Workspace Configuration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: CREATE WORKSPACE */}
          {step === 2 && (
            <form onSubmit={handleWorkspaceNext} className="space-y-6">
              <div>
                <div className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider">
                  Step 2 of 3
                </div>
                <h1 className="text-2xl font-black tracking-tight text-[#0B2545] mt-1">
                  Configure your workspace
                </h1>
                <p className="text-xs text-[#475569] mt-0.5">
                  All companies, filings, and authorized MCP connections reside inside this workspace.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-[#0B2545] block mb-1">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    required
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g. Acme Innovations or Frontier Advisory"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0B2545] text-[#0F172A]"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-1">
                  <div className="font-bold text-[#0B2545] flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-[#0066CC]" />
                    <span>One Platform • Two Experiences</span>
                  </div>
                  <p className="text-[11px] text-[#475569]">
                    Whether you use the Conversational Workspace or Professional UI, the underlying Supabase records, companies, and permissions remain shared and synchronized.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0B2545] flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 text-xs font-bold bg-[#0B2545] hover:bg-[#07192F] disabled:opacity-50 text-white rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
                >
                  <span>{isLoading ? 'Creating Workspace...' : 'Continue to Company Setup'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ADD COMPANY OR LOAD DEMO */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider">
                  Step 3 of 3
                </div>
                <h1 className="text-2xl font-black tracking-tight text-[#0B2545] mt-1">
                  Add a company to your workspace
                </h1>
                <p className="text-xs text-[#475569] mt-0.5">
                  Load a realistic demo entity with pre-configured directors and compliance deadlines, or create your custom entity.
                </p>
              </div>

              {/* Option A: Quick Demo Loading */}
              <div className="p-5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-[#0066CC]" />
                    <span className="font-bold text-xs text-[#0B2545]">Instant Demo Company</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#0066CC] font-bold border border-[#BFDBFE]">
                    Ready to Test
                  </span>
                </div>
                
                <p className="text-xs text-[#475569]">
                  Load <strong>Ziggers Private Limited</strong> with active directors, urgent AOC-4 & DIR-3 KYC deadlines, and RoC application records.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleLoadDemo('ziggers')}
                    className="p-2.5 rounded-xl bg-[#0B2545] hover:bg-[#07192F] text-white text-xs font-bold text-center transition-all shadow-sm"
                  >
                    Ziggers Pvt Ltd
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleLoadDemo('unfounded')}
                    className="p-2.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#0B2545] text-xs font-bold text-center transition-all"
                  >
                    Unfounded Tech
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleLoadDemo('futurefoods')}
                    className="p-2.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#0B2545] text-xs font-bold text-center transition-all"
                  >
                    Future Foods
                  </button>
                </div>
              </div>

              {/* Option B: Manual Company Creation */}
              <div className="pt-2 border-t border-[#E2E8F0] space-y-3">
                <div className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                  Or add a custom company
                </div>

                <form onSubmit={handleCreateCustom} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-[#475569] block mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Apex Frontier Robotics Private Limited"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0B2545]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#475569] block mb-1">CIN (Optional)</label>
                    <input
                      type="text"
                      value={companyCin}
                      onChange={(e) => setCompanyCin(e.target.value)}
                      placeholder="e.g. U72900KA2024PTC123456"
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0B2545]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!companyName.trim() || isLoading}
                    className="w-full py-2.5 px-4 text-xs font-bold bg-white hover:bg-[#EFF6FF] border border-[#CBD5E1] hover:border-[#0066CC] disabled:opacity-40 text-[#0B2545] rounded-xl transition-all"
                  >
                    Create Custom Company & Enter Workspace &rarr;
                  </button>
                </form>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0B2545] flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
