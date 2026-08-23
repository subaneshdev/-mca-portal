import { supabase } from '@/lib/supabase';
import { FILING_INTENT_TEMPLATES } from '@/lib/mockData';
import { FilingIntent, Application, Filing } from '@/types';
import { IntentResolver, ResolvedIntentResult } from './intentResolver';
import { CompanyService } from './companyService';

export class FilingService {
  /**
   * Get all registered intent templates (Static domain reference rules).
   */
  static getIntents(): FilingIntent[] {
    return FILING_INTENT_TEMPLATES;
  }

  /**
   * Get intent template by ID or form code.
   */
  static getIntentById(id: string): FilingIntent | null {
    if (!id) return null;
    const clean = id.toLowerCase().trim();
    return (
      FILING_INTENT_TEMPLATES.find(
        intent =>
          intent.id.toLowerCase() === clean ||
          intent.form_code.toLowerCase() === clean
      ) || null
    );
  }

  /**
   * Resolve a natural language corporate event to an MCA workflow.
   */
  static matchIntentByQuery(query: string): ResolvedIntentResult | null {
    return IntentResolver.resolve(query);
  }

  /**
   * List all filed applications with their progress events from Supabase.
   * Throws structured error if database query fails.
   */
  static async listApplications(companyId?: string): Promise<Application[]> {
    let query = supabase
      .from('applications')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch applications from Supabase: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Fetch events for each application from Supabase
    const applications: Application[] = await Promise.all(
      data.map(async (app: any) => {
        const { data: events } = await supabase
          .from('application_events')
          .select('*')
          .eq('application_id', app.id)
          .order('sort_order', { ascending: true });

        return {
          ...app,
          events: events || []
        };
      })
    );

    // Resolve company names
    const companies = await CompanyService.listCompanies().catch(() => []);
    return applications.map(app => {
      const comp = companies.find(c => c.id === app.company_id || c.cin === app.company_id);
      return {
        ...app,
        company_name: comp?.name || app.company_name || 'Authorized Entity'
      };
    });
  }

  /**
   * Retrieve a specific application by SRN / application number from Supabase.
   * Throws structured error if database query fails.
   */
  static async getApplicationByNumber(appNo: string): Promise<Application | null> {
    if (!appNo) return null;
    const cleanNo = appNo.trim();

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .ilike('application_no', cleanNo)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error fetching application [${cleanNo}]: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    const { data: events } = await supabase
      .from('application_events')
      .select('*')
      .eq('application_id', data.id)
      .order('sort_order', { ascending: true });

    const companies = await CompanyService.listCompanies().catch(() => []);
    const comp = companies.find(c => c.id === data.company_id || c.cin === data.company_id);

    return {
      ...data,
      company_name: comp?.name || 'Authorized Entity',
      events: events || []
    };
  }

  /**
   * Submit a new filing and create an active application journey in Supabase.
   */
  static async createFilingApplication(params: {
    company_id: string;
    form_code: string;
    title: string;
    type?: Application['type'];
    fee_paid?: number;
    remarks?: string;
  }): Promise<{ application: Application; srn: string }> {
    const srn = `SRN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const newApp: any = {
      company_id: params.company_id,
      application_no: srn,
      title: params.title,
      type: params.type || 'DIRECTOR_CHANGE',
      status: 'UNDER_REVIEW',
      current_step: 2,
      total_steps: 4,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      remarks:
        params.remarks ||
        'e-Form successfully signed and submitted. Scrutiny by RoC in progress (STP Gateway).'
    };

    const { data: appData, error: appError } = await supabase
      .from('applications')
      .insert(newApp)
      .select()
      .single();

    if (appError || !appData) {
      throw new Error(`Failed to create application in Supabase: ${appError?.message}`);
    }

    const createdApp = appData as Application;

    // Create step events in Supabase
    const events = [
      {
        application_id: createdApp.id,
        step_name: 'Intent Logged & Form Identified',
        description: `System matched event to ${params.form_code}`,
        status: 'COMPLETED' as const,
        completed_at: new Date().toISOString(),
        sort_order: 1
      },
      {
        application_id: createdApp.id,
        step_name: 'DSC Affixed & Payment Received',
        description: `Class 3 token signed. Challan paid: INR ${params.fee_paid || 600}`,
        status: 'COMPLETED' as const,
        completed_at: new Date().toISOString(),
        sort_order: 2
      },
      {
        application_id: createdApp.id,
        step_name: 'RoC STP Scrutiny & Approval',
        description: 'Automated Straight-Through-Processing validation queued.',
        status: 'CURRENT' as const,
        completed_at: null,
        sort_order: 3
      },
      {
        application_id: createdApp.id,
        step_name: 'Master Record Updated',
        description: 'Company master register reflecting changes.',
        status: 'PENDING' as const,
        completed_at: null,
        sort_order: 4
      }
    ];

    await supabase.from('application_events').insert(events);

    // Create filing record in Supabase
    await supabase.from('filings').insert({
      company_id: params.company_id,
      form_code: params.form_code,
      form_title: params.title,
      category: 'Event-based',
      financial_year: 'FY 2026-27',
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      filed_date: new Date().toISOString().split('T')[0],
      status: 'FILED',
      srn,
      fee_paid: params.fee_paid || 600,
      late_fee: 0
    });

    return {
      application: { ...createdApp, events: events as any },
      srn
    };
  }

  /**
   * Advance application lifecycle for testing in Supabase.
   */
  static async advanceApplicationStatus(applicationId: string): Promise<Application | null> {
    const { data: currentApp, error: fetchErr } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .maybeSingle();

    if (fetchErr) {
      throw new Error(`Database error fetching application for status advance: ${fetchErr.message}`);
    }

    if (!currentApp) return null;

    const nextStatusMap: Record<string, { status: Application['status']; step: number; remarks: string }> = {
      DRAFT: {
        status: 'SUBMITTED',
        step: 2,
        remarks: 'Form submitted and statutory challan paid.'
      },
      SUBMITTED: {
        status: 'UNDER_REVIEW',
        step: 3,
        remarks: 'Under scrutiny by RoC verification officer.'
      },
      UNDER_REVIEW: {
        status: 'APPROVED',
        step: 4,
        remarks: 'Approved by RoC. Master data updated in MCA register.'
      },
      RESUBMISSION_REQUIRED: {
        status: 'UNDER_REVIEW',
        step: 3,
        remarks: 'Revised documents submitted. Pending final approval.'
      },
      APPROVED: {
        status: 'APPROVED',
        step: 4,
        remarks: 'Application complete. Certificate / acknowledgement issued.'
      }
    };

    const next = nextStatusMap[currentApp.status] || nextStatusMap.UNDER_REVIEW;

    const { data: updated, error: updateErr } = await supabase
      .from('applications')
      .update({
        status: next.status,
        current_step: next.step,
        remarks: next.remarks,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateErr) {
      throw new Error(`Failed to update application in Supabase: ${updateErr.message}`);
    }

    // Update event statuses in Supabase
    if (next.step >= 3) {
      await supabase
        .from('application_events')
        .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
        .eq('application_id', applicationId)
        .eq('sort_order', 3);
    }
    if (next.step === 4) {
      await supabase
        .from('application_events')
        .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
        .eq('application_id', applicationId)
        .eq('sort_order', 4);
    }

    return updated;
  }
}
