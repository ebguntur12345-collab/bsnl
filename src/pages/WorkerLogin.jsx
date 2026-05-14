import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn, HardHat, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

const WorkerLogin = () => {
  const [workerName, setWorkerName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check against staff_salaries table
      const { data, error: fetchError } = await supabase
        .from('staff_salaries')
        .select('*')
        .eq('name', workerName)
        .single();

      if (fetchError || !data) {
        setError('Worker record not found. Please check your name.');
        setIsLoading(false);
        return;
      }

      // Check if password (salary) matches
      if (data.salary === password || data.salary.includes(password)) {
        localStorage.removeItem('adminAuth'); // Clear admin session to prevent view conflict
        localStorage.setItem('workerAuth', 'true');
        localStorage.setItem('workerName', data.name);
        navigate('/tasks');
      } else {
        setError('Invalid password. Use your registered salary amount.');
      }
    } catch (err) {
      setError('Database connection error. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-6 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/10 blur-[100px] rounded-full"></div>

      <div className="max-w-md w-full space-y-8 bg-dark-card p-12 rounded-[40px] border border-dark-border shadow-[0_0_50px_rgba(245,158,11,0.05)] relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-amber-500/10 rounded-3xl flex items-center justify-center shadow-2xl mb-8 border border-amber-500/20">
            <HardHat className="text-amber-500 h-10 w-10" />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2">
            Worker Portal
          </h2>
          <p className="text-gray-500 font-medium tracking-wide">
            Field Operations & Task Center
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
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] ml-1">Worker ID / Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-700 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border px-14 py-4.5 rounded-2xl text-white font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition-all placeholder:text-gray-700"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] ml-1">Pin / Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-700 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border px-14 py-4.5 rounded-2xl text-white font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition-all placeholder:text-gray-700"
                  placeholder="••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
            >
              {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <LogIn size={20} />}
              {isLoading ? 'Verifying...' : 'Sign In to Tasks'}
            </button>
          </div>
        </form>

        <div className="pt-8 text-center border-t border-dark-border/50">
          <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">
            Guntur SSA Field Operations
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkerLogin;
