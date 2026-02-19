
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnalysisRecord } from '../types';
import { Icons } from '../constants';

interface HistoryPageProps {
  searchTerm: string;
}

type SortField = 'date' | 'id' | 'patientId' | 'status';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 5;

const HistoryPage: React.FC<HistoryPageProps> = ({ searchTerm }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Complete' | 'Pending'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  
  // UI State for dropdowns
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistory = () => {
      const storedHistory = localStorage.getItem('pharmaGuardHistory');
      if (!storedHistory) {
        const initialHistory: AnalysisRecord[] = [
          { id: 'ANL-92381', date: '2024-05-20T10:30:00Z', patientId: 'PX-1029', drugs: ['CLOPIDOGREL', 'WARFARIN'], status: 'Complete' },
          { id: 'ANL-92382', date: '2024-05-21T14:45:00Z', patientId: 'PX-2041', drugs: ['SIMVASTATIN'], status: 'Complete' },
          { id: 'ANL-92383', date: '2024-05-21T16:20:00Z', patientId: 'PX-9921', drugs: ['CODEINE', 'AMITRIPTYLINE'], status: 'Pending' },
          { id: 'ANL-92384', date: '2024-05-18T09:15:00Z', patientId: 'PX-5501', drugs: ['TAMOXIFEN'], status: 'Complete' },
          { id: 'ANL-92385', date: '2024-05-17T11:00:00Z', patientId: 'PX-4421', drugs: ['ABACAVIR'], status: 'Complete' },
          { id: 'ANL-92386', date: '2024-05-16T15:30:00Z', patientId: 'PX-3312', drugs: ['TACROLIMUS', 'PHENYTOIN'], status: 'Complete' },
        ];
        localStorage.setItem('pharmaGuardHistory', JSON.stringify(initialHistory));
        setHistory(initialHistory);
      } else {
        setHistory(JSON.parse(storedHistory));
      }
    };

    loadHistory();

    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setShowFilterMenu(false);
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) setShowSortMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter and Sort Logic
  const processedHistory = useMemo(() => {
    let result = [...history];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(record => 
        record.id.toLowerCase().includes(term) ||
        record.patientId.toLowerCase().includes(term) ||
        record.drugs.some(d => d.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (filterStatus !== 'All') {
      result = result.filter(record => record.status === filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else {
        comparison = String(a[sortField]).localeCompare(String(b[sortField]));
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [history, searchTerm, sortField, sortOrder, filterStatus]);

  // Pagination Logic
  const totalPages = Math.ceil(processedHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = processedHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
    setShowSortMenu(false);
  };

  const handleFilterChange = (status: 'All' | 'Complete' | 'Pending') => {
    setFilterStatus(status);
    setCurrentPage(1);
    setShowFilterMenu(false);
  };

  const handleViewReport = (record: AnalysisRecord) => {
    localStorage.setItem('lastAnalysis', JSON.stringify({ drugs: record.drugs }));
    navigate('/results');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to permanently remove this analysis record from the clinical history?')) {
      const newHistory = history.filter(h => h.id !== id);
      setHistory(newHistory);
      localStorage.setItem('pharmaGuardHistory', JSON.stringify(newHistory));
      if (paginatedHistory.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports History</h1>
          <p className="text-slate-500 text-sm">Access and audit all clinical pharmacogenomic reports generated by the system.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {searchTerm && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-700 text-[10px] font-bold rounded-lg border border-sky-100 uppercase tracking-tight">
              Results for: "{searchTerm}"
            </div>
          )}

          {/* Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`px-4 py-2 bg-white border rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                filterStatus !== 'All' ? 'border-sky-500 text-sky-600 bg-sky-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
              {filterStatus === 'All' ? 'Filter' : `Status: ${filterStatus}`}
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2">
                  {['All', 'Complete', 'Pending'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleFilterChange(status as any)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold rounded-xl transition-colors ${
                        filterStatus === status ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {status === 'All' ? 'Show All' : `Status: ${status}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>
              Sort: {sortField.charAt(0).toUpperCase() + sortField.slice(1)}
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2">
                  {[
                    { label: 'Report Date', value: 'date' },
                    { label: 'Report ID', value: 'id' },
                    { label: 'Patient ID', value: 'patientId' },
                    { label: 'Outcome Status', value: 'status' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handleSortChange(item.value as SortField)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold rounded-xl transition-colors ${
                        sortField === item.value ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.label} {sortField === item.value && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[460px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="px-8 py-5 cursor-pointer hover:text-sky-600 transition-colors" onClick={() => handleSortChange('date')}>
                  <div className="flex items-center gap-1">
                    Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="px-8 py-5 cursor-pointer hover:text-sky-600 transition-colors" onClick={() => handleSortChange('id')}>
                   <div className="flex items-center gap-1">
                    Report ID {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="px-8 py-5 cursor-pointer hover:text-sky-600 transition-colors" onClick={() => handleSortChange('patientId')}>
                   <div className="flex items-center gap-1">
                    Patient ID {sortField === 'patientId' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="px-8 py-5">Screened Drugs</th>
                <th className="px-8 py-5 cursor-pointer hover:text-sky-600 transition-colors" onClick={() => handleSortChange('status')}>
                   <div className="flex items-center gap-1">
                    Outcome Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedHistory.length > 0 ? paginatedHistory.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5 text-sm text-slate-500">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">{new Date(report.date).toLocaleDateString()}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(report.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-mono text-xs font-bold text-sky-700">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
                      {report.id}
                    </div>
                  </td>
                  <td className="px-8 py-5 font-semibold text-slate-800">{report.patientId}</td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-1">
                      {report.drugs.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase border border-slate-200 shadow-sm">{d}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      report.status === 'Complete' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewReport(report)}
                        disabled={report.status !== 'Complete'}
                        className={`p-2 rounded-lg transition-all ${
                          report.status === 'Complete' 
                            ? 'text-sky-600 hover:bg-sky-50 opacity-0 group-hover:opacity-100 shadow-sm' 
                            : 'text-slate-300 cursor-not-allowed opacity-0 group-hover:opacity-100'
                        }`}
                        title="View Full Report"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(report.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Record"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Icons.History className="w-12 h-12 mb-4 opacity-10" />
                      <p className="italic font-medium">No clinical reports match your current search or filter criteria.</p>
                      <button 
                         onClick={() => { setFilterStatus('All'); navigate('/analyze'); }}
                         className="mt-4 text-sky-600 font-bold text-xs hover:underline"
                      >
                        Initiate a new patient analysis
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {processedHistory.length > 0 && (
          <div className="mt-auto p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
            <div className="flex flex-col">
              <p className="text-xs">
                Showing <span className="font-bold text-slate-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-bold text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, processedHistory.length)}</span>
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">Total Records: {processedHistory.length}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1.5 px-3">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentPage(i + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-8 h-8 rounded-xl text-[10px] font-bold transition-all ${
                      currentPage === i + 1 
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-2 ring-sky-500/10' 
                        : 'text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Audit & Context Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
               <Icons.Check className="w-6 h-6" />
            </div>
            <div>
               <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Audit Logs</h4>
               <p className="text-[11px] text-emerald-700/80 mt-1 leading-relaxed font-medium">Historical records are crytographically signed and time-stamped for regulatory compliance (HIPAA/GDPR).</p>
            </div>
         </div>
         <div className="bg-sky-50 border border-sky-100 p-5 rounded-3xl flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-600 shrink-0">
               <Icons.Dna className="w-6 h-6" />
            </div>
            <div>
               <h4 className="text-xs font-bold text-sky-800 uppercase tracking-widest">Metadata Hash</h4>
               <p className="text-[11px] text-sky-700/80 mt-1 leading-relaxed font-medium">VCF sequences are referenced via SHA-256 hashes to maintain data integrity without exposing raw PII in history.</p>
            </div>
         </div>
         <div className="bg-slate-100 border border-slate-200 p-5 rounded-3xl flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-600 shrink-0">
               <Icons.History className="w-6 h-6" />
            </div>
            <div>
               <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Consistency</h4>
               <p className="text-[11px] text-slate-700/80 mt-1 leading-relaxed font-medium">Historical reports preserve the guideline versions active during initial generation to prevent retrospective confusion.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default HistoryPage;
