import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PdfViewer = ({ title, module, category }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdf = async () => {
      setLoading(true);
      
      let query = supabase.from('pdfs').select('pdf_url');
      
      if (module && category) {
        // Precise matching by module and category
        query = query.eq('module', module).eq('category', category);
      } else {
        // Fallback to title matching
        query = query.ilike('title', `%${title.replace(/Tariff|Form/g, '').trim()}%`);
      }

      const { data } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setPdfUrl(data.pdf_url);
      } else {
        // Fallback to a working dummy if not found
        setPdfUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
      }
      setLoading(false);
    };

    fetchPdf();
  }, [title, module, category]);

  if (loading) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center text-primary bg-white rounded-xl border border-gray-100 shadow-sm">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="font-bold">Locating Document...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 text-red-500 rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            <p className="text-xs text-gray-500">Official BSNL Document</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pdfUrl && (
            <>
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
              >
                <ExternalLink size={16} />
                Open in New Tab
              </a>
              <a 
                href={pdfUrl} 
                download
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-all shadow-md active:scale-95"
              >
                <Download size={16} />
                Download PDF
              </a>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-inner border border-gray-200 overflow-hidden min-h-[700px]">
        {pdfUrl ? (
          <iframe 
            src={pdfUrl.includes('cloudinary') ? pdfUrl : `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
            className="w-full h-full border-none"
            title={title}
          ></iframe>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10 text-center">
             <FileText size={48} className="mb-4 opacity-20" />
             <p className="font-bold text-gray-600">Document Not Available</p>
             <p className="text-sm">Please upload this document in the Admin Panel.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
