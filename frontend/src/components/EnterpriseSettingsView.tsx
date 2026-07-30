import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Cpu, 
  Layers, 
  Database, 
  Globe, 
  Key, 
  Check, 
  Save, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  EyeOff
} from 'lucide-react';

export const EnterpriseSettingsView: React.FC = () => {
  const [workspaceName, setWorkspaceName] = useState('Nexus Legal Technologies Inc.');
  const [brandLogoUrl, setBrandLogoUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60');
  const [aiLlmModel, setAiLlmModel] = useState('GPT-4o (OpenAI)');
  const [embeddingModel, setEmbeddingModel] = useState('all-MiniLM-L6-v2 (384-dim)');
  const [storageProvider, setStorageProvider] = useState('Local Vector Vault (Encrypted)');
  const [primaryLanguage, setPrimaryLanguage] = useState('English 🇺🇸');
  const [openaiKey, setOpenaiKey] = useState('sk-proj-9920188329104819203810238120');
  const [anthropicKey, setAnthropicKey] = useState('sk-ant-882019481923019283012938');
  
  const [showKeys, setShowKeys] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 dark:bg-white/[0.03] p-8 border border-white/[0.06] text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30 mb-3">
              <Settings className="w-3.5 h-3.5" />
              Platform Configuration
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Settings & Infrastructure</h1>
            <p className="text-slate-400 mt-1 max-w-xl text-sm leading-relaxed">
              Configure your workspace branding, LLM model providers, vector embedding dimensions, storage vaults, and API credentials.
            </p>
          </div>

          <button
            onClick={handleSave}
            className={`px-6 py-3.5 rounded-lg font-semibold text-xs flex items-center gap-2 shadow-md transition-all ${
              savedSuccess
                ? 'bg-emerald-500 text-white shadow-emerald-500/20 scale-102'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 active:scale-98'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Settings Saved & Deployed ✔</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Section 1: Workspace & Branding */}
        <div className="p-8 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-semibold text-base">
            <Building2 className="w-5 h-5 text-brand-500" />
            <span>Workspace Branding</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Organization Name:</label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Brand Logo Image URL:</label>
              <input
                type="text"
                value={brandLogoUrl}
                onChange={(e) => setBrandLogoUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Section 2: AI Model Selection */}
        <div className="p-8 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-semibold text-base">
            <Cpu className="w-5 h-5 text-indigo-500" />
            <span>AI Model Engine (LLM)</span>
          </div>

          <p className="text-xs text-slate-500">Select the primary LLM model driving contract RAG synthesis.</p>

          <select
            value={aiLlmModel}
            onChange={(e) => setAiLlmModel(e.target.value)}
            className="w-full p-3 text-xs font-medium bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-800 dark:text-slate-200"
          >
            <option value="GPT-4o (OpenAI)">GPT-4o (OpenAI High Reasoning - Recommended)</option>
            <option value="Claude 3.5 Sonnet (Anthropic)">Claude 3.5 Sonnet (Anthropic Legal Precision)</option>
            <option value="Gemini 1.5 Pro (Google DeepMind)">Gemini 1.5 Pro (Google DeepMind 1M Context)</option>
            <option value="Llama-3-70B (Local Ollama)">Llama-3-70B (Local Air-Gapped Ollama)</option>
          </select>
        </div>

        {/* Section 3: Embedding Model Configuration */}
        <div className="p-8 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-semibold text-base">
            <Layers className="w-5 h-5 text-emerald-500" />
            <span>Vector Embedding Model</span>
          </div>

          <p className="text-xs text-slate-500">Vector representation model for FAISS cosine similarity searching.</p>

          <select
            value={embeddingModel}
            onChange={(e) => setEmbeddingModel(e.target.value)}
            className="w-full p-3 text-xs font-medium bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-800 dark:text-slate-200"
          >
            <option value="all-MiniLM-L6-v2 (384-dim)">all-MiniLM-L6-v2 (SentenceTransformers 384-dim)</option>
            <option value="text-embedding-3-small (1536-dim)">text-embedding-3-small (OpenAI 1536-dim)</option>
            <option value="bge-large-en (1024-dim)">bge-large-en (BAAI 1024-dim)</option>
          </select>
        </div>

        {/* Section 4: Data Vault & Storage Provider */}
        <div className="p-8 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-semibold text-base">
            <Database className="w-5 h-5 text-purple-500" />
            <span>Storage & Vector Vault Location</span>
          </div>

          <p className="text-xs text-slate-500">Physical storage target for uploaded PDFs and vector indexes.</p>

          <select
            value={storageProvider}
            onChange={(e) => setStorageProvider(e.target.value)}
            className="w-full p-3 text-xs font-medium bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-800 dark:text-slate-200"
          >
            <option value="Local Vector Vault (Encrypted)">Local Vector Vault (256-Bit Encrypted)</option>
            <option value="AWS S3 Bucket (us-east-1)">AWS S3 Encrypted Bucket (us-east-1)</option>
            <option value="Google Cloud Storage (GCS)">Google Cloud Storage (GCS Vault)</option>
            <option value="Azure Blob Storage">Azure Blob Confidential Storage</option>
          </select>
        </div>

        {/* Section 5: API Keys & Credentials (Full Width) */}
        <div className="md:col-span-2 p-8 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-semibold text-base">
              <Key className="w-5 h-5 text-amber-500" />
              <span>Model Provider API Keys</span>
            </div>

            <button
              onClick={() => setShowKeys(!showKeys)}
              className="text-xs font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1.5"
            >
              {showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showKeys ? 'Mask Keys' : 'Reveal Keys'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">OpenAI API Key:</label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Anthropic API Key:</label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
