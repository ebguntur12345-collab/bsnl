import React from 'react';
import { ChevronLeft, ChevronRight, Edit2, Trash2, Eye } from 'lucide-react';

const DataTable = ({ columns, data, title }) => {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 cyan-gradient text-white rounded-lg text-sm font-bold hover:scale-105 transition-all shadow-md">
              + Add New
            </button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="table-header-gradient">
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-4 text-sm font-semibold first:rounded-tl-none last:rounded-tr-none">
                  {col.header}
                </th>
              ))}
              <th className="px-6 py-4 text-sm font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-bsnl-light/30 transition-colors group odd:bg-white even:bg-gray-50/50">
                {columns.map((col, j) => (
                  <td key={j} className="px-6 py-4 text-sm text-gray-600">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye size={16} />
                    </button>
                    <button className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-500">Showing 1 to 10 of 45 entries</span>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-primary hover:border-primary transition-all disabled:opacity-50">
            <ChevronLeft size={18} />
          </button>
          {[1, 2, 3, '...', 5].map((page, i) => (
            <button 
              key={i} 
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                page === 1 ? 'cyan-gradient text-white shadow-md shadow-cyan-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:border-cyan-400 hover:text-cyan-600'
              }`}
            >
              {page}
            </button>
          ))}
          <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-primary hover:border-primary transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
