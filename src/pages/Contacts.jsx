import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Info, Loader2, Search, FileDown, FileUp, Trash2, Plus, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import { importExcelData } from '../lib/excelImport';

const columns = [
  { header: '#',           key: 'id' },
  { header: 'Circle',      key: 'circle' },
  { header: 'Designation', key: 'designation' },
  { header: 'Name',        key: 'name' },
  { header: 'Mobile',      key: 'mobile' },
  { header: 'Mail ID',     key: 'mail_id' },
  { header: 'BA Name',     key: 'ba_name' },
];



const Contacts = () => {
  const [selectedCircle, setSelectedCircle] = useState('ALL');
  const [selectedBA, setSelectedBA]         = useState('ALL');
  const [searchTerm, setSearchTerm]         = useState('');
  const [currentPage, setCurrentPage]        = useState(1);
  const [allData, setAllData]                = useState([]);
  const [expandedRows, setExpandedRows]      = useState({});
  const [loading, setLoading]                = useState(false);
  const [importing, setImporting]            = useState(false);
  const rowsPerPage = 10;

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const result = await importExcelData(file, 'eb_contacts');
      alert(`Successfully imported ${result.count} EB contacts!`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(`Import failed: ${err.message || err}`);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const downloadExcel = () => {
    if (filteredData.length === 0) {
      alert("No contacts available to export");
      return;
    }
    const exportData = filteredData.map((row, index) => ({
      "#": index + 1,
      "Circle": row.circle || '—',
      "Designation": row.designation || '—',
      "Enterprise Name": row.enterprise_name || '—',
      "Name": row.name || '—',
      "Mobile": row.mobile || '—',
      "Mail ID": row.mail_id || '—',
      "BA Name": row.ba_name || '—',
      "Service Type": row.service_type || '—',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EB_Contacts");
    
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

    XLSX.writeFile(workbook, "EB_Contacts.xlsx");
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalData, setModalData] = useState({
    enterprise_name: '',
    circle: '',
    name: '',
    designation: '',
    mobile: '',
    mail_id: '',
    ba_name: '',
    service_type: ''
  });
  const [saving, setSaving] = useState(false);

  const handleAddClick = () => {
    setEditingId(null);
    setModalData({
      enterprise_name: '',
      circle: '',
      name: '',
      designation: '',
      mobile: '',
      mail_id: '',
      ba_name: '',
      service_type: ''
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (contact) => {
    setEditingId(contact.id);
    setModalData({
      enterprise_name: contact.enterprise_name || '',
      circle: contact.circle || '',
      name: contact.name || '',
      designation: contact.designation || '',
      mobile: contact.mobile || '',
      mail_id: contact.mail_id || '',
      ba_name: contact.ba_name || '',
      service_type: contact.service_type || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...modalData };
      let res;
      if (editingId) {
        // Simulate update using DELETE + INSERT with the same ID because RLS blocks direct UPDATEs
        const deleteRes = await supabase.from('eb_contacts').delete().eq('id', editingId);
        if (deleteRes.error) {
          res = deleteRes;
        } else {
          res = await supabase.from('eb_contacts').insert([{ id: editingId, ...payload }]);
        }
      } else {
        res = await supabase.from('eb_contacts').insert([payload]);
      }

      if (res.error) {
        alert('Error saving contact: ' + res.error.message);
      } else {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('eb_contacts')
        .select('*')
        .order('id', { ascending: true });
      if (!error && data) setAllData(data);
    } finally {
      setLoading(false);
    }
  };

  // Load all EB contacts on mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this EB contact?')) return;
    try {
      const { error } = await supabase
        .from('eb_contacts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting EB contact:', error.message);
        alert('Failed to delete contact: ' + error.message);
      } else {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamically extract unique circles from database records for dropdown selector
  const uniqueCircles = Array.from(
    new Set(allData.map(r => r.circle).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  // Dynamically extract unique BA names based on the currently selected circle
  const uniqueBAs = Array.from(
    new Set(
      allData
        .filter(r => selectedCircle === 'ALL' || (r.circle || '').toLowerCase() === selectedCircle.toLowerCase())
        .map(r => r.ba_name)
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  // Handle Circle change to automatically reset BA filter
  const handleCircleChange = (val) => {
    setSelectedCircle(val);
    setSelectedBA('ALL');
    setCurrentPage(1);
  };

  // Premium, robust case-insensitive filtering irrespective of capital/small letters
  const filteredData = allData.filter(r => {
    // 1. Circle selection filter (exact match, case-insensitive)
    if (selectedCircle !== 'ALL') {
      const matchCircle = (r.circle || '').toLowerCase() === selectedCircle.toLowerCase();
      if (!matchCircle) return false;
    }

    // 2. BA Name selection filter (exact match, case-insensitive)
    if (selectedBA !== 'ALL') {
      const matchBA = (r.ba_name || '').toLowerCase() === selectedBA.toLowerCase();
      if (!matchBA) return false;
    }
    
    // 3. Free-text search filter (matches all key fields case-insensitively)
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      const matchSearch =
        (r.circle || '').toLowerCase().includes(s) ||
        (r.designation || '').toLowerCase().includes(s) ||
        (r.name || '').toLowerCase().includes(s) ||
        (r.enterprise_name || '').toLowerCase().includes(s) ||
        (r.mobile || '').toLowerCase().includes(s) ||
        (r.mail_id || '').toLowerCase().includes(s) ||
        (r.ba_name || '').toLowerCase().includes(s);
      
      if (!matchSearch) return false;
    }
    
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginated  = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Sliding window pagination implementation to avoid clipping or screen overflow
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto p-8 bg-dark-bg min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">EB Contacts</h1>
          <p className="text-gray-400 font-medium mt-1">
            {filteredData.length} of {allData.length} contacts
          </p>
        </div>

        {/* Filter Controls (Circle selector + BA Name selector + Search input) */}
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap">
          
          {/* State (Circle) Selector */}
          <div className="relative">
            <select
              value={selectedCircle}
              onChange={e => handleCircleChange(e.target.value)}
              className="pl-5 pr-10 py-3 bg-dark-card border border-dark-border rounded-xl text-sm text-gray-300 outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer w-52 sm:w-56"
            >
              <option value="ALL">All Circles (States)</option>
              {uniqueCircles.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* BA Name (City) Selector */}
          <div className="relative">
            <select
              value={selectedBA}
              onChange={e => { setSelectedBA(e.target.value); setCurrentPage(1); }}
              className="pl-5 pr-10 py-3 bg-dark-card border border-dark-border rounded-xl text-sm text-gray-300 outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer w-52 sm:w-56"
            >
              <option value="ALL">All BA Names</option>
              {uniqueBAs.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Dynamic Free-text input search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, designation, mobile…"
              className="pl-10 pr-5 py-3 w-80 bg-dark-card border border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm text-gray-300 placeholder:text-gray-600 transition-all"
            />
          </div>

          {/* Add Contact Button */}
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] h-[46px]"
            title="Add EB Contact"
          >
            <Plus size={16} />
            <span>Add Contact</span>
          </button>

          {/* Export Button */}
          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] h-[46px]"
            title="Download Excel"
          >
            <FileDown size={16} />
            <span>Export</span>
          </button>

          {/* Import Button */}
          <input
            type="file"
            id="import-excel-input"
            accept=".xlsx, .xls"
            onChange={handleImportExcel}
            className="hidden"
          />
          <button
            onClick={() => document.getElementById('import-excel-input').click()}
            disabled={importing}
            className="flex items-center gap-2 bg-dark-card border border-dark-border hover:border-primary/50 text-gray-300 hover:text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] h-[46px] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload/Import Excel"
          >
            {importing ? (
              <Loader2 size={16} className="animate-spin text-primary" />
            ) : (
              <FileUp size={16} className="text-primary" />
            )}
            <span>{importing ? 'Importing…' : 'Import'}</span>
          </button>
        </div>
      </div>

      <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-dark-bg/50 text-gray-400 border-b border-dark-border">
                {columns.map((col, i) => (
                  <th key={i} className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">
                    {col.header}
                  </th>
                ))}
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/30">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-20">
                    <Loader2 size={32} className="animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-20 text-gray-600 font-bold uppercase tracking-widest text-xs">
                    No contacts matched your search criteria
                  </td>
                </tr>
              ) : paginated.map((row, i) => {
                const rowId = row.id || i;
                return (
                  <React.Fragment key={rowId}>
                    <tr className="hover:bg-white/[0.02] transition-colors group">
                      {columns.map((col, j) => (
                        <td key={j} className="px-6 py-4 text-gray-300 font-medium truncate max-w-[200px]" title={row[col.key]}>
                          {row[col.key]}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-center text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => toggleRow(rowId)} 
                            className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                              expandedRows[rowId] ? 'bg-primary text-white shadow-[0_0_15px_rgba(0,180,216,0.3)]' : 'text-primary hover:bg-primary/10'
                            }`}
                          >
                            {expandedRows[rowId] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </button>
                          <button
                            onClick={() => handleEditClick(row)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors flex items-center justify-center"
                            title="Edit EB Contact"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center justify-center"
                            title="Delete EB Contact"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows[rowId] && (
                      <tr>
                        <td colSpan={columns.length + 1} className="p-0 bg-dark-bg/30">
                          <div className="px-10 py-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                                <Info size={20} />
                              </div>
                              <h4 className="font-black text-white text-lg tracking-tight">Full Contact Details</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-dark-card p-6 rounded-2xl border border-dark-border shadow-inner">
                              {[
                                { label: 'Circle',          value: row.circle },
                                { label: 'Designation',     value: row.designation },
                                { label: 'Enterprise Name', value: row.enterprise_name },
                                { label: 'Contact Name',    value: row.name },
                                { label: 'Mobile',          value: row.mobile },
                                { label: 'Mail ID',         value: row.mail_id },
                                { label: 'BA Name',         value: row.ba_name },
                                { label: 'Service Type',    value: row.service_type },
                              ].map((f, fi) => (
                                <div key={fi}>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">{f.label}</p>
                                  <p className="text-sm font-bold text-gray-300">{f.value || '—'}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Dynamic sliding window pagination footer */}
        <div className="px-8 py-6 bg-dark-bg/30 border-t border-dark-border flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Showing {paginated.length} of {filteredData.length} entries
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

      {/* Dynamic Data Edit / Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-in fade-in duration-300">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 relative">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
              <h3 className="text-white font-black text-sm uppercase tracking-wider">
                {editingId ? 'Edit EB Contact' : 'Add New EB Contact'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
            
            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { key: 'enterprise_name', label: 'Enterprise/Company Name', required: true },
                  { key: 'name', label: 'Contact Name', required: true },
                  { key: 'designation', label: 'Designation' },
                  { key: 'mobile', label: 'Mobile No', required: true },
                  { key: 'mail_id', label: 'Mail ID' },
                  { key: 'circle', label: 'Circle/State', required: true },
                  { key: 'ba_name', label: 'BA Name/District', required: true },
                  { key: 'service_type', label: 'Service Category/Type' },
                ].map((f) => (
                  <div key={f.key} className="flex flex-col space-y-1">
                    <label className="text-[9px] font-black text-primary uppercase tracking-[0.2em] ml-1">
                      {f.label} {f.required && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      required={f.required}
                      value={modalData[f.key] || ''}
                      onChange={(e) => setModalData(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={`Enter ${f.label}`}
                      className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-700"
                    />
                  </div>
                ))}
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-border/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-dark-bg border border-dark-border text-gray-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
