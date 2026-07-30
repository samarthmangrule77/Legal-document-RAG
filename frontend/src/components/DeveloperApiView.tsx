import React, { useState } from 'react';
import { 
  Code2, 
  Key, 
  Copy, 
  Check, 
  Terminal, 
  Send, 
  Sparkles, 
  UploadCloud, 
  ShieldAlert, 
  FileText,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const DeveloperApiView: React.FC = () => {
  const [apiKey, setApiKey] = useState('lexi_pk_live_9920188392104819203810238120');
  const [activeTab, setActiveTab] = useState<'upload' | 'query' | 'risk' | 'summary'>('query');
  const [activeLang, setActiveLang] = useState<'curl' | 'python'>('curl');
  const [copied, setCopied] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const generateNewKey = () => {
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setApiKey(`lexi_pk_live_${randomHex}`);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getCurlSnippet = () => {
    switch (activeTab) {
      case 'upload':
        return `curl -X POST "http://127.0.0.1:8000/api/v1/public/upload" \\
  -H "X-API-Key: ${apiKey}" \\
  -F "file=@/path/to/contract.pdf"`;
      case 'query':
        return `curl -X POST "http://127.0.0.1:8000/api/v1/public/query" \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "What is the notice period for contract termination?", "doc_ids": ["doc-001"]}'`;
      case 'risk':
        return `curl -X POST "http://127.0.0.1:8000/api/v1/public/risk" \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"doc_id": "doc-001"}'`;
      case 'summary':
        return `curl -X POST "http://127.0.0.1:8000/api/v1/public/summary" \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"doc_id": "doc-001"}'`;
    }
  };

  const getPythonSnippet = () => {
    switch (activeTab) {
      case 'upload':
        return `import requests

url = "http://127.0.0.1:8000/api/v1/public/upload"
headers = {"X-API-Key": "${apiKey}"}
files = {"file": open("contract.pdf", "rb")}

response = requests.post(url, headers=headers, files=files)
print(response.json())`;
      case 'query':
        return `import requests

url = "http://127.0.0.1:8000/api/v1/public/query"
headers = {
    "X-API-Key": "${apiKey}",
    "Content-Type": "application/json"
}
payload = {
    "query": "What is the notice period for contract termination?",
    "doc_ids": ["doc-001"]
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`;
      case 'risk':
        return `import requests

url = "http://127.0.0.1:8000/api/v1/public/risk"
headers = {"X-API-Key": "${apiKey}", "Content-Type": "application/json"}
payload = {"doc_id": "doc-001"}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`;
      case 'summary':
        return `import requests

url = "http://127.0.0.1:8000/api/v1/public/summary"
headers = {"X-API-Key": "${apiKey}", "Content-Type": "application/json"}
payload = {"doc_id": "doc-001"}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`;
    }
  };

  const codeSnippet = activeLang === 'curl' ? getCurlSnippet() : getPythonSnippet();

  const handleTestApi = async () => {
    setIsTesting(true);
    setApiResponse(null);

    const endpoint = `/api/v1/public/${activeTab}`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          activeTab === 'query'
            ? { query: 'What is the notice period for contract termination?', doc_ids: ['doc-001'] }
            : { doc_id: 'doc-001' }
        )
      });
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setApiResponse(JSON.stringify({ error: 'API Test Error', details: String(err) }, null, 2));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-navy-950 to-indigo-950 p-8 border border-white/[0.06] text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30 mb-3">
              <Code2 className="w-3.5 h-3.5" />
              Public REST API & Developer SDKs
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Public REST API & Integration Hub</h1>
            <p className="text-slate-400 mt-1 max-w-xl text-sm leading-relaxed">
              Integrate LexiRAG AI directly into external software, CRMs, and ERPs using our REST API endpoints (`/upload`, `/query`, `/risk`, `/summary`).
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur border border-white/[0.08]/80 p-3 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-mono font-medium text-emerald-400">API Endpoint Online (v1.0)</span>
          </div>
        </div>
      </div>

      {/* API Key Management Box */}
      <div className="p-8 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-semibold text-base">
            <Key className="w-5 h-5 text-amber-500" />
            <span>Developer Public API Key</span>
          </div>

          <button
            onClick={generateNewKey}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all border border-slate-200 dark:border-white/[0.08] flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Roll New Key</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            readOnly
            value={apiKey}
            className="w-full px-4 py-3 text-xs font-mono bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg text-brand-600 dark:text-brand-400 font-semibold focus:outline-none"
          />

          <button
            onClick={() => copyCode(apiKey)}
            className="px-4 py-3 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-medium border border-brand-500/15 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Key!' : 'Copy API Key'}</span>
          </button>
        </div>
      </div>

      {/* Endpoint Selector & Code Snippet Display */}
      <div className="p-8 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] shadow-sm space-y-6">
        
        {/* Endpoint Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/[0.06] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'query', label: 'POST /query', icon: Send },
              { id: 'risk', label: 'POST /risk', icon: ShieldAlert },
              { id: 'summary', label: 'POST /summary', icon: FileText },
              { id: 'upload', label: 'POST /upload', icon: UploadCloud }
            ].map((ep) => {
              const Icon = ep.icon;
              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    setActiveTab(ep.id as any);
                    setApiResponse(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    activeTab === ep.id
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{ep.label}</span>
                </button>
              );
            })}
          </div>

          {/* Language Switcher (cURL vs Python) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.05] p-1 rounded-xl border border-slate-200 dark:border-white/[0.08]">
            <button
              onClick={() => setActiveLang('curl')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                activeLang === 'curl' ? 'bg-white dark:bg-white/[0.03] text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setActiveLang('python')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                activeLang === 'python' ? 'bg-white dark:bg-white/[0.03] text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              Python
            </button>
          </div>
        </div>

        {/* Code Snippet Viewer */}
        <div className="relative rounded-lg bg-gray-950 p-5 border border-white/[0.06] text-slate-200 font-mono text-xs overflow-x-auto shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-slate-400 text-[11px]">
            <span>{activeLang === 'curl' ? 'cURL Command' : 'Python 3 SDK Snippet'}</span>
            <button
              onClick={() => copyCode(codeSnippet)}
              className="hover:text-white transition-colors flex items-center gap-1 font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="pt-4 text-emerald-400 leading-relaxed font-mono whitespace-pre-wrap">
            {codeSnippet}
          </pre>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleTestApi}
              disabled={isTesting}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isTesting ? 'Sending Request...' : `Test ${activeTab.toUpperCase()} Endpoint Live ▶`}</span>
            </button>
          </div>
        </div>

        {/* Interactive Response Payload Viewer */}
        {apiResponse && (
          <div className="p-5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 font-mono text-xs space-y-2 animate-in fade-in">
            <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider flex items-center justify-between">
              <span>HTTP 200 OK — Live REST Response JSON:</span>
              <span>application/json</span>
            </div>
            <pre className="p-3 bg-gray-950 rounded-xl border border-white/[0.06] text-slate-200 text-[11px] overflow-x-auto leading-relaxed">
              {apiResponse}
            </pre>
          </div>
        )}

      </div>

    </div>
  );
};
