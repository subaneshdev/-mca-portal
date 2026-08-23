import { ERROR_DIAGNOSIS_PATTERNS } from '@/lib/mockData';
import { ErrorDiagnosis, DiagnosticCase } from '@/types';

// In-memory diagnostic case store for interactive testing
const SAVED_CASES: DiagnosticCase[] = [];

export class DiagnosticService {
  /**
   * List all known MCA V3 error definitions.
   */
  static listKnownErrors(): ErrorDiagnosis[] {
    return ERROR_DIAGNOSIS_PATTERNS;
  }

  /**
   * Analyze an MCA error code, popup text, or symptom.
   */
  static diagnose(input: string): {
    match: ErrorDiagnosis | null;
    analysis: string;
    suggestedActions: string[];
    confidence: number;
    caseId?: string;
  } {
    const raw = (input || '').toLowerCase().trim();

    let match: ErrorDiagnosis | null = null;
    let analysis = '';
    let suggestedActions: string[] = [];
    let confidence = 0.75;

    if (
      raw.includes('dsc') ||
      raw.includes('certificate') ||
      raw.includes('token') ||
      raw.includes('signature') ||
      raw.includes('signatory') ||
      raw.includes('dsc-001')
    ) {
      match = ERROR_DIAGNOSIS_PATTERNS.find(e => e.id === 'err-dsc-01')!;
      analysis =
        'Digital Signature Certificate (DSC) token is valid, but the certificate thumbprint is not registered or mapped to the active Director/Professional profile in the MCA V3 portal registry.';
      suggestedActions = match.resolution_steps;
      confidence = 0.98;
    } else if (
      raw.includes('active-non-compliant') ||
      raw.includes('inc-22a') ||
      raw.includes('inactive') ||
      raw.includes('not qualified for filing') ||
      raw.includes('status')
    ) {
      match = ERROR_DIAGNOSIS_PATTERNS.find(e => e.id === 'err-cin-02')!;
      analysis =
        'The company master status is currently ACTIVE-NON-COMPLIANT due to overdue annual statutory filings or missing Form INC-22A ACTIVE geotag validation.';
      suggestedActions = match.resolution_steps;
      confidence = 0.94;
    } else if (
      raw.includes('debit') ||
      raw.includes('payment') ||
      raw.includes('bharatkosh') ||
      raw.includes('challan') ||
      raw.includes('pending payment') ||
      raw.includes('err-pay')
    ) {
      match = ERROR_DIAGNOSIS_PATTERNS.find(e => e.id === 'err-srn-03')!;
      analysis =
        'Payment gateway reconciliation delay. Your account was debited, but the inter-bank webhook to MCA V3 / Bharatkosh is queued. Do NOT make a duplicate payment.';
      suggestedActions = match.resolution_steps;
      confidence = 0.92;
    } else if (
      raw.includes('din') ||
      raw.includes('dir-3') ||
      raw.includes('kyc') ||
      raw.includes('deactivated')
    ) {
      match = ERROR_DIAGNOSIS_PATTERNS.find(e => e.id === 'err-din-04')!;
      analysis =
        'Director Identification Number (DIN) has been deactivated due to non-submission of annual DIR-3 KYC before the September deadline. DIN reactivation requires DIR-3 KYC with INR 5,000 statutory fee.';
      suggestedActions = match.resolution_steps;
      confidence = 0.97;
    } else if (
      raw.includes('name') ||
      raw.includes('spice') ||
      raw.includes('similar') ||
      raw.includes('trademark') ||
      raw.includes('rule 8')
    ) {
      match = ERROR_DIAGNOSIS_PATTERNS.find(e => e.id === 'err-name-05')!;
      analysis =
        'Proposed name contains phonetic or visual resemblance with an existing registered company or Trademark Class registry under Rule 8 of Companies (Incorporation) Rules.';
      suggestedActions = match.resolution_steps;
      confidence = 0.95;
    } else {
      analysis = `We analyzed your input: "${input.substring(0, 120)}...". This appears to be an MCA portal schema validation or transient session mismatch.`;
      suggestedActions = [
        'Clear browser cookies and temporary files for mca.gov.in',
        'Verify that all mandatory PDF attachments are signed with a valid Class 3 SHA-256 DSC',
        'Ensure the PDF file size is strictly below the 6MB statutory ceiling',
        'Check that the DSC token utility (emSigner / MCA Signer) is running on port 8080'
      ];
      confidence = 0.80;
    }

    // Persist diagnostic case
    const newCase: DiagnosticCase = {
      id: `diag-${Date.now()}`,
      error_code: match?.error_code || 'GEN-ERR-01',
      category: match?.category || 'General Portal',
      symptoms: input,
      user_input: input,
      analysis,
      resolution_steps: suggestedActions,
      created_at: new Date().toISOString()
    };
    SAVED_CASES.unshift(newCase);

    return {
      match,
      analysis,
      suggestedActions,
      confidence,
      caseId: newCase.id
    };
  }

  /**
   * List recent diagnostic cases submitted by the user.
   */
  static listRecentCases(): DiagnosticCase[] {
    return SAVED_CASES;
  }
}
