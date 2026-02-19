
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../constants';
import { DrugAnalysis, RiskLevel, GeneProfile, SystemSettings } from '../types';
import RiskBadge from '../components/RiskBadge';
import { getClinicalExplanation } from '../services/geminiService';

interface ResultsPageProps {
  settings: SystemSettings;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ settings }) => {
  const [analyses, setAnalyses] = useState<DrugAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDrug, setExpandedDrug] = useState<string | null>(null);

  useEffect(() => {
    const generateMockResults = async () => {
      const stored = localStorage.getItem('lastAnalysis');
      if (!stored) return;
      
      const { drugs } = JSON.parse(stored);
      
      // Seeded mock logic for demonstration
      const mockData: DrugAnalysis[] = drugs.map((drug: string) => {
        let risk = RiskLevel.SAFE;
        let genes: GeneProfile[] = [];
        let recommendation = "Standard dosing per label guidelines.";

        if (drug === 'CLOPIDOGREL') {
          risk = RiskLevel.TOXIC;
          genes = [{ gene: 'CYP2C19', diplotype: '*2/*2', phenotype: 'Poor Metabolizer', variants: ['rs12248560'] }];
          recommendation = "Recommend alternative antiplatelet (Prasugrel/Ticagrelor).";
        } else if (drug === 'WARFARIN') {
          risk = RiskLevel.ADJUST_DOSAGE;
          genes = [{ gene: 'CYP2C9', diplotype: '*1/*3', phenotype: 'Intermediate Metabolizer', variants: ['rs1799853'] }];
          recommendation = "Reduction in starting dose (3-5mg) is warranted.";
        } else if (drug === 'SIMVASTATIN') {
          risk = RiskLevel.ADJUST_DOSAGE;
          genes = [{ gene: 'SLCO1B1', diplotype: '*5/*5', phenotype: 'Low Function', variants: ['rs4149056'] }];
          recommendation = "Limit Simvastatin dose to 20mg or switch to Rosuvastatin.";
        }

        return {
          drug,
          risk,
          confidence: 0.94 + (Math.random() * 0.05),
          geneProfiles: genes,
          recommendation
        };
      });

      // Enhance with AI using the passed settings
      const enhancedData = await Promise.all(mockData.map(async (item) => {
        const explanation = await getClinicalExplanation(item, settings);
        return { ...item, aiExplanation: explanation };
      }));

      setAnalyses(enhancedData);
      setLoading(false);
      if (enhancedData.length > 0) setExpandedDrug(enhancedData[0].drug);
    };

    generateMockResults();
  }, [settings]);

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

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clinical Results Report</h1>
          <p className="text-slate-500">Analysis completed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export JSON
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 shadow-lg shadow-sky-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Generate PDF
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {analyses.map((analysis) => (
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
                  <div className="flex items-center gap-2 mt-1">
                    <RiskBadge level={analysis.risk} />
                    <span className="text-xs text-slate-400 font-medium">Confidence Score: {(analysis.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Genes Analyzed</p>
                  <div className="flex gap-1 justify-end">
                    {analysis.geneProfiles.map(g => (
                      <span key={g.gene} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">{g.gene}</span>
                    ))}
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
                  {/* Pharmacogenomic Details */}
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
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Variant(s)</p>
                                <p className="font-mono text-slate-700">{gene.variants.join(', ')}</p>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-400">
                            No significant high-risk variants detected for this drug interaction.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-sky-50 p-6 rounded-2xl border border-sky-100">
                      <h4 className="text-sky-800 font-bold mb-2 flex items-center gap-2">
                        <Icons.Check className="w-5 h-5" /> Recommended Clinical Action
                      </h4>
                      <p className="text-sky-900 leading-relaxed font-medium">
                        {analysis.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* AI Explanation Panel */}
                  <div className="bg-slate-900 text-slate-300 p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      <div className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></div>
                        Gemini Clinical AI
                      </div>
                    </div>
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
                      Expert Reasoning
                    </h4>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <p className="whitespace-pre-wrap leading-relaxed opacity-90 italic">
                        "{analysis.aiExplanation || "Generating clinical context..."}"
                      </p>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <p>Source: CPIC Guidelines v2024.1</p>
                      <button className="hover:text-sky-400 font-bold uppercase tracking-tighter">View Evidence Map</button>
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
