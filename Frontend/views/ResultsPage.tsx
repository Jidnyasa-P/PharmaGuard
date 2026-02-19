
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../constants';
import { DrugAnalysis, RiskLevel, SystemSettings } from '../types';
import RiskBadge from '../components/RiskBadge';

interface ResultsPageProps {
  settings: SystemSettings;
}

// ─── Map backend JSON → internal DrugAnalysis type ────────────────────────────
const mapBackendResult = (data: any): DrugAnalysis => {
  const riskLabel = (data.risk_assessment?.risk_label || 'safe').toLowerCase();
  let risk = RiskLevel.SAFE;
  if (riskLabel === 'toxic' || data.risk_assessment?.severity === 'high' || data.risk_assessment?.severity === 'critical') {
    risk = RiskLevel.TOXIC;
  } else if (riskLabel === 'adjust dosage' || riskLabel === 'adjust_dosage' || data.risk_assessment?.severity === 'moderate') {
    risk = RiskLevel.ADJUST_DOSAGE;
  }

  const profile = data.pharmacogenomic_profile || {};
  const variants = (profile.detected_variants || []).map((v: any) => v.rsid || v).filter(Boolean);

  const geneProfiles = profile.primary_gene && profile.primary_gene !== 'Unknown' ? [{
    gene: profile.primary_gene,
    diplotype: profile.diplotype || 'N/A',
    phenotype: profile.phenotype === 'PM' ? 'Poor Metabolizer'
      : profile.phenotype === 'IM' ? 'Intermediate Metabolizer'
      : profile.phenotype === 'NM' ? 'Normal Metabolizer'
      : profile.phenotype === 'RM' ? 'Rapid Metabolizer'
      : profile.phenotype === 'URM' ? 'Ultra-Rapid Metabolizer'
      : profile.phenotype || 'Unknown',
    variants: variants.length > 0 ? variants : ['N/A'],
  }] : [];

  return {
    drug: data.drug || 'Unknown',
    risk,
    confidence: data.risk_assessment?.confidence_score || 0.75,
    geneProfiles,
    recommendation: data.clinical_recommendation?.guideline || 'Refer to clinical guidelines.',
    aiExplanation: data.llm_generated_explanation?.summary || '',
  };
};

