import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  ShoppingCart, 
  HelpCircle, 
  DollarSign, 
  Users, 
  RefreshCw,
  Loader2
} from 'lucide-react';

const DashboardStatCard = ({ title, value, icon: Icon, iconColor, footerText, isDashed = false }) => (
  <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
    <div className="p-4 flex items-center justify-between">
      <div className={`w-12 h-12 rounded border flex items-center justify-center ${isDashed ? 'border-dashed border-pink-400' : 'border-gray-100 shadow-sm'}`}>
        <Icon size={24} className={iconColor} />
      </div>
      <div className="text-right">
        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-0.5">{title}</p>
        <p className="text-lg font-black text-gray-600 tracking-tight">{value}</p>
      </div>
    </div>
    <div className="bg-white px-4 py-2 border-t border-gray-50 flex items-center gap-2">
      <RefreshCw size={12} className="text-gray-400" />
      <span className="text-[10px] font-bold text-blue-400 cursor-pointer hover:text-blue-600 transition-colors">{footerText}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const [staffData, setStaffData] = useState(() => {
    return [
      { id: 1, name: "John", salary: "₹2100", date: "25/08/2020" },
      { id: 2, name: "Tim", salary: "₹2100", date: "25/08/2020" },
      { id: 3, name: "Rose", salary: "₹2100", date: "25/08/2020" },
      { id: 4, name: "Oscar", salary: "₹2100", date: "25/08/2020" },
      { id: 5, name: "Mary", salary: "₹2100", date: "25/08/2020" },
    ];
  });
  const [loading, setLoading] = useState(true);

  const [paymentData, setPaymentData] = useState(() => {
    const saved = localStorage.getItem('paymentData');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Lili", price: "₹2100", date: "25/08/2020", status: "Approved" },
      { id: 2, name: "Rob", price: "₹2100", date: "25/08/2020", status: "Approved" },
      { id: 3, name: "Jack", price: "₹2100", date: "25/08/2020", status: "Approved" },
      { id: 4, name: "Lisa", price: "₹2100", date: "25/08/2020", status: "pending" },
      { id: 5, name: "Peter", price: "₹2100", date: "25/08/2020", status: "pending" },
    ];
  });

  const fetchLiveStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff_salaries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setStaffData(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStaff();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_salaries' }, () => {
        fetchLiveStaff();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard title="NREGS" value="576 FTTH" icon={ShoppingCart} iconColor="text-yellow-400" footerText="NREGS Details" />
        <DashboardStatCard title="CGGB" value="MPLS 250" icon={HelpCircle} iconColor="text-pink-400" footerText="Updated Now" isDashed={true} />
        <DashboardStatCard title="DOJ" value="MPLS 188" icon={DollarSign} iconColor="text-green-500" footerText="Updated Now" />
        <DashboardStatCard title="Tobacco Board" value="33 ILLs" icon={Users} iconColor="text-teal-500" footerText="Updated Now" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        {/* Live Staff Salary Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-fit">
          <div className="p-5">
            <h3 className="text-2xl font-light text-gray-400 text-center mb-6 uppercase tracking-widest text-[14px] flex items-center justify-center gap-3">
              Staff Salary
              {loading && <Loader2 size={16} className="animate-spin text-blue-500" />}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="pb-3 font-bold text-sm">Name</th>
                    <th className="pb-3 font-bold text-sm">Role</th>
                    <th className="pb-3 font-bold text-sm">Salary</th>
                    <th className="pb-3 font-bold text-sm">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {staffData.length > 0 ? (
                    staffData.map((row) => (
                      <tr key={row.id} className="text-gray-600 hover:bg-gray-50 transition-colors">
                        <td className="py-3 font-bold text-sm">{row.name}</td>
                        <td className="py-3 text-[11px] uppercase font-bold text-gray-400">{row.role}</td>
                        <td className="py-3 text-sm font-black text-blue-600">{row.salary}</td>
                        <td className="py-3 text-xs text-gray-400">{row.date}</td>
                      </tr>
                    ))
                  ) : !loading && (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest">
                        No Staff Records Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Payment Table */}
        <div className="bg-[#1a1e21] rounded-lg shadow-sm text-white h-fit">
          <div className="p-5">
            <h3 className="text-2xl font-light text-gray-400 text-center mb-6 uppercase tracking-widest text-[14px]">Recent Payment</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-600 border-b border-gray-800">
                    <th className="pb-3 font-bold text-sm">#</th>
                    <th className="pb-3 font-bold text-sm">Name</th>
                    <th className="pb-3 font-bold text-sm">Price</th>
                    <th className="pb-3 font-bold text-sm text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {paymentData.map((row) => (
                    <tr key={row.id} className="text-gray-300 hover:bg-white/5 transition-colors">
                      <td className="py-3 font-bold text-sm">{row.id}</td>
                      <td className="py-3 font-bold text-sm">{row.name}</td>
                      <td className="py-3 text-xs">{row.price}</td>
                      <td className="py-3 flex justify-center">
                        <span className={`px-4 py-1 rounded text-[10px] font-bold w-24 text-center shadow-md ${
                          row.status === 'Approved' ? 'bg-[#43a047]' : 'bg-[#e53935]'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
