import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  Zap, 
  CreditCard, 
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Plus,
  FileDown,
  RefreshCw,
  Loader2,
  HelpCircle,
  DollarSign
} from 'lucide-react';

const DashboardStatCard = ({ title, value, icon: Icon, iconColor, footerText, isDashed = false }) => (
  <div className="bg-dark-card rounded-2xl p-6 border border-dark-border card-hover group relative overflow-hidden">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center ${isDashed ? 'border-dashed border-primary/40' : 'border-dark-border shadow-sm'}`}>
        <Icon size={24} className={iconColor} />
      </div>
      <div className="text-right">
        <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-1">{title}</p>
        <p className="text-xl font-black text-white tracking-tight">{value}</p>
      </div>
    </div>
    <div className="pt-3 border-t border-dark-border/50 flex items-center gap-2">
      <RefreshCw size={12} className="text-primary animate-spin-slow" />
      <span className="text-[10px] font-bold text-primary cursor-pointer hover:text-white transition-colors">{footerText}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, rate: 0, recentTasks: [] });

  useEffect(() => {
    const tasks = JSON.parse(localStorage.getItem('bsnl_tasks') || '[]');
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    setTaskStats({ 
      total, 
      completed, 
      rate, 
      pending: total - completed,
      recentTasks: tasks.slice(0, 5) // Show last 5 tasks
    });
  }, []);

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white tracking-tight">Enterprise Overview</h1>
        <p className="text-gray-400 font-medium text-lg">Monitoring real-time service provisioning and project status across Guntur SSA.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <DashboardStatCard title="NREGS" value="576 FTTH" icon={ShoppingCart} iconColor="text-primary" footerText="NREGS Details" />
        <DashboardStatCard title="CGGB" value="MPLS 250" icon={HelpCircle} iconColor="text-primary" footerText="Updated Now" isDashed={true} />
        <DashboardStatCard title="DOJ" value="MPLS 188" icon={DollarSign} iconColor="text-primary" footerText="Updated Now" />
        <DashboardStatCard title="Tobacco Board" value="33 ILLs" icon={Users} iconColor="text-primary" footerText="Updated Now" />
      </div>

      {/* Placeholder for future enterprise metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Task Progress Widget */}
        <div className="bg-dark-card p-8 rounded-3xl border border-dark-border relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6">Daily Task Progress</h3>
          
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Completion Rate</span>
              <span className="text-primary font-black text-sm">{taskStats.rate}%</span>
            </div>
            <div className="h-1.5 w-full bg-dark-bg rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(0,180,216,0.3)] transition-all duration-1000"
                style={{ width: `${taskStats.rate}%` }}
              ></div>
            </div>
            
            <div className="flex items-center gap-6 pt-2 pb-6 border-b border-dark-border/50">
              <div className="flex flex-col">
                <span className="text-white font-black text-lg">{taskStats.completed}</span>
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Completed</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-lg">{taskStats.pending || 0}</span>
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Pending</span>
              </div>
            </div>

            {/* Recent Tasks List */}
            <div className="space-y-4 pt-4">
              <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4">Operations Status</h4>
              {taskStats.recentTasks.length === 0 ? (
                <p className="text-gray-700 text-xs italic">No active tasks assigned.</p>
              ) : (
                taskStats.recentTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between group/item">
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-xs truncate max-w-[120px]">{task.title}</span>
                      <span className="text-[9px] text-primary font-black uppercase tracking-wider">{task.assignee}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                      {task.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-dark-card p-10 rounded-3xl border border-dark-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-4">Quick Insights</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Guntur SSA currently managing 1,240 active leased line circuits across 4 circles. System health is optimal.
          </p>
        </div>

        <div className="bg-dark-card p-10 rounded-3xl border border-dark-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-4">System Status</h3>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            <span className="text-gray-300 font-bold text-sm tracking-tight">Enterprise Services Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
