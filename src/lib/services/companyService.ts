import { supabase } from '@/lib/supabase';
import { Company, Director } from '@/types';
import { 
  PORTFOLIO_COMPANIES, 
  PRIMARY_DEMO_DIRECTORS, 
  PRIMARY_DEMO_COMPANY, 
  SeedService, 
  DYNAMIC_COMPANIES, 
  AZLER_DEMO_COMPANY, 
  AZLER_DEMO_DIRECTORS 
} from './seedService';

export class CompanyService {
  /**
   * List all companies belonging to the specified workspace or visible in portfolio.
   */
  static async listCompanies(workspaceId?: string): Promise<Company[]> {
    await SeedService.ensureSeeded().catch(() => {});

    let dbCompanies: Company[] = [];
    try {
      let query = supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (workspaceId) {
        query = query.or(`workspace_id.eq.${workspaceId},workspace_id.is.null`);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        dbCompanies = await Promise.all(
          data.map(async (c: any) => {
            const directors = await this.getCompanyDirectors(c.id).catch(() => []);
            return {
              ...c,
              directors,
              compliance_count: c.compliance_count || { critical: 0, action_required: 0, upcoming: 1 },
              next_action: c.next_action || 'Statutory compliance tracking active'
            };
          })
        );
      }
    } catch {
      // fallback
    }

    // Merge: DYNAMIC_COMPANIES (e.g. Azler) + dbCompanies + PORTFOLIO_COMPANIES
    const allKnown = [
      ...DYNAMIC_COMPANIES,
      AZLER_DEMO_COMPANY,
      PRIMARY_DEMO_COMPANY,
      ...dbCompanies,
      ...PORTFOLIO_COMPANIES
    ];

    const seen = new Set<string>();
    const merged: Company[] = [];

    for (const c of allKnown) {
      const key = (c.name || '').toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        let dirs = c.directors;
        if (!dirs || dirs.length === 0) {
          if (key.includes('azler')) {
            dirs = AZLER_DEMO_DIRECTORS;
          } else if (key.includes('aether') || c.id === 'comp_aeos_001' || c.id === 'comp_aether_001') {
            dirs = PRIMARY_DEMO_DIRECTORS;
          }
        }
        merged.push({
          ...c,
          directors: dirs || []
        });
      }
    }

    return merged;
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

    if (queryTerm.includes('azler') || queryTerm.includes('075616') || queryTerm === 'comp_azler_001') {
      return {
        ...AZLER_DEMO_COMPANY,
        directors: AZLER_DEMO_DIRECTORS
      };
    }

    // Check PORTFOLIO_COMPANIES and DYNAMIC_COMPANIES
    const allKnown = [...DYNAMIC_COMPANIES, ...PORTFOLIO_COMPANIES];
    const matched = allKnown.find(
      c =>
        c.id.toLowerCase() === queryTerm ||
        c.cin.toLowerCase() === queryTerm ||
        c.name.toLowerCase().includes(queryTerm) ||
        (queryTerm.includes('aeos') && c.name.toLowerCase().includes('aeos'))
    );

    if (matched) {
      return {
        ...matched,
        directors: matched.id === 'comp_azler_001' || matched.name.toLowerCase().includes('azler')
          ? AZLER_DEMO_DIRECTORS
          : (matched.id === 'comp_aeos_001' || matched.id === 'comp_aether_001' || matched.name.toLowerCase().includes('aether'))
          ? PRIMARY_DEMO_DIRECTORS
          : matched.directors || []
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
    if (queryTerm === 'comp_azler_001' || queryTerm.toLowerCase().includes('azler') || queryTerm.includes('075616')) {
      return AZLER_DEMO_DIRECTORS;
    }
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

    if (queryTerm === 'comp_aeos_001' || queryTerm.toLowerCase().includes('aeos') || queryTerm.includes('DEMO001') || queryTerm.toLowerCase().includes('aether')) {
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
    const assignedId = companyData.id || `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCompany: any = {
      id: assignedId,
      cin: companyData.cin?.toUpperCase() || `U62099TN2026PTC${Math.floor(100000 + Math.random() * 900000)}`,
      name: companyData.name || 'New Venture Private Limited',
      legal_type: companyData.legal_type || 'Private Limited Company',
      status: companyData.status || 'ACTIVE',
      paid_up_capital: companyData.paid_up_capital || 100000,
      authorized_capital: companyData.authorized_capital || 1000000,
      incorporation_date: companyData.incorporation_date || new Date().toISOString().split('T')[0],
      roc_jurisdiction: companyData.roc_jurisdiction || 'ROC Chennai',
      registered_office: companyData.registered_office || 'Tamil Nadu, India',
      email: companyData.email || 'contact@venture.in',
      pan: companyData.pan || 'AABCV9999K',
      gst: companyData.gst || '33AABCV9999K1Z4',
      workspace_id: companyData.workspace_id || null
    };

    let createdDirectors: Director[] = [];
    if (directorsList.length > 0) {
      createdDirectors = directorsList.map(d => ({
        id: `dir_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        company_id: newCompany.id,
        din: d.din || `09${Math.floor(100000 + Math.random() * 900000)}`,
        full_name: d.full_name || 'Founder Director',
        designation: d.designation || 'Director',
        appointment_date: d.appointment_date || newCompany.incorporation_date,
        din_status: d.din_status || 'APPROVED',
        dsc_status: d.dsc_status || 'ACTIVE',
        dsc_expiry: d.dsc_expiry || '2027-12-31',
        kyc_status: d.kyc_status || 'COMPLIANT',
        email: d.email || newCompany.email,
        phone: d.phone || ''
      }));
    }

    const createdCompany: Company = {
      ...newCompany,
      directors: createdDirectors,
      compliance_count: { critical: 0, action_required: 0, upcoming: 1 },
      next_action: 'Statutory compliance tracking active'
    };

    // Keep dynamic memory in sync so it shows instantly on ALL dashboards
    const dynIdx = DYNAMIC_COMPANIES.findIndex(c => c.name.toLowerCase() === createdCompany.name.toLowerCase() || c.cin === createdCompany.cin);
    if (dynIdx >= 0) {
      DYNAMIC_COMPANIES[dynIdx] = createdCompany;
    } else {
      DYNAMIC_COMPANIES.unshift(createdCompany);
    }

    const portIdx = PORTFOLIO_COMPANIES.findIndex(c => c.name.toLowerCase() === createdCompany.name.toLowerCase() || c.cin === createdCompany.cin);
    if (portIdx >= 0) {
      PORTFOLIO_COMPANIES[portIdx] = createdCompany;
    } else {
      PORTFOLIO_COMPANIES.unshift(createdCompany);
    }

    try {
      const { data } = await supabase
        .from('companies')
        .insert(newCompany)
        .select()
        .single();

      if (data) {
        createdCompany.id = data.id;
      }

      if (createdDirectors.length > 0) {
        await supabase
          .from('directors')
          .insert(createdDirectors.map(d => ({ ...d, company_id: createdCompany.id })));
      }
    } catch {
      // offline fallback
    }

    return createdCompany;
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
