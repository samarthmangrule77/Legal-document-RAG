export type Role = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

export interface Team {
  id: string;
  org_id: string;
  name: string;
  description: string;
  color: string;
  document_count: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'Enterprise RAG' | 'Business Pro' | 'Free Workspace';
  storage_used_mb: number;
  max_storage_mb: number;
  teams: Team[];
  created_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  name: string;
  email: string;
  role: Role;
  team_ids: string[];
  avatar_url?: string;
  status: 'active' | 'invited';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  active_org_id: string;
  active_team_id: string; // 'all' or specific team_id
  token?: string;
}

export interface DocumentChunk {
  id: string;
  doc_id: string;
  org_id: string;
  team_id: string;
  page_number: number;
  clause_number?: string;
  content: string;
  similarity_score?: number;
}

export interface RiskItem {
  id: string;
  category: 'unlimited_liability' | 'high_penalties' | 'auto_renewal' | 'non_compete' | 'arbitration' | 'confidentiality' | 'missing_signature' | 'missing_termination';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  clause_ref?: string;
  page_number?: number;
  recommendation: string;
}

export interface SummaryData {
  executive_summary: string;
  parties: string[];
  effective_date: string;
  expiry_date: string;
  payment_terms: string;
  termination_conditions: string;
  confidentiality_terms: string;
  key_obligations: string[];
  risks_summary: string[];
  key_deadlines: string[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  category: 'renewal' | 'payment' | 'expiry' | 'milestone' | 'notice';
  description: string;
  clause_ref?: string;
}

export interface LegalDocument {
  id: string;
  org_id: string;
  team_id: string;
  filename: string;
  file_type: 'pdf' | 'docx' | 'txt';
  upload_date: string;
  file_size: string;
  chunk_count: number;
  status: 'processing' | 'indexed' | 'error';
  risk_score: number;
  is_scanned_ocr?: boolean;
  summary?: SummaryData;
  risks?: RiskItem[];
  timeline?: TimelineEvent[];
}

export interface Citation {
  doc_id: string;
  doc_name: string;
  page_number: number;
  clause_number: string;
  snippet: string;
  confidence: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citations?: Citation[];
  confidence_level?: 'High' | 'Medium' | 'Low';
  beginner_version?: string;
  follow_up_questions?: string[];
  is_streaming?: boolean;
}

export interface Conversation {
  id: string;
  org_id: string;
  team_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_favorite?: boolean;
  messages: ChatMessage[];
  doc_ids: string[];
}

export interface ClauseComparison {
  title: string;
  status: 'added' | 'removed' | 'modified' | 'identical';
  doc1_text?: string;
  doc2_text?: string;
  analysis: string;
}

export interface ComparisonResult {
  doc1_name: string;
  doc2_name: string;
  similarity_percentage: number;
  key_differences: string[];
  key_similarities: string[];
  clauses: ClauseComparison[];
}

export interface AdminAnalytics {
  total_users: number;
  total_documents: number;
  total_ai_requests: number;
  avg_response_time_ms: number;
  storage_used_mb: number;
  popular_topics: { topic: string; count: number }[];
  daily_query_trend: { date: string; queries: number }[];
}
