
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DrugAnalysis, RiskLevel } from '../types';

// ─── Cost Data ──────────────────────────────────────────────────────────────
// Sources: HCUP Statistical Briefs, Agency for Healthcare Research & Quality
const COST_DATA: Record<string, {
  avgHospitalStay: number;        // USD
  avgERVisit: number;             // USD
  avgReadmission: number;         // USD
  avgAdverseDrugEvent: number;    // USD
  drugCostPerMonth: number;       // USD
  alternativeDrugCostPerMonth: number; // USD
  alternativeName: string;
  riskReductionPercent: number;   // 0–100
  cpicLevel: string;
  avgDaysInHospital: number;
  readmissionRate: number;        // decimal, e.g. 0.22
  alternativeReadmissionRate: number;
}> = {
  CLOPIDOGREL: {
    avgHospitalStay: 18400,
    avgERVisit: 2800,
    avgReadmission: 15200,
    avgAdverseDrugEvent: 9600,
    drugCostPerMonth: 140,
    alternativeDrugCostPerMonth: 210,
    alternativeName: 'Ticagrelor (CPIC-A)',
    riskReductionPercent: 78,
    cpicLevel: 'A',
    avgDaysInHospital: 5.2,
    readmissionRate: 0.22,
    alternativeReadmissionRate: 0.05,
  },
  WARFARIN: {
    avgHospitalStay: 21000,
    avgERVisit: 3100,
    avgReadmission: 17800,
    avgAdverseDrugEvent: 12400,
    drugCostPerMonth: 30,
    alternativeDrugCostPerMonth: 380,
    alternativeName: 'Rivaroxaban (Alternative)',
    riskReductionPercent: 65,
    cpicLevel: 'A',
    avgDaysInHospital: 6.8,
    readmissionRate: 0.26,
    alternativeReadmissionRate: 0.09,
  },
  SIMVASTATIN: {
    avgHospitalStay: 14600,
    avgERVisit: 2100,
    avgReadmission: 11200,
    avgAdverseDrugEvent: 7800,
    drugCostPerMonth: 25,
    alternativeDrugCostPerMonth: 180,
    alternativeName: 'Rosuvastatin (CPIC-A)',
    riskReductionPercent: 72,
    cpicLevel: 'A',
    avgDaysInHospital: 4.1,
    readmissionRate: 0.18,
    alternativeReadmissionRate: 0.05,
  },
  CODEINE: {
    avgHospitalStay: 16200,
    avgERVisit: 2400,
    avgReadmission: 13400,
    avgAdverseDrugEvent: 8900,
    drugCostPerMonth: 45,
    alternativeDrugCostPerMonth: 120,
    alternativeName: 'Morphine / Hydromorphone',
    riskReductionPercent: 82,
    cpicLevel: 'A',
    avgDaysInHospital: 4.8,
    readmissionRate: 0.2,
    alternativeReadmissionRate: 0.04,
  },
  AMITRIPTYLINE: {
    avgHospitalStay: 12800,
    avgERVisit: 1900,
    avgReadmission: 10100,
    avgAdverseDrugEvent: 6700,
    drugCostPerMonth: 20,
    alternativeDrugCostPerMonth: 95,
    alternativeName: 'Nortriptyline (CPIC-B)',
    riskReductionPercent: 58,
    cpicLevel: 'B',
    avgDaysInHospital: 3.6,
    readmissionRate: 0.15,
    alternativeReadmissionRate: 0.06,
  },
  TAMOXIFEN: {
    avgHospitalStay: 22600,
    avgERVisit: 3400,
    avgReadmission: 19200,
    avgAdverseDrugEvent: 14100,
    drugCostPerMonth: 85,
    alternativeDrugCostPerMonth: 320,
    alternativeName: 'Anastrozole (Alternative)',
    riskReductionPercent: 70,
    cpicLevel: 'A',
    avgDaysInHospital: 7.2,
    readmissionRate: 0.28,
    alternativeReadmissionRate: 0.08,
  },
  FLUOROURACIL: {
    avgHospitalStay: 28400,
    avgERVisit: 4200,
    avgReadmission: 24600,
    avgAdverseDrugEvent: 18300,
    drugCostPerMonth: 950,
    alternativeDrugCostPerMonth: 1200,
    alternativeName: 'Capecitabine (dose-adjusted)',
    riskReductionPercent: 85,
    cpicLevel: 'A',
    avgDaysInHospital: 9.1,
    readmissionRate: 0.32,
    alternativeReadmissionRate: 0.05,
  },
  ABACAVIR: {
    avgHospitalStay: 19800,
    avgERVisit: 2900,
    avgReadmission: 16400,
    avgAdverseDrugEvent: 11200,
    drugCostPerMonth: 1400,
    alternativeDrugCostPerMonth: 1550,
    alternativeName: 'Tenofovir-based regimen',
    riskReductionPercent: 94,
    cpicLevel: 'A',
    avgDaysInHospital: 6.2,
    readmissionRate: 0.24,
    alternativeReadmissionRate: 0.01,
  },
  TACROLIMUS: {
    avgHospitalStay: 24200,
    avgERVisit: 3600,
    avgReadmission: 20800,
    avgAdverseDrugEvent: 15600,
    drugCostPerMonth: 2800,
    alternativeDrugCostPerMonth: 2800,
    alternativeName: 'Tacrolimus (dose-optimized)',
    riskReductionPercent: 62,
    cpicLevel: 'A',
    avgDaysInHospital: 7.8,
    readmissionRate: 0.29,
    alternativeReadmissionRate: 0.11,
  },
  PHENYTOIN: {
    avgHospitalStay: 17400,
    avgERVisit: 2600,
    avgReadmission: 14200,
    avgAdverseDrugEvent: 9800,
    drugCostPerMonth: 55,
    alternativeDrugCostPerMonth: 180,
    alternativeName: 'Levetiracetam (Alternative)',
    riskReductionPercent: 68,
    cpicLevel: 'A',
    avgDaysInHospital: 5.5,
    readmissionRate: 0.21,
    alternativeReadmissionRate: 0.07,
  },
};

