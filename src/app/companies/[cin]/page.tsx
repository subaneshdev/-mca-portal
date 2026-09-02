'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useWorkspace } from '@/context/WorkspaceContext';
import { CompanyService } from '@/lib/services/companyService';
import { ComplianceService } from '@/lib/services/complianceService';
import { Company, Director, ComplianceDeadline } from '@/types';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  FileText, 
  FolderArchive, 
  History, 
  Sparkles, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Key, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function CompanyDetailPage() {
  const params = useParams();
  const cin = params?.cin as string;
  const { openAiWithQuery, setSelectedCompany } = useWorkspace();

  const [company, setCompany] = useState<Company | null>(null);
  const [directors, setDirectors] = useState<Director[]>([]);
  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'compliance' | 'people' | 'filings' | 'documents' | 'activity'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!cin) return;
      setLoading(true);
      const comp = await CompanyService.getCompanyByCin(cin);
      if (comp) {
        setCompany(comp);
        setSelectedCompany(comp);
        const [dirs, comps] = await Promise.all([
          CompanyService.getCompanyDirectors(comp.id),
          ComplianceService.getUpcomingDeadlines(comp.id)
        ]);
        setDirectors(dirs);
        setDeadlines(comps);
      }
      setLoading(false);
    }
    load();
  }, [cin]);

  if (loading || !company) {
    return (
      <AppShell>
        <div className="p-8 text-center text-xs text-[#525252]">Loading company profile...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Company Header */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-[#737373]">CIN: {company.cin}</span>
                <span>•</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] font-semibold">
                  {company.status}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-black">{company.name}</h1>
              <p className="text-xs text-[#525252]">{company.registered_office}</p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => openAiWithQuery(`Give me a complete compliance briefing for ${company.name}`)}
                className="px-3 py-2 text-xs font-medium bg-[#F7F7F5] hover:bg-[#EFF6FF] text-[#0A0A0A] border border-[#E5E5E5] hover:border-[#2563EB] rounded transition-all flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Ask About This Company</span>
              </button>
              <Link
                href="/filings/new"
                className="px-3.5 py-2 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded transition-colors flex items-center space-x-1"
              >
                <span>Report Event</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Stat Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E5E5E5] text-xs">
            <div>
              <div className="text-[#737373] text-[11px]">Entity Type</div>
              <div className="font-medium text-black">{company.legal_type}</div>
            </div>
            <div>
              <div className="text-[#737373] text-[11px]">RoC Jurisdiction</div>
              <div className="font-medium text-black">{company.roc_jurisdiction}</div>
            </div>
            <div>
              <div className="text-[#737373] text-[11px]">Paid-up Capital</div>
              <div className="font-medium text-black">₹{company.paid_up_capital.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div className="text-[#737373] text-[11px]">Incorporated</div>
              <div className="font-medium text-black">{company.incorporation_date}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 border-b border-[#E5E5E5] text-xs font-medium">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'compliance', label: `Compliance (${deadlines.length})` },
            { id: 'people', label: `People / Directors (${directors.length})` },
            { id: 'filings', label: 'Filings History' },
            { id: 'documents', label: 'Documents' },
            { id: 'activity', label: 'Activity' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#2563EB] text-[#2563EB] font-bold bg-white'
                  : 'border-transparent text-[#525252] hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Next Required Action Box */}
              <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                    Immediate Next Action
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626] font-bold">
                    Action Required
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-black">{company.next_action}</h4>
                  <p className="text-xs text-[#525252]">
                    Statutory financial statements (Form AOC-4) balance sheet and audit schedule upload is incomplete under Section 137.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/compliance"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#2563EB] text-white text-xs font-medium hover:bg-[#1D4ED8] transition-colors"
                  >
                    <span>Proceed to Filing Preparation</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Statutory Registrations */}
              <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737373] border-b border-[#E5E5E5] pb-2">
                  Statutory Registrations
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#E5E5E5]/60">
                    <span className="text-[#737373]">Corporate PAN</span>
                    <span className="font-mono font-medium text-black">{company.pan || 'AABCG1234F'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E5E5E5]/60">
                    <span className="text-[#737373]">GSTIN</span>
                    <span className="font-mono font-medium text-black">{company.gst || '29AABCG1234F1Z5'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E5E5E5]/60">
                    <span className="text-[#737373]">Official Contact</span>
                    <span className="text-black">{company.email}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#737373]">Authorized Capital</span>
                    <span className="font-medium text-black">₹{company.authorized_capital.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Directors Strip */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                  Active Board of Directors ({directors.length})
                </h3>
                <button
                  onClick={() => setActiveTab('people')}
                  className="text-xs text-[#2563EB] hover:underline"
                >
                  View all details
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {directors.map(dir => (
                  <div key={dir.id} className="p-3 rounded bg-[#F7F7F5] border border-[#E5E5E5] space-y-1">
                    <div className="font-bold text-xs text-black">{dir.full_name}</div>
                    <div className="text-[11px] text-[#525252]">{dir.designation}</div>
                    <div className="text-[10px] font-mono text-[#737373]">DIN: {dir.din}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPLIANCE */}
        {activeTab === 'compliance' && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Active Statutory Deadlines for {company.name}
            </h3>
            <div className="space-y-3">
              {deadlines.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        item.urgency === 'critical' ? 'bg-[#FEF2F2] text-[#DC2626]' :
                        item.urgency === 'action_required' ? 'bg-[#FFFBEB] text-[#D97706]' :
                        'bg-white text-[#525252]'
                      }`}>
                        {item.urgency}
                      </span>
                      <span className="font-mono text-xs font-bold text-black">{item.form_code}</span>
                    </div>
                    <div className="text-xs font-semibold text-black">{item.title}</div>
                    <p className="text-xs text-[#525252]">{item.description}</p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono font-medium text-black">Due: {item.due_date}</div>
                      <div className="text-[10px] text-[#737373]">Statutory Section</div>
                    </div>
                    <Link
                      href="/compliance"
                      className="px-3 py-1.5 text-xs font-medium bg-[#2563EB] text-white rounded hover:bg-[#1D4ED8]"
                    >
                      Prepare
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PEOPLE / DIRECTORS */}
        {activeTab === 'people' && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div>
                <h3 className="text-sm font-bold text-black">Director Identification & Signatory Matrix</h3>
                <p className="text-xs text-[#525252]">Real-time tracking of DIN validity, annual KYC, and DSC certificate expiration.</p>
              </div>
              <Link
                href="/filings/new?intent=director-resigned"
                className="px-3 py-1.5 text-xs font-medium bg-black hover:bg-[#0A0A0A] text-white rounded transition-colors"
              >
                Director Event (DIR-12)
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E5E5] text-[#737373] text-[11px] uppercase">
                    <th className="py-2.5 font-medium">Director Name</th>
                    <th className="py-2.5 font-medium">DIN</th>
                    <th className="py-2.5 font-medium">Designation</th>
                    <th className="py-2.5 font-medium">DIN Status</th>
                    <th className="py-2.5 font-medium">DIR-3 KYC</th>
                    <th className="py-2.5 font-medium">DSC Token</th>
                    <th className="py-2.5 font-medium">DSC Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {directors.map(dir => {
                    const isResigned = (dir as any).status === 'RESIGNED' || !!(dir as any).cessation_date;
                    return (
                      <tr key={dir.id} className="hover:bg-[#F7F7F5]">
                        <td className="py-3 font-semibold text-black">
                          <div className="flex items-center space-x-2">
                            <span>{dir.full_name}</span>
                            {isResigned && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626] font-bold">
                                RESIGNED ({dir.cessation_date || '15 Aug 2026'})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 font-mono text-[#525252]">{dir.din}</td>
                        <td className="py-3 text-[#525252]">
                          {isResigned ? 'Former Director' : dir.designation}
                        </td>
                        <td className="py-3">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            isResigned ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#F0FDF4] text-[#16A34A]'
                          }`}>
                            {isResigned ? 'RESIGNED' : dir.din_status}
                          </span>
                        </td>
                      <td className="py-3">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          dir.kyc_status === 'COMPLIANT' ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#FFFBEB] text-[#D97706]'
                        }`}>
                          {dir.kyc_status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          dir.dsc_status === 'ACTIVE' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#FFFBEB] text-[#D97706]'
                        }`}>
                          {dir.dsc_status}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[#737373]">{dir.dsc_expiry || 'N/A'}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: FILINGS HISTORY */}
        {activeTab === 'filings' && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-black">Statutory Filings Archive</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-[#F7F7F5] border border-[#E5E5E5] flex items-center justify-between">
                <div>
                  <div className="font-bold text-black">AOC-4 (Financial Statements FY 2024-25)</div>
                  <div className="text-[11px] text-[#737373] font-mono">SRN: R89201948 • Filed on 28-Oct-2025</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0FDF4] text-[#16A34A] font-bold">
                  APPROVED (STP)
                </span>
              </div>
              <div className="p-3 rounded bg-[#F7F7F5] border border-[#E5E5E5] flex items-center justify-between">
                <div>
                  <div className="font-bold text-black">MGT-7 (Annual Return FY 2024-25)</div>
                  <div className="text-[11px] text-[#737373] font-mono">SRN: R90182410 • Filed on 14-Nov-2025</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0FDF4] text-[#16A34A] font-bold">
                  APPROVED (STP)
                </span>
              </div>
              <div className="p-3 rounded bg-[#F7F7F5] border border-[#E5E5E5] flex items-center justify-between">
                <div>
                  <div className="font-bold text-black">DIR-12 (Appointment of Whole-time Director)</div>
                  <div className="text-[11px] text-[#737373] font-mono">SRN: Q10294812 • Filed on 12-Jan-2022</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0FDF4] text-[#16A34A] font-bold">
                  APPROVED
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-black">Constitutional & Statutory Records</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded bg-[#F7F7F5] border border-[#E5E5E5] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-black">Certificate of Incorporation (COI)</div>
                  <div className="text-[11px] text-[#737373]">Issued by ROC Bangalore</div>
                </div>
                <span className="text-[11px] text-[#2563EB] font-medium cursor-pointer hover:underline">Download PDF</span>
              </div>
              <div className="p-3.5 rounded bg-[#F7F7F5] border border-[#E5E5E5] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-black">Memorandum of Association (e-MoA)</div>
                  <div className="text-[11px] text-[#737373]">Form INC-33</div>
                </div>
                <span className="text-[11px] text-[#2563EB] font-medium cursor-pointer hover:underline">Download PDF</span>
              </div>
              <div className="p-3.5 rounded bg-[#F7F7F5] border border-[#E5E5E5] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-black">Articles of Association (e-AoA)</div>
                  <div className="text-[11px] text-[#737373]">Form INC-34</div>
                </div>
                <span className="text-[11px] text-[#2563EB] font-medium cursor-pointer hover:underline">Download PDF</span>
              </div>
              <div className="p-3.5 rounded bg-[#F7F7F5] border border-[#E5E5E5] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-black">Board Resolution Archive (2025-26)</div>
                  <div className="text-[11px] text-[#737373]">4 Resolutions on record</div>
                </div>
                <span className="text-[11px] text-[#2563EB] font-medium cursor-pointer hover:underline">View Extract</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-black">Workspace Audit Trail</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3 pb-3 border-b border-[#E5E5E5]">
                <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-1.5 shrink-0"></div>
                <div>
                  <div className="font-medium text-black">AI Agent "Claude Desktop Pro" queried compliance status</div>
                  <div className="text-[11px] text-[#737373]">Via MCP Tool <code className="font-mono bg-white px-1 border border-[#E5E5E5] rounded">get_compliance_status</code> • 15 mins ago</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 pb-3 border-b border-[#E5E5E5]">
                <div className="w-2 h-2 rounded-full bg-[#16A34A] mt-1.5 shrink-0"></div>
                <div>
                  <div className="font-medium text-black">Director Resignation (DIR-12) filed on MCA V3</div>
                  <div className="text-[11px] text-[#737373]">SRN: Y81920311 generated • 2 days ago</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
