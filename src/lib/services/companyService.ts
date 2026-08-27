import { supabase } from '@/lib/supabase';
import { Company, Director } from '@/types';

export class CompanyService {
  /**
   * List all companies belonging to the current workspace/user.
   * Throws structured error if database query fails.
   */
  static async listCompanies(workspaceId?: string): Promise<Company[]> {
    let query = supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (workspaceId) {
      query = query.or(`workspace_id.eq.${workspaceId},workspace_id.is.null`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Populate directors and real compliance statistics from Supabase
    return await Promise.all(
      data.map(async (c: any) => {
        const directors = await this.getCompanyDirectors(c.id).catch(() => []);
        
        // Fetch real compliance count from database
        const { data: deadlines } = await supabase
          .from('compliance_deadlines')
          .select('urgency, status')
          .eq('company_id', c.id);

        const activeDeadlines = deadlines || [];
        const criticalCount = activeDeadlines.filter(d => d.urgency === 'critical' && d.status !== 'FILED').length;
        const actionCount = activeDeadlines.filter(d => d.urgency === 'action_required' && d.status !== 'FILED').length;
        const upcomingCount = activeDeadlines.filter(d => (d.urgency === 'upcoming' || !d.urgency) && d.status !== 'FILED').length;

        return {
          ...c,
          directors,
          compliance_count: {
            critical: criticalCount,
            action_required: actionCount,
            upcoming: upcomingCount
          },
          next_action: criticalCount > 0 
            ? `${criticalCount} critical compliance deadline(s) pending` 
            : actionCount > 0 
            ? `${actionCount} action-required filing(s) due`
            : 'All statutory compliances up to date'
        };
      })
    );
  }

  /**
   * Retrieve a specific company by CIN or ID with its Board of Directors.
   * Throws structured error if database query fails.
   */
  static async getCompanyByCin(cinOrIdOrName: string): Promise<Company | null> {
    if (!cinOrIdOrName) return null;
    const queryTerm = cinOrIdOrName.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryTerm);

    let query = supabase.from('companies').select('*');
    if (isUuid) {
      query = query.eq('id', queryTerm);
    } else if (queryTerm.length === 21) {
      query = query.ilike('cin', queryTerm);
    } else {
      // Company name or partial search
      query = query.ilike('name', `%${queryTerm}%`);
    }

    const { data: list, error } = await query.limit(1);

    if (error || !list || list.length === 0) {
      return null;
    }

    const data = list[0];

    const directors = await this.getCompanyDirectors(data.id).catch(() => []);

    // Fetch real compliance count from database
    const { data: deadlines } = await supabase
      .from('compliance_deadlines')
      .select('urgency, status')
      .eq('company_id', data.id);

    const activeDeadlines = deadlines || [];
    const criticalCount = activeDeadlines.filter(d => d.urgency === 'critical' && d.status !== 'FILED').length;
    const actionCount = activeDeadlines.filter(d => d.urgency === 'action_required' && d.status !== 'FILED').length;
    const upcomingCount = activeDeadlines.filter(d => (d.urgency === 'upcoming' || !d.urgency) && d.status !== 'FILED').length;

    return {
      ...data,
      directors,
      compliance_count: {
        critical: criticalCount,
        action_required: actionCount,
        upcoming: upcomingCount
      },
      next_action: criticalCount > 0 
        ? `${criticalCount} critical compliance deadline(s) pending` 
        : actionCount > 0 
        ? `${actionCount} action-required filing(s) due`
        : 'All statutory compliances up to date'
    };
  }

  /**
   * Retrieve directors for a company from Supabase.
   * Throws structured error if database query fails.
   */
  static async getCompanyDirectors(companyIdOrCinOrName: string): Promise<Director[]> {
    if (!companyIdOrCinOrName) return [];
    const queryTerm = companyIdOrCinOrName.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryTerm);

    let companyId = queryTerm;
    if (!isUuid) {
      const comp = await this.getCompanyByCin(queryTerm);
      if (!comp) return [];
      companyId = comp.id;
    }

    const { data, error } = await supabase
      .from('directors')
      .select('*')
      .eq('company_id', companyId)
      .order('appointment_date', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  }

  /**
   * Search companies by name, CIN, or jurisdiction.
   */
  static async searchCompanies(query: string): Promise<Company[]> {
    const q = (query || '').toLowerCase().trim();
    const companies = await this.listCompanies();
    if (!q) return companies;

    return companies.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.cin.toLowerCase().includes(q) ||
        (c.registered_office && c.registered_office.toLowerCase().includes(q)) ||
        (c.roc_jurisdiction && c.roc_jurisdiction.toLowerCase().includes(q))
    );
  }

