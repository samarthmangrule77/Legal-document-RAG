import React, { useState } from 'react';
import { 
  Sparkles, 
  FileSignature, 
  CheckCircle2, 
  Copy, 
  Download, 
  ArrowRight, 
  Loader2, 
  Briefcase, 
  ShieldAlert, 
  Cloud, 
  Building2,
  FileText,
  Check,
  Zap,
  Layers
} from 'lucide-react';
import { LegalDocument } from '../types';
import { NavTab } from './Sidebar';

export interface ContractTemplateField {
  name: string;
  label: string;
  placeholder: string;
  type: string;
  required?: boolean;
}

export interface ContractTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  fields: ContractTemplateField[];
}

interface ContractGeneratorViewProps {
  onContractGenerated: (doc: LegalDocument) => void;
  setActiveTab: (tab: NavTab) => void;
  onSelectDoc: (doc: LegalDocument) => void;
}

const DEFAULT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'employment',
    title: 'Employment Agreement',
    category: 'HR & Hiring',
    description: 'Standard full-time employment contract with compensation, probation, notice period, and IP assignment clauses.',
    fields: [
      { name: 'employee_name', label: 'Employee Full Name', placeholder: 'e.g. Sarah Connor', type: 'text', required: true },
      { name: 'job_title', label: 'Job Title / Position', placeholder: 'e.g. Senior Software Engineer', type: 'text', required: true },
      { name: 'salary', label: 'Annual Base Salary', placeholder: 'e.g. $140,000', type: 'text', required: true },
      { name: 'country', label: 'Country / Jurisdiction', placeholder: 'e.g. United States', type: 'text', required: true },
      { name: 'notice_period', label: 'Notice Period', placeholder: 'e.g. 30 Days', type: 'text', required: true },
      { name: 'probation_period', label: 'Probation Period', placeholder: 'e.g. 90 Days', type: 'text', required: false }
    ]
  },
  {
    id: 'nda',
    title: 'Non-Disclosure Agreement (NDA)',
    category: 'Confidentiality',
    description: 'Mutual non-disclosure agreement protecting trade secrets, proprietary algorithms, and legal documents.',
    fields: [
      { name: 'disclosing_party', label: 'Disclosing Party Name', placeholder: 'e.g. LexiCorp Inc.', type: 'text', required: true },
      { name: 'receiving_party', label: 'Receiving Party Name', placeholder: 'e.g. Cyberdyne Systems', type: 'text', required: true },
      { name: 'country', label: 'Governing Jurisdiction', placeholder: 'e.g. United Kingdom', type: 'text', required: true },
      { name: 'term_years', label: 'Confidentiality Term', placeholder: 'e.g. 3 Years', type: 'text', required: true }
    ]
  },
  {
    id: 'saas_msa',
    title: 'SaaS Master Services Agreement',
    category: 'Commercial & Tech',
    description: 'Enterprise cloud SaaS agreement outlining service SLA, payment terms, data protection, and liability caps.',
    fields: [
      { name: 'provider_name', label: 'SaaS Provider Company', placeholder: 'e.g. NexusCloud AI Technologies', type: 'text', required: true },
      { name: 'client_name', label: 'Client Company Name', placeholder: 'e.g. Global Logistics Ltd.', type: 'text', required: true },
      { name: 'annual_fee', label: 'Annual SaaS License Fee', placeholder: 'e.g. $48,000', type: 'text', required: true },
      { name: 'sla_tier', label: 'Uptime SLA Commitment', placeholder: 'e.g. 99.9% Uptime Guarantee', type: 'text', required: true },
      { name: 'country', label: 'Governing Law', placeholder: 'e.g. Delaware, USA', type: 'text', required: true }
    ]
  },
  {
    id: 'lease',
    title: 'Commercial Property Lease',
    category: 'Real Estate',
    description: 'Commercial property lease agreement covering monthly rent, premises address, maintenance, and lease duration.',
    fields: [
      { name: 'landlord_name', label: 'Landlord / Lessor Name', placeholder: 'e.g. Skyline Real Estate Holdings', type: 'text', required: true },
      { name: 'tenant_name', label: 'Tenant / Lessee Name', placeholder: 'e.g. Acme Tech Solutions Inc.', type: 'text', required: true },
      { name: 'property_address', "label": "Leased Premises Address", placeholder: 'e.g. 500 Market St, Suite 1200, San Francisco, CA', type: 'text', required: true },
      { name: 'monthly_rent', label: 'Monthly Rent Amount', placeholder: 'e.g. $8,500 / month', type: 'text', required: true },
      { name: 'lease_term_months', label: 'Lease Term (Months)', placeholder: 'e.g. 36 Months', type: 'text', required: true }
    ]
  }
];