// ─── PDF Generator (pure HTML → window.print) ─────────────────────────────────
const generatePDF = (rawResults: any[]) => {
  const timestamp = new Date().toLocaleString();
  const riskColor = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('toxic') || l.includes('high') || l.includes('critical')) return '#dc2626';
    if (l.includes('adjust') || l.includes('moderate')) return '#d97706';
    return '#059669';
  };

  const drugsHTML = rawResults.map(r => {
    const rl = r.risk_assessment?.risk_label || 'Safe';
    const color = riskColor(rl);
    const profile = r.pharmacogenomic_profile || {};
    const variants = (profile.detected_variants || []).map((v: any) => v.rsid || v).filter(Boolean);
    return `
      <div style="margin-bottom:32px; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; page-break-inside:avoid;">
        <div style="background:#f8fafc; padding:20px 24px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="margin:0; font-size:20px; color:#0f172a;">${r.drug}</h3>
            <p style="margin:4px 0 0; font-size:12px; color:#64748b;">Patient: ${r.patient_id || 'PATIENT_001'} · ${new Date(r.timestamp).toLocaleString()}</p>
          </div>
          <span style="background:${color}20; color:${color}; border:1px solid ${color}40; padding:6px 16px; border-radius:999px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">${rl}</span>
        </div>
        <div style="padding:24px; display:grid; grid-template-columns:1fr 1fr; gap:24px;">
          <div>
            <h4 style="margin:0 0 12px; font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#94a3b8;">Risk Assessment</h4>
            <p style="margin:4px 0;"><strong>Confidence:</strong> ${((r.risk_assessment?.confidence_score || 0) * 100).toFixed(1)}%</p>
            <p style="margin:4px 0;"><strong>Severity:</strong> ${r.risk_assessment?.severity || 'N/A'}</p>
          </div>
          <div>
            <h4 style="margin:0 0 12px; font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#94a3b8;">Pharmacogenomic Profile</h4>
            <p style="margin:4px 0;"><strong>Gene:</strong> ${profile.primary_gene || 'N/A'}</p>
            <p style="margin:4px 0;"><strong>Diplotype:</strong> ${profile.diplotype || 'N/A'}</p>
            <p style="margin:4px 0;"><strong>Phenotype:</strong> ${profile.phenotype || 'N/A'}</p>
            <p style="margin:4px 0;"><strong>Variants:</strong> ${variants.length > 0 ? variants.join(', ') : 'None detected'}</p>
          </div>
          <div style="grid-column:1/-1;">
            <h4 style="margin:0 0 8px; font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#94a3b8;">Clinical Recommendation</h4>
            <p style="margin:0; background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:12px; color:#0c4a6e;">${r.clinical_recommendation?.guideline || 'N/A'}</p>
          </div>
          <div style="grid-column:1/-1;">
            <h4 style="margin:0 0 8px; font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#94a3b8;">AI Clinical Explanation</h4>
            <p style="margin:0; background:#f8fafc; border-left:3px solid #0ea5e9; padding:12px 16px; color:#334155; font-style:italic; line-height:1.6;">${r.llm_generated_explanation?.summary || 'N/A'}</p>
          </div>
          <div style="grid-column:1/-1; background:#f8fafc; border-radius:8px; padding:12px;">
            <h4 style="margin:0 0 8px; font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#94a3b8;">Quality Metrics</h4>
            <p style="margin:0; font-size:13px; color:#475569;">VCF Parsing: ${r.quality_metrics?.vcf_parsing_success ? '✅ Success' : '❌ Failed'} · Gene Match: ${r.quality_metrics?.gene_match_found ? '✅ Found' : '⚠️ Not found'}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>PharmaGuard Clinical Report</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 40px; color: #1e293b; background: #fff; }
    @media print {
      body { padding: 20px; }
      button { display: none !important; }
    }
  </style>
</head>
<body>
  <div style="text-align:center; margin-bottom:40px; padding-bottom:24px; border-bottom:2px solid #e2e8f0;">
    <div style="display:inline-flex; align-items:center; gap:12px; margin-bottom:16px;">
      <div style="width:48px; height:48px; background:linear-gradient(135deg,#0ea5e9,#6366f1); border-radius:12px; display:flex; align-items:center; justify-content:center;">
        <span style="color:white; font-size:24px;">⚕</span>
      </div>
      <div style="text-align:left;">
        <h1 style="margin:0; font-size:24px; color:#0f172a;">PharmaGuard</h1>
        <p style="margin:0; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:0.1em;">Clinical Risk Assessment Report</p>
      </div>
    </div>
    <p style="margin:0; color:#64748b; font-size:13px;">Generated: ${timestamp} · Powered by Groq AI (llama-3.3-70b) · CPIC Guidelines 2024</p>
  </div>

  <div style="margin-bottom:32px; background:#fef9c3; border:1px solid #fde047; border-radius:8px; padding:16px;">
    <p style="margin:0; font-size:13px; color:#713f12;">⚠️ <strong>Disclaimer:</strong> This report is generated by an AI system for decision support purposes only. All clinical decisions must be reviewed and confirmed by a licensed pharmacist or physician. Not a substitute for professional medical advice.</p>
  </div>

  ${drugsHTML}

  <div style="margin-top:40px; padding-top:24px; border-top:1px solid #e2e8f0; text-align:center; color:#94a3b8; font-size:12px;">
    <p style="margin:0;">PharmaGuard · RIFT 2026 Hackathon · HealthTech Track · Pharmacogenomics / Explainable AI</p>
    <p style="margin:4px 0 0;">Report generated at ${timestamp}</p>
  </div>

  <div style="margin-top:24px; text-align:center;">
    <button onclick="window.print()" style="background:#0ea5e9; color:white; border:none; padding:12px 32px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer;">🖨️ Print / Save as PDF</button>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};

// ─── Main Component ────────────────────────────────────────────────────────────
const ResultsPage: React.FC<ResultsPageProps> = ({ settings }) => {
  const [analyses, setAnalyses] = useState<DrugAnalysis[]>([]);
  const [rawResults, setRawResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDrug, setExpandedDrug] = useState<string | null>(null);
  const [showJsonPanel, setShowJsonPanel] = useState(false);
  const [activeJsonDrug, setActiveJsonDrug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lastAnalysisResults');
    if (!stored) { setLoading(false); return; }
    try {
      const raw = JSON.parse(stored);
      setRawResults(raw);
      const mapped = raw.map(mapBackendResult);
      setAnalyses(mapped);
      if (mapped.length > 0) {
        setExpandedDrug(mapped[0].drug);
        setActiveJsonDrug(mapped[0].drug);
      }
    } catch (e) {
      console.error('Failed to parse results', e);
    }
    setLoading(false);
  }, []);

  const activeJsonResult = rawResults.find(r => r.drug === activeJsonDrug) || rawResults[0];

  const handleCopy = () => {
    if (!activeJsonResult) return;
    navigator.clipboard.writeText(JSON.stringify(activeJsonResult, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(rawResults, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmaguard-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => generatePDF(rawResults);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
          <Icons.Dna className="w-10 h-10 text-sky-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Patient Genome</h2>
          <p className="text-slate-500 max-w-sm">Cross-referencing variants with CPIC, PharmGKB, and ClinVar databases...</p>
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-xl font-bold text-slate-700 mb-2">No Results Found</h2>
        <p className="text-slate-500 mb-6">Please run an analysis first.</p>
        <Link to="/analyze" className="px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700">
          Go to Analysis
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clinical Results Report</h1>
          <p className="text-slate-500">Analysis completed · {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowJsonPanel(!showJsonPanel)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold transition-all ${
              showJsonPanel ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            {showJsonPanel ? 'Hide JSON' : 'View JSON'}
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export JSON
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 shadow-lg shadow-sky-600/20 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* ── JSON Output Panel ─────────────────────────────────────────────────── */}
      {showJsonPanel && rawResults.length > 0 && (
        <div className="mb-8 bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden shadow-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <span className="text-slate-400 text-xs font-mono font-bold uppercase tracking-widest">JSON Output · Judge Schema</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Drug selector tabs */}
              <div className="flex gap-1">
                {rawResults.map(r => (
                  <button
                    key={r.drug}
                    onClick={() => setActiveJsonDrug(r.drug)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      activeJsonDrug === r.drug ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.drug}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                }`}
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="overflow-auto max-h-[480px]">
            <pre className="p-6 text-xs font-mono leading-relaxed text-slate-300 whitespace-pre">
              {JSON.stringify(activeJsonResult, null, 2)
                .split('\n')
                .map((line, i) => {
                  // Syntax highlighting via span coloring
                  const keyMatch = line.match(/^(\s*)"([^"]+)":/);
                  const strVal = line.match(/: "(.*)"(,?)$/);
                  const numVal = line.match(/: (\d+\.?\d*)(,?)$/);
                  const boolVal = line.match(/: (true|false)(,?)$/);

                  if (keyMatch) {
                    const key = keyMatch[2];
                    // Color keys by type
                    const isRiskKey = ['risk_label','severity','confidence_score'].includes(key);
                    const isGeneKey = ['primary_gene','diplotype','phenotype','rsid'].includes(key);
                    const keyColor = isRiskKey ? '#f87171' : isGeneKey ? '#a78bfa' : '#7dd3fc';
                    return (
                      <span key={i} style={{ display: 'block' }}>
                        <span style={{ color: '#94a3b8' }}>{line.match(/^\s*/)?.[0]}</span>
                        <span style={{ color: keyColor }}>"{key}"</span>
                        <span style={{ color: '#94a3b8' }}>: </span>
                        <span style={{ color: strVal ? '#86efac' : numVal ? '#fbbf24' : boolVal ? '#fbbf24' : '#e2e8f0' }}>
                          {line.replace(/^\s*"[^"]+": ?/, '').trimEnd()}
                        </span>
                      </span>
                    );
                  }
                  return <span key={i} style={{ display: 'block', color: '#64748b' }}>{line}</span>;
                })
              }
            </pre>
          </div>
          <div className="px-6 py-3 border-t border-slate-700 flex justify-between items-center">
            <span className="text-slate-500 text-xs">✅ Schema compliant · RIFT 2026 Judge Format</span>
            <button
              onClick={handleExportJSON}
              className="text-xs text-sky-400 hover:text-sky-300 font-bold"
            >
              Download All Results JSON →
            </button>
          </div>
        </div>
      )}

      {/* ── Drug Cards ─────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {analyses.map((analysis, idx) => (
          <div key={analysis.drug} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div
              className="p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer"
              onClick={() => setExpandedDrug(expandedDrug === analysis.drug ? null : analysis.drug)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                  analysis.risk === RiskLevel.SAFE ? 'bg-emerald-500' :
                  analysis.risk === RiskLevel.ADJUST_DOSAGE ? 'bg-amber-500' : 'bg-rose-500'
                }`}>
                  <Icons.Analyze className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{analysis.drug}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <RiskBadge level={analysis.risk} />
                    <span className="text-xs text-slate-400 font-medium">Confidence: {(analysis.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* View JSON for this drug */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveJsonDrug(analysis.drug);
                    setShowJsonPanel(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all"
                >
                  {'{ }'}
                </button>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Genes</p>
                  <div className="flex gap-1 justify-end">
                    {analysis.geneProfiles.map(g => (
                      <span key={g.gene} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">{g.gene}</span>
                    ))}
                    {analysis.geneProfiles.length === 0 && (
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-400">None</span>
                    )}
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-6 h-6 text-slate-400 transition-transform ${expandedDrug === analysis.drug ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>

            {expandedDrug === analysis.drug && (
              <div className="px-6 pb-8 border-t border-slate-50 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">

                  {/* Genotype Details */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Genotype Details</h4>
                      <div className="space-y-4">
                        {analysis.geneProfiles.length > 0 ? analysis.geneProfiles.map((gene, i) => (
                          <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-2xl font-bold text-sky-700">{gene.gene}</span>
                              <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold">{gene.phenotype}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Diplotype</p>
                                <p className="font-mono text-slate-700">{gene.diplotype}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Variants</p>
                                <p className="font-mono text-slate-700 text-xs break-all">{gene.variants.join(', ')}</p>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-400">
                            No significant pharmacogenomic variants detected. Standard dosing may apply.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-sky-50 p-6 rounded-2xl border border-sky-100">
                      <h4 className="text-sky-800 font-bold mb-2 flex items-center gap-2">
                        <Icons.Check className="w-5 h-5" /> Recommended Clinical Action
                      </h4>
                      <p className="text-sky-900 leading-relaxed font-medium">{analysis.recommendation}</p>
                    </div>

                    {/* Quality metrics */}
                    {rawResults[idx]?.quality_metrics && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quality Metrics</h4>
                        <div className="flex gap-4 flex-wrap text-sm">
                          <span className={`flex items-center gap-1 font-medium ${rawResults[idx].quality_metrics.vcf_parsing_success ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {rawResults[idx].quality_metrics.vcf_parsing_success ? '✅' : '❌'} VCF Parsed
                          </span>
                          <span className={`flex items-center gap-1 font-medium ${rawResults[idx].quality_metrics.gene_match_found ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {rawResults[idx].quality_metrics.gene_match_found ? '✅' : '⚠️'} Gene Match
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Explanation */}
                  <div className="bg-slate-900 text-slate-300 p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      <div className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></div>
                        Groq Clinical AI
                      </div>
                    </div>
                    <h4 className="text-white font-bold mb-4 text-lg">Expert Reasoning</h4>
                    <p className="whitespace-pre-wrap leading-relaxed opacity-90 italic text-sm">
                      "{analysis.aiExplanation || 'No AI explanation available.'}"
                    </p>
                    <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <p>Source: CPIC Guidelines v2024.1</p>
                      <button
                        onClick={() => {
                          setActiveJsonDrug(analysis.drug);
                          setShowJsonPanel(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="hover:text-sky-400 font-bold uppercase tracking-tighter"
                      >
                        View JSON Output →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link to="/analyze" className="text-slate-500 font-semibold flex items-center gap-2 hover:text-sky-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          Analyze Another Patient
        </Link>
      </div>
    </div>
  );
};

export default ResultsPage;
