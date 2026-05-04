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
    <div className="relative w-48" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 bg-white border border-blue-200 rounded text-sm text-gray-700 text-left flex justify-between items-center outline-none focus:ring-2 focus:ring-[#00bfff] shadow-sm transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-[#00bfff]'
        }`}
      >
        <span className="truncate">{selected || placeholder}</span>
        <ChevronDown size={14} className={`text-[#3b3598] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-blue-200 rounded shadow-xl z-[200] max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onSelect(opt); setIsOpen(false); }}
              className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center hover:bg-blue-50 transition-colors ${
                selected === opt ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700'
              }`}
            >
              <span className="truncate">{opt}</span>
              {selected === opt && <Check size={12} className="flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Sample data removed

const columns = [
  { header: 'id',          key: 'id' },
  { header: 'Circle',      key: 'circle' },
  { header: 'Designation', key: 'designation' },
  { header: 'Name',        key: 'name' },
  { header: 'Mobile',      key: 'mobile' },
  { header: 'mail id',     key: 'email' },
  { header: 'BA Name',     key: 'baName' },
];

// ─── Page component ───────────────────────────────────────────────────────────
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

  // Load localStorage registered entries
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedDistrict('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const all = loadAllData();
    setFilteredData(applyFilter(all, selectedState, selectedDistrict));
    setCurrentPage(1);
  };

  const handleDelete = (id) => {
    const registered = JSON.parse(localStorage.getItem('cctRegistrations') || '[]');
    localStorage.setItem('cctRegistrations', JSON.stringify(registered.filter(r => r.id !== id)));
    const all = loadAllData();
    setFilteredData(applyFilter(all, selectedState, selectedDistrict));
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginated  = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Filter Form */}
      <div className="flex justify-center mt-6">
        <form onSubmit={handleSubmit} className="flex items-center gap-4 flex-wrap justify-center">
          <label className="text-[#3b3598] font-medium text-sm whitespace-nowrap">Select Circle Name :</label>
          <CustomSelect
            options={Object.keys(statesData)}
            selected={selectedState}
            onSelect={handleStateChange}
            placeholder="Select State"
          />

          <label className="text-[#3b3598] font-medium text-sm whitespace-nowrap ml-4">Select BA Name :</label>
          <CustomSelect
            options={districts}
            selected={selectedDistrict}
            onSelect={setSelectedDistrict}
            disabled={!selectedState}
            placeholder="Select District"
          />

          <button
            type="submit"
            className="ml-4 px-6 py-2 bg-[#00bfff] text-white rounded font-medium hover:bg-[#009acd] transition-colors shadow-sm text-sm"
          >
            Submit
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md shadow border border-gray-100 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#00bfff] text-white">
                {columns.map((col, i) => (
                  <th key={i} className="px-4 py-3 font-semibold whitespace-nowrap border-r border-white/20">
                    {col.header}
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold whitespace-nowrap text-center w-16">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-8 text-gray-400">No records found</td>
                </tr>
              ) : paginated.map((row, i) => {
                const rowId = row.id || i;
                return (
                  <React.Fragment key={rowId}>
                    <tr className="hover:bg-blue-50/30 transition-colors odd:bg-white even:bg-gray-50/50">
                      {columns.map((col, j) => (
                        <td key={j} className="px-4 py-3 text-gray-600 truncate border-r border-gray-100" title={row[col.key]}>
                          {row[col.key]}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => toggleRow(rowId)} 
                          className="p-1.5 text-[#00bfff] hover:bg-blue-100 rounded-full transition-colors flex items-center justify-center mx-auto"
                          title="View Details"
                        >
                          {expandedRows[rowId] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </td>
                    </tr>
                    {expandedRows[rowId] && (
                      <tr className="bg-blue-50/20">
                        <td colSpan={columns.length + 1} className="p-0 border-b border-blue-100">
                          <div className="px-8 py-5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2 mb-4 border-b border-blue-100 pb-2 inline-flex">
                              <Info size={16} className="text-[#3b3598]" />
                              <h4 className="font-black text-[#3b3598] text-sm uppercase tracking-wider">Registration Details</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
                              <div>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Service Type</p>
                                <p className="text-sm font-semibold text-gray-800">{row.service || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Plan</p>
                                <p className="text-sm font-semibold text-gray-800">{row.plan || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Circuit ID / Phone</p>
                                <p className="text-sm font-semibold text-gray-800">{row.circuitId || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Billing Account No</p>
                                <p className="text-sm font-semibold text-gray-800">{row.billingAccountNo || 'N/A'}</p>
                              </div>
                              <div className="md:col-span-2 lg:col-span-3">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer Address</p>
                                <p className="text-sm font-semibold text-gray-800">{row.address || 'N/A'}</p>
                              </div>
                              {row.registeredAt && (
                                <div className="md:col-span-3 lg:col-span-4 pt-3 mt-1 border-t border-gray-50 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                  <p className="text-xs font-semibold text-gray-400">Registered on: {row.registeredAt}</p>
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
        <div className="px-6 py-3 bg-white border-t border-gray-100 flex items-center justify-end">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-[#00bfff] hover:text-[#00bfff] disabled:opacity-40 transition-all text-xs"
            >«</button>
            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold transition-all ${
                  p === currentPage ? 'bg-[#007bff] text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#00bfff]'
                }`}
              >{p}</button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-[#00bfff] hover:text-[#00bfff] disabled:opacity-40 transition-all text-xs"
            >»</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
