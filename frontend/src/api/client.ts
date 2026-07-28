import { LegalDocument, Conversation, ComparisonResult, AdminAnalytics, ChatMessage, User } from '../types';
import { INITIAL_DOCUMENTS, INITIAL_CONVERSATIONS, MOCK_COMPARISON_RESULT, MOCK_ADMIN_ANALYTICS } from '../mockData';

const API_BASE = '/api';

// Token Storage Keys
const ACCESS_TOKEN_KEY = 'lexirag_access_token';
const REFRESH_TOKEN_KEY = 'lexirag_refresh_token';
const REMEMBER_ME_KEY = 'lexirag_remember_me';

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(accessToken: string, refreshToken?: string, rememberMe: boolean = false) {
    if (rememberMe) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    } else {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  },
  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

// Authenticated fetch wrapper with automatic bearer token & token refresh retry
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = tokenStorage.getAccessToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  options.headers = headers;

  let response = await fetch(url, options);

  // Auto-refresh token if 401 Unauthorized occurs and refresh token is available
  if (response.status === 401 && tokenStorage.getRefreshToken()) {
    const refreshed = await api.refreshToken();
    if (refreshed && refreshed.access_token) {
      headers.set('Authorization', `Bearer ${refreshed.access_token}`);
      options.headers = headers;
      response = await fetch(url, options);
    } else {
      tokenStorage.clearTokens();
    }
  }

  return response;
}

