import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (localStorage.getItem('adminAuth')) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    const envEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const envPass = import.meta.env.VITE_ADMIN_PASSWORD;

    if (email === envEmail && password === envPass) {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-6 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-600/5 blur-[100px] rounded-full"></div>

      <div className="max-w-md w-full space-y-8 bg-dark-card p-12 rounded-[40px] border border-dark-border shadow-[0_0_50px_rgba(0,180,216,0.15)] relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center shadow-2xl mb-8 border border-primary/20">
            <LogIn className="text-primary h-10 w-10" />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2">
            Admin Portal
          </h2>
          <p className="text-gray-500 font-medium tracking-wide">
            Guntur SSA Enterprise Management
          </p>
        </div>
        
        <form className="mt-12 space-y-8" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-3 animate-shake">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <div className="flex flex-col space-y-3">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Administrator Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-700 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border px-14 py-4.5 rounded-2xl text-white font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-gray-700"
                  placeholder="admin@bsnl.in"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Secure Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-700 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border px-14 py-4.5 rounded-2xl text-white font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-gray-700"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all duration-300"
            >
              Sign In to Dashboard
            </button>
          </div>
        </form>

        <div className="pt-8 text-center border-t border-dark-border/50">
          <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
