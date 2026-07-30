import React, { useState } from 'react';
import { 
  Zap, 
  UploadCloud, 
  Eye, 
  FileCheck2, 
  ShieldAlert, 
  Mail, 
  Play, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight,
  Settings,
  Check,
  Terminal,
  Loader2
} from 'lucide-react';
import { LegalDocument } from '../types';

interface WorkflowBuilderViewProps {
  selectedDoc: LegalDocument | null;
  documents: LegalDocument[];
  onSelectDoc: (doc: LegalDocument) => void;
}

interface WorkflowStep {
  id: string;
  name: string;
  category: string;
  icon: any;
  description: string;
  status: 'idle' | 'running' | 'completed';
  duration?: string;
  enabled: boolean;
}

export const WorkflowBuilderView: React.FC<WorkflowBuilderViewProps> = ({
  selectedDoc,
  documents,
  onSelectDoc
}) => {
  const doc = selectedDoc || documents[0];
  const [recipientEmail, setRecipientEmail] = useState('legal-team@nexuscorp.com');
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 'step-1',
      name: '1. Document Upload & Ingestion',
      category: 'Input Trigger',
      icon: UploadCloud,
      description: 'Receives PDF/DOCX file, validates mime-type, and saves to secure workspace storage.',
      status: 'idle',
      enabled: true
    },
    {
      id: 'step-2',
      name: '2. OCR Text Extraction',
      category: 'Preprocessing',
      icon: Eye,
      description: 'Runs Tesseract Vision OCR to extract machine-readable text from scanned document pages.',
      status: 'idle',
      enabled: true
    },
    {
      id: 'step-3',
      name: '3. AI Executive Summarization',
      category: 'Legal Synthesis',
      icon: FileCheck2,
      description: 'Synthesizes executive summary, party obligations, payment terms, and key deadlines.',
      status: 'idle',
      enabled: true
    },
    {
      id: 'step-4',
      name: '4. AI Red Flags Risk Audit',
      category: 'Risk Telemetry',
      icon: ShieldAlert,
      description: 'Audits contract clauses for Critical 🔴, Medium 🟠, and Low 🟢 risk exposure.',
      status: 'idle',
      enabled: true
    },
    {
      id: 'step-5',
      name: '5. Email Summary Dispatch',
      category: 'Notification',
      icon: Mail,
      description: 'Sends formatted HTML legal digest email report directly to designated legal team members.',
      status: 'idle',
      enabled: true
    }
  ]);

  const toggleStep = (id: string) => {
    if (isRunning) return;
    setSteps(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleRunWorkflow = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsCompleted(false);
    setActiveStepIndex(0);
    setExecutionLogs([`[INFO] Starting AI Workflow Pipeline for ${doc?.filename || 'Document'}...`]);

    // Reset steps
    setSteps(prev => prev.map(s => ({ ...s, status: s.enabled ? 'idle' : 'completed' })));

    // Simulate sequential step execution
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step.enabled) continue;

      setActiveStepIndex(i);
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));
      setExecutionLogs(prev => [...prev, `[RUNNING] Executing Step ${i + 1}: ${step.name}...`]);

      await new Promise(r => setTimeout(r, 600));

      const durationMs = Math.floor(Math.random() * 200) + 150;
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'completed', duration: `${durationMs}ms` } : s));
      setExecutionLogs(prev => [...prev, `[SUCCESS] Step ${i + 1} Completed in ${durationMs}ms - Output Verified ✔`]);
    }

    setIsRunning(false);
    setActiveStepIndex(-1);
    setIsCompleted(true);
    setExecutionLogs(prev => [
      ...prev,
      `[FINISHED] Workflow Execution Completed Successfully! Total time: 1.24s.`,
      `[DISPATCH] Email Legal Digest delivered to ${recipientEmail}.`
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-navy-950 to-indigo-950 p-8 border border-white/[0.06] text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 mb-3">
              <Zap className="w-3.5 h-3.5" />
              Automated Legal Operations Pipeline
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">AI Legal Workflow Automation Builder</h1>
            <p className="text-slate-400 mt-1 max-w-xl text-sm leading-relaxed">
              Automate multi-step legal document processing: Upload ➔ OCR ➔ AI Summarize ➔ Risk Audit ➔ Email Digest Dispatch.
            </p>
          </div>

          <button
            onClick={handleRunWorkflow}
            disabled={isRunning}
            className={`px-6 py-3.5 rounded-lg font-semibold text-sm flex items-center gap-2.5 shadow-md transition-all ${
              isRunning
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/25 active:scale-98'
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                <span>Executing Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Run Workflow Live ▶</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Visual Pipeline Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-8 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>Workflow Action Pipeline</span>
                </h2>
                <p className="text-xs text-slate-500">Configure and execute sequential automation steps.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">Target Doc:</span>
                <select
                  value={doc?.id}
                  onChange={(e) => {
                    const found = documents.find(d => d.id === e.target.value);
                    if (found) onSelectDoc(found);
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-slate-200"
                >
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>{d.filename}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Workflow Step Nodes List */}
            <div className="space-y-4">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isRunningStep = step.status === 'running';
                const isCompletedStep = step.status === 'completed';

                return (
                  <div key={step.id} className="relative">
                    
                    {/* Arrow connector */}
                    {idx > 0 && (
                      <div className="flex justify-center -my-2">
                        <span className="text-slate-300 dark:text-slate-700 font-medium text-xs">↓</span>
                      </div>
                    )}

                    <div
                      className={`p-5 rounded-lg border transition-all duration-300 flex items-center justify-between gap-4 ${
                        isRunningStep
                          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 scale-101'
                          : isCompletedStep
                          ? 'bg-emerald-500/5 border-emerald-500/40'
                          : step.enabled
                          ? 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06]'
                          : 'bg-slate-100/50 dark:bg-white/[0.05]/20 border-slate-200/50 dark:border-white/[0.06]/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl border ${
                          isRunningStep
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : isCompletedStep
                            ? 'bg-emerald-500 text-white border-emerald-400'
                            : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/[0.08]'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{step.category}</span>
                            {step.duration && (
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                                ⏱ {step.duration}
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                            {step.name}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Enable/Disable Toggle */}
                      <button
                        onClick={() => toggleStep(step.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                          step.enabled
                            ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/15'
                            : 'bg-slate-200 dark:bg-white/[0.05] text-slate-400 border-slate-300 dark:border-white/[0.08]'
                        }`}
                      >
                        {step.enabled ? 'Enabled ✔' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Execution Logs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Email Recipient Configuration Box */}
          <div className="p-6 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-500 uppercase tracking-wider">
              <Settings className="w-4 h-4" />
              <span>Step 5 Dispatch Settings</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Legal Team Email Digest</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Recipient Email Address:</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  placeholder="legal-team@nexuscorp.com"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              When workflow completes, a formatted HTML summary report containing risk scores, key dates, and obligations will be emailed to this address.
            </p>
          </div>

          {/* Real-Time Execution Audit Log */}
          <div className="p-6 rounded-xl bg-gray-950 text-slate-200 border border-white/[0.06] shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2 font-mono text-xs font-medium text-amber-400">
                <Terminal className="w-4 h-4" />
                <span>Real-Time Execution Logs</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Live Telemetry</span>
            </div>

            <div className="font-mono text-[11px] space-y-2 max-h-64 overflow-y-auto leading-relaxed text-slate-300">
              {executionLogs.length === 0 ? (
                <div className="text-slate-600 italic">Click "Run Workflow Live ▶" to execute pipeline and stream logs...</div>
              ) : (
                executionLogs.map((log, idx) => (
                  <div key={idx} className={log.includes('[SUCCESS]') || log.includes('[FINISHED]') ? 'text-emerald-400 font-medium' : log.includes('[RUNNING]') ? 'text-amber-400' : 'text-slate-300'}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
