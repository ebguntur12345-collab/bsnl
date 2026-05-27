import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, ChevronDown, ChevronRight, Info, Loader2, FileDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

const CustomerContacts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allContacts, setAllContacts] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [expandedDetails, setExpandedDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const downloadExcel = () => {
    if (filtered.length === 0) {
      alert("No contacts available to export");
      return;
    }
    const exportData = filtered.map((row, index) => ({
      "#": index + 1,
      "Company Name": row.companyName || '—',
      "Location": row.location || '—',
      "Contact Name": row.contactName || '—',
      "Designation": row.designation || '—',
      "Contact No": row.contactNo || '—',
      "Mail ID": row.mailId || '—',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer_Contacts");
    
    // Auto-fit column widths
    const maxLens = {};
    exportData.forEach(row => {
      Object.keys(row).forEach(key => {
        const valStr = String(row[key]);
        maxLens[key] = Math.max(maxLens[key] || key.length, valStr.length);
      });
    });
    worksheet['!cols'] = Object.keys(maxLens).map(key => ({
      wch: Math.min(maxLens[key] + 3, 50)
    }));

    XLSX.writeFile(workbook, "Customer_Contacts.xlsx");
  };

  // Load registered contacts from Supabase
  const loadContacts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers_data')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error loading contacts:', error.message);
      } else {
        const mapped = (data || []).map(r => ({
          id: r.id,
          companyName: r.company_name || '—',
          location: r.location || '—',
          contactName: r.contact_name || '—',
          designation: r.designation || '—',
          contactNo: r.contact_no || '—',
          mailId: r.mail_id || '—',
        }));
        setAllContacts(mapped);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const toggleRow = async (row) => {
    const rowId = row.id;
    const isExpanding = !expandedRows[rowId];
    
    setExpandedRows(prev => ({ ...prev, [rowId]: isExpanding }));

    if (isExpanding && !expandedDetails[rowId]) {
      setLoadingDetails(prev => ({ ...prev, [rowId]: true }));
      try {
        const nameClean = row.companyName.trim();
        const contactNoClean = row.contactNo.trim();

        // 1. Try ILL
        let { data: ill } = await supabase
          .from('ill_data')
          .select('*')
          .or(`customer_name.ilike.%${nameClean}%,phone_no.eq.${contactNoClean}`)
          .limit(1);

        if (ill && ill.length > 0) {
          setExpandedDetails(prev => ({
            ...prev,
            [rowId]: {
              service: 'Internet Leased Line (ILL)',
              plan: ill[0].bandwidth || '—',
              circuitId: ill[0].lc_id || '—',
              billingAccountNo: ill[0].billing_account_no || '—',
              dateOfCommission: ill[0].service_start_date || '—',
              address: ill[0].address || '—'
            }
          }));
          return;
        }

        // 2. Try PRI
        let { data: pri } = await supabase
          .from('pri_data')
          .select('*')
          .or(`customer_name.ilike.%${nameClean}%,telephone_no.eq.${contactNoClean}`)
          .limit(1);

        if (pri && pri.length > 0) {
          setExpandedDetails(prev => ({
            ...prev,
            [rowId]: {
              service: 'PRI Data',
              plan: pri[0].pri_plan || '—',
              circuitId: pri[0].telephone_no || '—',
              billingAccountNo: pri[0].billing_account_no || '—',
              dateOfCommission: '—',
              address: pri[0].address || '—'
            }
          }));
          return;
        }

        // 3. Try SIP
        let { data: sip } = await supabase
          .from('sip_data')
          .select('*')
          .or(`customer_name.ilike.%${nameClean}%,telephone_no.eq.${contactNoClean}`)
          .limit(1);

        if (sip && sip.length > 0) {
          setExpandedDetails(prev => ({
            ...prev,
            [rowId]: {
              service: 'SIP Data',
              plan: sip[0].sip_plan || '—',
              circuitId: sip[0].telephone_no || '—',
              billingAccountNo: sip[0].billing_account_no || '—',
              dateOfCommission: '—',
              address: sip[0].address || '—'
            }
          }));
          return;
        }

        // 4. Try MMVC
        let { data: mmvc } = await supabase
          .from('mmvc_data')
          .select('*')
          .or(`customer_name.ilike.%${nameClean}%,telephone_no.eq.${contactNoClean}`)
          .limit(1);

        if (mmvc && mmvc.length > 0) {
          setExpandedDetails(prev => ({
            ...prev,
            [rowId]: {
              service: 'MMVC Data',
              plan: mmvc[0].mmv_plan || '—',
              circuitId: mmvc[0].telephone_no || '—',
              billingAccountNo: mmvc[0].billing_account_no || '—',
              dateOfCommission: '—',
              address: mmvc[0].address || '—'
            }
          }));
          return;
        }

        // 5. Try MPLS
        let { data: mpls } = await supabase
          .from('mpls_data')
          .select('*')
          .or(`customer_name.ilike.%${nameClean}%,telephone_no.eq.${contactNoClean}`)
          .limit(1);

        if (mpls && mpls.length > 0) {
          setExpandedDetails(prev => ({
            ...prev,
            [rowId]: {
              service: 'MPLS Data',
              plan: mpls[0].bandwidth || '—',
              circuitId: mpls[0].telephone_no || '—',
              billingAccountNo: mpls[0].billing_account_no || '—',
              dateOfCommission: '—',
              address: mpls[0].address || '—'
            }
          }));
          return;
        }

        // Fallback
        setExpandedDetails(prev => ({
          ...prev,
          [rowId]: {
            service: 'None / General Contact',
            plan: '—',
            circuitId: '—',
            billingAccountNo: '—',
            dateOfCommission: '—',
            address: '—'
          }
        }));

      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoadingDetails(prev => ({ ...prev, [rowId]: false }));
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      const { error } = await supabase
        .from('customers_data')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting contact:', error.message);
        alert('Failed to delete contact: ' + error.message);
      } else {
        loadContacts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = searchTerm.trim()
    ? allContacts.filter(item =>
        item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contactNo.includes(searchTerm) ||
        item.mailId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allContacts;

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const renderPaginationButtons = () => {
    const pages = [];
    if (totalPages <= 8) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1); // Always show first page
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        end = 4;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages); // Always show last page
    }
    
    return pages.map((p, idx) => {
      if (p === '...') {
        return (
          <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-600 text-sm font-bold">
            ...
          </span>
        );
      }
      return (
        <button
          key={p}
          onClick={() => setCurrentPage(p)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
            p === currentPage 
              ? 'bg-primary text-white shadow-[0_0_15px_rgba(0,180,216,0.3)]' 
              : 'bg-dark-card border border-dark-border text-gray-400 hover:border-primary hover:text-white'
          }`}
        >
          {p}
        </button>
      );
    });
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 bg-dark-bg min-h-screen">

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b3598] to-[#00bfff] flex items-center justify-center shadow">
            <UserPlus size={16} className="text-white" />
          </span>
          <div>
            <h3 className="text-white font-black text-lg uppercase tracking-tight">Customer Directory</h3>
            <p className="text-gray-400 text-xs">
              {loading ? 'Loading…' : `${filtered.length} contact${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] h-[38px]"
            title="Download Excel"
          >
            <FileDown size={14} />
            <span>Export</span>
          </button>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, contact, email…"
              className="pl-9 pr-4 py-2 w-72 bg-dark-card border border-dark-border rounded-md outline-none focus:ring-2 focus:ring-[#00bfff]/20 transition-all text-gray-300 text-sm shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl shadow-xl border border-dark-border bg-dark-card animate-in slide-in-from-bottom-4 duration-500">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-bg/60 border-b border-dark-border text-gray-400">
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">#</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Company Name</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Contact Name</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Designation</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Contact No</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Mail ID</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Action</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/20">
            {loading ? (
              <tr>
                <td colSpan="9" className="px-6 py-20 text-center">
                  <Loader2 size={32} className="animate-spin text-primary mx-auto" />
                </td>
              </tr>
            ) : paginated.length > 0 ? (
              paginated.map((item, index) => {
                const rowId = item.id;
                const details = expandedDetails[rowId];
                const isDetailsLoading = loadingDetails[rowId];

                return (
                  <React.Fragment key={rowId}>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                      <td className="px-6 py-4 text-sm text-white font-bold">{item.companyName}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.contactName}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.designation}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.contactNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-300 truncate max-w-[200px]">{item.mailId}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete contact"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => toggleRow(item)} 
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center mx-auto"
                          title="View Details"
                        >
                          {expandedRows[rowId] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </td>
                    </tr>
                    {expandedRows[rowId] && (
                      <tr className="bg-dark-bg/40">
                        <td colSpan="9" className="p-0 border-b border-dark-border/20">
                          <div className="px-10 py-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2 mb-4 border-b border-dark-border pb-2 inline-flex">
                              <Info size={16} className="text-primary" />
                              <h4 className="font-black text-white text-xs uppercase tracking-wider">Circuit & Technical Details</h4>
                            </div>

                            {isDetailsLoading ? (
                              <div className="flex items-center gap-3 py-4 text-gray-500 text-sm">
                                <Loader2 size={16} className="animate-spin text-primary" />
                                <span>Matching with active circuits…</span>
                              </div>
                            ) : details ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-dark-card p-5 rounded-xl border border-dark-border shadow-sm">
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Service Type</p>
                                  <p className="text-sm font-semibold text-primary">{details.service || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Plan / Bandwidth</p>
                                  <p className="text-sm font-semibold text-gray-300">{details.plan || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Circuit ID / Phone</p>
                                  <p className="text-sm font-semibold text-gray-300">{details.circuitId || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Billing Account No</p>
                                  <p className="text-sm font-semibold text-gray-300">{details.billingAccountNo || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Date of Commission</p>
                                  <p className="text-sm font-semibold text-gray-300">{details.dateOfCommission || '—'}</p>
                                </div>
                                <div className="md:col-span-2 lg:col-span-3">
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Customer Address</p>
                                  <p className="text-sm font-semibold text-gray-300">{details.address || '—'}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 py-2">
                                No active circuit match found in service sheets.
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-20 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">
                  {searchTerm ? `No contacts found for "${searchTerm}"` : 'No customers yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Dynamic sliding window pagination footer */}
        <div className="px-8 py-6 bg-dark-bg/30 border-t border-dark-border flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Showing {paginated.length} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 bg-dark-card border border-dark-border rounded-xl text-gray-400 hover:text-primary hover:border-primary disabled:opacity-30 transition-all"
            ><ChevronRight size={18} className="rotate-180" /></button>
            
            <div className="flex gap-2">
              {renderPaginationButtons()}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 bg-dark-card border border-dark-border rounded-xl text-gray-400 hover:text-primary hover:border-primary disabled:opacity-30 transition-all"
            ><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CustomerContacts;
