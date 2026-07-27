import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Layers, 
  Eye, 
  Trash2, 
  Sparkles, 
  Scan,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { LegalDocument } from '../types';
import { NavTab } from './Sidebar';

interface DocumentManagerProps {
  documents: LegalDocument[];
  onUpload: (file: File) => Promise<LegalDocument>;
  onSelectDoc: (doc: LegalDocument) => void;
  setActiveTab: (tab: NavTab) => void;
  planId?: 'free' | 'pro' | 'enterprise';
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  onUpload,
  onSelectDoc,
  setActiveTab,
  planId = 'free'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<LegalDocument | null>(null);
  const [quotaErrorModal, setQuotaErrorModal] = useState<boolean>(false);

  const isQuotaReached = planId === 'free' && documents.length >= 5;

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isQuotaReached) {
      setQuotaErrorModal(true);
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isQuotaReached) {
      setQuotaErrorModal(true);
      return;
    }
    if (e.target.files && e.target.files[0]) {
      await processUpload(e.target.files[0]);
    }
  };

  const processUpload = async (file: File) => {
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions.includes(ext)) {
      alert('Unsupported file format! Please upload a PDF, DOCX, or TXT legal document.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setCurrentStep('1/4 Extracting document text & metadata (PyMuPDF)...');

    setTimeout(() => {
      setUploadProgress(45);
      setCurrentStep('2/4 Performing automatic OCR check & clause segmentation...');
    }, 800);

    setTimeout(() => {
      setUploadProgress(75);
      setCurrentStep('3/4 Generating Sentence Transformer embeddings (384-dim)...');
    }, 1600);

    setTimeout(async () => {
      try {
        setUploadProgress(95);
        setCurrentStep('4/4 Indexing vectors into FAISS Vector Database...');
        const created = await onUpload(file);
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setCurrentStep('');
          onSelectDoc(created);
        }, 500);
      } catch (err: any) {
        setIsUploading(false);
        setUploadProgress(0);
        setCurrentStep('');
        setQuotaErrorModal(true);
      }
    }, 2400);
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Free Plan Quota Reached Banner */}
      {isQuotaReached && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-brand-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                Free Plan Quota Limit Reached (5/5 PDFs Used)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Your workspace has hit the maximum 5 PDF limit on the Free tier. Upgrade to Pro for unlimited document uploads and priority OCR indexing.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('billing')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all flex-shrink-0"
          >
            <span>Upgrade to Pro</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Document Repository & RAG Indexing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Upload legal PDFs, DOCX, or TXT agreements. Text is automatically chunked and stored in FAISS.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-semibold">
          <Layers className="w-4 h-4" />
          <span>{documents.length} Active Documents Indexed</span>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        className={`relative overflow-hidden p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all text-center ${
          isDragging
            ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700/80 bg-slate-50/50 dark:bg-navy-900/40 hover:border-brand-400'
        }`}
      >
        {isUploading ? (
          <div className="space-y-6 max-w-md mx-auto py-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                Processing RAG Pipeline...
              </div>
              <div className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                {currentStep}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">{uploadProgress}% Completed</div>
          </div>
        ) : (
          <div className="space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-brand-500/30 transform hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Drag & Drop Legal Document Here
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports <span className="font-semibold text-slate-700 dark:text-slate-300">PDF, DOCX, TXT</span> up to 50MB. Automatic OCR executed for scanned documents.
              </p>
            </div>

            <div className="pt-2">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md cursor-pointer transition-all">
                <FileText className="w-4 h-4" />
                <span>Browse Files</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Document List */}
      <div className="glass-card p-6 rounded-3xl space-y-6 border border-slate-200/80 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Indexed Legal Repository</span>
          <span className="text-xs font-normal text-slate-400">Click any document to inspect RAG clauses</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-900/50 hover:bg-slate-100/80 dark:hover:bg-navy-900 border border-slate-200/60 dark:border-slate-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/20 to-indigo-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-extrabold text-sm uppercase flex-shrink-0">
                  {doc.file_type}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {doc.filename}
                    </h3>
                    {doc.is_scanned_ocr && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        <Scan className="w-3 h-3" />
                        OCR Processed
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>Uploaded {doc.upload_date}</span>
                    <span>•</span>
                    <span>Size: {doc.file_size}</span>
                    <span>•</span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">{doc.chunk_count} RAG Chunks</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                
                {/* Risk Score */}
                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                  doc.risk_score >= 60
                    ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                    : doc.risk_score >= 35
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                }`}>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Risk Score: {doc.risk_score}/100</span>
                </div>

                <button
                  onClick={() => setSelectedPreviewDoc(doc)}
                  className="p-2.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                  title="View Contract Clauses"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    onSelectDoc(doc);
                    setActiveTab('chat');
                  }}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-brand-500/20"
                >
                  <span>Ask RAG</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Clause Inspection Modal */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl max-h-[85vh] glass-card bg-white dark:bg-navy-950 rounded-3xl p-6 sm:p-8 space-y-6 overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-500" />
                  <span>{selectedPreviewDoc.filename}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Extracted metadata & clause summary
                </p>
              </div>

              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            {/* Executive Summary */}
            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 space-y-2">
              <div className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Executive Summary
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedPreviewDoc.summary?.executive_summary || 'No summary available.'}
              </p>
            </div>

            {/* Clauses / Risks preview */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Detected Contract Clauses & Risks</h4>
              {selectedPreviewDoc.risks?.map((risk) => (
                <div key={risk.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{risk.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      risk.severity === 'high' ? 'bg-rose-500/15 text-rose-600' : 'bg-amber-500/15 text-amber-600'
                    }`}>
                      {risk.severity.toUpperCase()} SEVERITY
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{risk.description}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Quota Exceeded Modal */}
      {quotaErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Free Plan Limit Reached</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Free Plan is capped at 5 PDFs. You currently have <span className="font-bold text-slate-800 dark:text-slate-200">{documents.length} PDFs</span> indexed. Upgrade to Pro for unlimited document uploads.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setQuotaErrorModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setQuotaErrorModal(false);
                  setActiveTab('billing');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-brand-500/25"
              >
                <span>Upgrade to Pro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
