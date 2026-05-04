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
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-50 rounded-full blur-3xl opacity-50"></div>

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-white border-2 border-blue-100 rounded-2xl flex items-center justify-center shadow-sm mb-6">
            <img src="/bsnl-logo.png" alt="BSNL" className="h-14 w-auto object-contain" />
          </div>
          <h2 className="text-3xl font-black text-[#005BAA] tracking-tight">
            Enterprise Portal
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Authorized Personnel Login Only
          </p>
        </div>
        
        <form className="mt-10 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-xs font-bold animate-in slide-in-from-top-2">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border border-gray-100 bg-gray-50/50 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm font-medium"
                placeholder="Official Email ID"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border border-gray-100 bg-gray-50/50 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm font-medium"
                placeholder="Secure Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <ShieldCheck size={14} className="text-green-500" />
              Secure Session Active
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-[#005BAA] hover:bg-[#004a8b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-xl hover:shadow-blue-200"
            >
              Access Dashboard
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            Bharat Sanchar Nigam Limited
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
