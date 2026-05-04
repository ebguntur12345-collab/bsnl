import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { servicesData } from '../data/locationData';
import { 
  FileText, 
  Users, 
  Upload, 
  LogOut, 
  Plus, 
  Trash2,
  CheckCircle,
  AlertCircle,
  CreditCard,
  RefreshCw,
  UserPlus
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pdf');
  const [status, setStatus] = useState({ type: '', message: '' });

  // PDF State
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfModule, setPdfModule] = useState('Bulk CCTs');
  const [pdfCategory, setPdfCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPdfs, setUploadedPdfs] = useState([]);

  // Staff Salary State
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [staffSalary, setStaffSalary] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [isAddingStaff, setIsAddingStaff] = useState(false);

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch PDFs
        const { data: pdfs } = await supabase.from('pdfs').select('*').order('created_at', { ascending: false });
        setUploadedPdfs(pdfs || []);

        // Fetch Salaries (Create table if it doesn't exist via code is not possible, so we assume it exists or we handle error)
        const { data: salaries, error } = await supabase.from('staff_salaries').select('*').order('created_at', { ascending: false });
        if (!error) setStaffList(salaries || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) navigate('/admin');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!pdfTitle || !pdfFile) return setStatus({ type: 'error', message: 'Title and File required' });
    setIsUploading(true);

    try {
      const isPdf = pdfFile.type === 'application/pdf' || pdfFile.name.toLowerCase().endsWith('.pdf');
      const resourceType = isPdf ? 'raw' : 'image';
      const publicId = `bsnl_pdfs/${pdfFile.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}${isPdf ? '.pdf' : ''}`;

      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formData.append('public_id', publicId);
      
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
        method: 'POST',
        body: formData
      });
      
      const cloudinaryData = await cloudinaryRes.json();
      const { data, error } = await supabase.from('pdfs').insert([{
        title: pdfTitle,
        module: pdfModule,
        category: pdfCategory || 'General',
        location: 'All India',
        pdf_url: cloudinaryData.secure_url,
        date: new Date().toISOString().split('T')[0]
      }]).select();

      if (error) throw error;
      setUploadedPdfs([data[0], ...uploadedPdfs]);
      setPdfTitle('');
      setPdfFile(null);
      setStatus({ type: 'success', message: 'PDF published successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Upload failed' });
    } finally {
      setIsUploading(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffName || !staffSalary) return setStatus({ type: 'error', message: 'Name and Salary required' });
    setIsAddingStaff(true);

    try {
      const { data, error } = await supabase.from('staff_salaries').insert([{
        name: staffName,
        role: staffRole || 'Staff',
        salary: staffSalary,
        date: new Date().toLocaleDateString('en-GB')
      }]).select();

      if (error) throw error;
      setStaffList([data[0], ...staffList]);
      setStaffName('');
      setStaffRole('');
      setStaffSalary('');
      setStatus({ type: 'success', message: 'Staff added successfully!' });
    } catch (err) {
      console.error("Save error:", err);
      setStatus({ type: 'error', message: `Failed: ${err.message || 'Database error'}` });
    } finally {
      setIsAddingStaff(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 10000);
    }
  };

  const deleteStaff = async (id) => {
    if (!window.confirm('Delete this staff record?')) return;
    try {
      await supabase.from('staff_salaries').delete().eq('id', id);
      setStaffList(staffList.filter(s => s.id !== id));
      setStatus({ type: 'success', message: 'Staff record deleted' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Delete failed' });
    }
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  const deletePdf = async (id) => {
    if (!window.confirm('Delete document?')) return;
    await supabase.from('pdfs').delete().eq('id', id);
    setUploadedPdfs(uploadedPdfs.filter(pdf => pdf.id !== id));
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 blue-gradient text-white flex flex-col shadow-2xl">
        <div className="p-6">
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-600">B</span>
            BSNL Admin
          </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button onClick={() => setActiveTab('pdf')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'pdf' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
            <FileText size={20} /> <span className="font-semibold">PDF Management</span>
          </button>
          <button onClick={() => setActiveTab('salary')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'salary' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
            <Users size={20} /> <span className="font-semibold">Staff Salaries</span>
          </button>
        </nav>
        <div className="p-4"><button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 text-red-100 hover:bg-red-500/40 transition-all font-semibold"><LogOut size={20} /> Logout</button></div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wider">{activeTab === 'pdf' ? 'PDF Upload Center' : 'Staff Salary Management'}</h2>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {status.message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span className="font-semibold">{status.message}</span>
            </div>
          )}

          {activeTab === 'pdf' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Upload size={20} className="text-blue-500" /> Upload New PDF</h3>
                <form onSubmit={handlePdfUpload} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Module</label><select value={pdfModule} onChange={(e) => setPdfModule(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"><option value="Bulk CCTs">Bulk CCTs</option><option value="Tariffs">Tariffs</option><option value="Forms">Forms</option></select></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Category</label><select value={pdfCategory} onChange={(e) => setPdfCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"><option value="">Select Service</option>{servicesData.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Title</label><input type="text" value={pdfTitle} onChange={(e) => setPdfTitle(e.target.value)} placeholder="PDF Name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">File</label><input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} className="w-full text-sm" /></div>
                  <button type="submit" disabled={isUploading} className="blue-gradient text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                    {isUploading ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} />} Publish
                  </button>
                </form>
              </section>

              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center"><h3 className="text-lg font-bold">Recent Uploads</h3><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{uploadedPdfs.length} Files</span></div>
                <table className="w-full">
                  <thead className="bg-gray-50"><tr><th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase">Document</th><th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase">Category</th><th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase">Action</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">{uploadedPdfs.map(pdf => <tr key={pdf.id} className="hover:bg-gray-50 transition-colors"><td className="px-8 py-4 flex items-center gap-3"><FileText size={18} className="text-red-500" /><span className="font-semibold text-gray-700">{pdf.title}</span></td><td className="px-8 py-4 text-gray-500">{pdf.category}</td><td className="px-8 py-4 text-right"><button onClick={() => deletePdf(pdf.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button></td></tr>)}</tbody>
                </table>
              </section>
            </div>
          )}

          {activeTab === 'salary' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><UserPlus size={20} className="text-blue-500" /> Add New Staff Record</h3>
                <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Full Name</label><input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Employee Name" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Role</label><input type="text" value={staffRole} onChange={(e) => setStaffRole(e.target.value)} placeholder="Designation" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Salary (Ex: ₹2100)</label><input type="text" value={staffSalary} onChange={(e) => setStaffSalary(e.target.value)} placeholder="Amount" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" /></div>
                  <button type="submit" disabled={isAddingStaff} className="blue-gradient text-white font-bold py-3 px-8 rounded-xl shadow-lg flex items-center justify-center gap-2">
                    {isAddingStaff ? <RefreshCw size={18} className="animate-spin" /> : <Plus size={18} />} Save Record
                  </button>
                </form>
              </section>

              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center"><h3 className="text-lg font-bold">Staff Payroll</h3><span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{staffList.length} Staff</span></div>
                <table className="w-full">
                  <thead className="bg-gray-50"><tr><th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase">Name</th><th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase">Role</th><th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase">Salary</th><th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase">Action</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">{staffList.map(staff => <tr key={staff.id} className="hover:bg-gray-50 transition-colors"><td className="px-8 py-4 font-bold text-gray-800">{staff.name}</td><td className="px-8 py-4 text-gray-500">{staff.role}</td><td className="px-8 py-4 font-black text-blue-600">{staff.salary}</td><td className="px-8 py-4 text-right"><button onClick={() => deleteStaff(staff.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button></td></tr>)}</tbody>
                </table>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
