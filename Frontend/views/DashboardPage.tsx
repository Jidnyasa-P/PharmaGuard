
import React from 'react';
import { User, AnalysisRecord } from '../types';
import { Icons } from '../constants';
import { Link } from 'react-router-dom';

interface DashboardPageProps {
  user: User;
  searchTerm: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, searchTerm }) => {
  const stats = [
    { label: 'Total Analyses', value: '1,284', change: '+12%', icon: <Icons.Dashboard className="text-sky-500" /> },
    { label: 'High Risk Patients', value: '42', change: '-4%', icon: <Icons.Alert className="text-rose-500" /> },
    { label: 'Genes Detected', value: '84', change: 'Stable', icon: <Icons.Dna className="text-emerald-500" /> },
    { label: 'Reports Generated', value: '3,102', change: '+24%', icon: <Icons.History className="text-indigo-500" /> },
  ];

  const recentActivity: AnalysisRecord[] = [
    { id: 'ANL-92381', date: '2024-05-20', patientId: 'PX-1029', drugs: ['Clopidogrel', 'Warfarin'], status: 'Complete' },
    { id: 'ANL-92382', date: '2024-05-21', patientId: 'PX-2041', drugs: ['Simvastatin'], status: 'Complete' },
    { id: 'ANL-92383', date: '2024-05-21', patientId: 'PX-9921', drugs: ['Codeine', 'Amitriptyline'], status: 'Pending' },
    { id: 'ANL-92384', date: '2024-05-18', patientId: 'PX-5501', drugs: ['Tamoxifen'], status: 'Complete' },
  ];

  const filteredActivity = recentActivity.filter(record => 
    record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.drugs.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="text-slate-500">System online. You have {recentActivity.filter(r => r.status === 'Pending').length} pending analysis reviews today.</p>
        </div>
        {searchTerm && (
          <div className="text-xs bg-sky-50 text-sky-700 px-3 py-1 rounded-full font-bold border border-sky-100 flex items-center gap-2">
            Filtering for: "{searchTerm}"
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                {stat.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                stat.change.startsWith('+') ? 'bg-emerald-100 text-emerald-600' : 
                stat.change === 'Stable' ? 'bg-slate-100 text-slate-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-lg">Recent Analyses</h2>
            <Link to="/history" className="text-sky-600 text-sm font-semibold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Analysis ID</th>
                  <th className="px-6 py-4">Patient ID</th>
                  <th className="px-6 py-4">Drugs Checked</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActivity.length > 0 ? filteredActivity.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-600">{row.id}</td>
                    <td className="px-6 py-4 font-medium">{row.patientId}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {row.drugs.map((d, i) => (
                          <span key={i} className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded text-[10px] font-bold border border-sky-100 uppercase">{d}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        row.status === 'Complete' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No matching records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-sky-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl shadow-sky-600/20">
            <h3 className="font-bold text-lg mb-2">New Analysis</h3>
            <p className="text-sky-100 text-sm mb-6">Process a new VCF file to generate genomic insights instantly.</p>
            <Link 
              to="/analyze" 
              className="block w-full text-center bg-white text-sky-700 font-bold py-3 rounded-xl hover:bg-sky-50 transition-colors shadow-lg"
            >
              Start New Patient
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Quick Insights</h3>
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-amber-800 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                  <Icons.Alert className="w-3 h-3" /> Urgent Alert
                </p>
                <p className="text-amber-900 text-sm">3 patients with CYP2C19 Poor Metabolizer phenotypes found in cohort.</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-indigo-800 text-xs font-bold uppercase mb-1">Update Available</p>
                <p className="text-indigo-900 text-sm">CPIC guidelines v2.4 (May 2024) have been integrated into AI reasoning.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
