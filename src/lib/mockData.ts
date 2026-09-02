import { Company, Director, ComplianceDeadline, Filing, Application, ErrorDiagnosis, KnowledgeDocument, ConnectedClient, FilingIntent } from '@/types';

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    cin: 'U72900KA2021PTC145892',
    name: 'Ziggers Private Limited',
    legal_type: 'Private Limited Company',
    status: 'ACTIVE',
    paid_up_capital: 500000,
    authorized_capital: 2500000,
    incorporation_date: '2021-04-12',
    roc_jurisdiction: 'ROC Bangalore',
    registered_office: '4th Floor, Salarpuria Cyber Park, Electronic City Phase 1, Bangalore, Karnataka - 560100',
    email: 'c.subanesh@gmail.com',
    pan: 'AABCG1234F',
    gst: '29AABCG1234F1Z5',
    next_action: 'AOC-4 Due in 2 days (Critical)',
    compliance_count: {
      critical: 1,
      action_required: 1,
      upcoming: 2
    }
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    cin: 'U74999MH2022PTC389102',
    name: 'Unfounded Technologies Private Limited',
    legal_type: 'Private Limited Company',
    status: 'ACTIVE',
    paid_up_capital: 100000,
    authorized_capital: 1000000,
    incorporation_date: '2022-08-19',
    roc_jurisdiction: 'ROC Mumbai',
    registered_office: 'Unit 702, Supreme Business Park, Hiranandani Gardens, Powai, Mumbai, Maharashtra - 400076',
    email: 'c.subanesh@gmail.com',
    pan: 'AACXU9876P',
    gst: '27AACXU9876P1ZV',
    next_action: 'INC-22 Address Resubmission Pending',
    compliance_count: {
      critical: 0,
      action_required: 1,
      upcoming: 1
    }
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    cin: 'U35999DL2019PLC352410',
    name: 'Bharat Aerospace Dynamics Limited',
    legal_type: 'Public Limited Company',
    status: 'ACTIVE',
    paid_up_capital: 50000000,
    authorized_capital: 100000000,
    incorporation_date: '2019-01-15',
    roc_jurisdiction: 'ROC Delhi',
    registered_office: 'Plot 18, Aero City Business Hub, New Delhi, Delhi - 110037',
    email: 'c.subanesh@gmail.com',
    pan: 'AABCB4455Q',
    gst: '07AABCB4455Q1Z8',
    next_action: 'Cost Audit CRA-4 Due in 17 days',
    compliance_count: {
      critical: 0,
      action_required: 0,
      upcoming: 1
    }
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    cin: 'AAZ-8910',
    name: 'Novapulse Healthtech LLP',
    legal_type: 'Limited Liability Partnership',
    status: 'ACTIVE',
    paid_up_capital: 200000,
    authorized_capital: 500000,
    incorporation_date: '2023-02-10',
    roc_jurisdiction: 'ROC Hyderabad',
    registered_office: 'Survey 45, Financial District, Nanakramguda, Hyderabad, Telangana - 500032',
    email: 'c.subanesh@gmail.com',
    pan: 'AAPFN7788L',
    gst: '36AAPFN7788L1ZQ',
    next_action: 'Statement of Account (Form 8) Completed',
    compliance_count: {
      critical: 0,
      action_required: 0,
      upcoming: 0
    }
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    cin: 'U72900KA2022PTC158942',
    name: 'Future Labs Private Limited',
    legal_type: 'Private Limited Company',
    status: 'ACTIVE',
    paid_up_capital: 1000000,
    authorized_capital: 2500000,
    incorporation_date: '2022-05-18',
    roc_jurisdiction: 'ROC Bangalore',
    registered_office: '9th Floor, Brigade Tech Park, Whitefield, Bangalore, Karnataka - 560066',
    email: 'c.subanesh@gmail.com',
    pan: 'AABCF5566R',
    gst: '29AABCF5566R1Z2',
    next_action: 'DIR-12 Resignation Draft Ready',
    compliance_count: {
      critical: 1,
      action_required: 1,
      upcoming: 2
    }
  }
];

