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
  DollarSign,
  Phone,
  CheckCircle,
  Monitor
} from 'lucide-react';

import { Link } from 'react-router-dom';
import { downloadServiceExcel } from '../lib/excelExport';

const DashboardStatCard = ({ title, subtitle, value, service_type, icon: Icon, colorClass = "text-primary", onDownload }) => (
  <Link 
    to={`/leased-lines/users/${encodeURIComponent(service_type || title)}`}
    className="bg-dark-card rounded-xl p-3.5 border border-dark-border card-hover group relative overflow-hidden flex flex-col justify-between min-h-[90px] block transition-all"
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex flex-col min-w-0">
        <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest mb-0.5 truncate">{subtitle || 'Live'}</p>
        <h4 className="text-[10px] font-black text-white uppercase tracking-tight truncate">{title}</h4>
      </div>
      <div className={`p-1.5 rounded-lg bg-primary/5 flex items-center justify-center border border-white/5 flex-shrink-0`}>
        <Icon size={12} className={colorClass} />
      </div>
    </div>
    
    <div className="mt-2 flex items-baseline justify-between">
      <div className="flex flex-col">
        <p className="text-base font-black text-white tracking-tighter leading-none">{value}</p>
        <p className="text-[6px] font-black text-primary uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">View Details</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDownload(service_type || title);
          }}
          className="text-gray-500 hover:text-primary transition-all p-1 hover:bg-dark-bg/50 rounded border border-white/5 opacity-0 group-hover:opacity-100 flex items-center justify-center"
          title="Download Excel"
        >
          <FileDown size={10} />
        </button>
        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
      </div>
    </div>
  </Link>
);

const Dashboard = () => {
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, rate: 0, recentTasks: [] });
  const [metrics, setMetrics] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  useEffect(() => {
    // Fetch Metrics from Supabase
    const fetchMetrics = async () => {
      setLoadingMetrics(true);
      const defaults = [
        { title: "ILL CCTs", subtitle: "ILL Circuits", service_type: "Internet Leased Line (ILL)", table: "ill_data", icon: Zap },
        { title: "MPLS CCTs", subtitle: "MPLS Circuits", service_type: "MPLS", table: "mpls_data", icon: RefreshCw },
        { title: "ISDN PRI", subtitle: "PRI Circuits", service_type: "ISDN PRI", table: "pri_data", icon: Phone },
        { title: "SIP TRUNKS", subtitle: "SIP Trunks", service_type: "SIP Trunk", table: "sip_data", icon: Phone },
        { title: "MMVC", subtitle: "MMVC Circuits", service_type: "MMVC", table: "mmvc_data", icon: CreditCard },
        { title: "NMECT CCTs", subtitle: "NMECT Circuits", service_type: "NMECT", table: "nmect_data", icon: ShoppingCart },
        { title: "CGGB", subtitle: "CGGB Circuits", service_type: "CGGB", table: "cggb", icon: Users },
        { title: "Tobacco Board", subtitle: "Tobacco Board Circuits", service_type: "Tobacco Board", table: "tobacco_board", icon: Zap },
        { title: "NREGS", subtitle: "NREGS Circuits", service_type: "NREGS", table: "nregs", icon: RefreshCw },
        { title: "Toll Free", subtitle: "Toll Free Circuits", service_type: "Toll Free", table: "toll_free", icon: Phone },
      ];

      try {
        const counts = await Promise.all(
          defaults.map(async (item) => {
            const { count, error } = await supabase
              .from(item.table)
              .select('*', { count: 'exact', head: true });
            return error ? 0 : (count || 0);
          })
        );

        setMetrics(defaults.map((m, idx) => ({
          ...m,
          value: `${counts[idx]}`,
          icon: m.icon
        })));
      } catch (err) {
        console.error('Error fetching live metrics:', err);
      } finally {
        setLoadingMetrics(false);
      }
    };
    fetchMetrics();

    // Fetch Tasks
    const tasks = JSON.parse(localStorage.getItem('bsnl_tasks') || '[]');
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    setTaskStats({ 
      total, 
      completed, 
      rate, 
      pending: total - completed,
      recentTasks: tasks.slice(0, 5)
    });
  }, []);

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-black text-white tracking-tight">Enterprise Overview</h1>
        <p className="text-gray-600 font-bold text-[10px] uppercase tracking-widest">Real-time Project Analytics • Guntur SSA</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loadingMetrics ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-dark-card rounded-xl p-5 border border-dark-border h-24 animate-pulse flex flex-col justify-between">
              <div className="h-2 w-12 bg-white/5 rounded"></div>
              <div className="h-4 w-20 bg-white/5 rounded"></div>
              <div className="h-6 w-8 bg-white/5 rounded mt-2"></div>
            </div>
          ))
        ) : (
          metrics.map((m, i) => (
            <DashboardStatCard key={i} {...m} onDownload={downloadServiceExcel} />
          ))
        )}
      </div>

      {/* Progress & Quick Insights */}
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
            Guntur SSA manages thousands of active leased line circuits across all corporate and government clients. The database is actively synced with live field parameters.
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
