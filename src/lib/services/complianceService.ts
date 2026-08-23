import { supabase } from '@/lib/supabase';
import { ComplianceDeadline } from '@/types';
import { CompanyService } from './companyService';

export class ComplianceService {
  /**
   * List compliance deadlines for a company or all companies.
   * Throws structured error if database query fails.
   */
  static async listCompliance(filter?: {
    companyId?: string;
    urgency?: string;
  }): Promise<ComplianceDeadline[]> {
    let query = supabase
      .from('compliance_deadlines')
      .select('*')
      .order('due_date', { ascending: true });

    let targetCompanyId = filter?.companyId;
    if (targetCompanyId && targetCompanyId.length === 21) {
      const comp = await CompanyService.getCompanyByCin(targetCompanyId).catch(() => null);
      if (comp) targetCompanyId = comp.id;
    }

    if (targetCompanyId) {
      query = query.eq('company_id', targetCompanyId);
    }
    if (filter?.urgency && filter.urgency !== 'all') {
      query = query.eq('urgency', filter.urgency);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch compliance deadlines: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Resolve company names for each compliance deadline from Supabase
    const companies = await CompanyService.listCompanies().catch(() => []);
    return data.map(item => {
      const comp = companies.find(c => c.id === item.company_id || c.cin === item.company_id);
      return {
        ...item,
        company_name: comp?.name || item.company_name || 'Authorized Entity'
      };
    });
  }

  /**
   * Retrieve upcoming deadlines for a specific company or the entire workspace.
   */
  static async getUpcomingDeadlines(cinOrCompanyId?: string): Promise<ComplianceDeadline[]> {
    if (!cinOrCompanyId) {
      return this.listCompliance();
    }
    const company = await CompanyService.getCompanyByCin(cinOrCompanyId);
    return this.listCompliance({ companyId: company?.id || cinOrCompanyId });
  }

  /**
   * Retrieve high-priority critical or action-required items.
   */
  static async getCriticalActions(cinOrCompanyId?: string): Promise<ComplianceDeadline[]> {
    const list = await this.getUpcomingDeadlines(cinOrCompanyId);
    return list.filter(item => item.urgency === 'critical' || item.urgency === 'action_required');
  }

  /**
   * Update compliance record state in Supabase (e.g., when user starts preparation or marks filed).
   */
  static async updateComplianceStatus(
    id: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'FILED',
    urgency?: 'critical' | 'action_required' | 'upcoming' | 'completed'
  ): Promise<boolean> {
    const updates: any = { status };
    if (urgency) updates.urgency = urgency;

    const { error } = await supabase
      .from('compliance_deadlines')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update compliance status: ${error.message}`);
    }
    return true;
  }
}
