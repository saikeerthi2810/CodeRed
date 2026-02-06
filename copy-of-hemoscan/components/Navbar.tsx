
import React from 'react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { label: 'Home', id: 'home', color: 'text-indigo-600' },
    { label: 'Check-up', id: 'screening', color: 'text-teal-600' },
    { label: 'My Records', id: 'database', color: 'text-rose-600' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onTabChange('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-rose-100 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c-5.33 4.55-8 9.33-8 13.5 0 4.5 3.58 8.1 8 8.1s8-3.6 8-8.1c0-4.17-2.67-8.95-8-13.5z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight block leading-none">HemoScan <span className="text-rose-600 font-black italic">AI</span></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Health Portal</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-10">
            {menuItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`text-sm font-bold transition-all hover:scale-105 border-b-2 pb-1 ${activeTab === item.id ? `${item.color} border-current` : 'text-slate-500 border-transparent'}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <button 
              onClick={() => onTabChange('profile')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 ${
                activeTab === 'profile' ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
              }`}
            >
              My Profile
            </button>
            
            <div 
              onClick={() => onTabChange('profile')}
              className={`w-10 h-10 rounded-full border-2 overflow-hidden shadow-md hover:scale-110 transition-transform cursor-pointer ${
                activeTab === 'profile' ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-white'
              }`}
            >
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex" alt="Patient" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