export const MOCK_DIRECTORS: Record<string, Director[]> = {
  'c0000000-0000-0000-0000-000000000005': [
    {
      id: 'd0000000-0000-0000-0000-000000000009',
      company_id: 'c0000000-0000-0000-0000-000000000005',
      din: '08945120',
      full_name: 'Subanesh R',
      designation: 'Managing Director',
      appointment_date: '2022-05-18',
      din_status: 'APPROVED',
      dsc_status: 'ACTIVE',
      dsc_expiry: '2027-11-30',
      kyc_status: 'COMPLIANT',
      email: 'c.subanesh@gmail.com',
      phone: '+91 98401 23456'
    },
    {
      id: 'd0000000-0000-0000-0000-000000000010',
      company_id: 'c0000000-0000-0000-0000-000000000005',
      din: '08947219',
      full_name: 'Ananya Sharma',
      designation: 'Director',
      appointment_date: '2022-05-18',
      din_status: 'APPROVED',
      dsc_status: 'ACTIVE',
      dsc_expiry: '2026-09-15',
      kyc_status: 'COMPLIANT',
      email: 'c.subanesh@gmail.com',
      phone: '+91 98402 34567'
    }
  ],
  'c0000000-0000-0000-0000-000000000001': [
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      company_id: 'c0000000-0000-0000-0000-000000000001',
      din: '08945120',

      full_name: 'Subanesh M.',
      designation: 'Managing Director',
      appointment_date: '2021-04-12',
      din_status: 'APPROVED',
      dsc_status: 'ACTIVE',
      dsc_expiry: '2026-11-30',
      kyc_status: 'COMPLIANT',
      email: 'c.subanesh@gmail.com',
      phone: '+91 98401 23456'
    },
    {
      id: 'd0000000-0000-0000-0000-000000000002',
      company_id: 'c0000000-0000-0000-0000-000000000001',
      din: '09124589',
      full_name: 'Ananya Sharma',
      designation: 'Director',
      appointment_date: '2021-04-12',
      din_status: 'APPROVED',
      dsc_status: 'ACTIVE',
      dsc_expiry: '2026-09-15',
      kyc_status: 'INCOMPLETE',
      email: 'c.subanesh@gmail.com',
      phone: '+91 98402 34567'
    },
    {
      id: 'd0000000-0000-0000-0000-000000000003',
      company_id: 'c0000000-0000-0000-0000-000000000001',
      din: '07823419',
      full_name: 'Rohan Patel',
      designation: 'Whole-time Director',
      appointment_date: '2022-01-10',
      din_status: 'APPROVED',
      dsc_status: 'EXPIRING_SOON',
      dsc_expiry: '2026-09-25',
      kyc_status: 'COMPLIANT',
      email: 'c.subanesh@gmail.com',
      phone: '+91 98403 45678'
    }
  ],
  'c0000000-0000-0000-0000-000000000002': [
    {
      id: 'd0000000-0000-0000-0000-000000000004',
      company_id: 'c0000000-0000-0000-0000-000000000002',
      din: '06541298',
      full_name: 'Vikramaditya Roy',
      designation: 'Director',
      appointment_date: '2022-08-19',
      din_status: 'APPROVED',
      dsc_status: 'ACTIVE',
      dsc_expiry: '2027-03-20',
      kyc_status: 'COMPLIANT',
      email: 'c.subanesh@gmail.com',
      phone: '+91 97111 88990'
    },
    {
      id: 'd0000000-0000-0000-0000-000000000005',
      company_id: 'c0000000-0000-0000-0000-000000000002',
      din: '09981245',
      full_name: 'Priya Kulkarni',
      designation: 'Director',
      appointment_date: '2022-08-19',
      din_status: 'APPROVED',
      dsc_status: 'ACTIVE',
      dsc_expiry: '2027-01-14',
      kyc_status: 'COMPLIANT',
      email: 'c.subanesh@gmail.com',
      phone: '+91 97111 88991'
    }
  ]
};

