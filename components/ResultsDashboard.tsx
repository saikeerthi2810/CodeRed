
import React from 'react';
import { ScreeningResult, RiskLevel } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_HISTORICAL_DATA, COLORS } from '../constants';

interface ResultsDashboardProps {
  result: ScreeningResult;
  currentHemoglobin: number;
  currentMCV: number;
  onReload?: () => void;
  isReloading?: boolean;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ 
  result, 
  currentHemoglobin, 
  currentMCV, 
  onReload,
  isReloading = false 
}) => {
  const prevData = MOCK_HISTORICAL_DATA[MOCK_HISTORICAL_DATA.length - 1];
  const prevHb = prevData.hemoglobin;
  const hbVariation = currentHemoglobin - prevHb;
  const variationPercent = ((hbVariation / prevHb) * 100).toFixed(1);
  
  const isDosageReviewNeeded = 
    (Number(variationPercent) < -10) || 
    (currentHemoglobin < 10 && prevHb < 10) ||
    (Math.abs(currentMCV - prevData.mcv) > 5);

  const chartData = [...MOCK_HISTORICAL_DATA, { date: 'Current', hemoglobin: currentHemoglobin, score: result.confidenceScore * 100 }];

  const getRiskStyles = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW: return { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-500', gradient: 'from-emerald-400 to-teal-500' };
      case RiskLevel.MODERATE: return { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-500', gradient: 'from-amber-400 to-orange-500' };
      case RiskLevel.HIGH: return { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100', dot: 'bg-rose-500', gradient: 'from-rose-400 to-rose-600' };
      case RiskLevel.CRITICAL: return { color: 'text-rose-900', bg: 'bg-rose-100', border: 'border-rose-200', dot: 'bg-rose-600', gradient: 'from-rose-600 to-slate-900' };
      default: return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', dot: 'bg-slate-400', gradient: 'from-slate-400 to-slate-600' };
    }
  };

  const styles = getRiskStyles(result.riskLevel);

  return (
    <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ${isReloading ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
      
      {/* Header Actions */}
      <div className="flex justify-end items-center gap-4">
        <button 
          onClick={onReload}
          disabled={isReloading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm group active:scale-95"
        >
          <svg className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ${isReloading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isReloading ? 'Syncing...' : 'Re-sync Analysis'}
        </button>
      </div>

      {/* Dosage Review Alert Banner */}
      {isDosageReviewNeeded && (
        <div className="bg-rose-600 p-6 rounded-[2rem] shadow-2xl shadow-rose-200 flex items-center justify-between text-white animate-pulse-soft border-b-4 border-rose-800">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl">⚠️</div>
              <div>
                <h4 className="text-xl font-black tracking-tight">Medication Dosage Review Suggested</h4>
                <p className="text-rose-100 text-sm font-bold">Significant biometric shift detected ({variationPercent}% variation). Please consult your physician.</p>
              </div>
           </div>
           <button className="px-6 py-2.5 bg-white text-rose-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 transition-colors">Action Required</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Findings Card */}
        <div className="lg:col-span-5 bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className={`absolute -top-4 -right-4 w-32 h-32 opacity-20 rounded-full bg-gradient-to-br ${styles.gradient} group-hover:scale-125 transition-transform duration-700`}></div>
          <div className="relative z-10">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest mb-6 ${styles.bg} ${styles.color} ${styles.border}`}>
              <span className={`w-2 h-2 rounded-full ${styles.dot}`}></span>
              {result.riskLevel} Health Status
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Diagnosis Type</h3>
            <p className="text-3xl font-black text-slate-900 leading-tight mb-8">{result.classification}</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">AI Confidence</span>
                <span className={`text-sm font-black ${styles.color}`}>{(result.confidenceScore * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100 p-0.5">
                <div className={`h-full bg-gradient-to-r ${styles.gradient} rounded-full transition-all duration-1500`} style={{ width: `${result.confidenceScore * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Variations Analysis Panel */}
        <div className="lg:col-span-7 bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-xl shadow-slate-200/40 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Variation Analytics</h3>
            </div>
            <div className="flex items-end gap-6 mb-8 bg-slate-50 p-6 rounded-[2rem]">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Prior Record</p>
                <p className="text-3xl font-black text-slate-400">{prevHb.toFixed(1)}</p>
              </div>
              <div className="pb-2 text-indigo-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12h14"/></svg>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Active Record</p>
                <p className="text-3xl font-black text-slate-900">{currentHemoglobin.toFixed(1)}</p>
              </div>
              <div className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-2xl border ${Number(variationPercent) >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                <span className="text-lg font-black">{variationPercent}%</span>
                <svg className={`w-5 h-5 ${Number(variationPercent) >= 0 ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
              </div>
            </div>
            <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100">
               <p className="text-slate-600 leading-relaxed font-bold text-xs italic">
                 {result.analysisSummary}
               </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recovery Trend Graph */}
        <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-xl shadow-slate-200/40">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">Clinical Recovery Path</h3>
              <p className="text-[10px] font-bold text-slate-400">Hematology index evolution vs time</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.rose} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.rose} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 'bold' }} />
                <YAxis hide domain={[8, 16]} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                <Area type="monotone" dataKey="hemoglobin" stroke={COLORS.rose} strokeWidth={5} fillOpacity={1} fill="url(#colorHb)" animationDuration={2000}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vital Health Metrics Grid */}
        <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-xl shadow-slate-200/40">
           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-10">Metabolic Vitality Index</h3>
           <div className="grid grid-cols-2 gap-x-8 gap-y-12">
              <HealthScore label="Systemic Energy" score={Number(variationPercent) >= 0 ? 82 : 44} icon="⚡" color={COLORS.emerald} />
              <HealthScore label="O2 Efficiency" score={currentHemoglobin > 12 ? 90 : 55} icon="🌬️" color={COLORS.indigo} />
              <HealthScore label="Cell Longevity" score={72} icon="🧬" color={COLORS.rose} />
              <HealthScore label="Mineral Levels" score={60} icon="🛡️" color={COLORS.amber} />
           </div>
           
           <div className="mt-12 p-5 bg-slate-900 rounded-[2rem] border border-slate-800 flex items-center gap-5 group hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 bg-rose-600 rounded-2xl shadow-lg flex items-center justify-center text-2xl animate-bounce">💊</div>
              <div>
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Treatment Monitoring</p>
                <p className="text-xs text-white font-bold leading-tight">
                   {isDosageReviewNeeded 
                     ? "CRITICAL: Arrange a follow-up consultation for treatment recalibration." 
                     : "STABLE: Continue current regimen as directed by your clinical team."}
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const HealthScore: React.FC<{ label: string; score: number; icon: string; color: string }> = ({ label, score, icon, color }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-sm shadow-inner">{icon}</div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-end gap-3">
      <span className="text-3xl font-black text-slate-900 leading-none">{score}%</span>
      <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden mb-1 border border-slate-200">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, backgroundColor: color }}></div>
      </div>
    </div>
  </div>
);

export default ResultsDashboard;
