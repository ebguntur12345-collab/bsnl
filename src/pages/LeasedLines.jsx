/** UPDATED LEASED LINES GRID - VERSION 2 **/
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Monitor, 
  Server, 
  Phone, 
  PhoneCall, 
  Keyboard, 
  Laptop, 
  RefreshCw,
  Building2,
  Users,
  Vote,
  Leaf,
  Stethoscope,
  PhoneForwarded,
  Zap,
  ShoppingCart,
  CheckCircle,
  CreditCard,
  Loader2,
  FileDown
} from 'lucide-react';

import { Link } from 'react-router-dom';
import { downloadServiceExcel } from '../lib/excelExport';

const LeasedLineCard = ({ title, value, icon: Icon, footerText = "Explore", to, onDownload }) => (
  <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden card-hover group relative">
    <div className="p-6 flex items-center justify-between">
      <div className="w-12 h-12 rounded-xl bg-dark-bg border border-dark-border flex items-center justify-center text-gray-500 group-hover:text-primary group-hover:border-primary/30 transition-all">
        <Icon size={26} strokeWidth={1.5} />
      </div>
      <div className="text-right">
        <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-1.5">{title}</p>
        <p className="text-xl font-black text-white tracking-tight">{value}</p>
      </div>
    </div>
    <div className="bg-dark-bg/30 px-6 py-3 border-t border-dark-border/50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Live</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDownload(title);
          }}
          className="text-gray-500 hover:text-primary hover:bg-dark-bg/80 transition-all p-1.5 rounded-lg border border-dark-border/40"
          title="Download Excel"
        >
          <FileDown size={14} />
        </button>
        <Link 
          to={to || `/leased-lines/users/${encodeURIComponent(title)}`}
          className="text-[11px] font-black text-primary hover:text-white transition-colors uppercase tracking-widest"
        >
          {footerText}
        </Link>
      </div>
    </div>
    
    {/* Subtle Glow */}
    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
  </div>
);
const iconMap = {
  Zap,
  RefreshCw,
  Phone,
  PhoneCall,
  Server,
  Building2,
  Users,
  Vote,
  Leaf,
  Stethoscope,
  PhoneForwarded,
  Laptop,
  Keyboard,
  Monitor,
  CreditCard,
  ShoppingCart,
  CheckCircle
};

const getTableForMetric = (title, serviceType) => {
  const t = (title || '').toLowerCase();
  const s = (serviceType || '').toLowerCase();

  if (t.includes('doj')) return { table: 'ill_data', filter: 'doj' };
  if (t.includes('election')) return { table: 'toll_free', filter: 'election' };
  if (t.includes('collector')) return { table: 'ill_data', filter: 'collector' };
  if (t.includes('nhm')) return { table: 'ill_data', filter: 'nhm' };

  if (t.includes('ill') || t.includes('leased line') || s.includes('ill') || s.includes('leased line')) {
    return { table: 'ill_data' };
  }
  if (t.includes('pri') || s.includes('pri')) {
    return { table: 'pri_data' };
  }
  if (t.includes('sip') || s.includes('sip')) {
    return { table: 'sip_data' };
  }
  if (t.includes('mmvc') || s.includes('mmvc')) {
    return { table: 'mmvc_data' };
  }
  if (t.includes('mpls') || s.includes('mpls')) {
    return { table: 'mpls_data' };
  }
  if (t.includes('nmect') || s.includes('nmect')) {
    return { table: 'nmect_data' };
  }
  if (t.includes('cggb') || s.includes('cggb')) {
    return { table: 'cggb' };
  }
  if (t.includes('tobacco') || s.includes('tobacco')) {
    return { table: 'tobacco_board' };
  }
  if (t.includes('nregs') || s.includes('nregs')) {
    return { table: 'nregs' };
  }
  if (t.includes('toll') || s.includes('toll')) {
    return { table: 'toll_free' };
  }
  
  return { table: 'eb_contacts' }; // fallback table
};

const LeasedLines = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const { data: dbMetrics, error: dbError } = await supabase
          .from('enterprise_metrics')
          .select('*')
          .order('created_at', { ascending: true });

        if (dbError) throw dbError;

        const mappedMetrics = (dbMetrics || []).map(m => {
          const IconComp = iconMap[m.icon_name] || Laptop;
          const prefix = m.title.split(' ')[0] || '';
          
          let footerText = "Explore";
          if (m.title.toLowerCase().includes('doj') || 
              m.title.toLowerCase().includes('collector') || 
              m.title.toLowerCase().includes('nhm')) {
            footerText = "Details";
          } else if (m.title.toLowerCase().includes('cggb')) {
            footerText = "Explore";
          }

          let toPath = `/leased-lines/users/${encodeURIComponent(m.service_type && m.service_type !== 'None' ? m.service_type : m.title)}`;
          if (m.title === "ILL CCTs") {
            toPath = "/leased-lines/ill-576";
          }

          return {
            title: m.title,
            prefix: prefix,
            service_type: m.service_type,
            icon: IconComp,
            footerText: footerText,
            to: toPath
          };
        });

        const counts = await Promise.all(
          mappedMetrics.map(async (item) => {
            const { table, filter } = getTableForMetric(item.title, item.service_type);
            try {
              let query = supabase.from(table).select('*', { count: 'exact', head: true });
              if (filter === 'doj') {
                query = query.or('customer_name.ilike.%doj%,customer_name.ilike.%justice%,customer_name.ilike.%court%');
              } else if (filter === 'election') {
                query = query.or('customer_name.ilike.%election%,customer_name.ilike.%commission%');
              } else if (filter === 'collector') {
                query = query.or('customer_name.ilike.%collector%,customer_name.ilike.%collectorate%');
              } else if (filter === 'nhm') {
                query = query.or('customer_name.ilike.%nhm%,customer_name.ilike.%health%');
              } else if (table === 'eb_contacts') {
                query = query.eq('service_type', item.title);
              }
              const { count, error } = await query;
              return error ? 0 : (count || 0);
            } catch {
              return 0;
            }
          })
        );

        setMetrics(mappedMetrics.map((m, idx) => {
          const count = counts[idx];
          const displayValue = m.title.toLowerCase().includes('nmect') ? `${count}` : `${m.prefix} ${count}`;
          return {
            ...m,
            value: displayValue
          };
        }));
      } catch (err) {
        console.error('Error fetching live metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto min-h-screen bg-dark-bg">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-white tracking-tight">Leased Line Inventory</h1>
        <p className="text-gray-400 font-medium">Real-time status and documentation for all active leased line connections.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {metrics.map((item, index) => (
            <LeasedLineCard key={index} {...item} onDownload={downloadServiceExcel} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeasedLines;
