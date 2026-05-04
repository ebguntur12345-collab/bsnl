import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, ChevronDown, ChevronRight, Info } from 'lucide-react';

// Static contacts removed

const CustomerContacts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allContacts, setAllContacts] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Load registered contacts from localStorage
  const loadContacts = () => {
    const registered = JSON.parse(localStorage.getItem('cctRegistrations') || '[]');
    // Map registered entries
    const mapped = registered.map(r => ({
      id: r.id,
      companyName: r.companyName || r.contactName || '—',
      location: r.location || '—',
      contactName: r.contactName || '—',
      designation: r.designation || '—',
      contactNo: r.contactNo || '—',
      mailId: r.mailId || '—',
      isNew: true, // flag so we can highlight newly registered
      service: r.service,
      plan: r.plan,
      circuitId: r.circuitId,
      billingAccountNo: r.billingAccountNo,
      address: r.address,
      registeredAt: r.registeredAt,
    }));
    setAllContacts(mapped);
  };

  useEffect(() => {
    loadContacts();
    // Listen for storage changes from other tabs / pages
    window.addEventListener('storage', loadContacts);
    return () => window.removeEventListener('storage', loadContacts);
  }, []);

  const handleDelete = (id) => {
    const registered = JSON.parse(localStorage.getItem('cctRegistrations') || '[]');
    const updated = registered.filter(r => r.id !== id);
    localStorage.setItem('cctRegistrations', JSON.stringify(updated));
    loadContacts();
  };

  const filtered = searchTerm.trim()
    ? allContacts.filter(item =>
        item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contactNo.includes(searchTerm) ||
        item.mailId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allContacts;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b3598] to-[#00bfff] flex items-center justify-center shadow">
            <UserPlus size={16} className="text-white" />
          </span>
          <div>
            <h3 className="text-[#3b3598] font-black text-lg uppercase tracking-tight">Customer Contacts</h3>
            <p className="text-gray-400 text-xs">{filtered.length} contact{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, contact, email…"
            className="pl-9 pr-4 py-2 w-72 bg-white border border-blue-200 rounded-md outline-none focus:ring-2 focus:ring-[#00bfff] transition-all text-gray-700 text-sm shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl shadow-xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#1e40af] to-[#0ea5e9] text-white">
              <th className="px-4 py-3 font-bold text-sm uppercase tracking-tight border-r border-white/10">ID</th>
              <th className="px-4 py-3 font-bold text-sm uppercase tracking-tight border-r border-white/10">Company Name</th>
              <th className="px-4 py-3 font-bold text-sm uppercase tracking-tight border-r border-white/10">Location</th>
              <th className="px-4 py-3 font-bold text-sm uppercase tracking-tight border-r border-white/10">Contact Name</th>
              <th className="px-4 py-3 font-bold text-sm uppercase tracking-tight border-r border-white/10">Designation</th>
              <th className="px-4 py-3 font-bold text-sm uppercase tracking-tight border-r border-white/10">Contact No</th>
              <th className="px-4 py-3 font-bold text-sm uppercase tracking-tight border-r border-white/10">Mail ID</th>
              <th className="px-4 py-3 font-bold text-sm uppercase tracking-tight border-r border-white/10">Action</th>
              <th className="px-4 py-3 font-bold text-sm uppercase tracking-tight text-center">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filtered.length > 0 ? (
              filtered.map((item, index) => {
                const rowId = item.id || index;
                return (
                  <React.Fragment key={rowId}>
                    <tr
                      className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${item.isNew ? 'bg-emerald-50/40' : ''}`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-500 font-medium border-r border-gray-100">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-bold border-r border-gray-100">
                        {item.companyName}
                        {item.isNew && (
                          <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-full font-bold uppercase">New</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-100">{item.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-100">{item.contactName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-100">{item.designation}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-100">{item.contactNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[200px] border-r border-gray-100">{item.mailId}</td>
                      <td className="px-4 py-3 text-sm border-r border-gray-100">
                        {item.isNew && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete registration"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => toggleRow(rowId)} 
                          className="p-1.5 text-[#0ea5e9] hover:bg-blue-100 rounded-full transition-colors flex items-center justify-center mx-auto"
                          title="View Details"
                        >
                          {expandedRows[rowId] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </td>
                    </tr>
                    {expandedRows[rowId] && (
                      <tr className="bg-blue-50/20">
                        <td colSpan="9" className="p-0 border-b border-blue-100">
                          <div className="px-8 py-5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2 mb-4 border-b border-blue-100 pb-2 inline-flex">
                              <Info size={16} className="text-[#1e40af]" />
                              <h4 className="font-black text-[#1e40af] text-sm uppercase tracking-wider">Registration Details</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
                              <div>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Service Type</p>
                                <p className="text-sm font-semibold text-gray-800">{item.service || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Plan</p>
                                <p className="text-sm font-semibold text-gray-800">{item.plan || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Circuit ID / Phone</p>
                                <p className="text-sm font-semibold text-gray-800">{item.circuitId || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Billing Account No</p>
                                <p className="text-sm font-semibold text-gray-800">{item.billingAccountNo || 'N/A'}</p>
                              </div>
                              <div className="md:col-span-2 lg:col-span-3">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer Address</p>
                                <p className="text-sm font-semibold text-gray-800">{item.address || 'N/A'}</p>
                              </div>
                              {item.registeredAt && (
                                <div className="md:col-span-3 lg:col-span-4 pt-3 mt-1 border-t border-gray-50 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                  <p className="text-xs font-semibold text-gray-400">Registered on: {item.registeredAt}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="px-4 py-20 text-center text-gray-400 italic bg-gray-50/30">
                  {searchTerm ? `No contacts found for "${searchTerm}"` : 'No contacts yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default CustomerContacts;
