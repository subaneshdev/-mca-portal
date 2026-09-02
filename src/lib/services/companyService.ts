import { supabase } from '@/lib/supabase';
import { Company, Director } from '@/types';

export class CompanyService {
  /**
   * List all companies belonging to the specified workspace.
   * Strictly scopes by workspace_id so users only see their own companies.
   */
  static async listCompanies(workspaceId?: string): Promise<Company[]> {
    if (!workspaceId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return [];
      }

      // Populate directors and compliance statistics for each company
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
    } catch {
      return [];
    }
  }

  /**
   * Retrieve a specific company by CIN, ID, or Name.
   * If workspaceId is provided, strictly enforces workspace isolation.
   */
  static async getCompanyByCin(cinOrIdOrName: string, workspaceId?: string): Promise<Company | null> {
    if (!cinOrIdOrName) return null;
    const queryTerm = cinOrIdOrName.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryTerm);

    try {
      let query = supabase.from('companies').select('*');
      
      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      if (isUuid) {
        query = query.eq('id', queryTerm);
      } else if (queryTerm.length === 21) {
        query = query.ilike('cin', queryTerm);
      } else {
        query = query.ilike('name', `%${queryTerm}%`);
      }

      const { data: list, error } = await query.limit(1);

      if (error || !list || list.length === 0) {
        return null;
      }

      const data = list[0];
      const directors = await this.getCompanyDirectors(data.id).catch(() => []);

      return {
        ...data,
        directors
      };
    } catch {
      return null;
    }
  }

  /**
   * Retrieve directors for a specific company from Supabase.
   */
  static async getCompanyDirectors(companyIdOrCinOrName: string): Promise<Director[]> {
    if (!companyIdOrCinOrName) return [];
    const queryTerm = companyIdOrCinOrName.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryTerm);

    try {
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

      if (error || !data) {
        return [];
      }

      return data;
    } catch {
      return [];
    }
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
      company_id: companyId,
      din: directorData.din || `09${Math.floor(100000 + Math.random() * 900000)}`,
      full_name: directorData.full_name || 'New Director',
      designation: directorData.designation || 'Director',
      appointment_date: directorData.appointment_date || new Date().toISOString().split('T')[0],
      din_status: directorData.din_status || 'APPROVED',
      dsc_status: directorData.dsc_status || 'ACTIVE',
      dsc_expiry: directorData.dsc_expiry || '2027-12-31',
      kyc_status: directorData.kyc_status || 'COMPLIANT',
      email: directorData.email || '',
      phone: directorData.phone || ''
    };

    const { data, error } = await supabase
      .from('directors')
      .insert(newDir)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to add director: ${error?.message || 'Database error'}`);
    }

    return data as Director;
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