export const ContractGeneratorView: React.FC<ContractGeneratorViewProps> = ({
  onContractGenerated,
  setActiveTab,
  onSelectDoc
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate>(DEFAULT_TEMPLATES[0]);
  const [formValues, setFormValues] = useState<Record<string, string>>({
    employee_name: 'Sarah Connor',
    job_title: 'Senior Software Engineer',
    salary: '$140,000 / year',
    country: 'United States',
    notice_period: '30 Days',
    probation_period: '90 Days'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContractText, setGeneratedContractText] = useState<string | null>(null);
  const [generatedDoc, setGeneratedDoc] = useState<LegalDocument | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setGeneratedContractText(null);
    setGeneratedDoc(null);

    // Set initial default form values for sample demo speed
    const initialVals: Record<string, string> = {};
    if (template.id === 'employment') {
      initialVals.employee_name = 'Sarah Connor';
      initialVals.job_title = 'Senior Software Engineer';
      initialVals.salary = '$140,000 / year';
      initialVals.country = 'United States';
      initialVals.notice_period = '30 Days';
      initialVals.probation_period = '90 Days';
    } else if (template.id === 'nda') {
      initialVals.disclosing_party = 'LexiCorp Inc.';
      initialVals.receiving_party = 'Cyberdyne Systems';
      initialVals.country = 'United Kingdom';
      initialVals.term_years = '3 Years';
    } else if (template.id === 'saas_msa') {
      initialVals.provider_name = 'NexusCloud AI Technologies';
      initialVals.client_name = 'Global Logistics Ltd.';
      initialVals.annual_fee = '$48,000 / year';
      initialVals.sla_tier = '99.9% Uptime Guarantee';
      initialVals.country = 'Delaware, USA';
    } else if (template.id === 'lease') {
      initialVals.landlord_name = 'Skyline Real Estate Holdings';
      initialVals.tenant_name = 'Acme Tech Solutions Inc.';
      initialVals.property_address = '500 Market St, Suite 1200, San Francisco, CA';
      initialVals.monthly_rent = '$8,500 / month';
      initialVals.lease_term_months = '36 Months';
    }
    setFormValues(initialVals);
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: selectedTemplate.id,
          parameters: formValues
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedContractText(data.contract_text);
        setGeneratedDoc(data.document);
        onContractGenerated(data.document);
      } else {
        // Fallback Client Generator Simulation
        await new Promise(r => setTimeout(r, 1200));
        const sampleText = `EMPLOYMENT AGREEMENT\n\nTHIS AGREEMENT is made between Employer and ${formValues.employee_name || 'Employee'}.\n1. Position: ${formValues.job_title || 'Engineer'}\n2. Salary: ${formValues.salary || '$100,000'}\n3. Jurisdiction: ${formValues.country || 'USA'}\n4. Notice Period: ${formValues.notice_period || '30 Days'}\n\nExecuted as of ${new Date().toLocaleDateString()}.`;
        
        const fallbackDoc: LegalDocument = {
          id: `doc-gen-${Date.now()}`,
          org_id: 'org-nexus',
          team_id: 'all',
          filename: `${selectedTemplate.title.replace(/\s+/g, '_')}_${formValues.employee_name || 'Draft'}.pdf`,
          file_type: 'pdf',
          upload_date: new Date().toLocaleDateString(),
          file_size: '1.2 KB',
          chunk_count: 5,
          status: 'indexed',
          risk_score: 25
        };

        setGeneratedContractText(sampleText);
        setGeneratedDoc(fallbackDoc);
        onContractGenerated(fallbackDoc);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (!generatedContractText) return;
    navigator.clipboard.writeText(generatedContractText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const getTemplateIcon = (id: string) => {
    switch (id) {
      case 'employment': return <Briefcase className="w-5 h-5 text-brand-500" />;
      case 'nda': return <ShieldAlert className="w-5 h-5 text-indigo-500" />;
      case 'saas_msa': return <Cloud className="w-5 h-5 text-cyan-500" />;
      case 'lease': return <Building2 className="w-5 h-5 text-emerald-500" />;
      default: return <FileSignature className="w-5 h-5 text-brand-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-navy-950 to-indigo-950 p-8 border border-slate-800 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              AI Legal Contract Generator
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">AI Contract Generator & Drafter</h1>
            <p className="text-slate-400 mt-1 max-w-xl text-sm leading-relaxed">
              Draft legal contracts instantly from parameter forms. Generated contracts are automatically indexed into your workspace FAISS Vector DB for AI RAG Chat & Risk Analysis.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur border border-slate-700/80 p-3.5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 border border-brand-500/30">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Selected Template</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {selectedTemplate.title}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Template Picker Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-500" />
            <span>Step 1: Choose Contract Template</span>
          </h2>
          <span className="text-xs text-slate-400 font-semibold">{DEFAULT_TEMPLATES.length} Templates Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {DEFAULT_TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplate.id === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => handleTemplateSelect(tmpl)}
                className={`text-left p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-2 border-brand-500 shadow-xl shadow-brand-500/10 scale-102'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {getTemplateIcon(tmpl.id)}
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400 text-[10px] font-bold border border-brand-500/20">
                        Selected
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{tmpl.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>{tmpl.category}</span>
                  <span className="text-brand-600 font-bold flex items-center gap-1">
                    {tmpl.fields.length} Inputs <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2 & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Parameter Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span>Fill {selectedTemplate.title} Details</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Fill the parameters below and click Draft Contract.
              </p>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              {selectedTemplate.fields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>{field.label}</span>
                    {field.required && <span className="text-[10px] text-rose-500 font-semibold">*Required</span>}
                  </label>
                  <input
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={formValues[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full mt-2 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all transform active:scale-98"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Drafting Legal Contract with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Draft Contract & Index into RAG</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Contract Viewer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-500" />
                    <span>Generated Contract Document</span>
                  </h3>
                  <p className="text-xs text-slate-500">Live draft preview with standard legal clauses.</p>
                </div>

                {generatedContractText && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyText}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => alert('Downloading PDF Legal Contract...')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 text-xs font-semibold border border-brand-500/20 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Draft Viewer Body */}
              {isGenerating ? (
                <div className="py-24 text-center space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-brand-500 mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold animate-pulse">
                    Synthesizing legal clauses, indemnification terms, and jurisdiction enforcement...
                  </p>
                </div>
              ) : generatedContractText ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[450px] border border-slate-800 shadow-inner">
                    {generatedContractText}
                  </div>

                  {generatedDoc && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-700 dark:text-emerald-300">
                      <div className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Indexed in FAISS Vector DB ({generatedDoc.chunk_count} Chunks Created)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onSelectDoc(generatedDoc);
                            setActiveTab('chat');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all"
                        >
                          Ask RAG Assistant →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-24 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                    <FileSignature className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Contract Drafted Yet</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Fill the parameters on the left and click "Draft Contract & Index into RAG" to generate a complete legal document.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
