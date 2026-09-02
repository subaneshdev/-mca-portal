'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';
import { UserRole } from '@/types';
import { 
  Building2, 
  Briefcase, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding, profile } = useWorkspace();

  const [selectedCategory, setSelectedCategory] = useState<'business' | 'client_mgmt'>('business');
  const [selectedRole, setSelectedRole] = useState<UserRole>('FOUNDER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectCategory = (category: 'business' | 'client_mgmt') => {
    setSelectedCategory(category);
    if (category === 'business') {
      setSelectedRole('FOUNDER');
    } else {
      setSelectedRole('CA');
    }
  };

  const handleComplete = async (roleToUse: UserRole) => {
    setIsSubmitting(true);
    try {
      const { destination } = await completeOnboarding(roleToUse);
      router.push(destination);
    } catch {
      router.push(roleToUse === 'FOUNDER' || roleToUse === 'BUSINESS_OWNER' ? '/chat' : '/overview');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-neutral-900 font-sans flex flex-col justify-between p-4 sm:p-8 antialiased selection:bg-neutral-200">
      
      {/* Top Header / Ministry Badge */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pt-2 pb-6 border-b border-neutral-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs tracking-tight">
            MCA
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-900 tracking-tight">Future MCA</div>
            <div className="text-[10px] text-neutral-500 font-mono">Government Gateway</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-neutral-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-medium">Direct RoC Registry</span>
        </div>
      </header>

      {/* Main Role Selection Viewport */}
      <main className="max-w-4xl mx-auto w-full py-8 sm:py-12 flex-1 flex flex-col justify-center">
        
        {/* Title & Subtitle */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
            Welcome to Future MCA
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 font-normal">
            How do you work with companies?
          </p>
        </div>

        {/* Exactly Two Primary Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          
          {/* OPTION 1: I Own or Run a Business */}
          <div
            onClick={() => handleSelectCategory('business')}
            className={cn(
              "p-6 sm:p-8 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative text-left group",
              selectedCategory === 'business'
                ? "border-neutral-900 bg-white shadow-xl ring-4 ring-neutral-900/5"
                : "border-neutral-200/90 bg-neutral-50/50 hover:bg-white hover:border-neutral-400"
            )}
          >
            {selectedCategory === 'business' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white text-neutral-800 flex items-center justify-center transition-colors">
                <Building2 className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-neutral-950">
                  I Own or Run a Business
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  You are a founder, director, business owner, or someone managing your own company.
                </p>
              </div>

              {/* Explicit Role Chips */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory('business');
                    setSelectedRole('FOUNDER');
                  }}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg font-medium transition-all",
                    selectedCategory === 'business' && selectedRole === 'FOUNDER'
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  )}
                >
                  Founder
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory('business');
                    setSelectedRole('BUSINESS_OWNER');
                  }}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg font-medium transition-all",
                    selectedCategory === 'business' && selectedRole === 'BUSINESS_OWNER'
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  )}
                >
                  Business Owner
                </button>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-4 border-t border-neutral-100">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.stopPropagation();
                  handleComplete(selectedCategory === 'business' ? selectedRole : 'FOUNDER');
                }}
                className={cn(
                  "w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs",
                  selectedCategory === 'business'
                    ? "bg-neutral-900 hover:bg-black text-white"
                    : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                )}
              >
                <span>{isSubmitting && selectedCategory === 'business' ? 'Configuring Workspace...' : 'Continue as Business Owner'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* OPTION 2: I Manage Companies for Clients */}
          <div
            onClick={() => handleSelectCategory('client_mgmt')}
            className={cn(
              "p-6 sm:p-8 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative text-left group",
              selectedCategory === 'client_mgmt'
                ? "border-neutral-900 bg-white shadow-xl ring-4 ring-neutral-900/5"
                : "border-neutral-200/90 bg-neutral-50/50 hover:bg-white hover:border-neutral-400"
            )}
          >
            {selectedCategory === 'client_mgmt' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white text-neutral-800 flex items-center justify-center transition-colors">
                <Users className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-neutral-950">
                  I Manage Companies for Clients
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  You are a Chartered Accountant, Company Secretary, compliance professional, or someone managing multiple companies.
                </p>
              </div>

              {/* Explicit Role Chips */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory('client_mgmt');
                    setSelectedRole('CA');
                  }}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg font-medium transition-all",
                    selectedCategory === 'client_mgmt' && selectedRole === 'CA'
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  )}
                >
                  CA
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory('client_mgmt');
                    setSelectedRole('CS');
                  }}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg font-medium transition-all",
                    selectedCategory === 'client_mgmt' && selectedRole === 'CS'
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  )}
                >
                  CS
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory('client_mgmt');
                    setSelectedRole('COMPLIANCE_PROFESSIONAL');
                  }}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg font-medium transition-all",
                    selectedCategory === 'client_mgmt' && selectedRole === 'COMPLIANCE_PROFESSIONAL'
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  )}
                >
                  Compliance Pro
                </button>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-4 border-t border-neutral-100">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.stopPropagation();
                  handleComplete(selectedCategory === 'client_mgmt' ? selectedRole : 'CA');
                }}
                className={cn(
                  "w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs",
                  selectedCategory === 'client_mgmt'
                    ? "bg-neutral-900 hover:bg-black text-white"
                    : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                )}
              >
                <span>{isSubmitting && selectedCategory === 'client_mgmt' ? 'Configuring Practice...' : 'Continue as CA / CS Professional'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* 3-Second Understanding Note */}
        <div className="mt-8 text-center text-xs text-neutral-400 flex items-center justify-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
          <span>MCP AI Agent access is configured automatically according to your role and workspace permissions.</span>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="max-w-4xl mx-auto w-full py-4 text-center text-[11px] text-neutral-400 border-t border-neutral-100">
        MCA V3 Standard Corporate Gateway &bull; Role-Based Governance
      </footer>
    </div>
  );
}