export const MOCK_COMPLIANCE: ComplianceDeadline[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    company_name: 'Ziggers Private Limited',
    title: 'Annual Financial Statements Filing',
    form_code: 'AOC-4',
    section: 'Section 137, Companies Act 2013',
    due_date: '2026-08-26',
    urgency: 'critical',
    penalty_per_day: 100,
    description: 'Mandatory filing of balance sheet and profit & loss statement. 2 days remaining.',
    status: 'PENDING'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    company_name: 'Ziggers Private Limited',
    title: 'Director Annual KYC Verification',
    form_code: 'DIR-3 KYC',
    section: 'Rule 12A, Directors Rules 2014',
    due_date: '2026-08-30',
    urgency: 'action_required',
    penalty_per_day: 5000,
    description: 'Director Ananya Sharma has not verified web OTP. Risk of DIN deactivation.',
    status: 'PENDING'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    company_name: 'Ziggers Private Limited',
    title: 'Annual Return of the Company',
    form_code: 'MGT-7',
    section: 'Section 92, Companies Act 2013',
    due_date: '2026-09-15',
    urgency: 'upcoming',
    penalty_per_day: 100,
    description: 'Statutory filing of shareholder details, share transfers, and board governance records.',
    status: 'PENDING'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    company_name: 'Ziggers Private Limited',
    title: 'Return of Deposits & Exempted Monies',
    form_code: 'DPT-3',
    section: 'Rule 16, Deposit Rules 2014',
    due_date: '2026-09-30',
    urgency: 'upcoming',
    penalty_per_day: 0,
    description: 'Mandatory annual declaration of loans received from directors and banks.',
    status: 'PENDING'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000005',
    company_id: 'c0000000-0000-0000-0000-000000000002',
    company_name: 'Unfounded Technologies Private Limited',
    title: 'Auditor Appointment Intimation',
    form_code: 'ADT-1',
    section: 'Section 139, Companies Act 2013',
    due_date: '2026-09-20',
    urgency: 'upcoming',
    penalty_per_day: 100,
    description: 'Appointment of statutory auditor for tenure 2026-2031.',
    status: 'PENDING'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000006',
    company_id: 'c0000000-0000-0000-0000-000000000003',
    company_name: 'Bharat Aerospace Dynamics Limited',
    title: 'Cost Audit Report Filing',
    form_code: 'CRA-4',
    section: 'Section 148, Companies Act 2013',
    due_date: '2026-09-10',
    urgency: 'upcoming',
    penalty_per_day: 100,
    description: 'Filing of cost audit report with Central Government.',
    status: 'PENDING'
  }
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    company_id: 'c0000000-0000-0000-0000-000000000001',
    company_name: 'Ziggers Private Limited',
    application_no: 'SRN-Y81920311',
    title: 'Resignation of Whole-time Director (Rohan Patel)',
    type: 'DIRECTOR_CHANGE',
    status: 'UNDER_REVIEW',
    current_step: 3,
    total_steps: 4,
    submitted_at: '2026-08-22T10:30:00Z',
    updated_at: '2026-08-23T16:00:00Z',
    remarks: 'Straight-Through Processing (STP) scrutiny by ROC Bangalore. No citizen action required.',
    events: [
      {
        id: 'e1',
        application_id: 'a0000000-0000-0000-0000-000000000001',
        step_name: 'Intent Logged & Form Identified',
        description: 'System identified DIR-12 under Section 168 of Companies Act.',
        status: 'COMPLETED',
        completed_at: '2026-08-22T10:35:00Z',
        sort_order: 1
      },
      {
        id: 'e2',
        application_id: 'a0000000-0000-0000-0000-000000000001',
        step_name: 'Board Resolution & Notice Uploaded',
        description: 'Certified extract of Board Resolution and signed Resignation Letter attached.',
        status: 'COMPLETED',
        completed_at: '2026-08-22T11:15:00Z',
        sort_order: 2
      },
      {
        id: 'e3',
        application_id: 'a0000000-0000-0000-0000-000000000001',
        step_name: 'DSC Affixed & Statutory Fee Paid',
        description: 'Managing Director DSC verified. Fee of INR 600 acknowledged with Challan.',
        status: 'COMPLETED',
        completed_at: '2026-08-22T11:30:00Z',
        sort_order: 3
      },
      {
        id: 'e4',
        application_id: 'a0000000-0000-0000-0000-000000000001',
        step_name: 'ROC Bangalore Scrutiny',
        description: 'Automated MCA V3 registry validation underway.',
        status: 'CURRENT',
        completed_at: null,
        sort_order: 4
      },
      {
        id: 'e5',
        application_id: 'a0000000-0000-0000-0000-000000000001',
        step_name: 'Master Data Updated',
        description: 'ROC records update and formal approval intimation.',
        status: 'PENDING',
        completed_at: null,
        sort_order: 5
      }
    ]
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    company_id: 'c0000000-0000-0000-0000-000000000002',
    company_name: 'Unfounded Technologies Private Limited',
    application_no: 'SRN-F71029481',
    title: 'Change in Registered Office within Local Limits (INC-22)',
    type: 'ADDRESS_CHANGE',
    status: 'RESUBMISSION_REQUIRED',
    current_step: 2,
    total_steps: 4,
    submitted_at: '2026-08-20T14:20:00Z',
    updated_at: '2026-08-23T09:15:00Z',
    remarks: 'ROC Flag: Electricity bill uploaded was dated 85 days prior. Resubmit latest bill (within 60 days).',
    events: [
      {
        id: 'e6',
        application_id: 'a0000000-0000-0000-0000-000000000002',
        step_name: 'INC-22 Drafted & Fee Paid',
        description: 'Form generated with new Mumbai office coordinates.',
        status: 'COMPLETED',
        completed_at: '2026-08-20T14:40:00Z',
        sort_order: 1
      },
      {
        id: 'e7',
        application_id: 'a0000000-0000-0000-0000-000000000002',
        step_name: 'ROC Document Examination',
        description: 'Examiner marked discrepancy on utility bill recency.',
        status: 'ALERT',
        completed_at: '2026-08-23T09:15:00Z',
        sort_order: 2
      },
      {
        id: 'e8',
        application_id: 'a0000000-0000-0000-0000-000000000002',
        step_name: 'Resubmission Window Open (15 Days)',
        description: 'Upload latest MSEB bill dated July/August 2026.',
        status: 'CURRENT',
        completed_at: null,
        sort_order: 3
      },
      {
        id: 'e9',
        application_id: 'a0000000-0000-0000-0000-000000000002',
        step_name: 'Certificate of Office Change Issued',
        description: 'ROC final endorsement.',
        status: 'PENDING',
        completed_at: null,
        sort_order: 4
      }
    ]
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    company_id: null,
    company_name: 'QuantumEdge AI Labs Private Limited (Proposed)',
    application_no: 'SRN-N90124810',
    title: 'New Company Incorporation - SPICe+ (Part A & B)',
    type: 'INCORPORATION',
    status: 'UNDER_REVIEW',
    current_step: 4,
    total_steps: 5,
    submitted_at: '2026-08-23T08:00:00Z',
    updated_at: '2026-08-23T18:00:00Z',
    remarks: 'Name reservation approved. CRC Manesar currently verifying e-MoA, e-AoA, and PAN/TAN generation.',
    events: [
      {
        id: 'e10',
        application_id: 'a0000000-0000-0000-0000-000000000003',
        step_name: 'Name Reservation (RUN / SPICe+ Part A)',
        description: 'Name "QuantumEdge AI Labs Private Limited" approved by Central Registration Centre.',
        status: 'COMPLETED',
        completed_at: '2026-08-23T09:00:00Z',
        sort_order: 1
      },
      {
        id: 'e11',
        application_id: 'a0000000-0000-0000-0000-000000000003',
        step_name: 'e-MoA (INC-33) & e-AoA (INC-34) Signed',
        description: 'Subscribed by 2 promoters with Class 3 DSCs.',
        status: 'COMPLETED',
        completed_at: '2026-08-23T11:00:00Z',
        sort_order: 2
      },
      {
        id: 'e12',
        application_id: 'a0000000-0000-0000-0000-000000000003',
        step_name: 'AGILE-PRO-S (EPFO, ESIC, Bank A/c, GST)',
        description: 'Linked statutory tax registrations generated.',
        status: 'COMPLETED',
        completed_at: '2026-08-23T13:00:00Z',
        sort_order: 3
      },
      {
        id: 'e13',
        application_id: 'a0000000-0000-0000-0000-000000000003',
        step_name: 'CRC Manesar Official Verification',
        description: 'Final scrutiny for Certificate of Incorporation issuance.',
        status: 'CURRENT',
        completed_at: null,
        sort_order: 4
      },
      {
        id: 'e14',
        application_id: 'a0000000-0000-0000-0000-000000000003',
        step_name: 'Certificate of Incorporation (COI) Issued',
        description: 'CIN & DIN allocated; company legally born.',
        status: 'PENDING',
        completed_at: null,
        sort_order: 5
      }
    ]
  }
];

