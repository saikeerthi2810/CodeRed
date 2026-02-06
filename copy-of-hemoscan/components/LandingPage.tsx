
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative pt-24 pb-40 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-gradient-to-l from-indigo-50/50 to-transparent -z-0"></div>
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-in slide-in-from-left-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                Hematology AI 4.0
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.95]">
                Precision <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-indigo-600 to-teal-500">Hematology.</span>
              </h1>
              
              <div className="flex items-center gap-6 mb-12 border-l-4 border-rose-500 pl-6">
                <TaglineItem text="Predict" />
                <TaglineItem text="Prevent" />
                <TaglineItem text="Protect" />
              </div>

              <p className="text-xl text-slate-500 font-bold leading-relaxed mb-12 max-w-lg">
                HemoScan AI analyzes molecular blood patterns to detect anemia variants before clinical symptoms manifest.
              </p>
              
              <div className="flex flex-wrap gap-5">
                <button 
                  onClick={onStart}
                  className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-rose-600 transition-all shadow-2xl shadow-rose-100 flex items-center gap-4 active:scale-95 group"
                >
                  Enter Workspace
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              </div>
            </div>

            <div className="relative animate-in slide-in-from-right-8 duration-1000">
              {/* Animated Blood Component Hero */}
              <div className="relative z-10 bg-slate-950 p-12 rounded-[4rem] shadow-2xl border border-slate-800 overflow-hidden h-[600px] flex items-center justify-center transform hover:rotate-1 transition-transform duration-700">
                <div className="absolute inset-0 opacity-20">
                   <div className="scanning-line"></div>
                </div>
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                   <AnimatedBloodCells />
                </div>
                
                <div className="absolute bottom-12 left-12 right-12">
                   <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                      <p className="text-white/50 text-xs font-black uppercase mb-2 tracking-widest">Global Benchmarks</p>
                      <div className="text-4xl font-black text-white">98.4% Accuracy</div>
                   </div>
                </div>
              </div>
              
              {/* Floating Cell Icons */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-rose-500/10 rounded-full animate-float pointer-events-none flex items-center justify-center">
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="#f43f5e" opacity="0.5"><circle cx="12" cy="12" r="8"/></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Visualization Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl border-8 border-slate-50 group bg-slate-900 h-[500px] flex items-center justify-center">
                {/* Cell Morphology Scanner Animation */}
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-rose-900/20 opacity-50"></div>
                   <MorphologyScanner />
                </div>
                
                {/* Micro-label overlay */}
                <div className="absolute top-8 left-8 bg-slate-800/80 backdrop-blur px-4 py-2 rounded-xl border border-white/20">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Morphology Scan Active</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-6">Unmasking Anemia through <span className="text-rose-600">Molecular Vision.</span></h2>
              <p className="text-lg text-slate-500 font-bold leading-relaxed mb-8">
                Our AI goes beyond standard reference ranges, analyzing the individual morphology of red blood cells to detect sickle-cell patterns, iron-deficient hypochromia, and macrocytic trends in real-time.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-100">
                  <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center text-white text-xl animate-pulse">🔬</div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Automated Morphology</h4>
                    <p className="text-xs text-slate-500 font-bold">RBC size and shape variation tracking.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-xl animate-bounce">📈</div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Predictive Indexing</h4>
                    <p className="text-xs text-slate-500 font-bold">Historical data correlation for early warning.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lab Features Section */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              type="pattern"
              title="Pattern Recognition" 
              desc="Deep learning analysis of blood smears, cell morphology, and hemoglobin index correlations."
            />
            <FeatureCard 
              type="integration"
              title="Digital Integration" 
              desc="Automatic OCR ingestion of standard clinical CBC reports and hematology analyzer data."
            />
            <FeatureCard 
              type="trends"
              title="Predictive Trends" 
              desc="Longitudinal tracking of red cell distribution width (RDW) and patient metabolic evolution."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Custom Animated Components ---

const AnimatedBloodCells = () => (
  <svg width="400" height="400" viewBox="0 0 200 200" className="drop-shadow-2xl">
    <defs>
      <radialGradient id="cellGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#881337" />
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Floating animated cells */}
    {[...Array(8)].map((_, i) => (
      <circle
        key={i}
        cx={100 + Math.sin(i * 0.8) * 60}
        cy={100 + Math.cos(i * 0.8) * 60}
        r={12 + (i % 3) * 4}
        fill="url(#cellGradient)"
        filter="url(#glow)"
        className="animate-float"
        style={{ 
          animationDelay: `${i * 0.5}s`, 
          opacity: 0.7,
          animationDuration: `${5 + i}s`
        }}
      />
    ))}
    {/* Central Connecting Hub */}
    <g className="animate-pulse">
      <circle cx="100" cy="100" r="40" fill="none" stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="4,4" />
      <circle cx="100" cy="100" r="30" fill="rgba(244, 63, 94, 0.05)" stroke="#f43f5e" strokeWidth="1" />
      <path d="M70 100 L130 100 M100 70 L100 130" stroke="#f43f5e" strokeWidth="1" opacity="0.3" />
    </g>
  </svg>
);

