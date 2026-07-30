import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DocumentManager } from './components/DocumentManager';
import { ChatInterface } from './components/ChatInterface';
import { ContractSummaryView } from './components/ContractSummaryView';
import { RiskDetectorView } from './components/RiskDetectorView';
import { ContractComparer } from './components/ContractComparer';
import { SemanticSearchView } from './components/SemanticSearchView';
import { TimelineView } from './components/TimelineView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { OrganizationManagerView } from './components/OrganizationManagerView';
import { BillingDashboardView } from './components/BillingDashboardView';
import { ContractGeneratorView } from './components/ContractGeneratorView';
import { ClauseGraphView } from './components/ClauseGraphView';
import { VersionControlView } from './components/VersionControlView';
import { WorkflowBuilderView } from './components/WorkflowBuilderView';
import { AuditLogsView } from './components/AuditLogsView';
import { AIMemoryView } from './components/AIMemoryView';
import { EnterpriseSettingsView } from './components/EnterpriseSettingsView';
import { DeveloperApiView } from './components/DeveloperApiView';
import { AILegalAgentView } from './components/AILegalAgentView';
import { FloatingAIAssistant } from './components/FloatingAIAssistant';
import { AuthModal } from './components/AuthModal';
import { PDFViewerModal } from './components/PDFViewerModal';
import { AuthView } from './components/AuthView';
import { ProfileView } from './components/ProfileView';
import { NotificationToastContainer, NotificationEvent } from './components/NotificationToastContainer';

import { LegalDocument, Conversation, User, ChatMessage, Organization, OrgMember, Role, Citation, SubscriptionDetails, PricingPlan, InvoiceItem } from './types';
import { INITIAL_DOCUMENTS, INITIAL_CONVERSATIONS, INITIAL_ORGANIZATIONS, INITIAL_MEMBERS } from './mockData';
import { api } from './api/client';

