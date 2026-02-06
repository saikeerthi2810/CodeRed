
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import ScreeningForm from './components/ScreeningForm';
import ResultsDashboard from './components/ResultsDashboard';
import PatientList from './components/PatientList';
import LandingPage from './components/LandingPage';
import BookTest from './components/BookTest';
import UserProfile from './components/UserProfile';
import { PatientRecord, ScreeningResult } from './types';
import { analyzeAnemiaRisk } from './services/geminiService';
import { savePatientReport, generateRecoveryPath } from './services/reportService';
import { MOCK_PATIENTS, FullPatientEntry } from './constants';
import { trainRidgeClassifier } from './services/mlService';

type AppTab = 'home' | 'screening' | 'database' | 'analytics' | 'profile' | 'booktest';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [tabHistory, setTabHistory] = useState<AppTab[]>(['home']);
  const [activeResult, setActiveResult] = useState<ScreeningResult | null>(null);
  const [currentRecord, setCurrentRecord] = useState<PatientRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [patientDatabase, setPatientDatabase] = useState<FullPatientEntry[]>(MOCK_PATIENTS);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Load user's patient reports if logged in
      if (session?.user) {
        loadPatientReports(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadPatientReports(session.user.id);
      }
    });

    // Train ML model on app startup
    trainRidgeClassifier().catch(err => {
      console.error('❌ ML model training failed:', err);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadPatientReports = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('patient_reports')
        .select('*')
        .eq('user_id', userId)
        .order('test_date', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const entries: FullPatientEntry[] = data.map(report => ({
          record: {
            id: report.id,
            name: report.name,
            age: report.age,
            gender: report.gender,
            hemoglobin: parseFloat(report.hemoglobin),
            mcv: parseFloat(report.mcv),
            mch: parseFloat(report.mch),
            mchc: parseFloat(report.mchc),
            date: report.test_date
          },
          result: {
            classification: report.classification,
            confidenceScore: parseFloat(report.confidence_score || 0.85),
            riskLevel: report.risk_level,
            analysisSummary: report.analysis_summary || 'Analysis completed.'
          }
        }));
        setPatientDatabase(entries);
        console.log(`✅ Loaded ${entries.length} patient reports from database`);
      } else {
        console.log('ℹ️ No saved reports found, using sample data');
        setPatientDatabase(MOCK_PATIENTS);
      }
    } catch (error) {
      console.error('Error loading patient reports:', error);
      setPatientDatabase(MOCK_PATIENTS); // Fallback to mock data
    }
  };

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

      // Save to database if user is logged in
      if (user) {
        await savePatientReport(user.id, data, result);
        await generateRecoveryPath(user.id, data, result);
        // Reload reports to get the saved data with proper IDs
        await loadPatientReports(user.id);
      }
      
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

  const handleReloadAnalysis = () => {
    if (currentRecord) {
      handleScreening(currentRecord);
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
      case 'booktest': return 'bg-gradient-to-br from-rose-50/30 to-blue-50/30';
      default: return 'bg-slate-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  const renderContent = () => {
    if (activeTab === 'home') {
      return <LandingPage onStart={() => handleTabChange('screening')} />;
    }

    if (activeTab === 'profile') {
      return <UserProfile userId={user.id} onLogout={() => setUser(null)} />;
    }

    if (activeTab === 'booktest') {
      return <BookTest userId={user.id} onBookingComplete={() => handleTabChange('profile')} />;
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
        </div>
      </div>
    );

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
                    <ResultsDashboard 
                      result={activeResult} 
                      currentHemoglobin={currentRecord.hemoglobin} 
                      currentMCV={currentRecord.mcv}
                      onReload={handleReloadAnalysis}
                      isReloading={isLoading}
                    />
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
