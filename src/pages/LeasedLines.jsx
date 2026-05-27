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

const LeasedLines = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const queries = [
          // 0. ILL CCTs
          supabase.from('ill_data').select('*', { count: 'exact', head: true }),
          // 1. MPLS CCTs
          supabase.from('mpls_data').select('*', { count: 'exact', head: true }),
          // 2. ISDN PRI
          supabase.from('pri_data').select('*', { count: 'exact', head: true }),
          // 3. SIP Trunks
          supabase.from('sip_data').select('*', { count: 'exact', head: true }),
          // 4. MMVC
          supabase.from('mmvc_data').select('*', { count: 'exact', head: true }),
          // 5. NMECT CCTs
          supabase.from('nmect_data').select('*', { count: 'exact', head: true }),
          // 6. DOJ (Department of Justice)
          supabase.from('ill_data').select('*', { count: 'exact', head: true }).or('customer_name.ilike.%doj%,customer_name.ilike.%justice%,customer_name.ilike.%court%'),
          // 7. CGGB
          supabase.from('cggb').select('*', { count: 'exact', head: true }),
          // 8. Election Commission
          supabase.from('toll_free').select('*', { count: 'exact', head: true }).or('customer_name.ilike.%election%,customer_name.ilike.%commission%'),
          // 9. Tobacco Board
          supabase.from('tobacco_board').select('*', { count: 'exact', head: true }),
          // 10. NREGS
          supabase.from('nregs').select('*', { count: 'exact', head: true }),
          // 11. Collectorates
          supabase.from('ill_data').select('*', { count: 'exact', head: true }).or('customer_name.ilike.%collector%,customer_name.ilike.%collectorate%'),
          // 12. NHM (National Health Mission)
          supabase.from('ill_data').select('*', { count: 'exact', head: true }).or('customer_name.ilike.%nhm%,customer_name.ilike.%health%'),
          // 13. Toll FREE
          supabase.from('toll_free').select('*', { count: 'exact', head: true })
        ];

        const results = await Promise.all(queries);
        const counts = results.map(r => r.error ? 0 : (r.count || 0));

        const defaults = [
          { title: "ILL CCTs", value: `ILL ${counts[0]}`, service_type: "Internet Leased Line (ILL)", icon: Laptop, to: "/leased-lines/ill-576" },
          { title: "MPLS CCTs", value: `MPLS ${counts[1]}`, service_type: "MPLS", icon: Server },
          { title: "ISDN PRI", value: `ISDN ${counts[2]}`, service_type: "ISDN PRI", icon: Phone },
          { title: "SIP Trunks", value: `SIP ${counts[3]}`, service_type: "SIP Trunk", icon: PhoneCall },
          { title: "MMVC", value: `MMVC ${counts[4]}`, service_type: "MMVC", icon: Keyboard },
          { title: "NMECT CCTs", value: `${counts[5]}`, service_type: "NMECT", icon: Monitor },
          { title: "DOJ", value: `DOJ ${counts[6]}`, service_type: "Internet Leased Line (ILL)", icon: Building2, footerText: "Details" },
          { title: "CGGB", value: `CGGB ${counts[7]}`, service_type: "CGGB", icon: Users, footerText: "Explore" },
          { title: "Election Comission", value: `Election ${counts[8]}`, service_type: "Toll Free", icon: Vote },
          { title: "Tobacco Board", value: `Tobacco ${counts[9]}`, service_type: "Tobacco Board", icon: Leaf },
          { title: "NREGS", value: `NREGS ${counts[10]}`, service_type: "NREGS", icon: RefreshCw },
          { title: "Collectorates", value: `Collectorates ${counts[11]}`, service_type: "Internet Leased Line (ILL)", icon: Building2, footerText: "Details" },
          { title: "NHM", value: `NHM ${counts[12]}`, service_type: "NHM", icon: Stethoscope, footerText: "Details" },
          { title: "Toll FREE", value: `Toll ${counts[13]}`, service_type: "Toll Free", icon: PhoneForwarded },
        ];

        setMetrics(defaults);
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