const MorphologyScanner = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(244,63,94,0.1)_0%,transparent_70%)] animate-pulse"></div>
    
    {/* Scanning Circle */}
    <div className="w-80 h-80 border border-rose-500/30 rounded-full flex items-center justify-center relative">
      <div className="absolute inset-0 border-t-2 border-rose-500 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
      <div className="absolute inset-4 border border-indigo-500/20 rounded-full animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }}></div>
      
      <svg width="180" height="180" viewBox="0 0 100 100">
        <path
          d="M30 50 Q50 20 70 50 Q50 80 30 50"
          fill="#f43f5e"
          fillOpacity="0.4"
          className="animate-pulse"
        >
          <animate 
            attributeName="d" 
            values="M30 50 Q50 20 70 50 Q50 80 30 50; M25 50 Q50 15 75 50 Q50 85 25 50; M30 50 Q50 20 70 50 Q50 80 30 50"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
        <circle cx="50" cy="50" r="2" fill="white" className="animate-ping" />
      </svg>
      
      {/* Target Reticles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-1 h-6 bg-rose-500"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-1 h-6 bg-rose-500"></div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-6 h-1 bg-rose-500"></div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-6 h-1 bg-rose-500"></div>
    </div>
  </div>
);

const FeatureAnimation = ({ type }: { type: string }) => {
  if (type === 'pattern') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full p-12">
        <rect x="20" y="20" width="60" height="60" rx="10" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 2" className="animate-pulse" />
        <circle cx="50" cy="50" r="15" fill="#f43f5e" opacity="0.2">
          <animate attributeName="r" values="10;20;10" dur="3s" repeatCount="indefinite" />
        </circle>
        <line x1="20" y1="50" x2="80" y2="50" stroke="#f43f5e" strokeWidth="1" className="animate-bounce" style={{ animationDuration: '2s' }} />
      </svg>
    );
  }
  if (type === 'integration') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full p-12">
        <circle cx="50" cy="50" r="35" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="5 5" className="animate-spin" style={{ animationDuration: '10s' }} />
        <rect x="40" y="40" width="20" height="20" rx="4" fill="#6366f1" className="animate-bounce" />
        <path d="M30 50 L40 50 M60 50 L70 50 M50 30 L50 40 M50 60 L50 70" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full p-12">
      <polyline points="20,70 40,50 60,60 80,30" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="stroke-dasharray" from="0,200" to="200,0" dur="2s" repeatCount="indefinite" />
      </polyline>
      <circle cx="80" cy="30" r="4" fill="#10b981" className="animate-ping" />
    </svg>
  );
};

const TaglineItem = ({ text }: { text: string }) => (
  <span className="text-xs font-black tracking-[0.4em] uppercase text-slate-400 group-hover:text-rose-500 transition-colors">
    {text}
  </span>
);

const FeatureCard = ({ type, title, desc }: any) => (
  <div className="group cursor-pointer">
    <div className="relative h-64 mb-8 rounded-[2.5rem] overflow-hidden shadow-lg border-2 border-white bg-slate-900 flex items-center justify-center">
      <FeatureAnimation type={type} />
      <div className="absolute inset-0 bg-rose-900/10 group-hover:bg-rose-900/0 transition-colors"></div>
    </div>
    <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-rose-600 transition-colors">{title}</h3>
    <p className="text-slate-500 font-bold leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
