import { supabase } from '@/lib/supabase';
import { Company, Director, ComplianceDeadline } from '@/types';
import { ActionService } from './actionService';

export const PRIMARY_DEMO_COMPANY: Company = {
  id: 'comp_aether_001',
  workspace_id: 'ws_aether_labs_001',
  cin: 'U62099TN2026PTC145678',
  name: 'Aether Labs Private Limited',
  legal_type: 'Private Limited Company',
  status: 'ACTIVE',
  paid_up_capital: 1000000,
  authorized_capital: 1000000,
  incorporation_date: '2026-01-15',
  roc_jurisdiction: 'ROC Chennai',
  registered_office: 'Chennai, Tamil Nadu, India',
  email: 'contact@aetherlabs.in',
  pan: 'AABCA1234F',
  gst: '33AABCA1234F1Z5',
  next_action: 'Statutory compliance tracking active',
  compliance_count: {
    critical: 0,
    action_required: 1,
    upcoming: 2
  }
};

export const PRIMARY_DEMO_DIRECTORS: Director[] = [
  {
    id: 'dir_varun_001',
    company_id: 'comp_aether_001',
    din: '08945120',
    full_name: 'Varun Maya',
    designation: 'Director',
    appointment_date: '2026-01-15',
    din_status: 'APPROVED',
    dsc_status: 'ACTIVE',
    dsc_expiry: '2028-11-30',
    kyc_status: 'COMPLIANT',
    email: 'varun@aetherlabs.in',
    phone: '+91 98401 23456'
  },
  {
    id: 'dir_arun_002',
    company_id: 'comp_aether_001',
    din: '09124589',
    full_name: 'Arun Kumar',
    designation: 'Director',
    appointment_date: '2026-01-15',
    din_status: 'APPROVED',
    dsc_status: 'ACTIVE',
    dsc_expiry: '2027-09-15',
    kyc_status: 'COMPLIANT',
    email: 'arun@aetherlabs.in',
    phone: '+91 98402 34567'
  }
];

export const PORTFOLIO_COMPANIES: Company[] = [
  PRIMARY_DEMO_COMPANY,
  {
    id: 'comp_novara_002',
    workspace_id: 'ws_aeos_labs_001',
    cin: 'U72900KA2024PTCDEMO002',
    name: 'Novara Technologies Private Limited',
    legal_type: 'Private Limited Company',
    status: 'ACTIVE',
    paid_up_capital: 500000,
    authorized_capital: 2500000,
    incorporation_date: '2024-03-10',
    roc_jurisdiction: 'ROC Bangalore',
    registered_office: 'Outer Ring Road, Bellandur, Bangalore, Karnataka - 560103',
    email: 'legal@novaratech.io',
    pan: 'AABCN5566K',
    gst: '29AABCN5566K1Z8',
    next_action: 'AOC-4 Due in 45 days',
    compliance_count: { critical: 0, action_required: 1, upcoming: 2 }
  },
  {
    id: 'comp_terraworks_003',
    workspace_id: 'ws_aeos_labs_001',
    cin: 'U74999MH2023PTCDEMO003',
    name: 'TerraWorks Private Limited',
    legal_type: 'Private Limited Company',
    status: 'ACTIVE',
    paid_up_capital: 200000,
    authorized_capital: 1000000,
    incorporation_date: '2023-08-19',
    roc_jurisdiction: 'ROC Mumbai',
    registered_office: 'Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra - 400051',
    email: 'compliance@terraworks.in',
    pan: 'AAACT8899P',
    gst: '27AAACT8899P1ZQ',
    next_action: 'All compliances up to date',
    compliance_count: { critical: 0, action_required: 0, upcoming: 1 }
  },
  {
    id: 'comp_pulsegrid_004',
    workspace_id: 'ws_aeos_labs_001',
    cin: 'U35999DL2025PTCDEMO004',
    name: 'PulseGrid Innovations Private Limited',
    legal_type: 'Private Limited Company',
    status: 'ACTIVE',
    paid_up_capital: 1000000,
    authorized_capital: 5000000,
    incorporation_date: '2025-05-12',
    roc_jurisdiction: 'ROC Delhi',
    registered_office: 'Aerocity Business Hub, New Delhi, Delhi - 110037',
    email: 'admin@pulsegrid.io',
    pan: 'AABCP7788R',
    gst: '07AABCP7788R1Z1',
    next_action: 'Cost Audit CRA-4 Review',
    compliance_count: { critical: 0, action_required: 0, upcoming: 2 }
  }
];

