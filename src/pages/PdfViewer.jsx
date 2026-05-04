import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';

const PdfViewer = ({ title }) => {
  // Dummy PDF URL
  const pdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 text-red-500 rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            <p className="text-xs text-gray-500">Official BSNL Tariff Document</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
          >
            <ExternalLink size={16} />
            Open in New Tab
          </a>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-all shadow-md active:scale-95">
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-inner border border-gray-200 overflow-hidden min-h-[600px]">
        <iframe 
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full border-none"
          title={title}
        ></iframe>
      </div>
    </div>
  );
};

export default PdfViewer;
