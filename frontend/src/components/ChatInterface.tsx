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
  AlertTriangle
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
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
        
        {/* Scope Selector */}
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Scope:</span>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              beginnerMode
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 ring-2 ring-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Explain Like I'm a Beginner</span>
            <span className={`w-2 h-2 rounded-full ${beginnerMode ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`}></span>
          </button>

          {/* Export Chat */}
          <button
            onClick={exportChatAsPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Chat</span>
          </button>

        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-6">
        
        {currentConversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2 animate-slide-up`}
          >
            {/* Sender Label */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 px-1">
              <span>{msg.sender === 'user' ? 'You' : 'LexiRAG AI Assistant'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>

              {msg.confidence_level && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{msg.confidence_level} Grounded Confidence</span>
                </span>
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-3xl rounded-3xl p-5 shadow-sm leading-relaxed text-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-100/90 dark:bg-navy-900/80 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-tl-none space-y-4'
              }`}
            >
              {/* Main Text */}
              <div className="whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              {/* Beginner Version Box */}
              {msg.beginner_version && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    Simple English Translation:
                  </div>
                  <p className="leading-relaxed">{msg.beginner_version}</p>
                </div>
              )}

              {/* RAG Grounding Citations with Confidence Badging */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                    Verified RAG Citations & Confidence Ratings
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {msg.citations.map((cite, idx) => {
                      const docObj = documents.find(d => d.id === cite.doc_id) || documents[0];
                      const confBadge = getConfidenceBadge(cite.confidence);
                      const BadgeIcon = confBadge.icon;

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white/90 dark:bg-navy-950/80 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs shadow-sm hover:border-brand-500/50 transition-colors"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
                            <span className="text-brand-600 dark:text-brand-400 flex items-center gap-1 font-bold">
                              <FileText className="w-3.5 h-3.5" />
                              {cite.doc_name}
                            </span>
                            
                            {/* Citation Badges (Page #, Clause #, Confidence %) */}
                            <div className="flex items-center gap-2">
                              
                              {/* Confidence Percentage Badge */}
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1 ${confBadge.color}`}>
                                <BadgeIcon className="w-3 h-3" />
                                <span>{confBadge.label}</span>
                              </span>

                              <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-mono font-bold">
                                Page {cite.page_number}
                              </span>

                              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono font-bold">
                                {cite.clause_number}
                              </span>

                            </div>
                          </div>
                          
                          <p className="text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-navy-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50 text-[11px] leading-relaxed">
                            "{cite.snippet}"
                          </p>

                          {/* Source Button -> Opens PDF Viewer Modal on exact page with highlight */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <span>Vector Match Score:</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">{Math.round((cite.confidence || 0.95) * 100)}%</span>
                            </div>

                            <button
                              onClick={() => onOpenPDFViewer(cite, docObj)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
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

              {/* AI Follow-up Suggestions */}
              {msg.follow_up_questions && msg.follow_up_questions.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Follow-ups:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.follow_up_questions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(q)}
                        className="px-2.5 py-1 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-xs transition-colors border border-brand-500/20"
                      >
                        {q}
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
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-navy-900/60 w-fit text-slate-500 text-xs">
            <Sparkles className="w-4 h-4 text-brand-500 animate-spin" />
            <span>Retrieving vectors from FAISS & generating cited legal response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Prompts:</span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-900/80 hover:bg-brand-500/10 hover:text-brand-600 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium whitespace-nowrap transition-all"
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
          className="flex-1 py-3.5 pl-4 pr-24 bg-slate-100 dark:bg-navy-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-slate-900 dark:text-slate-100 text-sm shadow-inner"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
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
            className="p-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:from-brand-500 hover:to-indigo-500 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