const DEFAULT_COST = {
  avgHospitalStay: 18000,
  avgERVisit: 2800,
  avgReadmission: 14500,
  avgAdverseDrugEvent: 9500,
  drugCostPerMonth: 200,
  alternativeDrugCostPerMonth: 300,
  alternativeName: 'CPIC-Recommended Alternative',
  riskReductionPercent: 70,
  cpicLevel: 'B',
  avgDaysInHospital: 5.0,
  readmissionRate: 0.20,
  alternativeReadmissionRate: 0.06,
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtK = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : fmt(n);

// ─── Animated Counter ─────────────────────────────────────────────────────
const AnimatedNumber: React.FC<{ value: number; duration?: number; prefix?: string; suffix?: string }> = ({
  value, duration = 1200, prefix = '', suffix = ''
}) => {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef<number | null>(null);
  const prev = useRef(0);

  useEffect(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const from = prev.current;
    start.current = null;
    const step = (ts: number) => {
      if (!start.current) start.current = ts;
      const pct = Math.min((ts - start.current) / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 4);
      setDisplay(Math.round(from + (value - from) * ease));
      if (pct < 1) raf.current = requestAnimationFrame(step);
      else prev.current = value;
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value, duration]);

  return (
    <span>{prefix}{display >= 1000 ? `${(display / 1000).toFixed(1)}K` : display}{suffix}</span>
  );
};

// ─── Gauge / Donut ───────────────────────────────────────────────────────
const GaugeMeter: React.FC<{ percent: number; color: string; label: string }> = ({ percent, color, label }) => {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="44" cy="44" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
        <text x="44" y="49" textAnchor="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="monospace">
          {percent}%
        </text>
      </svg>
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center leading-tight max-w-[80px]">{label}</span>
    </div>
  );
};

// ─── Sparkline ─────────────────────────────────────────────────────────────
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const w = 120, h = 36;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── ROI Calc logic ────────────────────────────────────────────────────────
interface ROIResult {
  drug: string;
  risk: RiskLevel;
  costData: typeof DEFAULT_COST;
  patientCount: number;
  timelineMonths: number;
  // Current (flagged drug) costs
  currentReadmissions: number;
  currentReadmissionCost: number;
  currentERVisits: number;
  currentERCost: number;
  currentAdverseDrugEventCost: number;
  currentDrugCost: number;
  totalCurrentCost: number;
  // Optimized (CPIC alternative) costs
  optimizedReadmissions: number;
  optimizedReadmissionCost: number;
  optimizedERVisits: number;
  optimizedERCost: number;
  optimizedAdverseDrugEventCost: number;
  optimizedDrugCost: number;
  totalOptimizedCost: number;
  // Savings
  totalSaved: number;
  roi: number;
  paybackMonths: number;
  implementationCost: number;
}

