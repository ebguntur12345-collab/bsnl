import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    // If already logged in, skip to dashboard
    if (localStorage.getItem('adminAuth')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    const envEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const envPass = import.meta.env.VITE_ADMIN_PASSWORD;

    if (email === envEmail && password === envPass) {
      localStorage.setItem('adminAuth', 'true');
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-dark-card p-10 rounded-[40px] shadow-2xl border border-dark-border relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-dark-bg border border-dark-border rounded-3xl flex items-center justify-center shadow-2xl mb-8 relative group overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
            <img src="/bsnl-logo.png" alt="BSNL" className="h-16 w-auto object-contain relative z-10 brightness-110" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Enterprise Portal
          </h2>
          <p className="mt-3 text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">
            Authorized Personnel Login Only
          </p>
        </div>
        
        <form className="mt-10 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2 text-center">
              {error}
            </div>
          )}
          <div className="space-y-5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                <Mail className="h-5 w-5 text-gray-600" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-14 pr-5 py-5 border border-dark-border bg-dark-bg rounded-2xl text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none text-sm font-bold placeholder:text-gray-800"
                placeholder="Official Email ID"
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                <Lock className="h-5 w-5 text-gray-600" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-14 pr-5 py-5 border border-dark-border bg-dark-bg rounded-2xl text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none text-sm font-bold placeholder:text-gray-800"
                placeholder="Secure Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
              <ShieldCheck size={14} className="text-emerald-500" />
              Encrypted Session Active
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-xs font-black rounded-2xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 transition-all duration-300 shadow-xl shadow-primary/20 uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95"
            >
              Access Dashboard
            </button>
          </div>
        </form>

        <div className="mt-10 pt-8 border-t border-dark-border/50 text-center">
          <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.3em]">
            Bharat Sanchar Nigam Limited
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
