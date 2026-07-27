import { LegalDocument, Conversation, ComparisonResult, AdminAnalytics, Organization, OrgMember } from './types';

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-nexus',
    name: 'Nexus Corp Enterprise',
    slug: 'nexus-corp',
    plan: 'Enterprise RAG',
    storage_used_mb: 4850,
    max_storage_mb: 50000,
    created_at: '2026-01-15',
    teams: [
      { id: 'team-legal', org_id: 'org-nexus', name: 'Legal & Compliance', description: 'Employment, NDAs & Regulatory Risk', color: 'brand', document_count: 24 },
      { id: 'team-finance', org_id: 'org-nexus', name: 'Finance & Accounting', description: 'Leases, Commercial Purchases & Credit', color: 'emerald', document_count: 18 },
      { id: 'team-hr', org_id: 'org-nexus', name: 'Human Resources', description: 'Employment Contracts & Benefits Agreements', color: 'purple', document_count: 12 }
    ]
  },
  {
    id: 'org-apex',
    name: 'Apex Systems SaaS',
    slug: 'apex-systems',
    plan: 'Business Pro',
    storage_used_mb: 1200,
    max_storage_mb: 10000,
    created_at: '2026-03-01',
    teams: [
      { id: 'team-contracts', org_id: 'org-apex', name: 'Master Services Contracts', description: 'Customer MSAs, SLAs & SOWs', color: 'indigo', document_count: 15 },
      { id: 'team-vendors', org_id: 'org-apex', name: 'Vendor Procurement', description: 'Software Licenses & Cloud Providers', color: 'amber', document_count: 9 }
    ]
  },
  {
    id: 'org-personal',
    name: 'Personal Workspace',
    slug: 'personal-user',
    plan: 'Free Workspace',
    storage_used_mb: 150,
    max_storage_mb: 1000,
    created_at: '2026-07-01',
    teams: [
      { id: 'team-general', org_id: 'org-personal', name: 'General Documents', description: 'Personal Contracts & Invoices', color: 'blue', document_count: 4 }
    ]
  }
];

export const INITIAL_MEMBERS: OrgMember[] = [
  {
    id: 'm-1',
    org_id: 'org-nexus',
    name: 'Alex Rivera',
    email: 'alex.rivera@nexuscorp.com',
    role: 'owner',
    team_ids: ['team-legal', 'team-finance', 'team-hr'],
    status: 'active'
  },
  {
    id: 'm-2',
    org_id: 'org-nexus',
    name: 'Sarah Jenkins',
    email: 'sarah.j@nexuscorp.com',
    role: 'admin',
    team_ids: ['team-legal'],
    status: 'active'
  },
  {
    id: 'm-3',
    org_id: 'org-nexus',
    name: 'Marcus Vance',
    email: 'marcus.v@nexuscorp.com',
    role: 'manager',
    team_ids: ['team-finance'],
    status: 'active'
  },
  {
    id: 'm-4',
    org_id: 'org-nexus',
    name: 'Elena Rostova',
    email: 'elena.r@nexuscorp.com',
    role: 'member',
    team_ids: ['team-hr'],
    status: 'invited'
  }
];

