'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AshokaEmblem, McaLogoBadge } from './McaEmblem';
import { Search, User, ArrowRight, Sparkles, Bot, Briefcase } from 'lucide-react';

interface McaBrandHeaderProps {
  onSearch?: (query: string) => void;
  searchValue?: string;
  setSearchValue?: (val: string) => void;
}

export function McaBrandHeader({ onSearch, searchValue, setSearchValue }: McaBrandHeaderProps) {
  const router = useRouter();
  const [internalQuery, setInternalQuery] = useState('');
  const query = searchValue !== undefined ? searchValue : internalQuery;
  const setQuery = setSearchValue || setInternalQuery;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (onSearch) {
      onSearch(query);
    } else {
      router.push(`/filings/new?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="w-full bg-white border-b border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.05)] sticky top-0 z-50 font-sans">
      
      {/* Top Government Strip */}
      <div className="bg-[#0B2545] text-white py-1 px-4 sm:px-8 text-[11px] font-medium flex items-center justify-between border-b border-[#081B33]">
        <div className="flex items-center space-x-3">
          <span className="font-medium tracking-wide">भारत सरकार • GOVERNMENT OF INDIA</span>
          <span className="hidden md:inline text-[#94A3B8]">|</span>
          <span className="hidden md:inline text-[#E2E8F0] font-normal">कार्पोरेट कार्य मंत्रालय • Ministry of Corporate Affairs</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px]">
          <Link href="/system-status" className="text-[#93C5FD] hover:underline flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] inline-block animate-pulse"></span>
            <span>Services Operational</span>
          </Link>
          <span className="text-[#64748B]">|</span>
          <span className="text-[#E2E8F0] font-mono">Accessibility: A+ A-</span>
        </div>
      </div>

      {/* Main Authentic MCA Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Left: Emblem + MCA Logo Stack + Mottos */}
        <div className="flex items-center space-x-4 shrink-0">
          
          {/* Ashoka Stambh Lion Emblem */}
          <Link href="/" className="shrink-0 group">
            <AshokaEmblem className="w-9 h-13 sm:w-11 sm:h-15 drop-shadow-sm group-hover:opacity-95 transition-opacity" />
          </Link>

          {/* MCA Logo + Ministry Typography */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <McaLogoBadge className="w-9 h-9 sm:w-10 sm:h-10 rounded shadow-sm group-hover:scale-105 transition-transform" />
            <div className="leading-none text-left">
              <div className="font-extrabold text-[12px] sm:text-[13px] tracking-tight text-[#0B2545] uppercase font-sans">
                Ministry of
              </div>
              <div className="font-extrabold text-[12px] sm:text-[13px] tracking-tight text-[#0B2545] uppercase font-sans">
                Corporate
              </div>
              <div className="font-extrabold text-[12px] sm:text-[13px] tracking-tight text-[#0B2545] uppercase font-sans">
                Affairs
              </div>
              <div className="text-[9px] sm:text-[10px] font-bold text-[#0066CC] tracking-wider uppercase mt-0.5">
                Government of India
              </div>
            </div>
          </Link>

          {/* Subtle Vertical Divider */}
          <div className="hidden xl:block w-px h-11 bg-[#CBD5E1]" />

          {/* Mottos & 4 Pillars (Regulator, Integrator, Facilitator, Educator) */}
          <div className="hidden xl:flex flex-col justify-center text-left">
            <div className="text-[11px] font-bold text-[#0B2545] tracking-wider uppercase">
              Empowering Business, Protecting Investors
            </div>
            <div className="text-[10px] font-bold tracking-wide mt-1 flex items-center space-x-1.5">
              <span className="text-[#EA580C]">REGULATOR</span>
              <span className="text-[#94A3B8]">•</span>
              <span className="text-[#16A34A]">INTEGRATOR</span>
              <span className="text-[#94A3B8]">•</span>
              <span className="text-[#DC2626]">FACILITATOR</span>
              <span className="text-[#94A3B8]">•</span>
              <span className="text-[#0284C7]">EDUCATOR</span>
            </div>
          </div>
        </div>

        {/* Center: Universal Search Bar */}
        <div className="flex-1 max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services, forms, or ask in plain language (e.g. 'A director resigned')"
              className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0]/80 focus:bg-white text-xs sm:text-sm text-[#0F172A] placeholder-[#64748B] pl-4 pr-10 py-2.5 rounded-full border border-[#CBD5E1] focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/20 outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B2545] transition-colors p-1"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Dual Workspace Entry & Login */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <Link
            href="/chat"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#0066CC] font-bold text-xs transition-all shadow-xs"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Founder Chat</span>
          </Link>

          <Link
            href="/overview"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-[#0B2545] hover:bg-[#07192F] text-white font-bold text-xs transition-all shadow-sm"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Professional UI</span>
          </Link>
        </div>

      </div>

      {/* Sub-Header Navigation Bar */}
      <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-[#0B2545] flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
            <span>Future MCA</span>
          </span>
          <span className="text-[#64748B]">•</span>
          <span className="text-[#475569]">
            One platform. Two distinct workspaces: <strong>Conversational Chat for Founders</strong> and <strong>Operational Matrix for CA/CS</strong>.
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-4 text-[#475569] font-medium">
          <Link href="/companies" className="hover:text-[#0066CC] transition-colors">Master Data</Link>
          <Link href="/compliance" className="hover:text-[#0066CC] transition-colors">Compliance Schedule</Link>
          <Link href="/filings" className="hover:text-[#0066CC] transition-colors">e-Forms & Events</Link>
          <Link href="/applications" className="hover:text-[#0066CC] transition-colors">Track SRN</Link>
          <Link href="/connect-ai" className="hover:text-[#0066CC] text-[#0284C7] font-semibold flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-[#0284C7]" />
            <span>AI & MCP Services</span>
          </Link>
        </div>
      </div>

    </header>
  );
}