export const FILING_INTENT_TEMPLATES: FilingIntent[] = [
  {
    id: 'director-resigned',
    title: 'A director resigned',
    subtitle: 'Process cessation of director, file statutory intimation with ROC within 30 days',
    form_code: 'DIR-12',
    section: 'Section 168, Companies Act 2013',
    deadline_rule: '30 days from date of resignation receipt / board acceptance',
    prerequisites: [
      'Original resignation letter submitted by director',
      'Board of Directors meeting convened or circular resolution passed',
      'Active DSC of one continuing Director'
    ],
    required_info: [
      'Director Identification Number (DIN) of resigning person',
      'Effective date of cessation (DD/MM/YYYY)',
      'Reason for resignation (e.g. Personal grounds, preoccupation)',
      'Details of continuing board quorum (minimum 2 for Pvt Ltd, 3 for Public Ltd)'
    ],
    required_documents: [
      'Formal resignation letter addressed to the Board',
      'Certified true copy of Board Resolution noting resignation',
      'Proof of receipt / dispatch of notice to director'
    ],
    steps: [
      {
        number: 1,
        title: 'Select Resigning Director',
        description: 'Choose which director is stepping down from company register'
      },
      {
        number: 2,
        title: 'Effective Date & Reason',
        description: 'Specify the cessation timestamp and board acceptance date'
      },
      {
        number: 3,
        title: 'Attach Resignation Letter & Board Extract',
        description: 'Upload scanned PDF attachments with resolution number'
      },
      {
        number: 4,
        title: 'Affix DSC & Statutory Payment',
        description: 'Sign with authorized director token and generate SRN Challan'
      }
    ]
  },
  {
    id: 'director-joined',
    title: 'A director joined the company',
    subtitle: 'Appoint an additional, regular, or alternate director under Section 152 / 161',
    form_code: 'DIR-12',
    section: 'Section 152 & 161, Companies Act 2013',
    deadline_rule: '30 days from date of appointment at Board/General Meeting',
    prerequisites: [
      'Valid DIN held by proposed appointee',
      'Completed Director Consent (Form DIR-2)',
      'Declaration of non-disqualification (Form DIR-8)'
    ],
    required_info: [
      'DIN of new director',
      'Designation (Additional Director / Managing Director / Independent)',
      'Date of board resolution / AGM',
      'Tenure or term of appointment'
    ],
    required_documents: [
      'Consent to act as Director (DIR-2)',
      'Intimation of non-disqualification under 164(2) (DIR-8)',
      'Certified true copy of Board Resolution or EGM resolution'
    ],
    steps: [
      {
        number: 1,
        title: 'Enter DIN & Fetch Profile',
        description: 'Auto-verify proposed director identity against MCA master records'
      },
      {
        number: 2,
        title: 'Select Designation & Date',
        description: 'Define director category, executive powers, and appointment date'
      },
      {
        number: 3,
        title: 'Upload DIR-2 Consent & DIR-8',
        description: 'Provide signed consent declarations and board extract'
      },
      {
        number: 4,
        title: 'DSC Sign & ROC Filing',
        description: 'Affix DSC of continuing director and professional certification'
      }
    ]
  },
  {
    id: 'address-changed',
    title: 'We changed our registered office',
    subtitle: 'Intimate ROC regarding shift of registered office address',
    form_code: 'INC-22',
    section: 'Section 12, Companies Act 2013',
    deadline_rule: '30 days from date of change in registered office',
    prerequisites: [
      'Board resolution approving shifting of registered office',
      'Lease/Rent agreement or ownership deed for new premises',
      'Utility bill in the name of owner (not older than 2 months)'
    ],
    required_info: [
      'New registered address with PIN code and police station jurisdiction',
      'Official company contact email ID to receive MCA OTP',
      'Latitude and Longitude geo-coordinates of the premises'
    ],
    required_documents: [
      'Proof of registered office address (Electricity/Telephone/Gas bill within 60 days)',
      'No Objection Certificate (NOC) from property owner',
      'Rent Agreement along with rent receipt',
      'Photograph of registered office showing exterior building and at least one director inside'
    ],
    steps: [
      {
        number: 1,
        title: 'Enter New Address & Geo-coordinates',
        description: 'Provide full address details, PIN code, and police station'
      },
      {
        number: 2,
        title: 'Upload Utility Proof & NOC',
        description: 'Ensure utility bill is dated within the last 60 days'
      },
      {
        number: 3,
        title: 'Office Geotagged Photo',
        description: 'Attach color photo of registered office board and premises'
      },
      {
        number: 4,
        title: 'Sign with DSC & Submit',
        description: 'Affix Director DSC and CS/CA certification'
      }
    ]
  },
  {
    id: 'issued-shares',
    title: 'We issued new shares / allotment',
    subtitle: 'File return of allotment of securities under private placement or rights issue',
    form_code: 'PAS-3',
    section: 'Section 39 & 42, Companies Act 2013',
    deadline_rule: '30 days from the date of allotment of shares',
    prerequisites: [
      'Special resolution for Private Placement or Board resolution for Rights Issue',
      'Bank valuation report / Valuation Certificate by Registered Valuer',
      'Bank statement showing subscription money received in separate account'
    ],
    required_info: [
      'Class of shares (Equity / Preference / CCPS)',
      'Number of shares allotted and face value vs issue premium',
      'List of allottees with PAN, address, and shares allotted'
    ],
    required_documents: [
      'List of allottees (Format as prescribed)',
      'Certified true copy of Board Resolution for allotment',
      'Valuation Report by Registered Valuer'
    ],
    steps: [
      {
        number: 1,
        title: 'Allotment Details',
        description: 'Specify share class, number of shares, premium per share'
      },
      {
        number: 2,
        title: 'Allottee Register',
        description: 'Upload list of investors with PAN and individual allotment amounts'
      },
      {
        number: 3,
        title: 'Valuation & Resolutions',
        description: 'Attach valuer report and certified board extract'
      },
      {
        number: 4,
        title: 'DSC & Stamp Duty Payment',
        description: 'Pay statutory ROC fee and state electronic stamp duty'
      }
    ]
  },
  {
    id: 'annual-compliance',
    title: 'Complete annual compliance (AOC-4 & MGT-7)',
    subtitle: 'File audited financial statements and annual return following Annual General Meeting',
    form_code: 'AOC-4 / MGT-7',
    section: 'Section 137 & Section 92, Companies Act 2013',
    deadline_rule: 'AOC-4 within 30 days of AGM; MGT-7 within 60 days of AGM',
    prerequisites: [
      'Audited financial statements signed by 2 directors and statutory auditor',
      'Directors Report approved by the Board',
      'Notice of AGM and minutes of meeting'
    ],
    required_info: [
      'Date of AGM held',
      'Auditor details (Firm Name, FRN, Membership No)',
      'Shareholding pattern and turnover numbers'
    ],
    required_documents: [
      'Audited Balance Sheet, P&L, Notes to Accounts (PDF/XBRL)',
      'Directors Report with Annexures (CSR, Secretarial Audit if applicable)',
      'Auditors Report with CARO clauses',
      'Notice of Annual General Meeting'
    ],
    steps: [
      {
        number: 1,
        title: 'Review Financial Balance Sheet',
        description: 'Verify balance sheet figures and AGM completion date'
      },
      {
        number: 2,
        title: 'Upload Signed Financial Statements',
        description: 'Attach auditor-certified financial PDF bundle'
      },
      {
        number: 3,
        title: 'Director & Auditor Dual DSC',
        description: 'Affix Director DSC followed by Statutory Auditor DSC'
      },
      {
        number: 4,
        title: 'ROC Filing & SRN Generation',
        description: 'Submit to MCA V3 portal and obtain acknowledgment receipt'
      }
    ]
  }
];

