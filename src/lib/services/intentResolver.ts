import { FilingIntent } from '@/types';
import { FILING_INTENT_TEMPLATES } from '@/lib/mockData';

export interface ResolvedIntentResult {
  event: string;
  recommended_filing: string;
  confidence: number;
  explanation: string;
  intent: FilingIntent;
  required_documents: string[];
  required_information: string[];
  statutory_section: string;
  deadline_rule: string;
}

export class IntentResolver {
  static resolve(query: string): ResolvedIntentResult | null {
    const q = (query || '').toLowerCase().trim();
    if (!q) return null;

    // 1. Director Resignation / Cessation
    if (
      q.includes('resig') ||
      q.includes('step down') ||
      q.includes('quit') ||
      q.includes('leave board') ||
      q.includes('removed director') ||
      q.includes('director exit') ||
      q.includes('cessation')
    ) {
      const intent = FILING_INTENT_TEMPLATES.find(i => i.id === 'director-resigned')!;
      return {
        event: 'DIRECTOR_RESIGNATION',
        recommended_filing: 'DIR-12',
        confidence: 0.98,
        explanation: 'Identified Director Cessation event under Section 168 of the Companies Act 2013. Requires filing Form DIR-12 with RoC within 30 days of resignation date.',
        intent,
        required_documents: intent.required_documents,
        required_information: intent.required_info,
        statutory_section: intent.section,
        deadline_rule: intent.deadline_rule
      };
    }

    // 2. Director Appointment / Joined
    if (
      q.includes('add director') ||
      q.includes('appoint') ||
      q.includes('new director') ||
      q.includes('board appointment') ||
      q.includes('additional director') ||
      q.includes('nominee director')
    ) {
      const intent = FILING_INTENT_TEMPLATES.find(i => i.id === 'director-joined')!;
      return {
        event: 'DIRECTOR_APPOINTMENT',
        recommended_filing: 'DIR-12',
        confidence: 0.96,
        explanation: 'Identified Director Appointment event under Sections 152/161. Requires Form DIR-2 consent, Board resolution, and Form DIR-12 filing within 30 days.',
        intent,
        required_documents: intent.required_documents,
        required_information: intent.required_info,
        statutory_section: intent.section,
        deadline_rule: intent.deadline_rule
      };
    }

    // 3. Registered Office Change
    if (
      q.includes('address') ||
      q.includes('office') ||
      q.includes('shift') ||
      q.includes('location') ||
      q.includes('premises') ||
      q.includes('relocat') ||
      q.includes('city change')
    ) {
      const intent = FILING_INTENT_TEMPLATES.find(i => i.id === 'address-changed')!;
      return {
        event: 'REGISTERED_OFFICE_CHANGE',
        recommended_filing: 'INC-22',
        confidence: 0.95,
        explanation: 'Identified Registered Office Change under Section 12. Requires Form INC-22 along with utility bill within 60 days and proof of premises.',
        intent,
        required_documents: intent.required_documents,
        required_information: intent.required_info,
        statutory_section: intent.section,
        deadline_rule: intent.deadline_rule
      };
    }

    // 4. Share Allotment / Fundraise
    if (
      q.includes('share') ||
      q.includes('allot') ||
      q.includes('fundraise') ||
      q.includes('invest') ||
      q.includes('equity') ||
      q.includes('capital increase') ||
      q.includes('pas-3')
    ) {
      const intent = FILING_INTENT_TEMPLATES.find(i => i.id === 'issued-shares')!;
      return {
        event: 'SHARE_ALLOTMENT',
        recommended_filing: 'PAS-3',
        confidence: 0.94,
        explanation: 'Identified Securities Allotment event under Section 39/42. Requires filing Form PAS-3 Return of Allotment with list of allottees within 30 days.',
        intent,
        required_documents: intent.required_documents,
        required_information: intent.required_info,
        statutory_section: intent.section,
        deadline_rule: intent.deadline_rule
      };
    }

    // 5. Annual Compliance / AGM
    if (
      q.includes('annual') ||
      q.includes('financial') ||
      q.includes('agm') ||
      q.includes('aoc-4') ||
      q.includes('mgt-7') ||
      q.includes('balance sheet') ||
      q.includes('audit')
    ) {
      const intent = FILING_INTENT_TEMPLATES.find(i => i.id === 'annual-compliance')!;
      return {
        event: 'ANNUAL_COMPLIANCE',
        recommended_filing: 'AOC-4 / MGT-7A',
        confidence: 0.99,
        explanation: 'Identified Statutory Annual Compliance obligations under Sections 137 & 92 (AOC-4 Financial Statements & MGT-7 Annual Return).',
        intent,
        required_documents: intent.required_documents,
        required_information: intent.required_info,
        statutory_section: intent.section,
        deadline_rule: intent.deadline_rule
      };
    }

    return null;
  }
}
