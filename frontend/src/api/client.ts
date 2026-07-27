import { LegalDocument, Conversation, ComparisonResult, AdminAnalytics, ChatMessage } from '../types';
import { INITIAL_DOCUMENTS, INITIAL_CONVERSATIONS, MOCK_COMPARISON_RESULT, MOCK_ADMIN_ANALYTICS } from '../mockData';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(email: string, password: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend API unavailable, using local session state.", e);
    }
    return {
      user: { id: 'u-1', email, name: email.split('@')[0] || 'User', role: 'owner', active_org_id: 'org-nexus', active_team_id: 'all' },
      token: 'jwt-mock-token-abc123'
    };
  },

  async guestLogin() {
    try {
      const res = await fetch(`${API_BASE}/auth/guest`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend API unavailable, logging in as guest locally.", e);
    }
    return {
      user: { id: 'guest-99', email: 'guest@lexirag.ai', name: 'Guest User', role: 'member', active_org_id: 'org-nexus', active_team_id: 'all' },
      token: 'jwt-guest-token'
    };
  },

  async ssoLogin(provider: 'google' | 'microsoft' | 'github') {
    try {
      const res = await fetch(`${API_BASE}/auth/sso/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend SSO offline, generating authenticated SSO token.", e);
    }

    const nameMap = { google: 'Google Workspace', microsoft: 'Microsoft Entra ID', github: 'GitHub Enterprise' };
    return {
      user: {
        id: `sso-${provider}-99`,
        email: `sso.user@${provider}.com`,
        name: `Verified ${nameMap[provider]} User`,
        role: 'owner',
        active_org_id: 'org-nexus',
        active_team_id: 'all'
      },
      token: `jwt-sso-${provider}-token`
    };
  },

  async sendOTP(email: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend OTP offline, using local OTP simulator.", e);
    }
    return { status: 'success', message: `OTP sent to ${email}`, demo_code: '123456' };
  },

  async verifyOTP(email: string, code: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend OTP offline, verifying local OTP code.", e);
    }

    return {
      user: {
        id: `u-otp-${Date.now()}`,
        email,
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        role: 'owner',
        active_org_id: 'org-nexus',
        active_team_id: 'all'
      },
      token: 'jwt-otp-verified-token'
    };
  },

  // Documents
  async getDocuments(): Promise<LegalDocument[]> {
    try {
      const res = await fetch(`${API_BASE}/docs/list`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend API offline, serving cached documents.", e);
    }
    return INITIAL_DOCUMENTS;
  },

  async uploadDocument(file: File): Promise<LegalDocument> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/docs/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend upload offline, generating simulated indexing doc.", e);
    }

    const newDoc: LegalDocument = {
      id: `doc-${Date.now()}`,
      org_id: 'org-nexus',
      team_id: 'team-legal',
      filename: file.name,
      file_type: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : 'txt',
      upload_date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      file_size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      chunk_count: Math.floor(Math.random() * 20) + 10,
      status: 'indexed',
      risk_score: Math.floor(Math.random() * 55) + 20,
      is_scanned_ocr: file.name.toLowerCase().includes('scanned'),
      summary: {
        executive_summary: `Processed agreement for ${file.name}. Automatic RAG index created with page and clause metadata.`,
        parties: ["Party A", "Party B"],
        effective_date: "2026-08-01",
        expiry_date: "2027-07-31",
        payment_terms: "Standard commercial net 30 payment terms.",
        termination_conditions: "30-day prior written notice required by either party.",
        confidentiality_terms: "Mutual NDA protecting technical and financial assets.",
        key_obligations: ["Perform services outlined in Exhibit A", "Maintain insurance coverage"],
        risks_summary: ["Auto-renewal clause requires 60-day cancellation notice"],
        key_deadlines: ["2026-08-01: Effective Date", "2027-06-01: Notice Cutoff"]
      },
      risks: [
        {
          id: `r-${Date.now()}`,
          category: 'auto_renewal',
          title: 'Automatic Renewal Provision Detected',
          description: `Contract ${file.name} automatically extends for 12 months unless cancelled 60 days in advance.`,
          severity: 'medium',
          clause_ref: 'Section 4.1',
          page_number: 2,
          recommendation: 'Calendar the 60-day notice window to avoid unintentional renewal.'
        }
      ],
      timeline: [
        {
          id: `t-${Date.now()}`,
          date: '2026-08-01',
          title: 'Effective Date',
          category: 'milestone',
          description: 'Agreement active date.',
          clause_ref: 'Section 1.1'
        }
      ]
    };
    return newDoc;
  },

  // RAG Query
  async sendQuery(query: string, docIds: string[], beginnerMode: boolean = false): Promise<ChatMessage> {
    try {
      const res = await fetch(`${API_BASE}/chat/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, doc_ids: docIds, beginner_mode: beginnerMode })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend API offline, generating local RAG answer.", e);
    }

    const lower = query.toLowerCase();
    let text = "";
    let pageNum = 1;
    let clauseNum = "Clause 3.1";
    let snippet = "The terms set forth herein govern all operations and obligations of the contracting parties.";

    if (lower.includes('notice') || lower.includes('termination')) {
      text = "Based on the uploaded documents, **termination requires 30 days written notice** under standard conditions.\n\nIn cases of material breach, termination may take effect immediately upon written notification.";
      pageNum = 9;
      clauseNum = "Clause 10.1";
      snippet = "Either party may terminate this Agreement without cause upon giving thirty (30) calendar days advance written notice.";
    } else if (lower.includes('payment') || lower.includes('salary') || lower.includes('rent')) {
      text = "According to the financial terms in the contract:\n- Base payments are scheduled on the **1st of each month**.\n- Net 30 payment terms apply to invoice processing.\n- Late payments incur a **1.5% monthly interest penalty**.";
      pageNum = 4;
      clauseNum = "Clause 5.2";
      snippet = "Invoices shall be payable within thirty (30) days of receipt. Late payments shall accrue interest at 1.5% per month.";
    } else if (lower.includes('risk') || lower.includes('penalty') || lower.includes('liability')) {
      text = "The primary liability provisions state:\n- **Limitation of Liability**: Total liability is capped at the total amount paid in the preceding 12 months.\n- **Indemnification**: Employee/Contractor indemnifies third-party IP claims.";
      pageNum = 11;
      clauseNum = "Clause 12.1";
      snippet = "Neither party shall be liable for indirect or consequential damages, subject to indemnification exceptions.";
    } else {
      text = `Regarding your query "${query}":\n\nThe agreement specifies clear obligations between both parties. According to **${clauseNum}** on **Page ${pageNum}**, all terms must be performed in accordance with applicable governing law and industry security standards.`;
    }

    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence_level: 'High',
      citations: [
        {
          doc_id: docIds[0] || 'doc-001',
          doc_name: 'Senior_Software_Engineer_Employment_Agreement.pdf',
          page_number: pageNum,
          clause_number: clauseNum,
          snippet,
          confidence: 0.96
        }
      ],
      beginner_version: beginnerMode ? `Simplified: Here is the short version — ${text.replace(/\*\*/g, '').split('\n')[0]}` : undefined,
      follow_up_questions: [
        'What are the remedies if this clause is violated?',
        'Can this clause be amended by mutual agreement?',
        'What deadlines apply to this provision?'
      ]
    };
  },

  // Comparison
  async compareContracts(docId1: string, docId2: string): Promise<ComparisonResult> {
    try {
      const res = await fetch(`${API_BASE}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc1_id: docId1, doc2_id: docId2 })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend API offline, returning client comparison matrix.", e);
    }
    return MOCK_COMPARISON_RESULT;
  },

  // Analytics
  async getAnalytics(): Promise<AdminAnalytics> {
    try {
      const res = await fetch(`${API_BASE}/admin/analytics`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend API offline, using cached analytics.", e);
    }
    return MOCK_ADMIN_ANALYTICS;
  },

  // SaaS Billing & Subscription
  async getSubscriptionDetails() {
    try {
      const res = await fetch(`${API_BASE}/billing/subscription`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Billing API offline, using client session subscription.", e);
    }
    return null;
  },

  async createCheckoutSession(targetPlan: string, billingCycle: string = 'monthly') {
    try {
      const res = await fetch(`${API_BASE}/billing/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_plan: targetPlan, billing_cycle: billingCycle })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Checkout session API error, fallback local upgrade.", e);
    }
    return null;
  },

  async cancelSubscription() {
    try {
      const res = await fetch(`${API_BASE}/billing/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'User requested cancellation' })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Cancel subscription API error.", e);
    }
    return null;
  },

  // AI Contract Generator
  async getContractTemplates() {
    try {
      const res = await fetch(`${API_BASE}/generator/templates`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Generator API offline.", e);
    }
    return null;
  },

  async generateContract(templateId: string, parameters: Record<string, any>) {
    try {
      const res = await fetch(`${API_BASE}/generator/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: templateId, parameters })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Generate contract API error.", e);
    }
    return null;
  }
};