export const INITIAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'doc-001',
    org_id: 'org-nexus',
    team_id: 'team-legal',
    filename: 'Senior_Software_Engineer_Employment_Agreement.pdf',
    file_type: 'pdf',
    upload_date: '2026-07-20 10:30',
    file_size: '2.4 MB',
    chunk_count: 24,
    status: 'indexed',
    risk_score: 68,
    is_scanned_ocr: false,
    summary: {
      executive_summary: "This document is a full-time Employment Agreement between Nexus Tech Inc. (Employer) and Alex Rivera (Employee) for the role of Senior Principal Engineer starting September 1, 2026.",
      parties: ["Nexus Tech Inc. (Employer)", "Alex Rivera (Employee)"],
      effective_date: "2026-09-01",
      expiry_date: "Indefinite (At-Will)",
      payment_terms: "$185,000 USD base salary per annum, paid bi-weekly, plus 15% annual performance bonus.",
      termination_conditions: "Either party may terminate with 30 days written notice. Immediate termination for cause (breach, gross negligence).",
      confidentiality_terms: "Strict non-disclosure of proprietary software algorithms and trade secrets during and after employment.",
      key_obligations: [
        "Maintain 40 hours/week standard work schedule",
        "Assign all IP created during employment to Employer",
        "Abide by corporate security & compliance rules"
      ],
      risks_summary: [
        "Contains 2-year post-employment non-compete clause spanning worldwide remote territory",
        "Includes broad indemnification clause making employee liable for third-party IP claims",
        "Automatic IP assignment includes personal side projects without clear exemption criteria"
      ],
      key_deadlines: [
        "2026-09-01: Effective Employment Start Date",
        "2026-10-01: 30-Day Benefits Enrollment Deadline",
        "Annual Nov 30: Performance & Bonus Review"
      ]
    },
    risks: [
      {
        id: 'r-1',
        category: 'non_compete',
        title: 'Overly Broad Non-Compete Restrictions',
        description: 'Clause 8.2 restricts employee from working with any software competitor globally for 24 months post-resignation.',
        severity: 'high',
        clause_ref: 'Clause 8.2 (Restrictive Covenants)',
        page_number: 7,
        recommendation: 'Negotiate geographic scope limit (e.g. 50-mile radius) and reduce duration to 6 or 12 months maximum.'
      },
      {
        id: 'r-2',
        category: 'unlimited_liability',
        title: 'Employee IP Indemnification Liability',
        description: 'Clause 12.1 imposes unlimited financial indemnification on employee for open-source license infringements.',
        severity: 'high',
        clause_ref: 'Clause 12.1 (Indemnification)',
        page_number: 11,
        recommendation: 'Request a cap on liability equivalent to 3 months of base salary.'
      }
    ],
    timeline: [
      {
        id: 't-1',
        date: '2026-09-01',
        title: 'Employment Agreement Effective Date',
        category: 'milestone',
        description: 'Official start of employment terms and onboarding period.',
        clause_ref: 'Clause 1.1'
      }
    ]
  },
  {
    id: 'doc-002',
    org_id: 'org-nexus',
    team_id: 'team-finance',
    filename: 'Commercial_Office_Lease_Agreement_2026.pdf',
    file_type: 'pdf',
    upload_date: '2026-07-22 14:15',
    file_size: '4.1 MB',
    chunk_count: 38,
    status: 'indexed',
    risk_score: 42,
    is_scanned_ocr: true,
    summary: {
      executive_summary: "Commercial lease agreement for Suite 400 at 500 Enterprise Way between Metro Plaza LLC (Lessor) and Horizon Labs (Tenant) for a 3-year term.",
      parties: ["Metro Plaza Holdings LLC (Landlord)", "Horizon Labs Inc. (Tenant)"],
      effective_date: "2026-10-01",
      expiry_date: "2029-09-30",
      payment_terms: "$12,500 monthly base rent + pro-rata share of operating expenses (CAM). Paid on 1st of each month.",
      termination_conditions: "Early termination permitted after Month 24 subject to a 6-month rent penalty fee.",
      confidentiality_terms: "Standard lease terms non-disclosure clause.",
      key_obligations: [
        "Pay rent promptly on or before 1st of month",
        "Maintain $2M commercial general liability insurance"
      ],
      risks_summary: [
        "Annual rent escalation rate tied to CPI with a minimum 4% floor",
        "Automatic 3-year term renewal if written non-renewal notice is not provided 180 days prior"
      ],
      key_deadlines: [
        "2026-09-15: Security Deposit Payment ($25,000)",
        "2026-10-01: Move-in Date"
      ]
    },
    risks: [
      {
        id: 'r-4',
        category: 'auto_renewal',
        title: 'Strict 180-Day Notice for Auto-Renewal',
        description: 'Clause 4.3 automatically renews lease for another 3 years unless written notice is given 180 days in advance.',
        severity: 'medium',
        clause_ref: 'Clause 4.3 (Renewal Term)',
        page_number: 4,
        recommendation: 'Shorten notice window to 90 days.'
      }
    ],
    timeline: [
      {
        id: 't-4',
        date: '2026-09-15',
        title: 'Security Deposit Due',
        category: 'payment',
        description: 'Payment of $25,000 security deposit.',
        clause_ref: 'Clause 5.1'
      }
    ]
  },
  {
    id: 'doc-003',
    org_id: 'org-apex',
    team_id: 'team-contracts',
    filename: 'SaaS_Enterprise_Master_Services_Agreement.docx',
    file_type: 'docx',
    upload_date: '2026-07-24 16:40',
    file_size: '1.8 MB',
    chunk_count: 19,
    status: 'indexed',
    risk_score: 25,
    is_scanned_ocr: false,
    summary: {
      executive_summary: "Master Services Agreement (MSA) for Cloud AI Enterprise platform subscriptions between LexiCorp Solutions and Client.",
      parties: ["LexiCorp Solutions Inc. (Provider)", "Enterprise Client Corp (Customer)"],
      effective_date: "2026-08-01",
      expiry_date: "2027-07-31",
      payment_terms: "Annual upfront payment of $48,000 USD, Net 30 payment terms.",
      termination_conditions: "30-day cure period for material breach. Termination for convenience with 60 days notice.",
      confidentiality_terms: "Mutual NDA protecting Customer Data and Provider IP.",
      key_obligations: ["Maintain 99.9% uptime SLA"],
      risks_summary: ["Liability limited to total fees paid in preceding 12 months"],
      key_deadlines: ["2026-08-01: Platform Activation"]
    },
    risks: [],
    timeline: []
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    org_id: 'org-nexus',
    team_id: 'team-legal',
    title: 'Employment Contract - Notice Period & Non-Compete',
    created_at: '2026-07-24 11:20',
    updated_at: '2026-07-24 11:45',
    is_favorite: true,
    doc_ids: ['doc-001'],
    messages: [
      {
        id: 'm-1',
        sender: 'user',
        text: 'What is the required notice period for termination in the Employment Agreement?',
        timestamp: '11:20 AM'
      },
      {
        id: 'm-2',
        sender: 'ai',
        summary: 'According to Clause 10.1 of the Employment Agreement, either party may terminate by providing at least 30 days prior written notice.',
        reasoning: '1. Vector Embeddings Search -> Matched Clause 10.1 in FAISS index with 96% cosine similarity score.\n2. Contract Clause Verification -> Cross-referenced Page 9 Section 10.1 (Termination Procedures).\n3. Legal Deduction -> Verified 30 calendar days notice requirement without penalty.',
        text: 'According to **Clause 10.1 (Termination Procedures)** on **Page 9** of the *Senior Software Engineer Employment Agreement*, either party may terminate the agreement by providing at least **30 days prior written notice**.',
        timestamp: '11:21 AM',
        confidence_level: 'High',
        citations: [
          {
            doc_id: 'doc-001',
            doc_name: 'Senior_Software_Engineer_Employment_Agreement.pdf',
            page_number: 9,
            clause_number: 'Clause 10.1',
            snippet: 'Either party may terminate this Agreement without cause upon giving thirty (30) calendar days advance written notice.',
            confidence: 0.96
          }
        ],
        related_clauses: [
          'Clause 10.1 (Termination Procedures)',
          'Clause 10.2 (Immediate Termination for Cause)',
          'Clause 8.2 (Non-Compete Restrictions)'
        ],
        follow_up_questions: [
          'What happens if termination occurs during the probation period?',
          'What remedies apply if 30 days notice is not provided?',
          'Are there any severance pay entitlements upon termination?'
        ]
      }
    ]
  }
];

