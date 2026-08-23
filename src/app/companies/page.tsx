'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace } from '@/context/WorkspaceContext';
import { CompanyService } from '@/lib/services/companyService';
import { Company } from '@/types';
import { 
  Building2, 
  Search, 
  Plus, 
  ChevronRight, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Filter
} from 'lucide-react';

export default function CompaniesPage() {
  const { role, setSelectedCompany, createCompany } = useWorkspace();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyCin, setNewCompanyCin] = useState('');

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await CompanyService.listCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filtered = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.cin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.roc_jurisdiction.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    try {
      const created = await createCompany({
        cin: newCompanyCin.trim().toUpperCase() || `U72900DL2024PTC${Math.floor(100000 + Math.random() * 900000)}`,
        name: newCompanyName.trim(),
        legal_type: 'Private Limited Company',
        status: 'ACTIVE',
        paid_up_capital: 100000,
        authorized_capital: 1000000,
        incorporation_date: new Date().toISOString().split('T')[0],
        roc_jurisdiction: 'ROC Delhi',
        registered_office: 'Connaught Place, New Delhi - 110001',
        email: 'admin@company.in'
      });
      await loadCompanies();
      setSelectedCompany(created);
      setIsAddModalOpen(false);
      setNewCompanyName('');
      setNewCompanyCin('');
    } catch (err: any) {
      alert(`Failed to add company: ${err.message}`);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-black">
              {role === 'founder' ? 'Your Companies' : 'Client Portfolio'}
            </h1>
            <p className="text-xs text-[#525252] mt-1">
              {role === 'founder'
                ? 'Manage active entities, directors, and statutory authorizations.'
                : 'Monitor filing deadlines, DIN statuses, and compliance risks across all clients.'}
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium bg-black hover:bg-[#0A0A0A] text-white rounded transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Company</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center space-x-3 bg-white border border-[#E5E5E5] rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-[#737373]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company name, CIN, or RoC jurisdiction..."
            className="w-full text-xs text-[#0A0A0A] outline-none placeholder-[#737373]"
          />
        </div>

        {/* Companies Roster */}
        <div className="space-y-3">
          {filtered.map(company => (
            <div
              key={company.id}
              className="bg-white border border-[#E5E5E5] rounded-lg p-5 hover:border-[#2563EB] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2.5">
                    <h2 className="text-base font-bold text-black">{company.name}</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] font-medium border border-[#2563EB]/20">
                      {company.status}
                    </span>
                    <span className="text-xs text-[#737373] hidden sm:inline">•</span>
                    <span className="text-xs text-[#737373] hidden sm:inline">{company.legal_type}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#525252]">
                    <span className="font-mono text-[#737373]">CIN: {company.cin}</span>
                    <span>•</span>
                    <span>{company.roc_jurisdiction}</span>
                    <span>•</span>
                    <span>Inc: {company.incorporation_date}</span>
                  </div>

                  <div className="pt-1 flex items-center space-x-2 text-xs">
                    <span className="text-[#737373]">Next action:</span>
                    <span className="font-medium text-black">{company.next_action}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <Link
                    href={`/companies/${company.cin}`}
                    onClick={() => setSelectedCompany(company)}
                    className="px-4 py-2 text-xs font-medium bg-[#F7F7F5] hover:bg-[#EFF6FF] text-[#0A0A0A] border border-[#E5E5E5] hover:border-[#2563EB] rounded transition-all flex items-center space-x-1.5"
                  >
                    <span>View Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 bg-white border border-[#E5E5E5] rounded-lg">
              <p className="text-xs text-[#525252]">No companies found matching "{searchQuery}".</p>
            </div>
          )}
        </div>

        {/* Add Company Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <h3 className="text-sm font-bold text-black">Authorize / Link New Company</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs text-[#737373] hover:text-black"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddCompany} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#0A0A0A] block mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="e.g. Apex Frontier Robotics Private Limited"
                    className="w-full px-3 py-2 text-xs border border-[#E5E5E5] rounded outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#0A0A0A] block mb-1">CIN (Optional)</label>
                  <input
                    type="text"
                    value={newCompanyCin}
                    onChange={(e) => setNewCompanyCin(e.target.value)}
                    placeholder="e.g. U72900DL2024PTC123456"
                    className="w-full px-3 py-2 text-xs font-mono border border-[#E5E5E5] rounded outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-[#525252] hover:text-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded transition-colors"
                  >
                    Add to Workspace
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
