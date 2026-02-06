
import React, { useState } from 'react';
import { FullPatientEntry } from '../constants';
import { RiskLevel } from '../types';

interface PatientListProps {
  patients: FullPatientEntry[];
  onSelectPatient: (entry: FullPatientEntry) => void;
}

const PatientList: React.FC<PatientListProps> = ({ patients, onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(p => 
    p.result.classification.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW: return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case RiskLevel.MODERATE: return 'text-amber-500 bg-amber-50 border-amber-100';
      case RiskLevel.HIGH: return 'text-rose-500 bg-rose-50 border-rose-100';
      default: return 'text-rose-700 bg-rose-100 border-rose-200';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row gap-8 items-center justify-between bg-white p-6 rounded-[2rem] shadow-xl border border-slate-50">
        <div className="relative w-full md:w-1/2">
          <input 
            type="text" 
            placeholder="Search my clinical history..." 
            className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <div className="flex gap-6 items-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database Sync Active</p>
           <div className="px-5 py-2.5 bg-slate-900 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
             Total Records: {patients.length}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPatients.map((p, idx) => (
          <div 
            key={idx}
            onClick={() => onSelectPatient(p)}
            className="group bg-white rounded-[3rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col h-full"
          >
            {/* Dynamic Status Header */}
            <div className={`h-3 w-full bg-gradient-to-r ${p.record.hemoglobin < 12 ? 'from-rose-500 to-rose-700' : 'from-emerald-400 to-teal-500'}`}></div>
            
            <div className="p-8 flex flex-col flex-1 relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">
                     {new Date(p.record.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                   </p>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-rose-600 transition-colors">
                     {p.result.classification}
                   </h3>
                </div>
                <div className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest shadow-sm ${getRiskColor(p.result.riskLevel)}`}>
                  {p.result.riskLevel}
                </div>
              </div>

              {/* Biometric Snapshot Card */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 text-center group-hover:bg-rose-50/50 transition-colors">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hemoglobin</p>
                   <p className={`text-2xl font-black ${p.record.hemoglobin < 12 ? 'text-rose-600' : 'text-teal-600'}`}>
                     {p.record.hemoglobin.toFixed(1)}
                   </p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase">g/dL</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 text-center group-hover:bg-indigo-50/50 transition-colors">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">MCV Indices</p>
                   <p className="text-2xl font-black text-slate-900">{p.record.mcv}</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase">fL</p>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Validated</span>
                </div>
                <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                  Open Report
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </div>
              </div>
            </div>
            
            {/* Visual Flux Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity -z-0"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientList;