export const MOCK_COMPARISON_RESULT: ComparisonResult = {
  doc1_name: 'Senior_Software_Engineer_Employment_Agreement.pdf (Standard 2026)',
  doc2_name: 'SaaS_Enterprise_Master_Services_Agreement.docx (Vendor Contract)',
  similarity_percentage: 42,
  key_differences: [
    'Employment agreement includes 24-month non-compete clause, whereas SaaS MSA has no non-compete obligations.',
    'Employment agreement covers IP ownership assignment for employee creations, while SaaS MSA governs customer data privacy & service SLAs.'
  ],
  key_similarities: [
    'Both contracts enforce strict confidentiality and non-disclosure obligations.',
    'Both specify Delaware state law as the governing jurisdiction.'
  ],
  clauses: [
    {
      title: 'Confidentiality & Non-Disclosure',
      status: 'modified',
      doc1_text: 'Employee agrees to hold all proprietary source code and business plans in strict confidence perpetually.',
      doc2_text: 'Both parties agree to maintain mutual confidentiality of proprietary data for a term of 5 years.',
      analysis: 'Doc 1 mandates perpetual confidentiality for the employee, while Doc 2 sets a mutual 5-year sunset limit.'
    }
  ]
};

export const MOCK_ADMIN_ANALYTICS: AdminAnalytics = {
  total_users: 148,
  total_documents: 842,
  total_ai_requests: 12450,
  avg_response_time_ms: 320,
  storage_used_mb: 4850,
  popular_topics: [
    { topic: 'Termination & Notice Periods', count: 3240 },
    { topic: 'Non-Compete Enforceability', count: 2890 },
    { topic: 'Payment Terms & Escalation', count: 2150 }
  ],
  daily_query_trend: [
    { date: 'Jul 20', queries: 340 },
    { date: 'Jul 21', queries: 480 },
    { date: 'Jul 22', queries: 620 },
    { date: 'Jul 23', queries: 590 },
    { date: 'Jul 24', queries: 780 },
    { date: 'Jul 25', queries: 920 }
  ]
};
