import React from 'react';
import { ChevronLeft, ChevronRight, Edit2, Trash2, Eye } from 'lucide-react';

const DataTable = ({ columns, data, title }) => {
  return (
    <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
      {title && (
        <div className="px-8 py-6 border-b border-dark-border flex justify-between items-center bg-dark-card">
          <h3 className="font-black text-white text-xl tracking-tight">{title}</h3>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all shadow-lg">
              + Add New
            </button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-bg/50 text-gray-400 border-b border-dark-border">
              {columns.map((col, i) => (
                <th key={i} className="px-8 py-4 text-[11px] font-black uppercase tracking-widest">
                  {col.header}
                </th>
              ))}
              <th className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/30">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                {columns.map((col, j) => (
                  <td key={j} className="px-8 py-4 text-sm text-gray-300 font-medium">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                <td className="px-8 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors" title="View">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-colors" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-8 py-6 bg-dark-bg/30 border-t border-dark-border flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Showing 1 to 10 of 45 entries</span>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-dark-card border border-dark-border rounded-xl text-gray-400 hover:text-primary hover:border-primary transition-all disabled:opacity-30">
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((page, i) => (
              <button 
                key={i} 
                className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
                  page === 1 ? 'bg-primary text-white shadow-[0_0_15px_rgba(0,180,216,0.3)]' : 'bg-dark-card border border-dark-border text-gray-400 hover:border-primary hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button className="p-2.5 bg-dark-card border border-dark-border rounded-xl text-gray-400 hover:text-primary hover:border-primary transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