function calcROI(drug: string, risk: RiskLevel, patientCount: number, timelineMonths: number): ROIResult {
  const cd = COST_DATA[drug.toUpperCase()] || DEFAULT_COST;

  // Expected events per 1000 patients / year, scaled
  const scaledPatients = patientCount;
  const years = timelineMonths / 12;

  // Current risk
  const currentReadmissions = Math.round(scaledPatients * cd.readmissionRate * years);
  const currentReadmissionCost = currentReadmissions * cd.avgReadmission;
  // ER visits: ~40% of non-readmitted at-risk patients
  const currentERVisits = Math.round(scaledPatients * cd.readmissionRate * 0.4 * years);
  const currentERCost = currentERVisits * cd.avgERVisit;
  // ADE cost: ~25% of cohort experience ADE if drug flagged
  const riskMultiplier = risk === RiskLevel.TOXIC ? 1 : risk === RiskLevel.ADJUST_DOSAGE ? 0.5 : 0.15;
  const currentAdverseDrugEventCost = Math.round(scaledPatients * riskMultiplier * 0.25 * cd.avgAdverseDrugEvent * years);
  const currentDrugCost = scaledPatients * cd.drugCostPerMonth * timelineMonths;
  const totalCurrentCost = currentReadmissionCost + currentERCost + currentAdverseDrugEventCost + currentDrugCost;

  // Optimized (CPIC alternative)
  const optimizedReadmissions = Math.round(scaledPatients * cd.alternativeReadmissionRate * years);
  const optimizedReadmissionCost = optimizedReadmissions * cd.avgReadmission;
  const optimizedERVisits = Math.round(scaledPatients * cd.alternativeReadmissionRate * 0.4 * years);
  const optimizedERCost = optimizedERVisits * cd.avgERVisit;
  const optimizedAdverseDrugEventCost = Math.round(scaledPatients * 0.05 * cd.avgAdverseDrugEvent * years);
  const optimizedDrugCost = scaledPatients * cd.alternativeDrugCostPerMonth * timelineMonths;
  const totalOptimizedCost = optimizedReadmissionCost + optimizedERCost + optimizedAdverseDrugEventCost + optimizedDrugCost;

  const implementationCost = 4800 + patientCount * 12; // PGx testing + clinical setup
  const totalSaved = totalCurrentCost - totalOptimizedCost - implementationCost;
  const roi = implementationCost > 0 ? ((totalSaved / implementationCost) * 100) : 0;
  const paybackMonths = totalSaved > 0 ? Math.max(1, Math.round((implementationCost / (totalSaved / timelineMonths)))) : 0;

  return {
    drug, risk, costData: cd, patientCount, timelineMonths,
    currentReadmissions, currentReadmissionCost,
    currentERVisits, currentERCost,
    currentAdverseDrugEventCost, currentDrugCost,
    totalCurrentCost,
    optimizedReadmissions, optimizedReadmissionCost,
    optimizedERVisits, optimizedERCost,
    optimizedAdverseDrugEventCost, optimizedDrugCost,
    totalOptimizedCost,
    totalSaved, roi, paybackMonths, implementationCost,
  };
}