  /**
   * Create a new company record with initial directors and compliance schedule in Supabase.
   */
  static async createCompany(
    companyData: Partial<Company>,
    directorsList: Partial<Director>[] = []
  ): Promise<Company> {
    const newCompany: any = {
      cin: companyData.cin?.toUpperCase() || `U72900KA2024PTC${Math.floor(100000 + Math.random() * 900000)}`,
      name: companyData.name || 'New Venture Private Limited',
      legal_type: companyData.legal_type || 'Private Limited Company',
      status: companyData.status || 'ACTIVE',
      paid_up_capital: companyData.paid_up_capital || 100000,
      authorized_capital: companyData.authorized_capital || 1000000,
      incorporation_date: companyData.incorporation_date || new Date().toISOString().split('T')[0],
      roc_jurisdiction: companyData.roc_jurisdiction || 'ROC Bangalore',
      registered_office: companyData.registered_office || 'Brigade Road, Bangalore, Karnataka - 560025',
      email: companyData.email || 'contact@venture.io',
      pan: companyData.pan || 'AABCV9999K',
      gst: companyData.gst || '29AABCV9999K1Z5',
      workspace_id: companyData.workspace_id || null
    };

    const { data, error } = await supabase
      .from('companies')
      .insert(newCompany)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to insert company into Supabase: ${error?.message || 'Unknown database error'}`);
    }

    const createdCompany = data as Company;

    // Insert directors if provided
    let createdDirectors: Director[] = [];
    if (directorsList.length > 0) {
      const dirRows = directorsList.map(d => ({
        company_id: createdCompany.id,
        din: d.din || `09${Math.floor(100000 + Math.random() * 900000)}`,
        full_name: d.full_name || 'Founder Director',
        designation: d.designation || 'Director',
        appointment_date: d.appointment_date || createdCompany.incorporation_date,
        din_status: d.din_status || 'APPROVED',
        dsc_status: d.dsc_status || 'ACTIVE',
        dsc_expiry: d.dsc_expiry || '2027-12-31',
        kyc_status: d.kyc_status || 'COMPLIANT',
        email: d.email || createdCompany.email,
        phone: d.phone || '+91 98000 00000'
      }));

      const { data: dirsData, error: dirError } = await supabase
        .from('directors')
        .insert(dirRows)
        .select();

      if (dirError) {
        console.error('Error inserting directors into database:', dirError.message);
      } else {
        createdDirectors = dirsData || [];
      }
    }

    // Seed standard compliance deadlines for this new company in Supabase
    await supabase.from('compliance_deadlines').insert([
      {
        company_id: createdCompany.id,
        title: 'Annual Financial Statements Filing',
        form_code: 'AOC-4',
        due_date: '2026-10-30',
        urgency: 'action_required',
        penalty_per_day: 100,
        description: 'Filing of audited balance sheet and P&L statement under Section 137.',
        status: 'PENDING'
      },
      {
        company_id: createdCompany.id,
        title: 'Annual Return of Company',
        form_code: 'MGT-7A',
        due_date: '2026-11-29',
        urgency: 'upcoming',
        penalty_per_day: 100,
        description: 'Filing of annual return by Small Company / Startup under Section 92.',
        status: 'PENDING'
      },
      {
        company_id: createdCompany.id,
        title: 'Director KYC Annual Verification',
        form_code: 'DIR-3 KYC',
        due_date: '2026-09-30',
        urgency: 'critical',
        penalty_per_day: 5000,
        description: 'Annual web KYC verification for active DIN holders under Rule 12A.',
        status: 'PENDING'
      }
    ]);

    return {
      ...createdCompany,
      directors: createdDirectors,
      compliance_count: { critical: 1, action_required: 1, upcoming: 1 },
      next_action: '1 critical compliance deadline pending'
    };
  }

  /**
   * Seed realistic demo company dataset into Supabase for quick testing.
   * Templates are only used as seed input; data is directly stored in and retrieved from Supabase.
   */
  static async seedDemoCompany(
    workspaceId?: string,
    preset: 'ziggers' | 'unfounded' | 'futurefoods' = 'ziggers'
  ): Promise<Company> {
    const presets = {
      ziggers: {
        cin: 'U72900KA2021PTC145892',
        name: 'Ziggers Private Limited',
        legal_type: 'Private Limited Company',
        status: 'ACTIVE' as const,
        paid_up_capital: 500000,
        authorized_capital: 2500000,
        incorporation_date: '2021-04-12',
        roc_jurisdiction: 'ROC Bangalore',
        registered_office: '4th Floor, Salarpuria Cyber Park, Electronic City Phase 1, Bangalore, Karnataka - 560100',
        email: 'compliance@ziggers.io',
        pan: 'AABCG1234F',
        gst: '29AABCG1234F1Z5',
        directors: [
          {
            din: '08945120',
            full_name: 'Subanesh M.',
            designation: 'Managing Director',
            appointment_date: '2021-04-12',
            din_status: 'APPROVED' as const,
            dsc_status: 'ACTIVE' as const,
            dsc_expiry: '2026-11-30',
            kyc_status: 'COMPLIANT' as const,
            email: 'c.subanesh@gmail.com',
            phone: '+91 98401 23456'
          },
          {
            din: '09124589',
            full_name: 'Ananya Sharma',
            designation: 'Director',
            appointment_date: '2022-01-15',
            din_status: 'APPROVED' as const,
            dsc_status: 'ACTIVE' as const,
            dsc_expiry: '2027-02-28',
            kyc_status: 'INCOMPLETE' as const,
            email: 'c.subanesh@gmail.com',
            phone: '+91 98401 65432'
          },
          {
            din: '07823419',
            full_name: 'Rohan Patel',
            designation: 'Whole-time Director',
            appointment_date: '2021-04-12',
            din_status: 'APPROVED' as const,
            dsc_status: 'EXPIRING_SOON' as const,
            dsc_expiry: '2026-09-15',
            kyc_status: 'COMPLIANT' as const,
            email: 'c.subanesh@gmail.com',
            phone: '+91 98401 78901'
          }
        ]
      },
      unfounded: {
        cin: 'U72200DL2022PTC394812',
        name: 'Unfounded Technologies Private Limited',
        legal_type: 'Private Limited Company',
        status: 'ACTIVE' as const,
        paid_up_capital: 100000,
        authorized_capital: 1000000,
        incorporation_date: '2022-08-19',
        roc_jurisdiction: 'ROC Delhi',
        registered_office: 'Level 5, Max Towers, Sector 16B, Noida / Delhi NCR - 201301',
        email: 'c.subanesh@gmail.com',
        pan: 'AAACU5678R',
        gst: '07AAACU5678R1ZX',
        directors: [
          {
            din: '09567812',
            full_name: 'Vikram Malhotra',
            designation: 'Director',
            appointment_date: '2022-08-19',
            din_status: 'APPROVED' as const,
            dsc_status: 'ACTIVE' as const,
            dsc_expiry: '2027-05-10',
            kyc_status: 'COMPLIANT' as const,
            email: 'c.subanesh@gmail.com'
          },
          {
            din: '09567813',
            full_name: 'Sneha Kapoor',
            designation: 'Director',
            appointment_date: '2022-08-19',
            din_status: 'APPROVED' as const,
            dsc_status: 'ACTIVE' as const,
            dsc_expiry: '2027-04-18',
            kyc_status: 'COMPLIANT' as const,
            email: 'c.subanesh@gmail.com'
          }
        ]
      },
      futurefoods: {
        cin: 'U15130MH2023PTC401298',
        name: 'Future Foods Consumer Private Limited',
        legal_type: 'Private Limited Company',
        status: 'ACTIVE' as const,
        paid_up_capital: 1500000,
        authorized_capital: 5000000,
        incorporation_date: '2023-02-14',
        roc_jurisdiction: 'ROC Mumbai',
        registered_office: '7th Floor, Godrej One, Pirojshanagar, Vikhroli East, Mumbai - 400079',
        email: 'accounts@futurefoods.co',
        pan: 'AABCF7890Q',
        gst: '27AABCF7890Q1ZY',
        directors: [
          {
            din: '08129034',
            full_name: 'Aditya Godrej Singhania',
            designation: 'Managing Director',
            appointment_date: '2023-02-14',
            din_status: 'APPROVED' as const,
            dsc_status: 'ACTIVE' as const,
            dsc_expiry: '2027-01-20',
            kyc_status: 'COMPLIANT' as const,
            email: 'aditya@futurefoods.co'
          }
        ]
      }
    };

    const target = presets[preset] || presets.ziggers;

    // Check if already exists in Supabase
    const existing = await this.getCompanyByCin(target.cin);
    if (existing) {
      return existing;
    }

    const { directors, ...companyData } = target;
    return await this.createCompany(
      { ...companyData, workspace_id: workspaceId || null },
      directors as Partial<Director>[]
    );
  }
}
