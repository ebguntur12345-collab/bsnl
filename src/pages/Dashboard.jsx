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

const DashboardStatCard = ({ title, subtitle, value, service_type, icon: Icon, colorClass = "text-primary" }) => (
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
      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
    </div>
  </Link>
);

const Dashboard = () => {
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, rate: 0, recentTasks: [] });
  const [metrics, setMetrics] = useState([]);

  const iconMap = { Zap, RefreshCw, Phone, Users, ShoppingCart, Monitor, CreditCard, HelpCircle, DollarSign, CheckCircle };

  useEffect(() => {
    // Fetch Metrics
    const fetchMetrics = async () => {
      const { data, error } = await supabase.from('enterprise_metrics').select('*').order('created_at', { ascending: true });
      
      // Load actual counts from registrations
      const regs = JSON.parse(localStorage.getItem('cctRegistrations') || '[]');
      
      const processMetricValue = (m) => {
        if (!m.service_type || m.service_type === 'None') return m.value || '0';
        const count = regs.filter(r => {
          const rService = (r.serviceType || r.service || '').toLowerCase();
          const mService = (m.service_type || '').toLowerCase();
          const mTitle = (m.title || '').toLowerCase();
          if (!mService || mService === 'none') {
            // If no service type, match exactly against title
            return rService === mTitle;
          }
          
          return rService === mService || 
                 rService === mTitle ||
                 (rService.includes('ill') && mService.includes('ill')) ||
                 (rService.includes('mpls') && mService.includes('mpls')) ||
                 (rService.includes('sip') && mService.includes('sip')) ||
                 (rService.includes('pri') && mService.includes('pri')) ||
                 (rService.includes('ftth') && mService.includes('ftth')) ||
                 (rService.includes('mmvc') && mService.includes('mmvc'));
        }).length;
        // Use the title prefix + count (e.g., "ILL 576")
        const prefix = m.title.split(' ')[0] || '';
        return `${prefix} ${count}`;
      };

      if (data && data.length > 0) {
        setMetrics(data.map(m => ({
          ...m,
          value: processMetricValue(m),
          icon: iconMap[m.icon_name] || HelpCircle
        })));
      } else {
        // Fallback to defaults with dynamic counts
        const defaults = [
          { title: "ILL CCTs", subtitle: "ILL 576", service_type: "Internet Leased Line (ILL)", icon: Zap },
          { title: "MPLS CCTs", subtitle: "MPLS 250", service_type: "MPLS", icon: RefreshCw },
          { title: "ISDN PRI", subtitle: "PRI 97", service_type: "ISDN PRI", icon: Phone },
          { title: "SIP TRUNKS", subtitle: "SIP 33", service_type: "SIP Trunk", icon: Phone },
          { title: "MMVC", subtitle: "MMVC", service_type: "MMVC", icon: CreditCard },
          { title: "NMECT CCTs", subtitle: "NMECT CCTs", service_type: "None", value: "33", icon: ShoppingCart },
          { title: "DOJ", subtitle: "DOJ", service_type: "Internet Leased Line (ILL)", icon: Users },
          { title: "CG6B", subtitle: "CG6B", service_type: "MPLS", icon: Users },
          { title: "Election Comission", subtitle: "Election Comission", service_type: "Toll Free", icon: CheckCircle },
          { title: "Tobacco Board", subtitle: "Tobacco Board", service_type: "Internet Leased Line (ILL)", icon: Zap },
          { title: "NREGS", subtitle: "NREGS", service_type: "FTTH", icon: RefreshCw },
          { title: "Collectorates", subtitle: "Collectorates", service_type: "Internet Leased Line (ILL)", icon: Users },
          { title: "NHM", subtitle: "NHM", service_type: "FTTH", icon: Users },
          { title: "Toll Free", subtitle: "Toll Free", service_type: "Toll Free", icon: Phone },
        ];

        setMetrics(defaults.map(m => ({
          ...m,
          value: m.value || processMetricValue(m),
          icon: m.icon
        })));
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
    <div className="p-8 space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-black text-white tracking-tight">Enterprise Overview</h1>
        <p className="text-gray-600 font-bold text-[10px] uppercase tracking-widest">Real-time Project Analytics • Guntur SSA</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {metrics.map((m, i) => (
          <DashboardStatCard key={i} {...m} />
        ))}
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
