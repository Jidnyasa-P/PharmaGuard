
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons, AVAILABLE_DRUGS } from '../constants';

const AnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [drugInput, setDrugInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const toggleDrug = (drug: string) => {
    setSelectedDrugs(prev => 
      prev.includes(drug) ? prev.filter(d => d !== drug) : [...prev, drug]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(',')) {
      const parts = value.split(',');
      const newDrug = parts[0].trim().toUpperCase();
      if (newDrug && !selectedDrugs.includes(newDrug)) {
        setSelectedDrugs([...selectedDrugs, newDrug]);
      }
      setDrugInput(parts.slice(1).join(',').trim());
    } else {
      setDrugInput(value);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && drugInput.trim()) {
      const newDrug = drugInput.trim().toUpperCase();
      if (!selectedDrugs.includes(newDrug)) {
        setSelectedDrugs([...selectedDrugs, newDrug]);
      }
      setDrugInput('');
    }
  };

  const handleAnalyze = () => {
    if (!file || selectedDrugs.length === 0) return;
    setIsAnalyzing(true);
    
    // Simulate processing
    setTimeout(() => {
      const newId = `ANL-${Math.floor(10000 + Math.random() * 90000)}`;
      const patientId = `PX-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const analysisResult = {
        id: newId,
        date: new Date().toISOString(),
        patientId: patientId,
        drugs: selectedDrugs,
        status: 'Complete' as const
      };

      // Save to singular result for the next page
      localStorage.setItem('lastAnalysis', JSON.stringify({ drugs: selectedDrugs }));

      // Append to global history
      const existingHistory = JSON.parse(localStorage.getItem('pharmaGuardHistory') || '[]');
      localStorage.setItem('pharmaGuardHistory', JSON.stringify([analysisResult, ...existingHistory]));

      navigate('/results');
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Patient Genomic Analysis</h1>
        <p className="text-slate-500">Enter medications and upload genomic sequences to generate clinical insights.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          {/* Step 1: Upload */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm">1</span>
              <h2 className="text-lg font-bold text-slate-800">Genomic Data Source</h2>
            </div>
            
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                dragActive ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              } ${file ? 'border-emerald-500 bg-emerald-50' : ''}`}
            >
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                accept=".vcf,.txt"
              />
              <div className="flex flex-col items-center">
                {file ? (
                  <>
                    <Icons.Check className="w-12 h-12 text-emerald-500 mb-4" />
                    <p className="text-emerald-800 font-bold">{file.name}</p>
                    <p className="text-emerald-600 text-xs mt-1">Ready for sequencing</p>
                  </>
                ) : (
                  <>
                    <Icons.Upload className="w-12 h-12 text-slate-400 mb-4" />
                    <p className="text-slate-600 font-medium">Drag & drop .VCF file or click to browse</p>
                    <p className="text-slate-400 text-sm mt-1">Supported formats: VCF, txt, genome-zip</p>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Step 2: Medication Search & Select */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm">2</span>
              <h2 className="text-lg font-bold text-slate-800">Target Medications</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-slate-500 mb-2 font-medium">Type drugs (separated by commas) or select from clinical list:</p>
              <div className="relative group">
                <input 
                  type="text" 
                  value={drugInput}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  placeholder="e.g. Warfarin, Clopidogrel, Statins..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-5 pr-12 text-sm focus:ring-2 focus:ring-sky-500 transition-all outline-none font-medium"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <Icons.Analyze className="w-5 h-5" />
                </div>
              </div>
            </div>

            {selectedDrugs.length > 0 && (
              <div className="mb-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Selected for Analysis</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDrugs.map(drug => (
                    <span key={drug} className="flex items-center gap-2 px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold shadow-sm shadow-sky-600/20">
                      {drug}
                      <button onClick={() => toggleDrug(drug)} className="hover:text-sky-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Common High-Impact Drugs</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_DRUGS.slice(0, 10).map((drug) => (
                  <button
                    key={drug}
                    onClick={() => toggleDrug(drug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      selectedDrugs.includes(drug)
                        ? 'bg-sky-100 border-sky-300 text-sky-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'
                    }`}
                  >
                    {drug}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Analyze Button */}
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={!file || selectedDrugs.length === 0 || isAnalyzing}
              className={`px-8 py-4 rounded-xl font-bold text-white flex items-center gap-3 transition-all ${
                !file || selectedDrugs.length === 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-600/20'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  AI Processing Genomic Data...
                </>
              ) : (
                <>
                  Run Clinical Analysis
                  <Icons.Check className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
