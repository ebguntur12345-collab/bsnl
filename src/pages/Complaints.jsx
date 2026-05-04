import React from 'react';
import { AlertCircle, Clock, CheckCircle2, User } from 'lucide-react';

const Complaints = () => {
  const [complaints, setComplaints] = React.useState([
    { id: 'TKT-9901', enterprise: 'ITC Guntur', issue: 'ILL Down', time: '10:30 AM', priority: 'High', status: 'In Progress', assigned: 'Naveen (Controller)' },
    { id: 'TKT-9902', enterprise: 'Collector Office', issue: 'Slow Speed', time: '09:15 AM', priority: 'Medium', status: 'Pending', assigned: 'Suresh (Worker)' },
    { id: 'TKT-9895', enterprise: 'Sangam Dairy', issue: 'SIP Registration', time: 'Yesterday', priority: 'Low', status: 'Resolved', assigned: 'Rajesh (Controller)' },
    { id: 'TKT-9890', enterprise: 'GMC Office', issue: 'Router Failure', time: 'Yesterday', priority: 'High', status: 'Resolved', assigned: 'Anil (Worker)' },
  ]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 animate-in fade-in duration-700">
      {/* Internal Management Form */}
      <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-black text-[#1e40af] mb-6 uppercase tracking-tight">Admin Case Logging</h2>
        <p className="text-xs text-gray-500 mb-6 -mt-4 italic">Register complaints received from customers and assign to staff.</p>
        
        <form className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Enterprise / Customer Name</label>
            <input 
              type="text" 
              placeholder="e.g. ITC Guntur" 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Circuit ID / BAN</label>
            <input 
              type="text" 
              placeholder="e.g. GNI-ILL-123" 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Issue Category</label>
            <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200l6%206%206-6z%22%20fill%3D%22%23666%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:calc(100%-1rem)_center]">
              <option>Connectivity Issue</option>
              <option>Hardware Failure</option>
              <option>Billing Dispute</option>
              <option>Configuration</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Assign To (Controller/Worker)</label>
            <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200l6%206%206-6z%22%20fill%3D%22%23666%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:calc(100%-1rem)_center]">
              <option>Select Staff Member</option>
              <option>Naveen (Controller)</option>
              <option>Suresh (Worker)</option>
              <option>Rajesh (Controller)</option>
              <option>Anil (Worker)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
            <textarea 
              placeholder="Describe the issue reported by customer..." 
              className="w-full h-24 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all resize-none"
            ></textarea>
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-[#1e40af] to-[#0ea5e9] text-white font-bold rounded-lg shadow-lg hover:opacity-90 transition-all active:scale-95 uppercase tracking-widest text-sm">
            Log and Dispatch
          </button>
        </form>
      </div>

      {/* Internal Management Table */}
      <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-gray-50">
          <h2 className="text-xl font-black text-gray-400 uppercase tracking-tight">Active Internal Logs</h2>
          <button className="bg-[#0dcaf0] hover:bg-[#0baccc] text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition-all">+ Dispatch New</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-[#0dcaf0] text-white">
                <th className="px-4 py-3 font-bold uppercase">ID</th>
                <th className="px-4 py-3 font-bold uppercase">Customer</th>
                <th className="px-4 py-3 font-bold uppercase">Issue</th>
                <th className="px-4 py-3 font-bold uppercase text-blue-900 bg-white/10">Assigned To</th>
                <th className="px-4 py-3 font-bold uppercase text-center">Priority</th>
                <th className="px-4 py-3 font-bold uppercase text-center">Status</th>
                <th className="px-4 py-3 font-bold uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {complaints.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-4 font-medium text-gray-400">{item.id}</td>
                  <td className="px-4 py-4 font-bold text-gray-700">{item.enterprise}</td>
                  <td className="px-4 py-4 text-gray-600">{item.issue}</td>
                  <td className="px-4 py-4 text-blue-600 font-bold bg-blue-50/20">{item.assigned}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-bold shadow-sm ${
                      item.priority === 'High' ? 'bg-red-50 text-red-500 border border-red-100' :
                      item.priority === 'Medium' ? 'bg-orange-50 text-orange-500 border border-orange-100' :
                      'bg-blue-50 text-blue-500 border border-blue-100'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="flex items-center justify-center gap-1.5 text-gray-500 font-medium">
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'Resolved' ? 'bg-green-400' :
                        item.status === 'Pending' ? 'bg-orange-400' : 'bg-blue-400'
                      }`}></div>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button className="text-gray-400 hover:text-blue-500 transition-colors">
                      <div className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center mx-auto">
                        <span className="text-lg">...</span>
                      </div>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">INTERNAL MANAGEMENT VIEW | TOTAL ACTIVE: 4</p>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((n, i) => (
              <button key={i} className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold transition-all ${
                n === 1 ? 'bg-[#0dcaf0] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'
              }`}>{n}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaints;