export const ERROR_DIAGNOSIS_PATTERNS: ErrorDiagnosis[] = [
  {
    id: 'err-dsc-01',
    error_code: 'DSC_TOKEN_MISMATCH_01',
    category: 'Digital Signature',
    title: 'DSC Token Association Mismatch',
    symptoms: 'Error popup during pre-scrutiny: "DSC inserted does not match the registered DSC for this User ID / Director PAN".',
    root_cause: 'The USB cryptographic token certificate was recently renewed or is not associated with the current MCA V3 user profile.',
    resolution_steps: [
      'Insert the physical USB token into your computer.',
      'Navigate to MCA Portal -> Profile -> Associate DSC.',
      'Select User Role as "Director" and enter your DIN (e.g. 08945120).',
      'Click Register DSC and select your valid Class 3 certificate from the prompt.',
      'Return to Future MCA and retry pre-scrutiny.'
    ],
    affected_forms: ['AOC-4', 'MGT-7', 'DIR-12', 'SPICe+', 'PAS-3']
  },
  {
    id: 'err-cin-02',
    error_code: 'CIN_STATUS_INACTIVE_02',
    category: 'Company Master Data',
    title: 'CIN Status Not Qualified for Filing (ACTIVE-NON-COMPLIANT)',
    symptoms: 'System throws error: "Company status is ACTIVE-NON-COMPLIANT. e-Form filing restricted."',
    root_cause: 'The company failed to file Form INC-22A (ACTIVE) with registered office geotagged photo, or has unfiled annual returns for 2+ consecutive years.',
    resolution_steps: [
      'Verify status on MCA Master Data via Future MCA Company Profile.',
      'File Form INC-22A along with physical photo of registered premises and director.',
      'Pay statutory late fee of INR 10,000.',
      'Once MCA status reverts to "ACTIVE", proceed with regular filings.'
    ],
    affected_forms: ['DIR-12', 'PAS-3', 'SH-7', 'CHG-1', 'MGT-14']
  },
  {
    id: 'err-srn-03',
    error_code: 'SRN_BANK_TIMEOUT_03',
    category: 'Payment & Checkout',
    title: 'Payment Debited but SRN Status Remains "Pending Payment"',
    symptoms: 'Bank account was debited for statutory fee, but SRN Challan shows pending payment on portal.',
    root_cause: 'BharatKosh / Payment Gateway reconciliation delayed during peak MCA traffic hours.',
    resolution_steps: [
      'Do NOT attempt duplicate payment immediately.',
      'MCA automatically runs a batch reconciliation job every 60 minutes.',
      'Use Future MCA "Track Payment Status" tool to query BharatKosh webhook.',
      'If status does not update after 2 hours, raise SRN Re-query ticket with transaction UTR.'
    ],
    affected_forms: ['All MCA Forms']
  },
  {
    id: 'err-din-04',
    error_code: 'DIN_DEACTIVATED_KYC_04',
    category: 'Director Status',
    title: 'DIN Deactivated Due to Non-Filing of DIR-3 KYC',
    symptoms: 'Error: "Signatory DIN is deactivated. Form cannot be certified or submitted."',
    root_cause: 'Director failed to complete annual DIR-3 KYC verification before the statutory 30th September cut-off.',
    resolution_steps: [
      'Navigate to Compliance Centre -> DIR-3 KYC.',
      'File e-Form DIR-3 KYC (with DSC) and pay the late reactivation fee of INR 5,000.',
      'DIN is automatically reactivated within 2 hours of payment acknowledgment.',
      'Proceed with company filings.'
    ],
    affected_forms: ['DIR-12', 'AOC-4', 'MGT-7', 'INC-22']
  },
  {
    id: 'err-name-05',
    error_code: 'NAME_SIMILARITY_REJECT_04',
    category: 'Name Reservation',
    title: 'SPICe+ Name Reservation Rejected (Rule 8 Similarity)',
    symptoms: 'Rejection notice from CRC: "Proposed name phonetically/visually identical to existing registered company or registered trademark."',
    root_cause: 'Proposed entity name conflicts with an existing trademark in Class 9/35/42 or registered entity under Rule 8 of Companies Rules.',
    resolution_steps: [
      'Check trademark registry on IP India Database.',
      'If you own the trademark, attach Trademark Registration Certificate or TM-A receipt.',
      'If not, append a unique prefix or modify the descriptive business activity keyword.',
      'Submit revised name under the free 15-day SPICe+ Part A resubmission window.'
    ],
    affected_forms: ['RUN', 'SPICe+ Part A']
  }
];