export const PRIMARY_DEMO_DEADLINES: ComplianceDeadline[] = [
  {
    id: 'dl_dir12_001',
    company_id: 'comp_aeos_001',
    company_name: 'Aeos Labs Private Limited',
    title: 'Director Cessation Filing (Rahul Menon)',
    form_code: 'DIR-12',
    section: 'Section 168, Companies Act 2013',
    due_date: '2026-09-24',
    urgency: 'critical',
    penalty_per_day: 100,
    description: 'Statutory 30-day window following resignation of Director Rahul Menon on 25 Aug 2026. Action in progress.',
    status: 'IN_PROGRESS'
  },
  {
    id: 'dl_aoc4_002',
    company_id: 'comp_aeos_001',
    company_name: 'Aeos Labs Private Limited',
    title: 'Annual Financial Statements Filing',
    form_code: 'AOC-4',
    section: 'Section 137, Companies Act 2013',
    due_date: '2026-10-30',
    urgency: 'upcoming',
    penalty_per_day: 100,
    description: 'Filing of balance sheet and profit & loss statement.',
    status: 'PENDING'
  },
  {
    id: 'dl_mgt7_003',
    company_id: 'comp_aeos_001',
    company_name: 'Aeos Labs Private Limited',
    title: 'Annual Return of Company',
    form_code: 'MGT-7A',
    section: 'Section 92, Companies Act 2013',
    due_date: '2026-11-29',
    urgency: 'upcoming',
    penalty_per_day: 100,
    description: 'Annual return filing for small company / startup.',
    status: 'PENDING'
  }
];

export class SeedService {
  private static seeded = false;

  /**
   * Auto-seed demo data in Supabase & memory for Aeos Labs & Varun Maya
   */
  static async ensureSeeded(): Promise<void> {
    if (this.seeded) return;
    this.seeded = true;

    try {
      // 1. Check if workspace exists in Supabase
      const { data: ws } = await supabase.from('workspaces').select('id').eq('id', 'ws_aeos_labs_001').single();
      if (!ws) {
        await supabase.from('workspaces').insert({
          id: 'ws_aeos_labs_001',
          name: 'Aeos Labs Workspace',
          type: 'founder'
        });
      }

      // 2. Check if primary company exists
      const { data: comp } = await supabase.from('companies').select('id').eq('id', 'comp_aeos_001').single();
      if (!comp) {
        await supabase.from('companies').insert(PORTFOLIO_COMPANIES);
        await supabase.from('directors').insert(PRIMARY_DEMO_DIRECTORS);
        await supabase.from('compliance_deadlines').insert(PRIMARY_DEMO_DEADLINES);
      }
    } catch {
      // Offline / permission graceful handle
    }

    // 3. Ensure in-memory ActionService has the initial DIR-12 draft for Rahul Menon
    try {
      const existing = await ActionService.getAction('act_dir_demo_001');
      if (!existing) {
        await ActionService.prepareDirectorChange({
          company_id_or_cin: 'U62099TN2026PTCDEMO001',
          change_type: 'RESIGNATION',
          director_name: 'Rahul Menon',
          din: '09124589',
          effective_date: '2026-08-25',
          reason: 'Personal reasons'
        }, {
          workspaceId: 'ws_aeos_labs_001',
          userId: 'usr_varun_maya',
          actorType: 'AI_CLIENT',
          clientName: 'Future MCA AI Assistant',
          clientType: 'Conversational Agent'
        });
      }
    } catch {
      // Continue
    }
  }
}
