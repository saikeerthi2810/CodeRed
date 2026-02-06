import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        setMessage('Login successful!');
        onAuthSuccess();
      } else {
        // Sign up
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authData.user.id,
                email: email,
                full_name: fullName,
              },
            ]);

          if (profileError) throw profileError;
        }

        setMessage('Account created! Please check your email to verify.');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMessage = 'An error occurred';
      
      if (error.message?.includes('Email rate limit exceeded')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message?.includes('User already registered')) {
        errorMessage = 'This email is already registered. Try logging in instead.';
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50/50 via-rose-50/20 to-indigo-50/30 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full"></div>
      
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 rounded-[2rem] mb-6 shadow-2xl shadow-rose-200">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2c-5.33 4.55-8 9.33-8 13.5 0 4.5 3.58 8.1 8 8.1s8-3.6 8-8.1c0-4.17-2.67-8.95-8-13.5z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">HemoScan <span className="text-rose-600 italic">AI</span></h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {isLogin ? 'Clinical Portal Access' : 'Create New Account'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-8">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                placeholder="Enter your full name"
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 pr-12 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-slate-700 shadow-sm"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-sm font-bold border ${
              message.includes('success') || message.includes('created')
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-rose-50 text-rose-700 border-rose-100'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-2xl hover:bg-rose-600 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center justify-center gap-4 group active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : (
              <>
                <span className="text-lg italic">{isLogin ? 'Access Portal' : 'Create Account'}</span>
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage('');
            }}
            className="text-slate-500 hover:text-rose-600 font-bold text-sm transition-colors"
          >
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span className="text-rose-600 font-black">{isLogin ? 'Sign up' : 'Sign in'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