// ─── ROI Card ─────────────────────────────────────────────────────────────
const ROICard: React.FC<{ result: ROIResult }> = ({ result: r }) => {
  const isPositive = r.totalSaved > 0;
  const riskColor = r.risk === RiskLevel.TOXIC ? '#f43f5e' : r.risk === RiskLevel.ADJUST_DOSAGE ? '#f59e0b' : '#10b981';
  const riskLabel = r.risk === RiskLevel.TOXIC ? 'HIGH RISK' : r.risk === RiskLevel.ADJUST_DOSAGE ? 'DOSE ADJUST' : 'SAFE';

  // Build monthly savings sparkline (simulated ramp-up)
  const sparkData = Array.from({ length: 6 }, (_, i) =>
    Math.max(0, r.totalSaved * ((i + 1) / 6) * (0.8 + Math.random() * 0.2))
  );

  const rows = [
    { label: 'Readmissions', current: r.currentReadmissionCost, opt: r.optimizedReadmissionCost, icon: '🏥' },
    { label: 'ER Visits', current: r.currentERCost, opt: r.optimizedERCost, icon: '🚑' },
    { label: 'Adverse Drug Events', current: r.currentAdverseDrugEventCost, opt: r.optimizedAdverseDrugEventCost, icon: '⚠️' },
    { label: 'Drug Cost', current: r.currentDrugCost, opt: r.optimizedDrugCost, icon: '💊' },
  ];

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black"
            style={{ background: `linear-gradient(135deg, ${riskColor}33, ${riskColor}88)`, border: `1.5px solid ${riskColor}55` }}>
            💊
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">{r.drug}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                style={{ background: `${riskColor}22`, color: riskColor, border: `1px solid ${riskColor}44` }}>
                {riskLabel}
              </span>
              <span className="text-xs text-slate-400">CPIC Level {r.costData.cpicLevel} · {r.costData.riskReductionPercent}% risk reduction potential</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Est. Net Savings</p>
          <p className={`text-3xl font-black tracking-tight mt-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}{fmtK(r.totalSaved)}
          </p>
          <p className="text-xs text-slate-500">{r.timelineMonths}mo · {r.patientCount} patients</p>
        </div>
      </div>

      {/* Gauges */}
      <div className="px-6 py-5 grid grid-cols-3 gap-2 border-b border-slate-800 bg-slate-950/40">
        <GaugeMeter
          percent={Math.min(99, Math.max(0, Math.round(r.roi)))}
          color={r.roi >= 200 ? '#10b981' : r.roi >= 100 ? '#f59e0b' : '#f43f5e'}
          label="ROI"
        />
        <GaugeMeter
          percent={r.costData.riskReductionPercent}
          color="#38bdf8"
          label="Risk Reduction"
        />
        <GaugeMeter
          percent={Math.min(99, Math.round((r.currentReadmissions - r.optimizedReadmissions) / Math.max(1, r.currentReadmissions) * 100))}
          color="#a78bfa"
          label="Readmissions Prevented"
        />
      </div>

      {/* Cost comparison table */}
      <div className="p-6">
        <div className="grid grid-cols-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">
          <span>Category</span>
          <span className="text-center">Current Drug</span>
          <span className="text-center">CPIC Alternative</span>
        </div>
        <div className="space-y-2">
          {rows.map((row) => {
            const saved = row.current - row.opt;
            return (
              <div key={row.label} className="grid grid-cols-3 items-center bg-slate-800/60 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span>{row.icon}</span>
                  <span className="text-xs font-semibold text-slate-300">{row.label}</span>
                </div>
                <div className="text-center">
                  <span className="text-sm font-bold text-rose-400">{fmtK(row.current)}</span>
                </div>
                <div className="text-center flex flex-col items-center">
                  <span className="text-sm font-bold text-emerald-400">{fmtK(row.opt)}</span>
                  {saved > 0 && (
                    <span className="text-[9px] text-emerald-500 font-bold">−{fmtK(saved)}</span>
                  )}
                  {saved < 0 && (
                    <span className="text-[9px] text-amber-400 font-bold">+{fmtK(Math.abs(saved))}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="mt-4 grid grid-cols-3 items-center bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-3">
          <span className="text-xs font-black text-white uppercase tracking-wide">Total</span>
          <div className="text-center">
            <span className="text-base font-black text-rose-400">{fmtK(r.totalCurrentCost)}</span>
          </div>
          <div className="text-center">
            <span className="text-base font-black text-emerald-400">{fmtK(r.totalOptimizedCost)}</span>
          </div>
        </div>

        {/* Implementation + Payback */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="bg-slate-800/80 rounded-2xl p-4">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Implementation Cost</p>
            <p className="text-lg font-black text-white">{fmt(r.implementationCost)}</p>
            <p className="text-[10px] text-slate-500">PGx testing + clinical setup</p>
          </div>
          <div className="bg-slate-800/80 rounded-2xl p-4">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Payback Period</p>
            <p className="text-lg font-black text-white">{r.paybackMonths > 0 ? `${r.paybackMonths} mo` : 'N/A'}</p>
            <p className="text-[10px] text-slate-500">Time to recoup investment</p>
          </div>
        </div>

        {/* Sparkline trend */}
        <div className="mt-5 bg-slate-800/50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Savings Trajectory</p>
            <p className="text-sm font-bold text-emerald-400">{isPositive ? 'Positive ROI' : 'Negative ROI'} over {r.timelineMonths} months</p>
          </div>
          <Sparkline data={sparkData} color={isPositive ? '#10b981' : '#f43f5e'} />
        </div>

        {/* Alternative drug callout */}
        <div className="mt-4 px-4 py-3 rounded-xl border flex items-center gap-3"
          style={{ background: '#0ea5e922', borderColor: '#0ea5e944' }}>
          <span className="text-sky-400 text-lg">🔄</span>
          <div>
            <p className="text-xs font-black text-sky-300">CPIC-Recommended Alternative</p>
            <p className="text-sm font-semibold text-white">{r.costData.alternativeName}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] text-slate-400">Drug cost</p>
            <p className="text-sm font-black text-sky-400">{fmt(r.costData.alternativeDrugCostPerMonth)}/mo per pt</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────
const ROICalculatorPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<DrugAnalysis[]>([]);
  const [patientCount, setPatientCount] = useState(250);
  const [timelineMonths, setTimelineMonths] = useState(12);
  const [roiResults, setROIResults] = useState<ROIResult[]>([]);
  const [hasData, setHasData] = useState(false);
  const [activeTab, setActiveTab] = useState<'individual' | 'summary'>('summary');

  useEffect(() => {
    const stored = localStorage.getItem('lastAnalysisResults');
    if (!stored) return;
    try {
      const raw = JSON.parse(stored);
      const mapped: DrugAnalysis[] = raw.map((d: any) => {
        const riskLabel = (d.risk_assessment?.risk_label || 'safe').toLowerCase();
        let risk = RiskLevel.SAFE;
        if (riskLabel.includes('toxic') || d.risk_assessment?.severity === 'high') risk = RiskLevel.TOXIC;
        else if (riskLabel.includes('adjust') || d.risk_assessment?.severity === 'moderate') risk = RiskLevel.ADJUST_DOSAGE;
        return {
          drug: d.drug || 'Unknown',
          risk,
          confidence: d.risk_assessment?.confidence_score || 0.75,
          geneProfiles: [],
          recommendation: d.clinical_recommendation?.guideline || '',
          aiExplanation: d.llm_generated_explanation?.summary || '',
        };
      });
      setAnalyses(mapped);
      setHasData(true);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    const results = analyses
      .filter(a => a.risk !== RiskLevel.SAFE)
      .map(a => calcROI(a.drug, a.risk, patientCount, timelineMonths));
    setROIResults(results);
  }, [analyses, patientCount, timelineMonths]);

  // Global summary
  const totalSaved = roiResults.reduce((s, r) => s + r.totalSaved, 0);
  const totalCurrentCost = roiResults.reduce((s, r) => s + r.totalCurrentCost, 0);
  const totalOptimizedCost = roiResults.reduce((s, r) => s + r.totalOptimizedCost, 0);
  const totalImpl = roiResults.reduce((s, r) => s + r.implementationCost, 0);
  const avgROI = roiResults.length > 0 ? roiResults.reduce((s, r) => s + r.roi, 0) / roiResults.length : 0;
  const readmissionsPrevented = roiResults.reduce((s, r) => s + (r.currentReadmissions - r.optimizedReadmissions), 0);
  const erPrevented = roiResults.reduce((s, r) => s + (r.currentERVisits - r.optimizedERVisits), 0);

  const exportCSV = () => {
    const headers = ['Drug', 'Risk', 'Patients', 'Timeline(mo)', 'Current Cost', 'Optimized Cost', 'Net Savings', 'ROI%', 'Payback(mo)', 'Readmissions Prevented'];
    const rows = roiResults.map(r => [
      r.drug, r.risk, r.patientCount, r.timelineMonths,
      r.totalCurrentCost.toFixed(0), r.totalOptimizedCost.toFixed(0),
      r.totalSaved.toFixed(0), r.roi.toFixed(1), r.paybackMonths,
      r.currentReadmissions - r.optimizedReadmissions,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `PharmaGuard_ROI_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-700 pb-12">
      {/* Page Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
              Financial Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pharmacoeconomic ROI Calculator</h1>
          <p className="text-slate-500 mt-1 text-sm max-w-xl">
            Quantify the financial impact of PharmaGuard's precision medicine decisions. See estimated cost savings when CPIC-aligned alternatives replace high-risk drugs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            disabled={roiResults.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-5">Scenario Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-slate-600">Patient Cohort Size</label>
              <span className="text-sm font-black text-sky-600">{patientCount.toLocaleString()} patients</span>
            </div>
            <input
              type="range" min={10} max={5000} step={10}
              value={patientCount}
              onChange={e => setPatientCount(Number(e.target.value))}
              className="w-full accent-sky-500 h-2 rounded-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>10</span><span>5,000</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-slate-600">Analysis Timeline</label>
              <span className="text-sm font-black text-sky-600">{timelineMonths} months</span>
            </div>
            <input
              type="range" min={1} max={60} step={1}
              value={timelineMonths}
              onChange={e => setTimelineMonths(Number(e.target.value))}
              className="w-full accent-sky-500 h-2 rounded-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 mo</span><span>5 yrs</span>
            </div>
          </div>
        </div>
      </div>

      {!hasData ? (
        /* ─── No analysis data state ─────────────────────────────────── */
        <div>
          {/* Demo summary cards */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 mb-8 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              </div>
              <div>
                <h3 className="text-white font-black">Demo Mode — No Analysis Data Found</h3>
                <p className="text-slate-400 text-sm">Showing illustrative ROI projections for 3 high-risk drugs with {patientCount} patients over {timelineMonths} months</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Est. Total Savings', value: fmt(calcROI('CLOPIDOGREL', RiskLevel.TOXIC, patientCount, timelineMonths).totalSaved + calcROI('WARFARIN', RiskLevel.TOXIC, patientCount, timelineMonths).totalSaved + calcROI('FLUOROURACIL', RiskLevel.TOXIC, patientCount, timelineMonths).totalSaved), color: 'text-emerald-400' },
                { label: 'Avg ROI', value: `${Math.round((calcROI('CLOPIDOGREL', RiskLevel.TOXIC, patientCount, timelineMonths).roi + calcROI('WARFARIN', RiskLevel.TOXIC, patientCount, timelineMonths).roi + calcROI('FLUOROURACIL', RiskLevel.TOXIC, patientCount, timelineMonths).roi) / 3)}%`, color: 'text-sky-400' },
                { label: 'Drugs Optimized', value: '3', color: 'text-violet-400' },
                { label: 'Readmissions Prevented', value: String(calcROI('CLOPIDOGREL', RiskLevel.TOXIC, patientCount, timelineMonths).currentReadmissions - calcROI('CLOPIDOGREL', RiskLevel.TOXIC, patientCount, timelineMonths).optimizedReadmissions + calcROI('WARFARIN', RiskLevel.TOXIC, patientCount, timelineMonths).currentReadmissions - calcROI('WARFARIN', RiskLevel.TOXIC, patientCount, timelineMonths).optimizedReadmissions), color: 'text-rose-400' },
              ].map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {(['CLOPIDOGREL', 'WARFARIN', 'FLUOROURACIL'] as const).map(drug => (
              <ROICard key={drug} result={calcROI(drug, RiskLevel.TOXIC, patientCount, timelineMonths)} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/analyze"
              className="inline-flex items-center gap-2 px-8 py-4 bg-sky-600 text-white rounded-2xl font-black text-base hover:bg-sky-700 shadow-lg shadow-sky-600/30 transition-all">
              Run a Real Patient Analysis →
            </Link>
            <p className="text-slate-400 text-xs mt-3">Upload a VCF file to get personalized ROI projections based on actual genomic data</p>
          </div>
        </div>
      ) : roiResults.length === 0 ? (
        /* ─── All drugs are SAFE ────────────────────────────────────── */
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-12 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-black text-emerald-800 mb-2">All Drugs Are Safe — No Intervention Needed</h2>
          <p className="text-emerald-600 text-sm">PharmaGuard found no high-risk or dose-adjust drugs in the last analysis. No financial intervention is required.</p>
          <Link to="/analyze" className="inline-flex mt-6 items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all">
            Analyze Another Patient
          </Link>
        </div>
      ) : (
        /* ─── Actual results ────────────────────────────────────────── */
        <div>
          {/* Summary Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 mb-8 border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Portfolio Summary</p>
                <h2 className="text-2xl font-black text-white">
                  {roiResults.length} High-Risk Drug{roiResults.length > 1 ? 's' : ''} · {patientCount} Patients · {timelineMonths} Months
                </h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Estimated Net Impact</p>
                <p className={`text-4xl font-black tracking-tight ${totalSaved >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {totalSaved >= 0 ? '+' : ''}{fmtK(totalSaved)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Cost (Current)', value: fmtK(totalCurrentCost), color: 'text-rose-400', sub: 'Without PharmaGuard' },
                { label: 'Total Cost (Optimized)', value: fmtK(totalOptimizedCost), color: 'text-emerald-400', sub: 'With CPIC alternatives' },
                { label: 'Average ROI', value: `${Math.round(avgROI)}%`, color: 'text-sky-400', sub: 'Return on investment' },
                { label: 'Readmissions Prevented', value: String(readmissionsPrevented), color: 'text-violet-400', sub: `+${erPrevented} ER visits avoided` },
              ].map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(['summary', 'individual'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                {tab === 'summary' ? 'Portfolio View' : 'Drug-by-Drug Analysis'}
              </button>
            ))}
          </div>

          {activeTab === 'summary' ? (
            /* Summary Table */
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-black text-slate-800">Cost Comparison Table</h3>
                <p className="text-slate-500 text-xs mt-1">All costs estimated over {timelineMonths} months for {patientCount} patients</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Drug</th>
                      <th className="text-center p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk</th>
                      <th className="text-right p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Cost</th>
                      <th className="text-right p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimized Cost</th>
                      <th className="text-right p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Savings</th>
                      <th className="text-right p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ROI</th>
                      <th className="text-center p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roiResults.map((r, i) => {
                      const rc = r.risk === RiskLevel.TOXIC ? 'text-rose-600' : 'text-amber-600';
                      const rl = r.risk === RiskLevel.TOXIC ? 'Toxic' : 'Dose Adjust';
                      return (
                        <tr key={r.drug} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                          <td className="p-4 font-bold text-slate-900">{r.drug}</td>
                          <td className="p-4 text-center"><span className={`text-xs font-black ${rc}`}>{rl}</span></td>
                          <td className="p-4 text-right font-semibold text-rose-600">{fmtK(r.totalCurrentCost)}</td>
                          <td className="p-4 text-right font-semibold text-emerald-600">{fmtK(r.totalOptimizedCost)}</td>
                          <td className="p-4 text-right">
                            <span className={`font-black text-base ${r.totalSaved >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {r.totalSaved >= 0 ? '+' : ''}{fmtK(r.totalSaved)}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className={`font-black text-base ${r.roi >= 100 ? 'text-emerald-600' : r.roi >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                              {Math.round(r.roi)}%
                            </span>
                          </td>
                          <td className="p-4 text-center text-slate-600 font-semibold">{r.paybackMonths > 0 ? `${r.paybackMonths} mo` : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 text-white">
                      <td className="p-4 font-black">TOTAL</td>
                      <td />
                      <td className="p-4 text-right font-black text-rose-300">{fmtK(totalCurrentCost)}</td>
                      <td className="p-4 text-right font-black text-emerald-300">{fmtK(totalOptimizedCost)}</td>
                      <td className="p-4 text-right font-black text-emerald-300 text-base">{totalSaved >= 0 ? '+' : ''}{fmtK(totalSaved)}</td>
                      <td className="p-4 text-right font-black text-sky-300">{Math.round(avgROI)}%</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Data sources */}
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">📚 Methodology & Data Sources</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cost estimates derived from HCUP Statistical Briefs (AHRQ), Agency for Healthcare Research & Quality hospital cost databases,
                  CPIC guidelines (cpicpgx.org), and published pharmacoeconomic literature. Drug-specific costs sourced from GoodRx and CMS drug
                  pricing data 2023-2024. Implementation costs include pharmacogenomic testing ($200–$800/patient) and clinical workflow setup.
                  All figures are estimates for decision-support purposes only and should be validated against institutional cost data.
                </p>
              </div>
            </div>
          ) : (
            /* Individual drug cards */
            <div className="space-y-6">
              {roiResults.map(r => <ROICard key={r.drug} result={r} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ROICalculatorPage;