export const api = {
  // --- AUTHENTICATION API ---

  async login(email: string, password: string, rememberMe: boolean = false) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember_me: rememberMe })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          tokenStorage.setTokens(data.access_token, data.refresh_token, rememberMe);
        }
        return data;
      } else {
        const err = await res.json();
        throw new Error(err.detail || "Authentication failed.");
      }
    } catch (e: any) {
      if (e.message && e.message !== "Failed to fetch") {
        throw e;
      }
      console.warn("Backend API offline, serving local fallback user.", e);
    }

    // Local fallback when backend server is un-contactable
    const mockUser: User = {
      id: 'u-1',
      email: email || 'alex.rivera@nexuscorp.com',
      name: email ? (email.split('@')[0].replace('.', ' ').replace(/^./, c => c.toUpperCase())) : 'Alex Rivera',
      role: 'owner',
      active_org_id: 'org-nexus',
      active_team_id: 'all',
      job_title: 'Head of Legal Operations',
      company_name: 'Nexus Corp',
      email_verified: true,
      auth_provider: 'local',
      created_at: new Date().toISOString().split('T')[0]
    };
    tokenStorage.setTokens('jwt-mock-access-token', 'jwt-mock-refresh-token', rememberMe);
    return { user: mockUser, access_token: 'jwt-mock-access-token', refresh_token: 'jwt-mock-refresh-token' };
  },

  async register(name: string, email: string, password: string, companyName: string = 'Nexus Corp') {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, company_name: companyName })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          tokenStorage.setTokens(data.access_token, data.refresh_token, true);
        }
        return data;
      } else {
        const err = await res.json();
        throw new Error(err.detail || "Registration failed.");
      }
    } catch (e: any) {
      if (e.message && e.message !== "Failed to fetch") {
        throw e;
      }
      console.warn("Backend API offline, completing registration locally.", e);
    }

    const mockUser: User = {
      id: `u-${Date.now()}`,
      email,
      name,
      role: 'owner',
      active_org_id: 'org-nexus',
      active_team_id: 'all',
      job_title: 'Enterprise Workspace Admin',
      company_name: companyName,
      email_verified: false,
      auth_provider: 'local',
      created_at: new Date().toISOString().split('T')[0]
    };
    tokenStorage.setTokens('jwt-mock-register-token', 'jwt-mock-refresh-token', true);
    return { user: mockUser, access_token: 'jwt-mock-register-token', refresh_token: 'jwt-mock-refresh-token' };
  },

  async refreshToken() {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      if (res.ok) {
        const data = await res.json();
        const isRemember = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
        tokenStorage.setTokens(data.access_token, data.refresh_token, isRemember);
        return data;
      }
    } catch (e) {
      console.warn("Refresh token request failed.", e);
    }
    return null;
  },

  async logout() {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      await fetchWithAuth(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
    } catch (e) {
      console.warn("Logout endpoint call offline.", e);
    } finally {
      tokenStorage.clearTokens();
    }
    return { status: 'success' };
  },

  async getMe(): Promise<User | null> {
    const token = tokenStorage.getAccessToken();
    if (!token) return null;

    try {
      const res = await fetchWithAuth(`${API_BASE}/auth/me`);
      if (res.ok) {
        const data = await res.json();
        return data.user;
      }
    } catch (e) {
      console.warn("Get current user profile offline.", e);
    }

    // Fallback profile if backend offline but token exists
    return {
      id: 'u-1',
      email: 'alex.rivera@nexuscorp.com',
      name: 'Alex Rivera',
      role: 'owner',
      active_org_id: 'org-nexus',
      active_team_id: 'all',
      job_title: 'Head of Legal & Compliance',
      company_name: 'Nexus Corp',
      email_verified: true,
      auth_provider: 'local',
      created_at: '2026-01-15'
    };
  },

  async ssoLogin(provider: 'google' | 'microsoft' | 'github', email?: string, name?: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/sso/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, email, name })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          tokenStorage.setTokens(data.access_token, data.refresh_token, true);
        }
        return data;
      }
    } catch (e) {
      console.warn("Backend SSO offline, generating local OAuth session.", e);
    }

    const providerNames = { google: 'Google Workspace', microsoft: 'Microsoft Entra ID', github: 'GitHub Enterprise' };
    const mockEmail = email || `alex.rivera@${provider}.company.com`;
    const mockName = name || `Verified ${providerNames[provider]} User`;
    const mockUser: User = {
      id: `sso-${provider}-${Date.now()}`,
      email: mockEmail,
      name: mockName,
      role: 'owner',
      active_org_id: 'org-nexus',
      active_team_id: 'all',
      job_title: `${providerNames[provider]} Single Sign-On User`,
      company_name: 'Nexus Corp',
      email_verified: true,
      auth_provider: provider,
      created_at: new Date().toISOString().split('T')[0]
    };
    tokenStorage.setTokens(`jwt-sso-${provider}-token`, `jwt-sso-refresh-${provider}`, true);
    return { user: mockUser, access_token: `jwt-sso-${provider}-token`, sso_provider: providerNames[provider] };
  },

  async forgotPassword(email: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend forgot password offline.", e);
    }
    return { status: 'success', message: `Password reset pin sent to ${email}`, demo_code: '123456' };
  },

  async resetPassword(email: string, code: string, newPassword: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, new_password: newPassword })
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.detail || "Password reset failed.");
    } catch (e: any) {
      if (e.message && e.message !== "Failed to fetch") throw e;
      console.warn("Backend reset password offline.", e);
    }
    return { status: 'success', message: 'Password reset successfully.' };
  },

  async sendEmailVerification(email: string) {
    try {
      const res = await fetchWithAuth(`${API_BASE}/auth/verify-email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend email verification send offline.", e);
    }
    return { status: 'success', message: `Verification code sent to ${email}`, demo_code: '123456' };
  },

  async confirmEmailVerification(email: string, code: string) {
    try {
      const res = await fetchWithAuth(`${API_BASE}/auth/verify-email/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.detail || "Invalid verification pin.");
    } catch (e: any) {
      if (e.message && e.message !== "Failed to fetch") throw e;
      console.warn("Backend confirm email verification offline.", e);
    }
    return { status: 'success', message: 'Email address verified!' };
  },

  async updateProfile(payload: { name?: string; job_title?: string; company_name?: string; current_password?: string; new_password?: string }) {
    try {
      const res = await fetchWithAuth(`${API_BASE}/auth/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.detail || "Profile update failed.");
    } catch (e: any) {
      if (e.message && e.message !== "Failed to fetch") throw e;
      console.warn("Backend update profile offline.", e);
    }
    return { status: 'success', message: 'Profile updated locally.' };
  },

  async guestLogin() {
    try {
      const res = await fetch(`${API_BASE}/auth/guest`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          tokenStorage.setTokens(data.access_token, data.refresh_token, false);
        }
        return data;
      }
    } catch (e) {
      console.warn("Backend API unavailable, logging in as guest locally.", e);
    }
    const mockUser: User = {
      id: 'guest-99',
      email: 'guest@lexirag.ai',
      name: 'Guest User',
      role: 'member',
      active_org_id: 'org-nexus',
      active_team_id: 'all',
      job_title: 'Guest Evaluator',
      company_name: 'LexiRAG Sandbox',
      email_verified: true,
      auth_provider: 'guest',
      created_at: new Date().toISOString().split('T')[0]
    };
    tokenStorage.setTokens('jwt-guest-token', 'jwt-guest-refresh-token', false);
    return { user: mockUser, access_token: 'jwt-guest-token' };
  },

  async sendOTP(email: string) {
    return this.forgotPassword(email);
  },

  async verifyOTP(email: string, code: string) {
    return this.confirmEmailVerification(email, code);
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
