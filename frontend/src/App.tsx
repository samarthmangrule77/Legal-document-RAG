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
import { FloatingAIAssistant } from './components/FloatingAIAssistant';
import { AuthModal } from './components/AuthModal';
import { PDFViewerModal } from './components/PDFViewerModal';
import { AuthView } from './components/AuthView';

import { LegalDocument, Conversation, User, ChatMessage, Organization, OrgMember, Role, Citation } from './types';
import { INITIAL_DOCUMENTS, INITIAL_CONVERSATIONS, INITIAL_ORGANIZATIONS, INITIAL_MEMBERS } from './mockData';
import { api } from './api/client';

export const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Multi-Tenant State
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [activeOrgId, setActiveOrgId] = useState<string>('org-nexus');
  const [activeTeamId, setActiveTeamId] = useState<string>('all');
  const [members, setMembers] = useState<OrgMember[]>(INITIAL_MEMBERS);

  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0];

  // Dedicated Auth Page State
  const [user, setUser] = useState<User | null>({
    id: 'u-1',
    email: 'alex.rivera@nexuscorp.com',
    name: 'Alex Rivera',
    role: 'owner',
    active_org_id: activeOrgId,
    active_team_id: activeTeamId
  });

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

  // Render Dedicated Full-Screen Auth View if user is signed out
  if (!user) {
    return <AuthView onSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      
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
        onLogout={() => setUser(null)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onQuickSearch={() => setActiveTab('search')}
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

          {activeTab === 'org' && (
            <OrganizationManagerView
              activeOrg={activeOrg}
              members={members}
              onAddTeam={handleAddTeam}
              onInviteMember={handleInviteMember}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentManager
              documents={filteredDocuments}
              onUpload={handleUploadDocument}
              onSelectDoc={setSelectedDoc}
              setActiveTab={setActiveTab}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-card bg-white dark:bg-navy-950 rounded-3xl p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Create New Organization Workspace</h3>
              <button onClick={() => setIsCreateOrgModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
            </div>

            <form onSubmit={handleCreateOrgSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Global Logistics"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Create Enterprise Tenant Workspace
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
