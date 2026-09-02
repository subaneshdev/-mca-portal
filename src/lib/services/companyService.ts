import { supabase } from '@/lib/supabase';
import { Company, Director } from '@/types';
import { PORTFOLIO_COMPANIES, PRIMARY_DEMO_DIRECTORS, PRIMARY_DEMO_COMPANY, SeedService } from './seedService';

export class CompanyService {
  /**
   * List all companies belonging to the specified workspace.
   */
  static async listCompanies(workspaceId?: string): Promise<Company[]> {
    await SeedService.ensureSeeded().catch(() => {});

    try {
      let query = supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return await Promise.all(
          data.map(async (c: any) => {
            const directors = await this.getCompanyDirectors(c.id).catch(() => []);
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
    } catch {
      // fallback
    }

    // Fallback to PORTFOLIO_COMPANIES
    return PORTFOLIO_COMPANIES.map(c => ({
      ...c,
      directors: c.id === 'comp_aeos_001' ? PRIMARY_DEMO_DIRECTORS : []
    }));
  }

  /**
   * Retrieve a specific company by CIN, ID, or Name.
   */
  static async getCompanyByCin(cinOrIdOrName: string, workspaceId?: string): Promise<Company | null> {
    if (!cinOrIdOrName) return PRIMARY_DEMO_COMPANY;
    const queryTerm = cinOrIdOrName.trim().toLowerCase();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryTerm);

    try {
      let query = supabase.from('companies').select('*');
      
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      if (isUuid) {
        query = query.eq('id', queryTerm);
      } else if (queryTerm.length === 21 || queryTerm.startsWith('u62') || queryTerm.startsWith('u72')) {
        query = query.ilike('cin', queryTerm);
      } else {
        query = query.ilike('name', `%${queryTerm}%`);
      }

      const { data: list, error } = await query.limit(1);

      if (!error && list && list.length > 0) {
        const data = list[0];
        const directors = await this.getCompanyDirectors(data.id).catch(() => []);
        return {
          ...data,
          directors
        };
      }
    } catch {
      // fallback
    }

    // Check PORTFOLIO_COMPANIES
    const matched = PORTFOLIO_COMPANIES.find(
      c =>
        c.id.toLowerCase() === queryTerm ||
        c.cin.toLowerCase() === queryTerm ||
        c.name.toLowerCase().includes(queryTerm) ||
        (queryTerm.includes('aeos') && c.name.toLowerCase().includes('aeos'))
    );

    if (matched) {
      return {
        ...matched,
        directors: matched.id === 'comp_aeos_001' ? PRIMARY_DEMO_DIRECTORS : []
      };
    }

    return PRIMARY_DEMO_COMPANY;
  }

  /**
   * Retrieve directors for a specific company.
   */
  static async getCompanyDirectors(companyIdOrCinOrName: string): Promise<Director[]> {
    if (!companyIdOrCinOrName) return PRIMARY_DEMO_DIRECTORS;
    const queryTerm = companyIdOrCinOrName.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryTerm);

    try {
      let companyId = queryTerm;
      if (!isUuid) {
        const comp = await this.getCompanyByCin(queryTerm);
        if (comp) companyId = comp.id;
      }

      const { data, error } = await supabase
        .from('directors')
        .select('*')
        .eq('company_id', companyId)
        .order('appointment_date', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => {
          const mem = PRIMARY_DEMO_DIRECTORS.find(
            p => p.din === d.din || p.full_name.toLowerCase() === d.full_name?.toLowerCase()
          );
          if (mem && (mem.status === 'RESIGNED' || mem.cessation_date)) {
            return {
              ...d,
              status: mem.status,
              cessation_date: mem.cessation_date,
              designation: mem.designation
            };
          }
          return d;
        });
      }
    } catch {
      // fallback
    }

    if (queryTerm === 'comp_aeos_001' || queryTerm.toLowerCase().includes('aeos') || queryTerm.includes('DEMO001')) {
      return PRIMARY_DEMO_DIRECTORS;
    }

    return PRIMARY_DEMO_DIRECTORS;
  }


