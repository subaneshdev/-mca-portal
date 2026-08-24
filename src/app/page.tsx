'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { McaBrandHeader } from '@/components/brand/McaBrandHeader';
import { AshokaEmblem, McaLogoBadge } from '@/components/brand/McaEmblem';
import { 
  Building2, 
  FileText, 
  Clock, 
  Search, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  User, 
  Users, 
  Briefcase, 
  Calendar, 
  Check, 
  Sparkles, 
  Lock, 
  ChevronRight, 
  ChevronDown,
  Layers,
  Cpu,
  Compass,
  FileCheck,
  Send
} from 'lucide-react';

export default function RedesignedLandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive "Starting a Company" Widget State
  const [entityType, setEntityType] = useState<'pvt_ltd' | 'llp' | 'opc' | 'unsure'>('pvt_ltd');
  const [companyNameInput, setCompanyNameInput] = useState('Ziggers');
  const [businessDescInput, setBusinessDescInput] = useState('We connect businesses with flexible workers');
  const [foundersCountInput, setFoundersCountInput] = useState('3');

  // Interactive "I Need Help" Widget State
  const [helpInput, setHelpInput] = useState('');
  const [helpResponse, setHelpResponse] = useState<{ query: string; steps: string[] } | null>(null);

  const handleHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpInput.trim()) return;
    
    const q = helpInput.toLowerCase();
    let steps = [
      'Identify the statutory requirement and compliance timeline',
      'Gather necessary board resolutions and verified documentation',
      'Submit the intimation through Future MCA guided workflow'
    ];

    if (q.includes('resig') || q.includes('director')) {
      steps = [
        'Obtain formal resignation letter with effective date from the director',
        'Convene Board meeting to accept resignation and pass resolution',
        'Submit Form DIR-12 intimation to RoC within 30 days of cessation'
      ];
    } else if (q.includes('address') || q.includes('office')) {
      steps = [
        'Collect registered office address proof (utility bill under 60 days old)',
        'Obtain NOC from the property owner / landlord',
        'Submit Form INC-22 within 30 days of office relocation'
      ];
    } else if (q.includes('file') || q.includes('annual')) {
      steps = [
        'Audit annual balance sheet and P&L financial statements',
        'Prepare Directors Report and conduct Annual General Meeting (AGM)',
        'File AOC-4 (Financials) within 30 days and MGT-7 (Annual Return) within 60 days of AGM'
      ];
    }

    setHelpResponse({ query: helpInput, steps });
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans selection:bg-[#0B2545] selection:text-white">
      
      {/* 1. Official Authentic MCA Navigation Header */}
      <McaBrandHeader
        searchValue={searchQuery}
        setSearchValue={setSearchQuery}
        onSearch={(q) => router.push(`/filings/new?query=${encodeURIComponent(q)}`)}
      />

      {/* 2. HERO SECTION */}
      <section className="bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9]/60 to-white pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          {/* Official Endorsement Tag */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E2E8F0]/80 border border-[#CBD5E1] text-[11px] sm:text-xs font-semibold text-[#0B2545] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#0066CC]"></span>
            <span>Ministry of Corporate Affairs • Next Generation Citizen Platform</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0B2545] max-w-4xl mx-auto leading-[1.15]">
            Managing a company shouldn&apos;t feel complicated.
          </h1>

          {/* Supporting Text */}
          <p className="text-sm sm:text-lg text-[#475569] max-w-2xl mx-auto leading-relaxed">
            Start a company, manage your compliance, track applications and get help when you need it. Future MCA brings everything together in one simple place.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#0B2545] hover:bg-[#07192F] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#action-selector"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-[#F8FAFC] text-[#0B2545] border-2 border-[#CBD5E1] hover:border-[#0B2545] font-bold text-sm transition-all"
            >
              Explore Services
            </a>
          </div>

          {/* Audience Sub-tagline */}
          <p className="text-xs text-[#64748B] pt-1">
            Built for founders, business owners, directors and professionals.
          </p>

        </div>
      </section>

      {/* 3. MAIN HERO INTERACTION: "WHAT WOULD YOU LIKE TO DO?" */}
      <section id="action-selector" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0066CC]">
              Action-First Experience
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545]">
              What would you like to do?
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto">
              Select your goal below. We will guide you through every step in plain language.
            </p>
          </div>

          {/* 5 Main Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Card 1: Start a Company */}
            <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#0B2545] rounded-2xl p-6 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#CBD5E1] flex items-center justify-center text-2xl shadow-xs">
                  🏢
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0B2545] group-hover:text-[#0066CC] transition-colors">
                    Start a Company
                  </h4>
                  <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                    Tell us about your business and we&apos;ll guide you through the process, structure, and required filings.
                  </p>
                </div>
              </div>

              <Link
                href="/onboarding?intent=incorporation"
                className="w-full py-2.5 px-4 rounded-xl bg-[#0B2545] hover:bg-[#0055A5] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Start</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2: Manage My Company */}
            <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#0B2545] rounded-2xl p-6 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#CBD5E1] flex items-center justify-center text-2xl shadow-xs">
                  📋
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0B2545] group-hover:text-[#0066CC] transition-colors">
                    Manage My Company
                  </h4>
                  <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                    View your company master information, active directors, documents, and important updates.
                  </p>
                </div>
              </div>

              <Link
                href="/companies"
                className="w-full py-2.5 px-4 rounded-xl bg-[#0B2545] hover:bg-[#0055A5] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Open Company</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3: Check What I Need To Do */}
            <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#0B2545] rounded-2xl p-6 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#CBD5E1] flex items-center justify-center text-2xl shadow-xs">
                  📅
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0B2545] group-hover:text-[#0066CC] transition-colors">
                    Check What I Need To Do
                  </h4>
                  <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                    See upcoming statutory deadlines, overdue risks, and required actions needing your attention.
                  </p>
                </div>
              </div>

              <Link
                href="/compliance"
                className="w-full py-2.5 px-4 rounded-xl bg-[#0B2545] hover:bg-[#0055A5] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Check Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 4: Track an Application */}
            <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#0B2545] rounded-2xl p-6 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#CBD5E1] flex items-center justify-center text-2xl shadow-xs">
                  🔎
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0B2545] group-hover:text-[#0066CC] transition-colors">
                    Track an Application
                  </h4>
                  <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                    Check the real-time progress, officer scrutiny, and approvals for your Service Request Number (SRN).
                  </p>
                </div>
              </div>

              <Link
                href="/applications"
                className="w-full py-2.5 px-4 rounded-xl bg-[#0B2545] hover:bg-[#0055A5] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Track Application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 5: I Need Help (Spans 2 cols on lg) */}
            <div className="md:col-span-2 bg-gradient-to-br from-[#0B2545] to-[#07192F] text-white rounded-2xl p-6 transition-all shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">💬</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#93C5FD] bg-[#003366] px-2 py-0.5 rounded">
                    Plain Language Assistant
                  </span>
                </div>
                <h4 className="text-lg font-bold">
                  I Need Help — Tell us what you&apos;re trying to do
                </h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  No need to memorize form numbers. Type in plain English (e.g. <em>&quot;A director has resigned&quot;</em> or <em>&quot;We changed our office address&quot;</em>).
                </p>
              </div>

              <form onSubmit={handleHelpSubmit} className="space-y-3">
                <div className="flex items-center bg-white/10 border border-white/20 rounded-xl overflow-hidden focus-within:border-[#93C5FD] transition-colors">
                  <input
                    type="text"
                    value={helpInput}
                    onChange={(e) => setHelpInput(e.target.value)}
                    placeholder="e.g. A director has resigned. What should I do?"
                    className="w-full bg-transparent text-xs text-white placeholder-white/50 px-4 py-2.5 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#0066CC] hover:bg-[#0055A5] text-white text-xs font-semibold shrink-0 transition-colors"
                  >
                    Ask
                  </button>
                </div>

                {helpResponse && (
                  <div className="p-3.5 bg-white/10 border border-white/20 rounded-xl space-y-2 text-xs text-[#E2E8F0] animate-in fade-in duration-150">
                    <div className="font-bold text-[#93C5FD]">
                      Guidance for: &quot;{helpResponse.query}&quot;
                    </div>
                    <ol className="space-y-1 pl-4 list-decimal text-[11px] text-white/90">
                      {helpResponse.steps.map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ol>
                    <Link
                      href={`/filings/new?query=${encodeURIComponent(helpResponse.query)}`}
                      className="inline-flex items-center space-x-1 text-[#93C5FD] hover:underline font-semibold text-[11px] pt-1"
                    >
                      <span>Start Guided Preparation &rarr;</span>
                    </Link>
                  </div>
                )}
              </form>
            </div>

          </div>

        </div>
      </section>

      {/* 4. FEATURE HIGHLIGHT: "STARTING A COMPANY? START HERE." */}
      <section className="py-16 bg-[#F8FAFC] border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0066CC]">
              Guided Incorporation
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545]">
              Starting a company? Start here.
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] max-w-xl mx-auto">
              Prepare and guide your company creation journey step by step without legal jargon.
            </p>
          </div>

          {/* Interactive Guided Flow Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
            
            {/* Step 1: Entity Type Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0B2545] block">
                1. What would you like to create?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'pvt_ltd', label: 'Private Limited Company' },
                  { id: 'llp', label: 'Limited Liability Partnership (LLP)' },
                  { id: 'opc', label: 'One Person Company (OPC)' },
                  { id: 'unsure', label: 'Not sure yet' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEntityType(opt.id as any)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      entityType === opt.id
                        ? 'bg-[#0B2545] border-[#0B2545] text-white shadow-xs'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] hover:border-[#CBD5E1]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Company Details Form */}
            <div className="space-y-3 border-t border-[#E2E8F0] pt-6">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0B2545] block">
                2. Tell us a little about your business
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-[#475569] block mb-1">Proposed Business Name</label>
                  <input
                    type="text"
                    value={companyNameInput}
                    onChange={(e) => setCompanyNameInput(e.target.value)}
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs outline-none focus:border-[#0066CC]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#475569] block mb-1">What does your business do?</label>
                  <input
                    type="text"
                    value={businessDescInput}
                    onChange={(e) => setBusinessDescInput(e.target.value)}
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs outline-none focus:border-[#0066CC]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#475569] block mb-1">Number of Founders</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={foundersCountInput}
                    onChange={(e) => setFoundersCountInput(e.target.value)}
                    className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs outline-none focus:border-[#0066CC]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Transparent Breakdown Checklist */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-3">
              <div className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                Your Customized Roadmap for &quot;{companyNameInput || 'New Entity'}&quot;:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0F172A]">Structure: </strong>
                    <span className="text-[#475569]">
                      {entityType === 'pvt_ltd' ? 'Private Limited with separate legal entity status' :
                       entityType === 'llp' ? 'LLP with flexible partner agreement' :
                       entityType === 'opc' ? 'Solo Founder OPC with nominated successor' :
                       'Guided structure assessment'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0F172A]">Documents Needed: </strong>
                    <span className="text-[#475569]">PAN, Aadhaar, Bank Statement, Office Utility Bill</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0F172A]">Estimated Timeline: </strong>
                    <span className="text-[#475569]">3 to 5 working days for name & certificate</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0F172A]">Immediate Next Step: </strong>
                    <span className="text-[#475569]">Run name availability & trademark pre-check</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  href={`/onboarding?name=${encodeURIComponent(companyNameInput)}&type=${entityType}`}
                  className="px-5 py-2.5 rounded-lg bg-[#0B2545] hover:bg-[#07192F] text-white font-bold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <span>Begin Preparation Journey</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. "JUST TELL US WHAT HAPPENED" */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0066CC]">
              Event-Driven Workflows
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545]">
              You don&apos;t need to know the form. Just tell us what happened.
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto">
              Real corporate events translated into clean, step-by-step guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Scenario 1 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0066CC] rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all">
              <div className="space-y-3">
                <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0F172A]">
                  &ldquo;A director has resigned.&rdquo;
                </div>
                <div className="text-center text-[#94A3B8] text-xs font-bold">&darr;</div>
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase text-[#0066CC] tracking-wider">Future MCA:</div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    This may require updating your director information on the central register within 30 days. We&apos;ll guide you through the required board extract and intimation.
                  </p>
                </div>
              </div>

              <Link
                href="/filings/new?intent=director-resigned"
                className="w-full py-2 px-3 bg-white hover:bg-[#0B2545] hover:text-white border border-[#CBD5E1] text-[#0B2545] font-bold text-xs rounded-xl transition-all text-center block"
              >
                Continue &rarr;
              </Link>
            </div>

            {/* Scenario 2 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0066CC] rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all">
              <div className="space-y-3">
                <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0F172A]">
                  &ldquo;We changed our office address.&rdquo;
                </div>
                <div className="text-center text-[#94A3B8] text-xs font-bold">&darr;</div>
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase text-[#0066CC] tracking-wider">Future MCA:</div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    We&apos;ll help you understand what premises proof and utility bills are required to record the new registered office with the Registrar of Companies.
                  </p>
                </div>
              </div>

              <Link
                href="/filings/new?intent=address-changed"
                className="w-full py-2 px-3 bg-white hover:bg-[#0B2545] hover:text-white border border-[#CBD5E1] text-[#0B2545] font-bold text-xs rounded-xl transition-all text-center block"
              >
                Check Requirements &rarr;
              </Link>
            </div>

            {/* Scenario 3 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0066CC] rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-all">
              <div className="space-y-3">
                <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0F172A]">
                  &ldquo;I haven&apos;t filed anything this year.&rdquo;
                </div>
                <div className="text-center text-[#94A3B8] text-xs font-bold">&darr;</div>
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase text-[#0066CC] tracking-wider">Future MCA:</div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    Let&apos;s check your company status, calculate any statutory penalty exposure, and organize your overdue annual filings in order of priority.
                  </p>
                </div>
              </div>

              <Link
                href="/compliance"
                className="w-full py-2 px-3 bg-white hover:bg-[#0B2545] hover:text-white border border-[#CBD5E1] text-[#0B2545] font-bold text-xs rounded-xl transition-all text-center block"
              >
                Check My Company &rarr;
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 6. ACTUAL PORTAL EXPERIENCE PREVIEW: "EVERYTHING ABOUT YOUR COMPANY, IN ONE PLACE." */}
      <section className="py-16 bg-[#F8FAFC] border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0066CC]">
              Calm & Clear Workspace
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545]">
              Everything about your company, in one place.
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] max-w-xl mx-auto">
              A serene dashboard designed to keep you informed without stress or confusing jargon.
            </p>
          </div>

          {/* Realistic Portal Window Mockup */}
          <div className="bg-white border-2 border-[#CBD5E1] rounded-2xl shadow-xl overflow-hidden max-w-5xl mx-auto">
            
            {/* Window Top Bar */}
            <div className="bg-[#0B2545] text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                <span className="text-[11px] font-mono text-[#94A3B8] ml-2">Future MCA Command Centre • Ziggers Private Limited</span>
              </div>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-[#93C5FD]">
                Live Status
              </span>
            </div>

            {/* Dashboard Content Mockup */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Salutation Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
                <div>
                  <h4 className="text-xl font-bold text-[#0B2545]">
                    Good morning, Subanesh 👋
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Here&apos;s what needs your attention for <strong className="text-[#0F172A]">Ziggers Private Limited</strong>.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-3 py-1 bg-[#EFF6FF] text-[#0066CC] border border-[#BFDBFE] rounded-full">
                    CIN: U72900KA2021PTC145892
                  </span>
                </div>
              </div>

              {/* 4 Summary Stat Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
                  <div className="text-2xl font-black text-[#DC2626]">3</div>
                  <div className="text-xs font-bold text-[#991B1B] mt-0.5">Actions Needed</div>
                </div>

                <div className="p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl">
                  <div className="text-2xl font-black text-[#D97706]">2</div>
                  <div className="text-xs font-bold text-[#92400E] mt-0.5">Upcoming</div>
                </div>

                <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl">
                  <div className="text-2xl font-black text-[#2563EB]">1</div>
                  <div className="text-xs font-bold text-[#1E40AF] mt-0.5">In Progress</div>
                </div>

                <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl">
                  <div className="text-2xl font-black text-[#16A34A]">✓</div>
                  <div className="text-xs font-bold text-[#166534] mt-0.5">All Good</div>
                </div>
              </div>

              {/* Priority Action Cards & Calendar Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Priority Action Items (2 cols) */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                    Priority Items Requiring Attention:
                  </div>

                  {/* Priority 1 */}
                  <div className="p-4 bg-white border-l-4 border-l-[#DC2626] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626]">CRITICAL</span>
                        <span className="text-xs font-bold text-[#0B2545]">Annual Financial Statements Filing (AOC-4)</span>
                      </div>
                      <p className="text-[11px] text-[#64748B]">Audited balance sheet submission due in 2 days.</p>
                    </div>
                    <Link
                      href="/filings/new?form=AOC-4"
                      className="px-3.5 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs rounded-lg shrink-0 transition-colors"
                    >
                      Start Now
                    </Link>
                  </div>

                  {/* Priority 2 */}
                  <div className="p-4 bg-white border-l-4 border-l-[#D97706] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFFBEB] text-[#D97706]">ACTION REQUIRED</span>
                        <span className="text-xs font-bold text-[#0B2545]">Director Information & KYC (DIR-3)</span>
                      </div>
                      <p className="text-[11px] text-[#64748B]">Annual web KYC verification for Director Ananya Sharma.</p>
                    </div>
                    <Link
                      href="/filings/new?form=DIR-3"
                      className="px-3.5 py-1.5 bg-[#0B2545] hover:bg-[#07192F] text-white font-bold text-xs rounded-lg shrink-0 transition-colors"
                    >
                      Continue
                    </Link>
                  </div>

                  {/* Priority 3 */}
                  <div className="p-4 bg-white border-l-4 border-l-[#CBD5E1] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">UPCOMING</span>
                        <span className="text-xs font-bold text-[#0B2545]">Annual Return of Company (MGT-7A)</span>
                      </div>
                      <p className="text-[11px] text-[#64748B]">Due in 18 days for small company compliance.</p>
                    </div>
                    <Link
                      href="/filings/new?form=MGT-7"
                      className="px-3.5 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0B2545] font-bold text-xs rounded-lg shrink-0 transition-colors"
                    >
                      Prepare
                    </Link>
                  </div>
                </div>

                {/* Right: Statutory Calendar Preview (1 col) */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3 text-xs">
                  <div className="font-bold text-[#0B2545] flex items-center justify-between">
                    <span>Statutory Calendar</span>
                    <Calendar className="w-4 h-4 text-[#64748B]" />
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-white border border-[#E2E8F0] rounded-lg">
                      <div className="text-[10px] text-[#DC2626] font-bold font-mono">26 AUG 2026</div>
                      <div className="font-bold text-[#0F172A] mt-0.5">AOC-4 Due Date</div>
                      <div className="text-[10px] text-[#64748B]">Penalty ₹100/day after default</div>
                    </div>

                    <div className="p-2.5 bg-white border border-[#E2E8F0] rounded-lg">
                      <div className="text-[10px] text-[#D97706] font-bold font-mono">30 SEP 2026</div>
                      <div className="font-bold text-[#0F172A] mt-0.5">DIR-3 KYC Cutoff</div>
                      <div className="text-[10px] text-[#64748B]">Fee ₹5,000 for delayed deactivation</div>
                    </div>

                    <div className="p-2.5 bg-white border border-[#E2E8F0] rounded-lg">
                      <div className="text-[10px] text-[#0284C7] font-bold font-mono">29 NOV 2026</div>
                      <div className="font-bold text-[#0F172A] mt-0.5">MGT-7A Return</div>
                      <div className="text-[10px] text-[#64748B]">Routine statutory submission</div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 7. SIMPLE 3-STEP ONBOARDING */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0066CC]">
              Simple Onboarding
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545]">
              Getting started is simple.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-3 relative text-center">
              <div className="w-10 h-10 rounded-full bg-[#0B2545] text-white font-black text-sm flex items-center justify-center mx-auto">
                1
              </div>
              <h4 className="text-base font-bold text-[#0B2545]">
                Create your account
              </h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Sign up securely using your email or existing credentials in less than 30 seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-3 relative text-center">
              <div className="w-10 h-10 rounded-full bg-[#0B2545] text-white font-black text-sm flex items-center justify-center mx-auto">
                2
              </div>
              <h4 className="text-base font-bold text-[#0B2545]">
                Tell us about your company
              </h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Add your registered CIN or start fresh with our step-by-step incorporation guide.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-3 relative text-center">
              <div className="w-10 h-10 rounded-full bg-[#0B2545] text-white font-black text-sm flex items-center justify-center mx-auto">
                3
              </div>
              <h4 className="text-base font-bold text-[#0B2545]">
                See what needs attention
              </h4>
              <p className="text-xs text-[#475569] leading-relaxed">
                Future MCA organises your important actions, filings, and statutory calendar in one calm dashboard.
              </p>
            </div>

          </div>

          <div className="text-center pt-2">
            <Link
              href="/onboarding"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[#0B2545] hover:bg-[#07192F] text-white font-bold text-xs transition-colors"
            >
              <span>Start in 30 Seconds</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* 8. BUILT FOR DIFFERENT ROLES */}
      <section className="py-16 bg-[#F8FAFC] border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0066CC]">
              Designed for You
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545]">
              Built for different people across Indian business.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Role 1: Business Owners */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#0066CC] flex items-center justify-center font-bold text-sm">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0B2545]">For Business Owners</h4>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                  Understand what your company needs without having to learn the entire compliance handbook.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-[#0F172A] border-t border-[#E2E8F0] pt-3">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Start new companies with guided steps</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Track deadlines and avoid penalty surprises</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Store and organize statutory certificates</span>
                </li>
              </ul>
            </div>

            {/* Role 2: Directors */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center font-bold text-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0B2545]">For Company Directors</h4>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                  Stay informed about personal fiduciary responsibilities and statutory obligations connected to your DIN.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-[#0F172A] border-t border-[#E2E8F0] pt-3">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Monitor DIN and annual KYC compliance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Track Digital Signature (DSC) expirations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Receive director cessation & appointment alerts</span>
                </li>
              </ul>
            </div>

            {/* Role 3: CA / CS Professionals */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] text-[#0B2545] border border-[#CBD5E1] flex items-center justify-center font-bold text-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0B2545]">For CA / CS Professionals</h4>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                  Manage multiple companies, client portfolios, and bulk risk matrices from a unified practice workspace.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-[#0F172A] border-t border-[#E2E8F0] pt-3">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Multi-client risk overview & compliance filters</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Automated pre-scrutiny & error diagnosis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Rapid e-Form validation & attachment checklists</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 9. FUTURE-READY SERVICES (MCP & AI ASSISTANTS AS A CONTROLLED FEATURE) */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0066CC]">
              Future-Ready Infrastructure
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545]">
              Designed for people, and ready for your AI tools.
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] max-w-2xl mx-auto leading-relaxed">
              Future MCA is designed not only for people, but also for the next generation of AI assistants. Connect your tools to securely query information you choose to share.
            </p>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
            
            {/* 3 Compatible Clients */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="px-4 py-2 bg-white border border-[#CBD5E1] rounded-full text-xs font-bold text-[#0B2545] shadow-xs flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#0066CC]" />
                <span>Anthropic Claude</span>
              </div>
              <div className="px-4 py-2 bg-white border border-[#CBD5E1] rounded-full text-xs font-bold text-[#0B2545] shadow-xs flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Cursor IDE</span>
              </div>
              <div className="px-4 py-2 bg-white border border-[#CBD5E1] rounded-full text-xs font-bold text-[#0B2545] shadow-xs flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Windsurf & Custom Agents</span>
              </div>
            </div>

            {/* Controlled Action Mockup */}
            <div className="bg-white border border-[#CBD5E1] rounded-xl p-5 space-y-4">
              <div className="text-xs font-bold text-[#0B2545] uppercase tracking-wider flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Human-In-The-Loop Safety Principle:</span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                Future MCA can prepare actions and draft statutory submissions. <strong>You always review and authorize</strong> before anything is changed.
              </p>

              <div className="p-4 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between text-[#0F172A]">
                  <span className="font-bold">Proposed Action from Connected Assistant:</span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#CBD5E1]">OAuth 2.1 Verified</span>
                </div>
                <div className="text-[11px] text-[#475569]">
                  Change: <strong>Director cessation intimation (DIR-12)</strong> • Entity: <strong>Ziggers Private Limited</strong>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <button className="px-3.5 py-1.5 bg-[#0B2545] text-white text-xs font-semibold rounded-lg">
                    Confirm & Proceed
                  </button>
                  <button className="px-3.5 py-1.5 bg-white border border-[#CBD5E1] text-[#475569] text-xs font-semibold rounded-lg">
                    Review Details
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/connect-ai"
                className="text-xs font-bold text-[#0066CC] hover:underline flex items-center justify-center space-x-1"
              >
                <span>Learn how to connect Claude or Cursor &rarr;</span>
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 10. OFFICIAL TRUST SECTION (DEEP MCA NAVY) */}
      <section className="bg-[#0B2545] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#93C5FD]">
              Trust & Governance
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Institutional security, modern simplicity.
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <ShieldCheck className="w-6 h-6 text-[#93C5FD]" />
              <h4 className="text-sm font-bold text-white">Secure & Trusted</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Government-grade authentication, row-level tenant isolation, and strict access controls.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <Compass className="w-6 h-6 text-[#93C5FD]" />
              <h4 className="text-sm font-bold text-white">Simple to Use</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Designed for ordinary citizens and first-time founders, not just compliance experts.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <Calendar className="w-6 h-6 text-[#93C5FD]" />
              <h4 className="text-sm font-bold text-white">Stay Updated</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                See upcoming filing deadlines, penalty projections, and statutory cutoffs in one clear view.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <Users className="w-6 h-6 text-[#93C5FD]" />
              <h4 className="text-sm font-bold text-white">Built for Everyone</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Tailored journeys for founders, business owners, individual directors, and CA/CS professionals.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 11. FINAL CONFIDENT CTA */}
      <section className="py-20 bg-gradient-to-b from-white to-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2545] tracking-tight">
            Your company. Made easier to manage.
          </h2>

          <p className="text-sm sm:text-base text-[#475569] max-w-xl mx-auto leading-relaxed">
            Whether you&apos;re starting your first company or managing several, Future MCA helps you understand what to do next.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0B2545] hover:bg-[#07192F] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/overview"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-[#F8FAFC] text-[#0B2545] border-2 border-[#CBD5E1] hover:border-[#0B2545] font-bold text-sm transition-all"
            >
              Explore Future MCA
            </Link>
          </div>

          <p className="text-[11px] text-[#64748B]">
            A new way to experience corporate services.
          </p>

        </div>
      </section>

      {/* 12. OFFICIAL FOOTER */}
      <footer className="bg-[#0B2545] text-[#94A3B8] text-xs border-t border-[#081B33]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <AshokaEmblem className="w-8 h-11 brightness-200" />
              <div>
                <div className="text-white font-bold text-sm">Ministry of Corporate Affairs</div>
                <div className="text-[#64748B] text-[11px]">Government of India • Next Gen Portal</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs">
              <Link href="/companies" className="hover:text-white transition-colors">Master Data</Link>
              <Link href="/compliance" className="hover:text-white transition-colors">Statutory Deadlines</Link>
              <Link href="/diagnostics" className="hover:text-white transition-colors">Error Diagnostics</Link>
              <Link href="/connect-ai" className="hover:text-white transition-colors">AI & MCP Services</Link>
              <Link href="/system-status" className="hover:text-white transition-colors">System Health</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>
              © 2026 Ministry of Corporate Affairs, Government of India. All Rights Reserved.
            </p>
            <div className="flex items-center space-x-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security & Audit</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
