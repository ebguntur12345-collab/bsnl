import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import PdfViewer from './PdfViewer';
import { supabase } from '../lib/supabase';

const CategoryPdfs = () => {
  const { module, category } = useParams();
  const navigate = useNavigate();
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState(null);

  useEffect(() => {
    const fetchPdfs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('pdfs')
        .select('*')
        .eq('module', module)
        .eq('category', category)
        .order('created_at', { ascending: false });
        
      if (data) {
        setPdfs(data);
      }
      setLoading(false);
    };
    
    fetchPdfs();
  }, [module, category]);

  if (selectedPdf) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500 h-full flex flex-col">
        <button 
          onClick={() => setSelectedPdf(null)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold w-fit bg-white px-4 py-2 rounded-lg shadow-sm"
        >
          <ArrowLeft size={18} />
          Back to {module} - {category} Documents
        </button>
          <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden min-h-[800px] flex flex-col">
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Document: {selectedPdf.title}</span>
              <div className="flex items-center gap-4">
                <a 
                  href={selectedPdf.pdf_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-bold"
                >
                  <Download size={16} />
                  Direct Download
                </a>
              </div>
            </div>
            {/* Conditional Renderer based on file type */}
            <div className="flex-1 bg-white flex flex-col min-h-[800px]">
              {selectedPdf.pdf_url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|avif)$/) ? (
                <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                  <img 
                    src={selectedPdf.pdf_url} 
                    alt={selectedPdf.title} 
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="bg-blue-50 p-3 border-b border-blue-100 flex justify-between items-center px-6">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={14} />
                      Cloud PDF Viewer
                    </p>
                    <a 
                      href={selectedPdf.pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-md hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
                    >
                      <ExternalLink size={12} />
                      OPEN FULL SCREEN
                    </a>
                  </div>
                  <iframe 
                    src={selectedPdf.pdf_url}
                    className="w-full flex-1 border-none bg-gray-50"
                    title={selectedPdf.title}
                  />
                </div>
              )}
            </div>
          </div>
      </div>
    );
  }

  const getBackUrl = () => {
    switch(module) {
      case 'Tariffs': return '/tariffs';
      case 'Forms': return '/forms';
      default: return '/leased-lines/bulk-ccts';
    }
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(getBackUrl())}
          className="p-2 bg-white rounded-lg shadow-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-black text-[#3b3598] uppercase tracking-tight">
          {module} / {category} Documents
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-blue-500">
            <Loader2 size={48} className="animate-spin mb-4" />
            <p className="text-lg font-bold">Loading Documents...</p>
          </div>
        ) : pdfs.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#1e40af] to-[#0ea5e9] text-white">
                <th className="px-6 py-4 font-bold text-sm uppercase tracking-tight border-r border-white/10">Document Title</th>
                <th className="px-6 py-4 font-bold text-sm uppercase tracking-tight border-r border-white/10">Upload Date</th>
                <th className="px-6 py-4 font-bold text-sm uppercase tracking-tight text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pdfs.map((pdf) => (
                <tr key={pdf.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                        <FileText size={20} />
                      </div>
                      <span className="font-bold text-gray-700">{pdf.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{pdf.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedPdf(pdf)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#00bfff] hover:bg-[#0ea5e9] text-white rounded-md text-sm font-bold transition-colors shadow-sm"
                    >
                      <FileText size={16} />
                      VIEW PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
            <FileText size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl font-bold text-gray-600 mb-2">No documents found</p>
            <p className="text-sm">There are no {module} documents uploaded for {category} yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPdfs;
