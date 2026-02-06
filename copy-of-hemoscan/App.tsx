
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ScreeningForm from './components/ScreeningForm';
import ResultsDashboard from './components/ResultsDashboard';
import PatientList from './components/PatientList';
import LandingPage from './components/LandingPage';
import { PatientRecord, ScreeningResult } from './types';
import { analyzeAnemiaRisk } from './services/geminiService';
import { MOCK_PATIENTS, FullPatientEntry } from './constants';

type AppTab = 'home' | 'screening' | 'database' | 'analytics' | 'profile';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [tabHistory, setTabHistory] = useState<AppTab[]>(['home']);
  const [activeResult, setActiveResult] = useState<ScreeningResult | null>(null);
  const [currentRecord, setCurrentRecord] = useState<PatientRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [patientDatabase, setPatientDatabase] = useState<FullPatientEntry[]>(MOCK_PATIENTS);

  const handleTabChange = (tab: AppTab) => {
    if (tab !== activeTab) {
      setTabHistory(prev => [...prev, tab]);
      setActiveTab(tab);
    }
  };

  const handleGoBack = () => {
    if (tabHistory.length > 1) {
      const newHistory = [...tabHistory];
      newHistory.pop();
      const lastTab = newHistory[newHistory.length - 1];
      setTabHistory(newHistory);
      setActiveTab(lastTab);
    } else {
      setActiveTab('home');
    }
  };

  const handleScreening = async (data: PatientRecord) => {
    setIsLoading(true);
    try {
      const result = await analyzeAnemiaRisk(data);
      const newEntry: FullPatientEntry = { record: data, result };
      
      setCurrentRecord(data);
      setActiveResult(result);
      setPatientDatabase(prev => [newEntry, ...prev]);
      
      setTimeout(() => {
        window.scrollTo({ top: 600, behavior: 'smooth' });
      }, 500);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Analysis engine encountered an error. Please verify input data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPatient = (entry: FullPatientEntry) => {
    setCurrentRecord(entry.record);
    setActiveResult(entry.result);
    handleTabChange('screening');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const getBackgroundClass = () => {
    switch (activeTab) {
      case 'home': return 'bg-white';
      case 'screening': return 'bg-gradient-to-br from-slate-50/50 via-rose-50/20 to-indigo-50/30';
      case 'database': return 'bg-gradient-to-tr from-indigo-50/30 via-slate-50/40 to-rose-50/20';
      case 'profile': return 'bg-slate-50';
      default: return 'bg-slate-50';
    }
  };

  const renderContent = () => {
    if (activeTab === 'home') {
      return <LandingPage onStart={() => handleTabChange('screening')} />;
    }

    const navigationHeader = (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-6 flex items-center justify-between">
        <button 
          onClick={handleGoBack}
          className="group flex items-center gap-3 text-slate-400 hover:text-rose-600 transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <div className="w-10 h-10 rounded-2xl border-2 border-slate-100 flex items-center justify-center group-hover:border-rose-200 group-hover:bg-rose-50 group-hover:scale-110 transition-all shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
          </div>
          <span>Back</span>
        </button>
        <div className="flex gap-2">
           <div className={`w-2 h-2 rounded-full ${activeTab === 'screening' ? 'bg-rose-500' : 'bg-slate-200'}`}></div>
           <div className={`w-2 h-2 rounded-full ${activeTab === 'database' ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
           <div className={`w-2 h-2 rounded-full ${activeTab === 'profile' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
        </div>
      </div>
    );

    if (activeTab === 'profile') {
      return (
        <>
          {navigationHeader}
          <div className="max-w-4xl mx-auto px-4 pb-20 animate-in fade-in zoom-in duration-500">
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden relative">
              <div className="h-48 bg-slate-900 relative">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="absolute -bottom-16 left-12 w-32 h-32 rounded-[2.5rem] border-8 border-white overflow-hidden shadow-xl bg-white">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex" alt="Patient" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="pt-24 pb-16 px-16 relative z-10">
                <div className="flex justify-between items-start mb-12">
                    <div>
                      <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Alex Johnson</h1>
                      <p className="text-rose-600 font-black uppercase tracking-widest text-[10px]">My Health Passport • Verified Profile</p>
                    </div>
                    <div className="flex gap-4">
                      <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg active:scale-95">Edit Identity</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <ProfileStat label="Historical Records" value={patientDatabase.length} color="text-indigo-600" />
                    <ProfileStat label="Wellness Score" value="Optimal" color="text-emerald-500" />
                    <ProfileStat label="Clinical ID" value="#P-9982" color="text-slate-400" />
                </div>
                <div className="space-y-8">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-50 pb-4 italic">Biometric Summary</h3>
                    <div className="grid grid-cols-2 gap-y-10">
                      <InfoItem label="Genetic Blood Type" value="O Negative" />
                      <InfoItem label="Primary Care Provider" value="Dr. Sarah Mitchell" />
                      <InfoItem label="Last Baseline" value="December 12, 2023" />
                      <InfoItem label="Treatment Plan" value="Oral Ferrous Fumarate (300mg)" />
                    </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        {navigationHeader}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {activeTab === 'database' ? (
              <div className="col-span-12">
                <div className="mb-16 text-center max-w-2xl mx-auto">
                  <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">My Vitality Archives</h1>
                  <p className="text-slate-500 font-bold italic text-lg leading-relaxed">A molecular timeline of your hematology metrics and recovery milestones.</p>
                </div>
                <PatientList patients={patientDatabase} onSelectPatient={handleSelectPatient} />
              </div>
            ) : (
              <>
                <div className="lg:col-span-5 sticky top-28">
                  <ScreeningForm onSubmit={handleScreening} isLoading={isLoading} />
                  <div className="mt-8 grid grid-cols-2 gap-5">
                    <Badge icon="🛡️" label="Secure" text="End-to-end data encryption" />
                    <Badge icon="🧠" label="AI Engine" text="Predictive Hematology Model" />
                  </div>
                </div>
                <div className="lg:col-span-7">
                  {activeResult && currentRecord ? (
                    <ResultsDashboard result={activeResult} currentHemoglobin={currentRecord.hemoglobin} currentMCV={currentRecord.mcv} />
                  ) : (
                    <div className="h-full min-h-[650px] border-4 border-dashed border-slate-100 rounded-[4rem] bg-white/40 backdrop-blur-xl flex flex-col items-center justify-center p-16 text-center group overflow-hidden relative shadow-inner">
                      <div className="absolute -top-32 -right-32 w-80 h-80 bg-rose-50/50 rounded-full opacity-30 animate-pulse"></div>
                      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-50/50 rounded-full opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
                      
                      <div className="w-40 h-40 bg-white rounded-[3rem] flex items-center justify-center text-slate-200 shadow-2xl shadow-slate-200/50 border-2 border-slate-50 group-hover:scale-110 transition-transform duration-700 mb-10 relative z-10">
                        <svg className="w-20 h-20 text-slate-100 group-hover:text-rose-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2c-5.33 4.55-8 9.33-8 13.5 0 4.5 3.58 8.1 8 8.1s8-3.6 8-8.1c0-4.17-2.67-8.95-8-13.5z" />
                        </svg>
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4 relative z-10">Health Engine Ready</h3>
                      <p className="text-slate-400 max-w-sm font-bold text-base leading-relaxed relative z-10 italic">
                        Generate your latest clinical profile by entering your blood indices or uploading your lab report.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${getBackgroundClass()} relative overflow-hidden font-sans`}>
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
      {renderContent()}
      
      <footer className="bg-slate-950 py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(244,63,94,0.1),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-900/40">
                   <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-5.33 4.55-8 9.33-8 13.5 0 4.5 3.58 8.1 8 8.1s8-3.6 8-8.1c0-4.17-2.67-8.95-8-13.5z"/></svg>
                </div>
                <span className="text-3xl font-black text-white tracking-tighter">HemoScan <span className="text-rose-500 italic font-black">AI</span></span>
              </div>
              <p className="text-slate-500 font-bold max-w-sm text-sm">
                Next-generation molecular analysis for personalized patient health management.
              </p>
            </div>
            <div className="flex gap-10">
               <div className="text-right">
                 <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-2">Global Access</p>
                 <p className="text-white font-bold">24/7 Digital Monitoring</p>
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ProfileStat = ({ label, value, color }: any) => (
  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:scale-105 transition-all shadow-sm">
    <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em]">{label}</p>
    <p className={`text-4xl font-black ${color} tracking-tighter`}>{value}</p>
  </div>
);

const InfoItem = ({ label, value }: any) => (
  <div className="group">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-lg font-bold text-slate-700 group-hover:text-rose-600 transition-colors">{value}</p>
  </div>
);

const Badge = ({ icon, label, text }: any) => (
  <div className="p-6 bg-white rounded-[2rem] border-2 border-slate-50 shadow-sm hover:border-indigo-100 hover:shadow-xl transition-all group">
    <div className="flex items-center gap-3 mb-2">
       <span className="text-2xl group-hover:scale-125 transition-transform">{icon}</span>
       <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-xs font-bold text-slate-500 leading-relaxed">{text}</p>
  </div>
);

export default App;