export const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Real-Time WebSockets & Notifications State
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);

  // Multi-Tenant State
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [activeOrgId, setActiveOrgId] = useState<string>('org-nexus');
  const [activeTeamId, setActiveTeamId] = useState<string>('all');
  const [members, setMembers] = useState<OrgMember[]>(INITIAL_MEMBERS);

  // SaaS Billing & Subscription State
  const [subscription, setSubscription] = useState<SubscriptionDetails>({
    plan_id: 'free',
    plan_name: 'Free Plan',
    pdf_limit: 5,
    current_pdf_count: 3,
    status: 'active',
    billing_cycle: 'monthly',
    price_per_month: 0,
    renews_at: '2026-08-27',
    stripe_customer_id: 'cus_lexi99201'
  });

  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([
    {
      id: 'free',
      name: 'Free Plan',
      price_monthly: 0,
      price_annual: 0,
      pdf_limit: 5,
      features: [
        'Up to 5 PDF document uploads',
        'Standard vector search & RAG',
        'Single user workspace',
        'Basic risk detection',
        'Community support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price_monthly: 29,
      price_annual: 290,
      pdf_limit: -1,
      features: [
        'Unlimited PDF & DOCX uploads',
        'Priority OCR for scanned contracts',
        'Side-by-side contract comparison',
        'AI timeline & deadline extractor',
        'Export analysis to PDF/Word',
        'Up to 10 team members',
        'Email & chat support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price_monthly: 199,
      price_annual: 1990,
      pdf_limit: -1,
      features: [
        'Everything in Pro Plan',
        'Dedicated vector database instance',
        'Enterprise SSO (Google, Azure AD, Okta)',
        'Custom SLA & audit logs',
        'Unlimited team members & roles',
        'Dedicated account manager & onboarding'
      ]
    }
  ]);

  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    {
      id: 'inv_1092',
      date: '2026-07-01',
      amount: '$0.00',
      status: 'Paid',
      plan: 'Free Plan',
      pdf_url: '#'
    }
  ]);

  useEffect(() => {
    async function loadBilling() {
      const data = await api.getSubscriptionDetails();
      if (data) {
        if (data.subscription) setSubscription(data.subscription);
        if (data.plans) setPricingPlans(data.plans);
        if (data.invoices) setInvoices(data.invoices);
      }
    }
    loadBilling();
  }, []);

  // WebSocket Live Real-Time Notifications Connection
  useEffect(() => {
    let ws: WebSocket | null = null;
    let retryTimer: any = null;

    const connectWS = () => {
      try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.host.includes(':') ? window.location.host : '127.0.0.1:8000';
        const wsUrl = `${wsProtocol}//${wsHost}/api/ws`;

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.event && payload.event !== 'pong' && payload.event !== 'connected') {
              const newNotif: NotificationEvent = {
                id: `notif-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                event: payload.event,
                title: payload.title || 'Live Event',
                message: payload.message || 'Processing complete',
                timestamp: payload.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: false
              };
              setNotifications(prev => [newNotif, ...prev]);

              // Auto-dismiss toast after 5 seconds
              setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
              }, 5000);
            }
          } catch (e) {
            console.error("WS parse error", e);
          }
        };

        ws.onclose = () => {
          setIsWsConnected(false);
          retryTimer = setTimeout(connectWS, 4000);
        };

        ws.onerror = () => {
          setIsWsConnected(false);
        };
      } catch (e) {
        console.warn("WebSocket connection fallback.", e);
      }
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const triggerLiveEvents = (filename: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // 1. OCR Complete
    setTimeout(() => {
      const e1: NotificationEvent = {
        id: `ocr-${Date.now()}`,
        event: 'ocr_completed',
        title: 'OCR Complete ✔',
        message: `PyMuPDF text extraction & OCR verified for ${filename}`,
        timestamp: timeStr
      };
      setNotifications(prev => [e1, ...prev]);
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== e1.id)), 5000);
    }, 800);

    // 2. Risk Analysis Finished
    setTimeout(() => {
      const e2: NotificationEvent = {
        id: `risk-${Date.now()}`,
        event: 'risk_analysis_completed',
        title: 'Risk Analysis Finished ✔',
        message: `Contract clause analysis finished for ${filename}`,
        timestamp: timeStr
      };
      setNotifications(prev => [e2, ...prev]);
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== e2.id)), 5000);
    }, 1600);

    // 3. Document Indexed
    setTimeout(() => {
      const e3: NotificationEvent = {
        id: `idx-${Date.now()}`,
        event: 'doc_indexed',
        title: 'Document Indexed ✔',
        message: `${filename} successfully indexed into FAISS Vector DB`,
        timestamp: timeStr
      };
      setNotifications(prev => [e3, ...prev]);
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== e3.id)), 5000);
    }, 2400);
  };

  const handleUpgradePlan = async (planId: 'pro' | 'enterprise', cycle: 'monthly' | 'annual') => {
    const res = await api.createCheckoutSession(planId, cycle);
    if (res && res.updated_subscription) {
      setSubscription(res.updated_subscription);
      if (invoices.findIndex(i => i.id === res.session_id) === -1) {
        setInvoices(prev => [
          {
            id: `inv_${int_time()}`,
            date: new Date().toISOString().split('T')[0],
            amount: planId === 'pro' ? (cycle === 'monthly' ? '$29.00' : '$290.00') : (cycle === 'monthly' ? '$199.00' : '$1,990.00'),
            status: 'Paid',
            plan: planId === 'pro' ? 'Pro Plan' : 'Enterprise Plan',
            pdf_url: '#'
          },
          ...prev
        ]);
      }
    } else {
      // Fallback UI update
      setSubscription(prev => ({
        ...prev,
        plan_id: planId,
        plan_name: planId === 'pro' ? 'Pro Plan' : 'Enterprise Plan',
        pdf_limit: -1,
        billing_cycle: cycle,
        price_per_month: planId === 'pro' ? (cycle === 'monthly' ? 29 : 24) : (cycle === 'monthly' ? 199 : 165)
      }));
    }
  };

  const handleCancelSubscription = async () => {
    const res = await api.cancelSubscription();
    if (res && res.subscription) {
      setSubscription(res.subscription);
    } else {
      setSubscription(prev => ({
        ...prev,
        plan_id: 'free',
        plan_name: 'Free Plan',
        pdf_limit: 5,
        price_per_month: 0
      }));
    }
  };

  const int_time = () => Math.floor(Date.now() / 1000) % 10000;

  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];

  // Dedicated Auth Page State & Initial Session Check
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      const activeUser = await api.getMe();
      if (activeUser) {
        setUser(activeUser);
      }
      setAuthChecked(true);
    }
    restoreSession();
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');

  // PDF Viewer Modal State
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [pdfViewerDoc, setPdfViewerDoc] = useState<LegalDocument | null>(null);

  const [allDocuments, setAllDocuments] = useState<LegalDocument[]>(INITIAL_DOCUMENTS);

  // Filter documents by active Organization and Department Team
  const filteredDocuments = allDocuments.filter(doc => {
    if (doc.org_id !== activeOrgId) return false;
    if (activeTeamId !== 'all' && doc.team_id !== activeTeamId) return false;
    return true;
  });

  const [selectedDoc, setSelectedDoc] = useState<LegalDocument>(filteredDocuments[0] || INITIAL_DOCUMENTS[0]);
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [currentConvId, setCurrentConvId] = useState<string>('conv-1');

  const [beginnerMode, setBeginnerMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync selectedDoc when org/team changes
  useEffect(() => {
    if (filteredDocuments.length > 0) {
      setSelectedDoc(filteredDocuments[0]);
    }
  }, [activeOrgId, activeTeamId]);

  // Handle Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const currentConv = conversations.find(c => c.id === currentConvId) || conversations[0];

  const handleUploadDocument = async (file: File) => {
    triggerLiveEvents(file.name);
    const created = await api.uploadDocument(file);
    const tenantDoc: LegalDocument = {
      ...created,
      org_id: activeOrgId,
      team_id: activeTeamId === 'all' ? (activeOrg.teams[0]?.id || 'team-legal') : activeTeamId
    };
    setAllDocuments(prev => [tenantDoc, ...prev]);
    setSelectedDoc(tenantDoc);
    return tenantDoc;
  };

  const handleSendMessage = async (query: string, isBeginner: boolean) => {
    const docScope = selectedDocId === 'all' ? filteredDocuments.map(d => d.id) : [selectedDocId];
    
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConv.id) {
        return {
          ...conv,
          messages: [...conv.messages, userMsg],
          updated_at: 'Just now'
        };
      }
      return conv;
    }));

    const aiMsg = await api.sendQuery(query, docScope, isBeginner);

    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConv.id) {
        return {
          ...conv,
          messages: [...conv.messages, aiMsg],
          updated_at: 'Just now'
        };
      }
      return conv;
    }));
  };

  const handleOpenPDFViewer = (citation: Citation, doc: LegalDocument) => {
    setActiveCitation(citation);
    setPdfViewerDoc(doc);
    setIsPDFViewerOpen(true);
  };

  const handleAddTeam = (name: string, description: string) => {
    const newTeamId = `team-${Date.now()}`;
    const newTeam = {
      id: newTeamId,
      org_id: activeOrgId,
      name,
      description: description || 'Department legal scope',
      color: 'brand',
      document_count: 0
    };

    setOrganizations(prev => prev.map(org => {
      if (org.id === activeOrgId) {
        return {
          ...org,
          teams: [...org.teams, newTeam]
        };
      }
      return org;
    }));
  };

  const handleInviteMember = (email: string, name: string, role: Role, teamIds: string[]) => {
    const newMember: OrgMember = {
      id: `m-${Date.now()}`,
      org_id: activeOrgId,
      name,
      email,
      role,
      team_ids: teamIds.length > 0 ? teamIds : [activeOrg.teams[0]?.id || 'team-legal'],
      status: 'invited'
    };
    setMembers(prev => [newMember, ...prev]);

    const notif: NotificationEvent = {
      id: `mem-${Date.now()}`,
      event: 'member_joined',
      title: 'New Team Member Joined ✔',
      message: `${name} (${email}) joined the workspace`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [notif, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== notif.id)), 5000);
  };

  const handleCreateOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    const newOrgId = `org-${Date.now()}`;
    const createdOrg: Organization = {
      id: newOrgId,
      name: newOrgName,
      slug: newOrgName.toLowerCase().replace(/\s+/g, '-'),
      plan: 'Business Pro',
      storage_used_mb: 50,
      max_storage_mb: 10000,
      created_at: new Date().toISOString().substring(0, 10),
      teams: [
        { id: `team-gen-${Date.now()}`, org_id: newOrgId, name: 'General Contracts', description: 'Default company contracts scope', color: 'brand', document_count: 0 }
      ]
    };
    setOrganizations(prev => [...prev, createdOrg]);
    setActiveOrgId(newOrgId);
    setActiveTeamId('all');
    setNewOrgName('');
    setIsCreateOrgModalOpen(false);
  };

  const highRiskCount = filteredDocuments.filter(d => d.risk_score >= 60).length;

  // Render Loading spinner while checking initial auth status
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  // Protected Route: Render Dedicated Full-Screen Auth View if user is signed out
  if (!user) {
    return <AuthView onSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-150 overflow-x-hidden">
      
      {/* Real-Time WebSocket Floating Toasts Stack */}
      <NotificationToastContainer
        notifications={notifications}
        onDismiss={handleDismissNotification}
        isConnected={isWsConnected}
      />

      {/* Top Navigation Bar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        organizations={organizations}
        activeOrg={activeOrg}
        activeTeamId={activeTeamId}
        onSelectOrg={(id) => {
          setActiveOrgId(id);
          setActiveTeamId('all');
        }}
        onSelectTeam={(tid) => setActiveTeamId(tid)}
        onCreateOrgModal={() => setIsCreateOrgModalOpen(true)}
        onOpenAuth={() => setUser(null)}
        onLogout={handleLogout}
        onOpenProfile={() => setActiveTab('profile')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onQuickSearch={() => setActiveTab('search')}
        notifications={notifications}
        unreadCount={notifications.length}
        onClearNotifications={() => setNotifications([])}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          documentCount={filteredDocuments.length}
          highRiskCount={highRiskCount}
          activeOrgName={activeOrg.name}
          planName={subscription.plan_name}
        />

        {/* Content Body Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              documents={filteredDocuments}
              conversations={conversations}
              setActiveTab={setActiveTab}
              setSelectedDoc={setSelectedDoc}
            />
          )}

          {activeTab === 'profile' && user && (
            <ProfileView
              user={user}
              onUpdateUser={(updated) => setUser(updated)}
              onLogout={handleLogout}
            />
          )}

          {activeTab === 'agent' && (
            <AILegalAgentView />
          )}

          {activeTab === 'org' && (
            <OrganizationManagerView
              activeOrg={activeOrg}
              members={members}
              onAddTeam={handleAddTeam}
              onInviteMember={handleInviteMember}
            />
          )}

          {activeTab === 'generator' && (
            <ContractGeneratorView
              onContractGenerated={(genDoc) => {
                const tenantDoc: LegalDocument = {
                  ...genDoc,
                  org_id: activeOrgId,
                  team_id: activeTeamId === 'all' ? (activeOrg.teams[0]?.id || 'team-legal') : activeTeamId
                };
                setAllDocuments(prev => [tenantDoc, ...prev]);
                setSelectedDoc(tenantDoc);
              }}
              setActiveTab={setActiveTab}
              onSelectDoc={setSelectedDoc}
            />
          )}

          {activeTab === 'workflows' && (
            <WorkflowBuilderView
              selectedDoc={selectedDoc}
              documents={filteredDocuments}
              onSelectDoc={setSelectedDoc}
            />
          )}

          {activeTab === 'memory' && (
            <AIMemoryView />
          )}

          {activeTab === 'graph' && (
            <ClauseGraphView
              selectedDoc={selectedDoc}
              documents={filteredDocuments}
              onSelectDoc={setSelectedDoc}
            />
          )}

          {activeTab === 'versioning' && (
            <VersionControlView
              selectedDoc={selectedDoc}
              documents={filteredDocuments}
              onSelectDoc={setSelectedDoc}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogsView />
          )}

          {activeTab === 'developer' && (
            <DeveloperApiView />
          )}

          {activeTab === 'settings' && (
            <EnterpriseSettingsView />
          )}

          {activeTab === 'billing' && (
            <BillingDashboardView
              subscription={subscription}
              plans={pricingPlans}
              invoices={invoices}
              onUpgradePlan={handleUpgradePlan}
              onCancelSubscription={handleCancelSubscription}
              documentCount={filteredDocuments.length}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentManager
              documents={filteredDocuments}
              onUpload={handleUploadDocument}
              onSelectDoc={setSelectedDoc}
              setActiveTab={setActiveTab}
              planId={subscription.plan_id}
            />
          )}

          {activeTab === 'chat' && (
            <ChatInterface
              documents={filteredDocuments}
              currentConversation={currentConv}
              onSendMessage={handleSendMessage}
              selectedDocId={selectedDocId}
              setSelectedDocId={setSelectedDocId}
              beginnerMode={beginnerMode}
              setBeginnerMode={setBeginnerMode}
              onOpenPDFViewer={handleOpenPDFViewer}
            />
          )}

          {activeTab === 'summary' && (
            <ContractSummaryView
              selectedDoc={selectedDoc}
              documents={filteredDocuments}
              onSelectDoc={setSelectedDoc}
            />
          )}

          {activeTab === 'risks' && (
            <RiskDetectorView
              selectedDoc={selectedDoc}
              documents={filteredDocuments}
              onSelectDoc={setSelectedDoc}
            />
          )}

          {activeTab === 'compare' && (
            <ContractComparer
              documents={filteredDocuments}
            />
          )}

          {activeTab === 'search' && (
            <SemanticSearchView
              documents={filteredDocuments}
              initialQuery={searchQuery}
              onSelectDoc={setSelectedDoc}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineView
              documents={filteredDocuments}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboardView />
          )}
        </main>

      </div>

      {/* Floating AI Helper Drawer */}
      <FloatingAIAssistant
        documents={filteredDocuments}
        onOpenFullChat={() => setActiveTab('chat')}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(u) => setUser(u)}
      />

      {/* PDF Viewer with Highlighted Sentences */}
      <PDFViewerModal
        isOpen={isPDFViewerOpen}
        onClose={() => setIsPDFViewerOpen(false)}
        citation={activeCitation}
        document={pdfViewerDoc}
      />

      {/* Create Organization Modal */}
      {isCreateOrgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl p-6 space-y-5 border border-slate-200 dark:border-white/[0.08] shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Create Organization</h3>
              <button onClick={() => setIsCreateOrgModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
            </div>

            <form onSubmit={handleCreateOrgSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Global Logistics"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors"
              >
                Create Organization
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