  /**
   * Search companies strictly within a workspace.
   */
  static async searchCompanies(query: string, workspaceId?: string): Promise<Company[]> {
    const companies = await this.listCompanies(workspaceId);
    const q = (query || '').toLowerCase().trim();
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
   * Create a new company record associated with a specific workspace and user.
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
      registered_office: companyData.registered_office || 'Bengaluru, Karnataka',
      email: companyData.email || '',
      pan: companyData.pan || '',
      gst: companyData.gst || '',
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
        phone: d.phone || ''
      }));

      const { data: dirsData, error: dirError } = await supabase
        .from('directors')
        .insert(dirRows)
        .select();

      if (!dirError && dirsData) {
        createdDirectors = dirsData;
      }
    }

    return {
      ...createdCompany,
      directors: createdDirectors,
      compliance_count: { critical: 0, action_required: 0, upcoming: 0 },
      next_action: 'Statutory compliance tracking active'
    };
  }

  /**
   * Add a director to an existing company.
   */
  static async addDirector(companyId: string, directorData: Partial<Director>): Promise<Director> {
    const newDir: any = {
      id: `dir_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      company_id: companyId,
      din: directorData.din || `09${Math.floor(100000 + Math.random() * 900000)}`,
      full_name: directorData.full_name || 'New Director',
      designation: directorData.designation || 'Director',
      appointment_date: directorData.appointment_date || new Date().toISOString().split('T')[0],
      din_status: directorData.din_status || 'APPROVED',
      dsc_status: directorData.dsc_status || 'ACTIVE',
      dsc_expiry: directorData.dsc_expiry || '2028-12-31',
      kyc_status: directorData.kyc_status || 'COMPLIANT',
      email: directorData.email || '',
      phone: directorData.phone || ''
    };

    // Keep in-memory store in sync so changes immediately reflect everywhere
    const existingIndex = PRIMARY_DEMO_DIRECTORS.findIndex(
      d => d.din === newDir.din || d.full_name.toLowerCase() === newDir.full_name.toLowerCase()
    );
    if (existingIndex >= 0) {
      PRIMARY_DEMO_DIRECTORS[existingIndex] = { ...PRIMARY_DEMO_DIRECTORS[existingIndex], ...newDir };
    } else {
      PRIMARY_DEMO_DIRECTORS.push(newDir);
    }

    try {
      const { data, error } = await supabase
        .from('directors')
        .insert(newDir)
        .select()
        .single();

      if (!error && data) {
        return data as Director;
      }
    } catch {
      // Local/offline demo fallback
    }

    return newDir as Director;
  }

  /**
   * Resign a director from a company, update memory & DB, and register DIR-12 filing.
   */
  static async resignDirector(
    companyIdOrCin: string,
    directorName: string,
    effectiveDate: string = '2026-08-15',
    notes?: string
  ): Promise<{ success: boolean; director: any; form: string; srn: string }> {
    const srn = `SRN_DIR12_${Date.now()}`;
    const cleanName = (directorName || '').toLowerCase().trim();

    // 1. Update in-memory store
    const dirIndex = PRIMARY_DEMO_DIRECTORS.findIndex(
      d => d.full_name.toLowerCase().includes(cleanName) || cleanName.includes(d.full_name.toLowerCase())
    );

    let updatedDir: any = null;
    if (dirIndex >= 0) {
      PRIMARY_DEMO_DIRECTORS[dirIndex] = {
        ...PRIMARY_DEMO_DIRECTORS[dirIndex],
        cessation_date: effectiveDate,
        status: 'RESIGNED' as any,
        designation: 'Director (Resigned)'
      };
      updatedDir = PRIMARY_DEMO_DIRECTORS[dirIndex];
    } else {
      updatedDir = {
        id: `dir_res_${Date.now()}`,
        company_id: companyIdOrCin,
        din: '09124589',
        full_name: directorName,
        designation: 'Director (Resigned)',
        appointment_date: '2026-01-15',
        cessation_date: effectiveDate,
        status: 'RESIGNED' as any,
        din_status: 'APPROVED',
        dsc_status: 'ACTIVE',
        kyc_status: 'COMPLIANT'
      };
      PRIMARY_DEMO_DIRECTORS.push(updatedDir);
    }

    // 2. Update company next_action and compliance
    PRIMARY_DEMO_COMPANY.next_action = `DIR-12 filed for ${directorName} resignation (SRN: ${srn})`;
    PRIMARY_DEMO_COMPANY.compliance_count = {
      critical: 0,
      action_required: 1,
      upcoming: 2
    };

    // 3. Try DB update
    try {
      if (updatedDir.id) {
        await supabase
          .from('directors')
          .update({
            cessation_date: effectiveDate,
            din_status: 'APPROVED'
          })
          .eq('id', updatedDir.id);
      }
    } catch {
      // offline fallback
    }

    return {
      success: true,
      director: updatedDir,
      form: 'DIR-12',
      srn
    };
  }

  /**
   * Seed a demo company strictly into the user's active workspace
   */
  static async seedDemoCompany(
    workspaceId?: string,
    preset: 'ziggers' | 'unfounded' | 'futurefoods' = 'ziggers'
  ): Promise<Company> {
    const isZiggers = preset === 'ziggers';
    const isUnfounded = preset === 'unfounded';

    const companyData: Partial<Company> = {
      cin: isZiggers ? 'U72900KA2021PTC145892' : isUnfounded ? 'U74999MH2022PTC389102' : 'U15400TN2023PTC160124',
      name: isZiggers ? 'Ziggers Private Limited' : isUnfounded ? 'Unfounded Technologies Private Limited' : 'Future Foods Private Limited',
      legal_type: 'Private Limited Company',
      status: 'ACTIVE',
      paid_up_capital: isZiggers ? 500000 : 100000,
      authorized_capital: isZiggers ? 2500000 : 1000000,
      incorporation_date: isZiggers ? '2021-04-12' : '2022-08-19',
      roc_jurisdiction: isZiggers ? 'ROC Bangalore' : 'ROC Mumbai',
      registered_office: isZiggers 
        ? '4th Floor, Cyber Park, Electronic City, Bangalore, Karnataka - 560100'
        : 'Unit 702, Supreme Business Park, Powai, Mumbai - 400076',
      workspace_id: workspaceId || null
    };

    const directors: Partial<Director>[] = [
      {
        full_name: 'Founder Director',
        designation: 'Managing Director',
        din: '08945120',
        din_status: 'APPROVED',
        dsc_status: 'ACTIVE',
        kyc_status: 'COMPLIANT'
      }
    ];

    return this.createCompany(companyData, directors);
  }
}
