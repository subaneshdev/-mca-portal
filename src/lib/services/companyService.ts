import { supabase } from '@/lib/supabase';
import { Company, Director } from '@/types';
import { DYNAMIC_COMPANIES, DYNAMIC_DIRECTORS } from './seedService';

export class CompanyService {
  /**
   * List all companies from Supabase + any created at runtime via MCP.
   */
  static async listCompanies(workspaceId?: string): Promise<Company[]> {
    let dbCompanies: Company[] = [];
    try {
      let query = supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (workspaceId && isUuid.test(workspaceId)) {
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
              compliance_count: c.compliance_count || { critical: 0, action_required: 0, upcoming: 0 },
              next_action: c.next_action || 'No pending actions'
            };
          })
        );
      }
    } catch {
      // Supabase offline — fall back to dynamic only
    }

    // Merge: DYNAMIC_COMPANIES (from MCP runtime) + DB companies, deduplicated
    const allKnown = [...DYNAMIC_COMPANIES, ...dbCompanies];
    const seen = new Set<string>();
    const merged: Company[] = [];

    for (const c of allKnown) {
      const key = (c.cin || c.name || c.id).toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        // Attach runtime directors if available
        if ((!c.directors || c.directors.length === 0) && DYNAMIC_DIRECTORS.has(c.id)) {
          c.directors = DYNAMIC_DIRECTORS.get(c.id);
        }
        merged.push(c);
      }
    }

    return merged;
  }

  /**
   * Retrieve a specific company by CIN, ID, or Name.
   * Returns null if not found.
   */
  static async getCompanyByCin(cinOrIdOrName: string, workspaceId?: string): Promise<Company | null> {
    if (!cinOrIdOrName) return null;
    const queryTerm = cinOrIdOrName.trim().toLowerCase();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryTerm);

    try {
      let query = supabase.from('companies').select('*');

      if (workspaceId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) {
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
        return { ...data, directors };
      }
    } catch {
      // fallback to dynamic
    }

    // Check DYNAMIC_COMPANIES
    const matched = DYNAMIC_COMPANIES.find(
      c =>
        c.id.toLowerCase() === queryTerm ||
        c.cin.toLowerCase() === queryTerm ||
        c.name.toLowerCase().includes(queryTerm)
    );

    if (matched) {
      return {
        ...matched,
        directors: DYNAMIC_DIRECTORS.get(matched.id) || matched.directors || []
      };
    }

    return null;
  }

  /**
   * Retrieve directors for a specific company.
   * Returns empty array if not found.
   */
  static async getCompanyDirectors(companyIdOrCinOrName: string): Promise<Director[]> {
    if (!companyIdOrCinOrName) return [];
    const queryTerm = companyIdOrCinOrName.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryTerm);

    // Check dynamic directors first
    if (DYNAMIC_DIRECTORS.has(queryTerm)) {
      return DYNAMIC_DIRECTORS.get(queryTerm) || [];
    }

    try {
      let companyId = queryTerm;
      if (!isUuid) {
        const comp = await this.getCompanyByCin(queryTerm);
        if (comp) {
          companyId = comp.id;
          // Check dynamic directors with resolved ID
          if (DYNAMIC_DIRECTORS.has(companyId)) {
            return DYNAMIC_DIRECTORS.get(companyId) || [];
          }
        }
      }

      const { data, error } = await supabase
        .from('directors')
        .select('*')
        .eq('company_id', companyId)
        .order('appointment_date', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Director[];
      }
    } catch {
      // offline fallback
    }

    // Check dynamic companies for inline directors
    const dynCompany = DYNAMIC_COMPANIES.find(
      c => c.id === queryTerm || c.cin?.toLowerCase() === queryTerm.toLowerCase() || c.name?.toLowerCase().includes(queryTerm.toLowerCase())
    );
    if (dynCompany?.directors && dynCompany.directors.length > 0) {
      return dynCompany.directors;
    }

    return [];
  }

  /**
   * Search companies within a workspace.
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
   * Create a new company. Pushes to DYNAMIC_COMPANIES for instant dashboard visibility,
   * and persists to Supabase for durability.
   */
  static async createCompany(
    companyData: Partial<Company>,
    directorsList: Partial<Director>[] = []
  ): Promise<Company> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const assignedId = (companyData.id && isUuid.test(companyData.id))
      ? companyData.id
      : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `comp_${Date.now()}`);

    const stateCode = (companyData.registered_office || '').toLowerCase().includes('karnataka') ? 'KA' :
                      (companyData.registered_office || '').toLowerCase().includes('maharashtra') ? 'MH' :
                      (companyData.registered_office || '').toLowerCase().includes('delhi') ? 'DL' : 'TN';
    const cin = companyData.cin?.toUpperCase() || `U62099${stateCode}2026PTC${Math.floor(100000 + Math.random() * 900000)}`;

    const newCompany: any = {
      id: assignedId,
      cin,
      name: companyData.name || 'New Venture Private Limited',
      legal_type: companyData.legal_type || 'Private Limited Company',
      status: companyData.status || 'ACTIVE',
      paid_up_capital: companyData.paid_up_capital || 100000,
      authorized_capital: companyData.authorized_capital || 1000000,
      incorporation_date: companyData.incorporation_date || new Date().toISOString().split('T')[0],
      roc_jurisdiction: companyData.roc_jurisdiction || (stateCode === 'KA' ? 'ROC Bangalore' : stateCode === 'MH' ? 'ROC Mumbai' : 'ROC Chennai'),
      registered_office: companyData.registered_office || `${stateCode === 'KA' ? 'Karnataka' : stateCode === 'MH' ? 'Maharashtra' : 'Tamil Nadu'}, India`,
      email: companyData.email || 'compliance@futuremca.in',
      pan: companyData.pan || '',
      gst: companyData.gst || '',
      workspace_id: (companyData.workspace_id && isUuid.test(companyData.workspace_id)) ? companyData.workspace_id : null
    };

    let createdDirectors: Director[] = [];
    if (directorsList.length > 0) {
      createdDirectors = directorsList.map(d => ({
        id: (d.id && isUuid.test(d.id)) ? d.id : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `dir_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
        company_id: newCompany.id,
        din: d.din || `09${Math.floor(100000 + Math.random() * 900000)}`,
        full_name: d.full_name || 'Director',
        designation: d.designation || 'Director',
        appointment_date: d.appointment_date || newCompany.incorporation_date,
        din_status: d.din_status || 'APPROVED',
        dsc_status: d.dsc_status || 'ACTIVE',
        dsc_expiry: d.dsc_expiry || '2027-12-31',
        kyc_status: d.kyc_status || 'COMPLIANT',
        email: d.email || 'director@futuremca.in',
        phone: d.phone || ''
      }));
    }

    const createdCompany: Company = {
      ...newCompany,
      directors: createdDirectors,
      compliance_count: { critical: 0, action_required: 0, upcoming: 0 },
      next_action: 'No pending actions'
    };

    // Push to in-memory arrays for instant dashboard visibility
    const dynIdx = DYNAMIC_COMPANIES.findIndex(c => c.name.toLowerCase() === createdCompany.name.toLowerCase() || c.cin === createdCompany.cin);
    if (dynIdx >= 0) {
      DYNAMIC_COMPANIES[dynIdx] = createdCompany;
    } else {
      DYNAMIC_COMPANIES.unshift(createdCompany);
    }

    // Store directors in runtime map
    if (createdDirectors.length > 0) {
      DYNAMIC_DIRECTORS.set(assignedId, createdDirectors);
    }

    // Persist to Supabase with valid types
    try {
      const dbPayload: any = {
        cin: newCompany.cin,
        name: newCompany.name,
        legal_type: newCompany.legal_type,
        status: newCompany.status,
        paid_up_capital: newCompany.paid_up_capital,
        authorized_capital: newCompany.authorized_capital,
        incorporation_date: newCompany.incorporation_date,
        roc_jurisdiction: newCompany.roc_jurisdiction,
        registered_office: newCompany.registered_office,
        email: newCompany.email || 'compliance@futuremca.in',
        pan: newCompany.pan || null,
        gst: newCompany.gst || null,
        workspace_id: newCompany.workspace_id
      };
      if (isUuid.test(assignedId)) {
        dbPayload.id = assignedId;
      }

      const { data, error } = await supabase
        .from('companies')
        .insert(dbPayload)
        .select()
        .single();

      if (!error && data) {
        createdCompany.id = data.id;
        newCompany.id = data.id;
        DYNAMIC_DIRECTORS.set(data.id, createdDirectors);

        if (createdDirectors.length > 0) {
          const directorsToInsert = createdDirectors.map(d => ({
            company_id: data.id,
            din: d.din,
            full_name: d.full_name,
            designation: d.designation,
            appointment_date: d.appointment_date,
            din_status: d.din_status,
            dsc_status: d.dsc_status,
            kyc_status: d.kyc_status,
            email: d.email || 'director@futuremca.in',
            phone: d.phone || null
          }));
          await supabase.from('directors').insert(directorsToInsert);
        }
      }
    } catch (e) {
      console.warn('Notice while persisting to Supabase:', e);
    }

    return createdCompany;
  }

  /**
   * Add a director to an existing company.
   */
  static async addDirector(companyId: string, directorData: Partial<Director>): Promise<Director> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let targetCompanyId = companyId;
    if (!isUuid.test(companyId)) {
      const comp = await this.getCompanyByCin(companyId);
      if (comp && comp.id && isUuid.test(comp.id)) {
        targetCompanyId = comp.id;
      }
    }

    const assignedId = (directorData.id && isUuid.test(directorData.id))
      ? directorData.id
      : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `dir_${Date.now()}`);

    const newDir: Director = {
      id: assignedId,
      company_id: targetCompanyId,
      din: directorData.din || `09${Math.floor(100000 + Math.random() * 900000)}`,
      full_name: directorData.full_name || 'New Director',
      designation: directorData.designation || 'Director',
      appointment_date: directorData.appointment_date || new Date().toISOString().split('T')[0],
      din_status: directorData.din_status || 'APPROVED',
      dsc_status: directorData.dsc_status || 'ACTIVE',
      dsc_expiry: directorData.dsc_expiry || '2028-12-31',
      kyc_status: directorData.kyc_status || 'COMPLIANT',
      email: directorData.email || 'director@futuremca.in',
      phone: directorData.phone || ''
    };

    // Update runtime directors
    const existing = DYNAMIC_DIRECTORS.get(companyId) || [];
    const dirIdx = existing.findIndex(
      d => d.din === newDir.din || d.full_name.toLowerCase() === newDir.full_name.toLowerCase()
    );
    if (dirIdx >= 0) {
      existing[dirIdx] = { ...existing[dirIdx], ...newDir };
    } else {
      existing.push(newDir);
    }
    DYNAMIC_DIRECTORS.set(companyId, existing);
    if (targetCompanyId !== companyId) {
      DYNAMIC_DIRECTORS.set(targetCompanyId, existing);
    }

    try {
      if (isUuid.test(targetCompanyId)) {
        const dbDir: any = {
          company_id: targetCompanyId,
          din: newDir.din,
          full_name: newDir.full_name,
          designation: newDir.designation,
          appointment_date: newDir.appointment_date,
          din_status: newDir.din_status,
          dsc_status: newDir.dsc_status,
          dsc_expiry: newDir.dsc_expiry,
          kyc_status: newDir.kyc_status,
          email: newDir.email || 'director@futuremca.in',
          phone: newDir.phone || null
        };
        if (isUuid.test(assignedId)) {
          dbDir.id = assignedId;
        }

        const { data, error } = await supabase
          .from('directors')
          .insert(dbDir)
          .select()
          .single();

        if (!error && data) {
          return data as Director;
        }
      }
    } catch {
      // offline fallback
    }

    return newDir;
  }

  /**
   * Resign a director from a company.
   */
  static async resignDirector(
    companyIdOrCin: string,
    directorName: string,
    effectiveDate: string = new Date().toISOString().split('T')[0],
    notes?: string
  ): Promise<{ success: boolean; director: any; form: string; srn: string }> {
    const srn = `SRN_DIR12_${Date.now()}`;
    const cleanName = (directorName || '').toLowerCase().trim();

    // 1. Update runtime directors
    const directors = DYNAMIC_DIRECTORS.get(companyIdOrCin) || [];
    const dirIndex = directors.findIndex(
      d => d.full_name.toLowerCase().includes(cleanName) || cleanName.includes(d.full_name.toLowerCase())
    );

    let updatedDir: any = null;
    if (dirIndex >= 0) {
      directors[dirIndex] = {
        ...directors[dirIndex],
        cessation_date: effectiveDate,
        status: 'RESIGNED' as any,
        designation: 'Director (Resigned)'
      };
      updatedDir = directors[dirIndex];
      DYNAMIC_DIRECTORS.set(companyIdOrCin, directors);
    } else {
      updatedDir = {
        id: `dir_res_${Date.now()}`,
        company_id: companyIdOrCin,
        din: '00000000',
        full_name: directorName,
        designation: 'Director (Resigned)',
        appointment_date: effectiveDate,
        cessation_date: effectiveDate,
        status: 'RESIGNED' as any,
        din_status: 'APPROVED',
        dsc_status: 'ACTIVE',
        kyc_status: 'COMPLIANT'
      };
    }

    // 2. Try DB update
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
}
