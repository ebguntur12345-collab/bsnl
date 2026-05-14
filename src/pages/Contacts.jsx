import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Trash2, ChevronRight, Info } from 'lucide-react';
import { statesData } from '../data/locationData';

// ─── Reusable custom scrollable select ───────────────────────────────────────
const CustomSelect = ({ label, options, selected, onSelect, disabled = false, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative w-64" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-5 py-2.5 bg-dark-card border border-dark-border rounded-xl text-sm text-gray-300 text-left flex justify-between items-center outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
          disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:border-primary'
        }`}
      >
        <span className="truncate font-medium">{selected || placeholder}</span>
        <ChevronDown size={16} className={`text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 w-full mt-2 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-[200] max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onSelect(opt); setIsOpen(false); }}
              className={`px-5 py-3 text-sm cursor-pointer flex justify-between items-center hover:bg-white/5 transition-colors ${
                selected === opt ? 'bg-primary/10 text-primary font-bold' : 'text-gray-400'
              }`}
            >
              <span className="truncate">{opt}</span>
              {selected === opt && <Check size={14} className="flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const columns = [
  { header: 'id',          key: 'id' },
  { header: 'Circle',      key: 'circle' },
  { header: 'Designation', key: 'designation' },
  { header: 'Enterprise Name', key: 'name' },
  { header: 'Primary Contact', key: 'primaryContactName' },
  { header: 'Mobile',      key: 'mobile' },
  { header: 'mail id',     key: 'email' },
  { header: 'BA Name',     key: 'baName' },
];

const Contacts = () => {
  const [selectedState, setSelectedState]     = useState('Andhra Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState('Guntur');
  const [currentPage, setCurrentPage]         = useState(1);
  const [filteredData, setFilteredData]       = useState([]);
  const [expandedRows, setExpandedRows]       = useState({});
  const rowsPerPage = 6;

  const districts = selectedState ? statesData[selectedState] || [] : [];

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const loadAllData = () => {
    const registered = JSON.parse(localStorage.getItem('cctRegistrations') || '[]');
    return registered;
  };

  const applyFilter = (data, state, district) => {
    return data.filter(row => {
      const circleMatch = !state    || (row.circle || '').toLowerCase() === state.toLowerCase();
      const baMatch     = !district || (row.baName || '').toLowerCase() === district.toLowerCase();
      return circleMatch && baMatch;
    });
  };

  useEffect(() => {
    const all = loadAllData();
    setFilteredData(applyFilter(all, selectedState, selectedDistrict));
  }, []);

  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedDistrict('');
  };

  const handleDelete = (id) => {
    const existing = JSON.parse(localStorage.getItem('cctRegistrations') || '[]');
    const updated = existing.filter(item => (item.id || item.index) !== id);
    localStorage.setItem('cctRegistrations', JSON.stringify(updated));
    const all = loadAllData();
    setFilteredData(applyFilter(all, selectedState, selectedDistrict));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const all = loadAllData();
    setFilteredData(applyFilter(all, selectedState, selectedDistrict));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginated  = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto p-8 bg-dark-bg min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Enterprise Contacts</h1>
          <p className="text-gray-400 font-medium mt-1">Manage and filter BSNL enterprise business contacts by region.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex items-center gap-4 flex-wrap bg-dark-card p-4 rounded-2xl border border-dark-border shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Circle</span>
            <CustomSelect
              options={Object.keys(statesData)}
              selected={selectedState}
              onSelect={handleStateChange}
              placeholder="Select State"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest whitespace-nowrap">BA Name</span>
            <CustomSelect
              options={districts}
              selected={selectedDistrict}
              onSelect={setSelectedDistrict}
              disabled={!selectedState}
              placeholder="Select District"
            />
          </div>

          <button
            type="submit"
            className="px-8 py-2.5 bg-primary text-white rounded-xl font-black hover:shadow-[0_0_20px_rgba(0,180,216,0.3)] transition-all text-sm uppercase tracking-wider"
          >
            Submit
          </button>
        </form>
      </div>

      <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden shadow-2xl">
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
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-20 text-gray-600 font-bold uppercase tracking-widest text-xs">
                    No contacts found in this region
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
                      <td className="px-6 py-4 text-center">
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
                            onClick={() => handleDelete(rowId)}
                            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                            title="Delete Contact"
                          >
                            <Trash2 size={18} />
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
                              <h4 className="font-black text-white text-lg tracking-tight">Full Registration Details</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-dark-card p-6 rounded-2xl border border-dark-border shadow-inner">

                              {row.registeredAt && (
                                <div className="md:col-span-3 lg:col-span-4 pt-6 mt-4 border-t border-dark-border/50 flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,180,216,0.8)]"></div>
                                  <p className="text-xs font-bold text-gray-500 tracking-wider">REGISTERED ON: <span className="text-primary">{row.registeredAt}</span></p>
                                </div>
                              )}
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

        {/* Pagination */}
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
              {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
                    p === currentPage ? 'bg-primary text-white shadow-[0_0_15px_rgba(0,180,216,0.3)]' : 'bg-dark-card border border-dark-border text-gray-400 hover:border-primary hover:text-white'
                  }`}
                >{p}</button>
              ))}
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

export default Contacts;