export const PLATFORM_KNOWLEDGE_BASE: KnowledgeDocument[] = [
  {
    id: 'k-aoc4',
    title: 'Annual Financial Statements Filing (AOC-4)',
    category: 'Annual Compliance',
    act_section: 'Section 137, Companies Act 2013',
    summary: 'Every company must file its audited balance sheet, profit & loss statement, and directors report with the ROC within 30 days of AGM.',
    official_guidance: 'Filing must include audited financial statements, board report, auditors report, and notice of AGM. For companies subject to Ind-AS or turnover above 500 Cr, XBRL filing is mandatory.',
    penalties: 'INR 100 per day of default on the company, and directors liable to fines between INR 1,00,000 to INR 5,00,000.',
    relevant_forms: ['AOC-4', 'AOC-4 XBRL', 'AOC-4 CFS']
  },
  {
    id: 'k-dir3kyc',
    title: 'Director KYC Annual Verification (DIR-3 KYC)',
    category: 'Director Compliance',
    act_section: 'Rule 12A, Companies Rules 2014',
    summary: 'Every individual holding a DIN must submit KYC annually before 30th September to maintain active status.',
    official_guidance: 'If mobile and email are unchanged, web-based OTP verification is sufficient. If details changed, e-Form DIR-3 KYC with DSC and CA/CS certification is required.',
    penalties: 'DIN is deactivated. Reactivation fee is INR 5,000.',
    relevant_forms: ['DIR-3 KYC', 'DIR-3 KYC Web']
  },
  {
    id: 'k-dir12',
    title: 'Director Appointment & Cessation (DIR-12)',
    category: 'Secretarial Compliance',
    act_section: 'Section 168 & 170, Companies Act 2013',
    summary: 'Notice of appointment or cessation of a director must be filed with ROC within 30 days of effective date.',
    official_guidance: 'Attachments must include formal resignation letter, certified extract of Board Resolution accepting resignation, and proof of dispatch.',
    penalties: 'INR 100 per day after statutory 30-day window.',
    relevant_forms: ['DIR-12', 'DIR-11']
  },
  {
    id: 'k-inc22',
    title: 'Notice of Situation / Change of Registered Office (INC-22)',
    category: 'Corporate Administration',
    act_section: 'Section 12, Companies Act 2013',
    summary: 'Notice of change in registered office within local limits or state must be filed with ROC within 30 days.',
    official_guidance: 'Requires proof of address (utility bill within 60 days), NOC from owner, rent deed, and geotagged photograph of the registered office board.',
    penalties: 'INR 1,000 per day of default on company and officers in default.',
    relevant_forms: ['INC-22', 'INC-23']
  }
];

export const MOCK_CONNECTED_CLIENTS: ConnectedClient[] = [
  {
    id: 'client-1',
    name: 'Claude Desktop',
    client_type: 'Claude by Anthropic',
    mcp_endpoint: 'https://mcp.futuremca.in/mcp',
    scopes: ['company.read', 'compliance.read', 'filing.read', 'filing.prepare', 'application.read', 'knowledge.read'],
    status: 'ACTIVE',
    last_active_at: new Date(Date.now() - 15 * 60000).toISOString(),
    created_at: '2026-08-15T10:00:00Z'
  },
  {
    id: 'client-2',
    name: 'Cursor IDE Workspace',
    client_type: 'Cursor Agent',
    mcp_endpoint: 'https://mcp.futuremca.in/mcp',
    scopes: ['company.read', 'compliance.read', 'diagnostics.read'],
    status: 'ACTIVE',
    last_active_at: new Date(Date.now() - 120 * 60000).toISOString(),
    created_at: '2026-08-18T14:30:00Z'
  }
];
