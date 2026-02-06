
import React, { useState } from 'react';
import { PatientRecord } from '../types';
import { CLINICAL_RANGES } from '../constants';
import { parseLabReport } from '../services/geminiService';

interface ScreeningFormProps {
  onSubmit: (data: PatientRecord) => void;
  isLoading: boolean;
}

const ScreeningForm: React.FC<ScreeningFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<Partial<PatientRecord>>({
    gender: 'M',
    hemoglobin: 12.0,
    mcv: 85,
    mch: 28,
    mchc: 33,
    name: 'Alex Johnson',
    age: 34
  });

  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsParsing(true);
    setParseSuccess(false);
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const result = event.target?.result as string;
          const base64 = result.split(',')[1];
          const mimeType = file.type || 'image/jpeg';

          console.log('📤 Uploading to Gemini AI for analysis...');
          const extracted = await parseLabReport(base64, mimeType);
          
          // Normalize gender
          let genderCode: 'M' | 'F' = formData.gender as 'M' | 'F';
          if (extracted.gender) {
            const g = extracted.gender.toLowerCase();
            if (g.startsWith('m')) genderCode = 'M';
            else if (g.startsWith('f')) genderCode = 'F';
          }
          
          setFormData(prev => ({ 
            ...prev, 
            ...extracted, 
            gender: genderCode,
            date: (extracted as any).testDate || prev.date // Use extracted test date
          }));
          
          setParseSuccess(true);
          setTimeout(() => setParseSuccess(false), 4000);
          setIsParsing(false);
        } catch (err: any) {
          console.error('File processing error:', err);
          alert(`Upload Failed:\n\n${err.message || 'Failed to process the file'}\n\nCheck browser console (F12) for more details.`);
          setIsParsing(false);
        }
      };
      
      reader.onerror = () => {
        throw new Error("File reading failed");
      };
      
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Report Ingestion Error:", error);
      const errorMsg = error.message || "Analysis system could not read the report. Please try a clearer image or a standard PDF.";
      alert(`Upload Failed:\n\n${errorMsg}\n\nCheck browser console (F12) for more details.`);
      setIsParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    } as PatientRecord);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden relative group">
      {(isLoading || isParsing) && <div className="scanning-line"></div>}
      
      <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Health Intake</h2>
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-1">My Personal Data Entry</p>
        </div>
        {parseSuccess && (
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest animate-in fade-in zoom-in">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            Biometrics Synced
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={`p-10 space-y-10 transition-all duration-500 ${isLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <label className={`cursor-pointer group flex flex-col items-center justify-center gap-4 px-8 py-10 rounded-[2.5rem] border-2 border-dashed transition-all shadow-inner active:scale-95 group/upload ${parseSuccess ? 'border-emerald-500 bg-emerald-50' : 'bg-slate-50 border-slate-200 hover:border-rose-500 hover:bg-rose-50'}`}>
            <div className={`w-14 h-14 rounded-2xl shadow-md flex items-center justify-center transition-transform ${parseSuccess ? 'bg-emerald-500 text-white' : 'bg-white text-rose-500 group-hover/upload:scale-110'}`}>
              {isParsing ? (
                <div className="w-7 h-7 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
              )}
            </div>
            <div className="text-center">
              <span className="text-sm font-black text-slate-900 uppercase tracking-widest block mb-1">
                {isParsing ? 'Reading Molecular Data...' : parseSuccess ? 'Report Data Imported' : 'Import Lab Report'}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter block italic">Accepts Image (JPEG/PNG) or Clinical PDF</span>
            </div>
            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
          </label>
          
          <div className="mt-4 text-center">
            <button 
              type="button"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors group/cta"
              onClick={() => alert("Redirecting to clinical partner booking portal...")}
            >
              No report? <span className="text-indigo-500 group-hover/cta:underline">Book a test now</span>
              <svg className="w-3 h-3 group-hover/cta:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <SectionHeader number="1" title="Profile Summary" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Name" value={formData.name || ''} onChange={(v: string) => setFormData({...formData, name: v})} />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Age" type="number" value={formData.age || ''} onChange={(v: string) => setFormData({...formData, age: Number(v)})} />
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                <select 
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 appearance-none shadow-sm cursor-pointer"
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value as any})}
                >
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <SectionHeader number="2" title="Blood Biometrics" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
            <BiometricSlider 
              label="Hemoglobin" unit="g/dL" value={formData.hemoglobin || 0}
              onChange={(v: number) => setFormData({...formData, hemoglobin: v})}
              range={formData.gender === 'M' ? CLINICAL_RANGES.HEMOGLOBIN.M : CLINICAL_RANGES.HEMOGLOBIN.F}
              min={CLINICAL_RANGES.HEMOGLOBIN.min} max={CLINICAL_RANGES.HEMOGLOBIN.max}
            />
            <BiometricSlider 
              label="MCV" unit="fL" value={formData.mcv || 0}
              onChange={(v: number) => setFormData({...formData, mcv: v})}
              range={CLINICAL_RANGES.MCV.range}
              min={CLINICAL_RANGES.MCV.min} max={CLINICAL_RANGES.MCV.max}
            />
            <BiometricSlider 
              label="MCH" unit="pg" value={formData.mch || 0}
              onChange={(v: number) => setFormData({...formData, mch: v})}
              range={CLINICAL_RANGES.MCH.range}
              min={CLINICAL_RANGES.MCH.min} max={CLINICAL_RANGES.MCH.max}
            />
            <BiometricSlider 
              label="MCHC" unit="g/dL" value={formData.mchc || 0}
              onChange={(v: number) => setFormData({...formData, mchc: v})}
              range={CLINICAL_RANGES.MCHC.range}
              min={CLINICAL_RANGES.MCHC.min} max={CLINICAL_RANGES.MCHC.max}
            />
          </div>
        </div>

        <button 
          disabled={isLoading || isParsing}
          className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] shadow-2xl hover:bg-rose-600 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center justify-center gap-4 group active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="flex items-center gap-3">
              <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              Generating Clinical Insight...
            </span>
          ) : (
            <>
              <span className="text-xl italic">Analyze My Health</span>
              <svg className="w-7 h-7 group-hover:translate-x-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const SectionHeader = ({ number, title }: any) => (
  <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-50">
    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black">{number}</span>
    <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">{title}</h3>
  </div>
);

const InputField = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm" required />
  </div>
);

const BiometricSlider = ({ label, unit, value, onChange, range, min, max }: any) => {
  const isNormal = value >= range[0] && value <= range[1];
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{label}</p>
          <p className="text-[10px] font-bold text-slate-400">Normal: {range[0]}-{range[1]}</p>
        </div>
        <div className={`text-2xl font-black ${isNormal ? 'text-emerald-500' : 'text-rose-600'}`}>
          {value.toFixed(1)} <span className="text-[10px] uppercase">{unit}</span>
        </div>
      </div>
      <input type="range" min={min} max={max} step="0.1" value={value} onChange={e => onChange(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-full appearance-none accent-slate-900 cursor-pointer" />
    </div>
  );
};

export default ScreeningForm;
