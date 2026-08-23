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
  ArrowLeft
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
    role === 'founder' ? 'My Startup Workspace' : 'CA & Associates Practice'
  );
  const [companyName, setCompanyName] = useState('');
  const [companyCin, setCompanyCin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Confirm Persona
  const handlePersonaNext = async () => {
    await setRole(selectedPersona);
    setWorkspaceName(
      selectedPersona === 'founder' ? 'Ziggers Startup Workspace' : 'Subanesh & Associates'
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
      router.push('/overview');
    } catch (err) {
      router.push('/overview');
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
      router.push('/overview');
    } catch {
      router.push('/overview');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center font-bold text-xs">
            MCA
          </div>
          <span className="text-lg font-bold tracking-tight text-black">Future MCA Onboarding</span>
        </div>

        {/* Progression Dots */}
        <div className="flex items-center justify-center space-x-2 pt-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                step === s ? 'w-8 bg-[#2563EB]' : step > s ? 'w-4 bg-black' : 'w-4 bg-[#E5E5E5]'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white p-6 sm:p-8 shadow-sm border border-[#E5E5E5] rounded-xl space-y-6">
          
          {/* STEP 1: PERSONA SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-mono uppercase text-[#737373] tracking-wider">
                  Step 1 of 3
                </div>
                <h1 className="text-xl font-bold tracking-tight text-black mt-1">
                  How will you use Future MCA?
                </h1>
                <p className="text-xs text-[#525252] mt-0.5">
                  Select your primary role to configure workflows and attention matrices.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Business Owner */}
                <div
                  onClick={() => setSelectedPersona('founder')}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    selectedPersona === 'founder'
                      ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 bg-[#EFF6FF]'
                      : 'border-[#E5E5E5] hover:border-[#737373] bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded bg-white text-[#2563EB] border border-[#E5E5E5] flex items-center justify-center mb-3">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-black">Founder & Business Owner</h3>
                  <p className="text-xs text-[#525252] mt-1 leading-relaxed">
                    Manage your company, understand obligations in plain language, and track RoC applications.
                  </p>
                  <div className="text-[10px] text-[#2563EB] font-medium mt-3 flex items-center space-x-1">
                    <span>Intent-first workflows</span>
                  </div>
                </div>

                {/* CA / CS Professional */}
                <div
                  onClick={() => setSelectedPersona('professional')}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    selectedPersona === 'professional'
                      ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 bg-[#EFF6FF]'
                      : 'border-[#E5E5E5] hover:border-[#737373] bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded bg-white text-[#2563EB] border border-[#E5E5E5] flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-black">CA / CS Professional</h3>
                  <p className="text-xs text-[#525252] mt-1 leading-relaxed">
                    Manage 50+ client entities, bulk deadline matrix, instant DSC diagnosis, and MCP agents.
                  </p>
                  <div className="text-[10px] text-[#2563EB] font-medium mt-3 flex items-center space-x-1">
                    <span>Multi-client power tools</span>
                  </div>
                </div>

              </div>

              <button
                type="button"
                onClick={handlePersonaNext}
                className="w-full py-2.5 px-4 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Continue to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STEP 2: CREATE WORKSPACE */}
          {step === 2 && (
            <form onSubmit={handleWorkspaceNext} className="space-y-6">
              <div>
                <div className="text-[10px] font-mono uppercase text-[#737373] tracking-wider">
                  Step 2 of 3
                </div>
                <h1 className="text-xl font-bold tracking-tight text-black mt-1">
                  Create your workspace
                </h1>
                <p className="text-xs text-[#525252] mt-0.5">
                  All companies, compliance records, and AI agent permissions will be isolated inside this workspace.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-black block mb-1">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    required
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g. Ziggers Technologies or Subanesh & Associates"
                    className="w-full px-3.5 py-2.5 text-xs border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB] text-[#0A0A0A]"
                  />
                </div>

                <div className="p-3.5 rounded bg-[#F7F7F5] border border-[#E5E5E5] space-y-1">
                  <div className="font-semibold text-black flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Workspace Isolation Guarantee</span>
                  </div>
                  <p className="text-[11px] text-[#525252]">
                    Data created under this workspace is completely isolated. Only authorized team members and scoped MCP clients can read this workspace.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-medium text-[#525252] hover:text-black flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white rounded-lg transition-colors flex items-center space-x-1.5"
                >
                  <span>{isLoading ? 'Creating Workspace...' : 'Continue to Add Company'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ADD COMPANY OR LOAD DEMO */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-mono uppercase text-[#737373] tracking-wider">
                  Step 3 of 3
                </div>
                <h1 className="text-xl font-bold tracking-tight text-black mt-1">
                  Add a company to your workspace
                </h1>
                <p className="text-xs text-[#525252] mt-0.5">
                  Load a realistic demo entity with pre-configured directors and compliance deadlines, or create your own entity.
                </p>
              </div>

              {/* Option A: Quick Hackathon Demo Loading */}
              <div className="p-5 rounded-xl bg-[#EFF6FF] border border-[#2563EB]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-[#2563EB]" />
                    <span className="font-bold text-xs text-black">Recommended for Testing</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#2563EB] font-bold border border-[#2563EB]/20">
                    Instant Demo Seed
                  </span>
                </div>
                
                <p className="text-xs text-[#525252]">
                  Instantly load <strong>Ziggers Private Limited</strong> with 3 Directors, critical AOC-4 & DIR-3 KYC statutory items, and an active RoC application journey into your workspace.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleLoadDemo('ziggers')}
                    className="p-2.5 rounded-lg bg-black hover:bg-[#0A0A0A] text-white text-xs font-medium text-center transition-colors shadow-sm"
                  >
                    Load Ziggers Pvt Ltd
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleLoadDemo('unfounded')}
                    className="p-2.5 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#0A0A0A] text-xs font-medium text-center transition-colors"
                  >
                    Unfounded Tech Pvt Ltd
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleLoadDemo('futurefoods')}
                    className="p-2.5 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#0A0A0A] text-xs font-medium text-center transition-colors"
                  >
                    Future Foods Pvt Ltd
                  </button>
                </div>
              </div>

              {/* Option B: Manual Company Creation */}
              <div className="pt-2 border-t border-[#E5E5E5] space-y-3">
                <div className="text-xs font-bold text-black uppercase tracking-wider text-[#737373]">
                  Or add a custom company
                </div>

                <form onSubmit={handleCreateCustom} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-black block mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Apex Frontier Robotics Private Limited"
                      className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-black block mb-1">CIN (Optional)</label>
                    <input
                      type="text"
                      value={companyCin}
                      onChange={(e) => setCompanyCin(e.target.value)}
                      placeholder="e.g. U72900KA2024PTC123456"
                      className="w-full px-3 py-2 text-xs font-mono border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!companyName.trim() || isLoading}
                    className="w-full py-2.5 px-4 text-xs font-medium bg-[#F7F7F5] hover:bg-[#EFF6FF] border border-[#E5E5E5] hover:border-[#2563EB] disabled:opacity-40 text-black rounded-lg transition-colors"
                  >
                    Create Custom Company & Enter
                  </button>
                </form>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-medium text-[#525252] hover:text-black flex items-center space-x-1"
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
