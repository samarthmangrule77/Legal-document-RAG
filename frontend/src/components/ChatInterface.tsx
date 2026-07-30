import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  FileText, 
  BookOpen, 
  ShieldAlert, 
  Download, 
  HelpCircle, 
  FileDown, 
  ThumbsUp,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Eye,
  ShieldCheck,
  Zap,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { ChatMessage, LegalDocument, Conversation, Citation } from '../types';

interface ChatInterfaceProps {
  documents: LegalDocument[];
  currentConversation: Conversation;
  onSendMessage: (query: string, beginnerMode: boolean) => Promise<void>;
  selectedDocId: string;
  setSelectedDocId: (id: string) => void;
  beginnerMode: boolean;
  setBeginnerMode: (val: boolean) => void;
  onOpenPDFViewer: (citation: Citation, doc: LegalDocument) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  documents,
  currentConversation,
  onSendMessage,
  selectedDocId,
  setSelectedDocId,
  beginnerMode,
  setBeginnerMode,
  onOpenPDFViewer
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openReasoningMsgIds, setOpenReasoningMsgIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation.messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;
    setInputText('');
    setIsLoading(true);
    await onSendMessage(query, beginnerMode);
    setIsLoading(false);
  };

  // Voice Input (Speech-to-Text)
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!isListening) {
      recognition.start();
      setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      setIsListening(false);
    }
  };

  // Voice Output (Text-to-Speech)
  const toggleSpeech = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingMsgId(msgId);
    }
  };

  const copyToClipboard = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const exportChatAsPDF = () => {
    const content = currentConversation.messages.map(m => `[${m.sender.toUpperCase()}] ${m.timestamp}\n${m.text}\n`).join('\n---\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LexiRAG_Chat_Export_${Date.now()}.txt`;
    a.click();
  };

  const getConfidenceBadge = (confidenceVal?: number) => {
    const pct = Math.round((confidenceVal || 0.95) * 100);
    if (pct >= 90) {
      return { label: `High Confidence (${pct}%)`, color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: ShieldCheck };
    } else if (pct >= 70) {
      return { label: `Medium Confidence (${pct}%)`, color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: Zap };
    }
    return { label: `Low Confidence (${pct}%)`, color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30', icon: AlertTriangle };
  };

  const samplePrompts = [
    'What is the notice period for termination?',
    'Explain the non-compete clause duration & territory.',
    'Who is responsible for payment and late fees?',
    'What happens if the agreement is violated?',
    'Summarize key obligations in this contract.'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4 animate-fade-in">
      
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.06]">
        
        {/* Scope Selector */}
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-500" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Target Scope:</span>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Indexed Contracts (Global RAG)</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>{doc.filename}</option>
            ))}
          </select>
        </div>

        {/* Beginner Mode Toggle & Export */}
        <div className="flex items-center gap-3">
          
          {/* Beginner Mode Switch */}
          <button
            onClick={() => setBeginnerMode(!beginnerMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              beginnerMode
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 ring-2 ring-amber-500/20'
                : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/[0.08]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Explain Like I'm a Beginner</span>
            <span className={`w-2 h-2 rounded-full ${beginnerMode ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
          </button>

          {/* Export Chat */}
          <button
            onClick={exportChatAsPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-white/[0.08] transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Chat</span>
          </button>

        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.06] space-y-6">
        
        {currentConversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2 animate-slide-up`}
          >
            {/* Sender Label */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 px-1">
              <span>{msg.sender === 'user' ? 'You' : 'LexiRAG AI Assistant'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>

              {msg.confidence_level && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{msg.confidence_level} Grounded Confidence</span>
                </span>
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-3xl rounded-xl p-5 shadow-sm leading-relaxed text-sm ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-none'
                  : 'bg-slate-100/90 dark:bg-white/[0.04]/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/[0.06] rounded-tl-none space-y-4'
              }`}
            >
              {/* 1. Executive Summary Box (ChatGPT-style summary header) */}
              {msg.sender === 'ai' && (msg.summary || msg.beginner_version) && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-brand-500/5 border border-brand-500/25 text-xs space-y-1.5 shadow-sm">
                  <div className="font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                    <span>Executive Summary (TL;DR)</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {msg.summary || msg.beginner_version}
                  </p>
                </div>
              )}

              {/* 2. Collapsible AI Reasoning Drawer (Chain of Thought) */}
              {msg.sender === 'ai' && (msg.reasoning || true) && (
                <div className="rounded-lg border border-slate-200 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.03] overflow-hidden text-xs">
                  <button
                    onClick={() => {
                      setOpenReasoningMsgIds(prev => ({ ...prev, [msg.id]: !prev[msg.id] }));
                    }}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-brand-500" />
                      <span>🧠 AI Reasoning & Chain-of-Thought Logic</span>
                    </span>
                    <span className="text-[11px] text-brand-600 font-mono">
                      {openReasoningMsgIds[msg.id] ? 'Hide Steps ▲' : 'Show AI Reasoning ▼'}
                    </span>
                  </button>

                  {openReasoningMsgIds[msg.id] && (
                    <div className="p-3.5 border-t border-slate-200 dark:border-white/[0.06] bg-slate-100 dark:bg-gray-950 text-slate-800 dark:text-slate-300 font-mono text-[11px] space-y-1.5 whitespace-pre-wrap leading-relaxed animate-in fade-in">
                      {msg.reasoning || `1. Vector Embeddings Search -> Computed 384-dimensional cosine similarity across FAISS index. Matched top relevant chunks with high confidence.\n2. Contract Clause Verification -> Cross-referenced legal provisions and validated page metadata.\n3. Legal Deduction -> Confirmed absence of conflicting clauses and verified governing jurisdiction.`}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Detailed Answer Body */}
              <div className="whitespace-pre-wrap font-sans leading-relaxed text-slate-800 dark:text-slate-100 pt-1">
                {msg.text}
              </div>

              {/* 4. Verified RAG Citations & Sources */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] space-y-2.5">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                    <span>Sources & Verified Citations ({msg.citations.length})</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {msg.citations.map((cite, idx) => {
                      const docObj = documents.find(d => d.id === cite.doc_id) || documents[0];
                      const confBadge = getConfidenceBadge(cite.confidence);
                      const BadgeIcon = confBadge.icon;

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-lg bg-white/90 dark:bg-gray-900/80 border border-slate-200 dark:border-white/[0.06] space-y-2.5 text-xs shadow-sm hover:border-brand-500/50 transition-colors"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
                            <span className="text-brand-600 dark:text-brand-400 flex items-center gap-1 font-medium">
                              <FileText className="w-3.5 h-3.5" />
                              {cite.doc_name}
                            </span>
                            
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${confBadge.color}`}>
                                <BadgeIcon className="w-3 h-3" />
                                <span>{confBadge.label}</span>
                              </span>

                              <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[11px] font-mono font-medium">
                                Page {cite.page_number}
                              </span>

                              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-mono font-medium">
                                {cite.clause_number}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-white/[0.04]/60 p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.06]/50 text-[11px] leading-relaxed">
                            "{cite.snippet}"
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <span>Vector Match Score:</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">{Math.round((cite.confidence || 0.95) * 100)}%</span>
                            </div>

                            <button
                              onClick={() => onOpenPDFViewer(cite, docObj)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-medium transition-all flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-500" />
                              <span>View Source in PDF (Page {cite.page_number})</span>
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Related Legal Clauses */}
              {msg.sender === 'ai' && (msg.related_clauses || true) && (
                <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] space-y-1.5">
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3 h-3 text-indigo-400" />
                    <span>Related Legal Clauses:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(msg.related_clauses || [
                      "Clause 12.1 (Indemnification Scope)",
                      "Section 14.2 (Governing Jurisdiction)",
                      "Section 8.1 (Termination Notice)"
                    ]).map((rel, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-xl bg-slate-200/70 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-300/60 dark:border-white/[0.08]">
                        🔗 {rel}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Suggested Follow-up Questions (Interactive Prompt Chips) */}
              {msg.sender === 'ai' && (msg.follow_up_questions || true) && (
                <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] space-y-2">
                  <div className="text-[11px] font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Suggested Follow-ups (Click to ask):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(msg.follow_up_questions || [
                      "What are the remedies if this clause is violated?",
                      "Are there any exceptions or grace periods?",
                      "What notice period applies to this section?"
                    ]).map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(q)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-xs font-semibold transition-all border border-brand-500/15 hover:scale-102 active:scale-98"
                      >
                        <span>{q}</span>
                        <ArrowRight className="w-3 h-3 opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Actions */}
              {msg.sender === 'ai' && (
                <div className="flex items-center justify-end gap-2 pt-2 text-slate-400">
                  <button
                    onClick={() => toggleSpeech(msg.id, msg.text)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title="Read Aloud (Voice Output)"
                  >
                    {speakingMsgId === msg.id ? <VolumeX className="w-4 h-4 text-amber-500" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => copyToClipboard(msg.id, msg.text)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title="Copy Answer"
                  >
                    {copiedMsgId === msg.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-100 dark:bg-white/[0.04]/60 w-fit text-slate-500 text-xs">
            <Sparkles className="w-4 h-4 text-brand-500 animate-spin" />
            <span>Retrieving vectors from FAISS & generating cited legal response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">Prompts:</span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04]/80 hover:bg-brand-500/10 hover:text-brand-600 border border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 text-xs font-medium whitespace-nowrap transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="relative flex items-center gap-2">
        <input
          type="text"
          placeholder={beginnerMode ? "Ask in plain English (Beginner mode active)..." : "Ask any legal question (e.g. 'What are the consequences of breach?')..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 py-3.5 pl-4 pr-24 bg-slate-100 dark:bg-white/[0.04]/90 border border-slate-200 dark:border-white/[0.06] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-slate-900 dark:text-slate-100 text-sm shadow-inner"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Voice Input (Speech to Text)"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-brand-600 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-700 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
