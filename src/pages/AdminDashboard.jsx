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
  Edit2,
  Check,
  Zap,
  RefreshCw,
  UserPlus,
  ClipboardList,
  Clock,
  User,
  Calendar,
  Lock,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Info,
  Building2,
  Phone,
  PhoneCall,
  Server,
  Monitor
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pdf');
  const [status, setStatus] = useState({ type: '', message: '' });

  // PDF State
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfModule, setPdfModule] = useState('Tariffs');
  const [pdfCategory, setPdfCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPdfs, setUploadedPdfs] = useState([]);

  // Staff Salary State
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [staffSalary, setStaffSalary] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [isAddingStaff, setIsAddingStaff] = useState(false);

  // Task State
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignee: '', dueDate: new Date().toISOString().split('T')[0] });

  const [workerList, setWorkerList] = useState([]);
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [workerPin, setWorkerPin] = useState('');
  const [editingWorker, setEditingWorker] = useState(null);

  // Category State
  const defaultTariffs = ['SIP Trunk', 'Internet leased line', 'Mobile Prepaid', 'Mobile Postpaid', 'MMVC OBD', 'FTTH'];
  const defaultForms = ['ILL CAF', 'SIP Trunk', 'FTTH CAF', 'Mobile'];
  
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatModule, setNewCatModule] = useState('Tariffs');
  const [isAddingCat, setIsAddingCat] = useState(false);
  
  // Enterprise Metrics State
  const [metricsList, setMetricsList] = useState([]);
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [newMetric, setNewMetric] = useState({
    title: '',
    subtitle: '',
    icon_name: 'Zap',
    to_link: ''
  });
  const [editingMetric, setEditingMetric] = useState(null);

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: pdfs } = await supabase.from('pdfs').select('*').order('created_at', { ascending: false });
        setUploadedPdfs(pdfs || []);

        const { data: salaries, error } = await supabase.from('staff_salaries').select('*').order('created_at', { ascending: false });
        if (!error) {
          setStaffList(salaries.filter(s => s.role !== 'worker') || []);
          setWorkerList(salaries.filter(s => s.role === 'worker') || []);
        }

        const { data: cats } = await supabase.from('categories').select('*').order('name', { ascending: true });
        setCategories(cats || []);

        const savedTasks = JSON.parse(localStorage.getItem('bsnl_tasks') || '[]');
        setTasks(savedTasks);

        const { data: metrics } = await supabase.from('enterprise_metrics').select('*').order('created_at', { ascending: true });
        if (metrics) setMetricsList(metrics);
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

  // Update category when module changes
  useEffect(() => {
    const defaults = pdfModule === 'Tariffs' ? defaultTariffs : defaultForms;
    const custom = categories.filter(c => c.module === pdfModule);
    const firstCat = [...defaults, ...custom.map(c => c.name)][0];
    if (firstCat) setPdfCategory(firstCat);
  }, [pdfModule, categories]);

  const handleAddTask = (e) => {
    e.preventDefault();
    const task = { ...newTask, id: Date.now(), status: 'pending', createdAt: new Date().toLocaleString() };
    const updated = [task, ...tasks];
    setTasks(updated);
    localStorage.setItem('bsnl_tasks', JSON.stringify(updated));
    setNewTask({ title: '', description: '', assignee: '', dueDate: new Date().toISOString().split('T')[0] });
    setStatus({ type: 'success', message: 'Task assigned successfully!' });
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  const deleteTask = (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    localStorage.setItem('bsnl_tasks', JSON.stringify(updated));
  };

  const handleAddWorker = async (e) => {
    e.preventDefault();
    if (!staffName || !workerPin) return setStatus({ type: 'error', message: 'Name and Pin required' });
    setIsAddingWorker(true);

    try {
      if (editingWorker) {
        // Since UPDATE policy is blocked by RLS, we simulate update using DELETE + INSERT with the same ID
        const { error: delErr } = await supabase
          .from('staff_salaries')
          .delete()
          .eq('id', editingWorker.id);
        if (delErr) throw delErr;

        const { data, error } = await supabase.from('staff_salaries').insert([{
          id: editingWorker.id,
          name: staffName,
          role: 'worker',
          salary: workerPin,
          date: editingWorker.date || new Date().toLocaleDateString('en-GB')
        }]).select();

        if (error) throw error;
        setWorkerList(workerList.map(w => w.id === editingWorker.id ? data[0] : w));
        setStatus({ type: 'success', message: 'Worker login updated successfully!' });
      } else {
        // Create new worker
        const { data, error } = await supabase.from('staff_salaries').insert([{
          name: staffName,
          role: 'worker',
          salary: workerPin,
          date: new Date().toLocaleDateString('en-GB')
        }]).select();

        if (error) throw error;
        setWorkerList([data[0], ...workerList]);
        setStatus({ type: 'success', message: 'Worker login created successfully!' });
      }
      
      setStaffName('');
      setWorkerPin('');
      setEditingWorker(null);
    } catch (err) {
      setStatus({ type: 'error', message: `Failed: ${err.message}` });
    } finally {
      setIsAddingWorker(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }
  };

  const startEditWorker = (worker) => {
    setEditingWorker(worker);
    setStaffName(worker.name);
    setWorkerPin(worker.salary);
    setActiveTab('worker');
    // Scroll to top of the form if needed
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const deletePdf = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const { error } = await supabase.from('pdfs').delete().eq('id', id);
      if (error) throw error;
      setUploadedPdfs(prev => prev.filter(pdf => pdf.id !== id));
      setStatus({ type: 'success', message: 'Document deleted successfully!' });
    } catch (err) {
      console.error("Delete error:", err);
      setStatus({ type: 'error', message: 'Failed to delete document' });
    }
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  const deleteStaff = async (id, isWorkerTab = false) => {
    if (!window.confirm(`Delete this ${isWorkerTab ? 'worker' : 'staff'} record?`)) return;
    try {
      await supabase.from('staff_salaries').delete().eq('id', id);
      if (isWorkerTab) {
        setWorkerList(workerList.filter(w => w.id !== id));
      } else {
        setStaffList(staffList.filter(s => s.id !== id));
      }
      setStatus({ type: 'success', message: 'Record deleted' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Delete failed' });
    }
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    setIsAddingCat(true);
    try {
      const { data, error } = await supabase.from('categories').insert([{
        name: newCatName,
        module: newCatModule
      }]).select();
      if (error) throw error;
      setCategories([...categories, data[0]]);
      setNewCatName('');
      setStatus({ type: 'success', message: 'Category added successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to add category' });
    } finally {
      setIsAddingCat(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category? Documents assigned to it will remain but the category link will break.')) return;
    try {
      await supabase.from('categories').delete().eq('id', id);
      setCategories(categories.filter(c => c.id !== id));
      setStatus({ type: 'success', message: 'Category removed' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Delete failed' });
    }
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  const handleAddMetric = async (e) => {
    e.preventDefault();
    if (!newMetric.title) return;
    setIsAddingMetric(true);
    
    // Auto-detect service type from title
    let detectedService = 'None';
    const t = newMetric.title.toUpperCase();
    if (t.includes('ILL')) detectedService = 'Internet Leased Line (ILL)';
    else if (t.includes('MPLS')) detectedService = 'MPLS';
    else if (t.includes('SIP')) detectedService = 'SIP Trunk';
    else if (t.includes('PRI')) detectedService = 'ISDN PRI';
    else if (t.includes('FTTH')) detectedService = 'FTTH';
    else if (t.includes('MMVC')) detectedService = 'MMVC';
    else if (t.includes('TOLL')) detectedService = 'Toll Free';
    
    try {
      if (editingMetric) {
        // Update mode: simulate UPDATE using DELETE + INSERT with the same ID due to RLS blocking direct UPDATEs
        const { error: delErr } = await supabase
          .from('enterprise_metrics')
          .delete()
          .eq('id', editingMetric.id);
        if (delErr) throw delErr;

        const { error } = await supabase
          .from('enterprise_metrics')
          .insert([{
            id: editingMetric.id,
            ...newMetric,
            service_type: detectedService,
            value: editingMetric.value || '0'
          }]);
        if (error) throw error;
        setMetricsList(metricsList.map(m => m.id === editingMetric.id ? { ...m, ...newMetric, service_type: detectedService } : m));
        setStatus({ type: 'success', message: 'Metric updated successfully!' });
      } else {
        // Insert mode
        const metricToInsert = { 
          ...newMetric, 
          service_type: detectedService,
          value: '0' 
        };
        const { data, error } = await supabase.from('enterprise_metrics').insert([metricToInsert]).select();
        if (error) throw error;
        setMetricsList([...metricsList, data[0]]);
        setStatus({ type: 'success', message: 'Metric added successfully!' });
      }
      setNewMetric({ title: '', subtitle: '', icon_name: 'Zap', to_link: '' });
      setEditingMetric(null);
    } catch (err) {
      console.error("Metric error:", err);
      setStatus({ type: 'error', message: `Failed to process metric: ${err.message || 'Unknown error'}` });
    } finally {
      setIsAddingMetric(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }
  };

  const startEdit = (metric) => {
    setEditingMetric(metric);
    setNewMetric({
      title: metric.title,
      subtitle: metric.subtitle || '',
      icon_name: metric.icon_name,
      to_link: metric.to_link || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingMetric(null);
    setNewMetric({ title: '', subtitle: '', icon_name: 'Zap', to_link: '' });
  };

  const deleteMetric = async (id) => {
    if (!window.confirm('Delete this metric?')) return;
    try {
      await supabase.from('enterprise_metrics').delete().eq('id', id);
      setMetricsList(metricsList.filter(m => m.id !== id));
      setStatus({ type: 'success', message: 'Metric removed' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Delete failed' });
    }
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden font-sans">
      {/* Premium Sidebar */}
      <div className="w-72 bg-dark-card border-r border-dark-border flex flex-col shadow-2xl relative z-20">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <img
              src="/bsnl-logo.png"
              alt="BSNL Logo"
              className="h-12 w-auto object-contain brightness-110"
            />
            <div className="flex flex-col">
              <h1 className="text-lg font-black text-white leading-none tracking-tight">EB ADMIN</h1>
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Smart Center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveTab('pdf')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === 'pdf' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <FileText size={18} /> PDF Management
          </button>
          <button onClick={() => setActiveTab('tasks')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === 'tasks' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <ClipboardList size={18} /> Task Management
          </button>
          <button onClick={() => setActiveTab('worker')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === 'worker' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <Lock size={18} /> Worker Access
          </button>
          <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === 'categories' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <Plus size={18} /> Menu Manager
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === 'inventory' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <Monitor size={18} /> Inventory Cards
          </button>
        </nav>

        <div className="p-6 mt-auto border-t border-dark-border/50">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-black text-xs uppercase tracking-widest border border-red-500/20">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-dark-card/50 backdrop-blur-xl border-b border-dark-border px-10 py-6 flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {activeTab === 'pdf' ? 'Asset Management' : 
               activeTab === 'tasks' ? 'Operational Tasks' : 
               activeTab === 'worker' ? 'Worker Credentials' : 
               activeTab === 'categories' ? 'Menu Category Manager' :
               activeTab === 'inventory' ? 'Inventory Cards Manager' :
               'Payroll Management'}
            </h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Enterprise Guntur Portal</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Active</span>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 scrollbar-hide">
          {status.message && (
            <div className={`mb-10 p-5 rounded-[20px] flex items-center gap-4 border animate-in slide-in-from-top-4 duration-500 ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {status.type === 'success' ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
              <span className="font-black text-sm uppercase tracking-wide">{status.message}</span>
            </div>
          )}

          {activeTab === 'pdf' && (
            <div className="space-y-10 animate-in fade-in duration-700">
              {/* ... PDF View ... */}
              <section className="bg-dark-card p-10 rounded-[40px] border border-dark-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                  <Upload size={18} className="text-primary" /> Deploy New Document
                </h3>
                <form onSubmit={handlePdfUpload} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-end">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Module</label>
                    <select value={pdfModule} onChange={(e) => setPdfModule(e.target.value)} className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                      <option value="Tariffs">Tariffs</option>
                      <option value="Forms">Forms</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Category</label>
                    <select required value={pdfCategory} onChange={(e) => setPdfCategory(e.target.value)} className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                      <optgroup label="Default Categories" className="bg-dark-card">
                        {(pdfModule === 'Tariffs' ? defaultTariffs : defaultForms).map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </optgroup>
                      {categories.filter(c => c.module === pdfModule).length > 0 && (
                        <optgroup label="Custom Sub-Pages" className="bg-dark-card">
                          {categories.filter(c => c.module === pdfModule).map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Title</label>
                    <input type="text" value={pdfTitle} onChange={(e) => setPdfTitle(e.target.value)} placeholder="PDF Filename" className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-700" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Select PDF/Image</label>
                    <input 
                      type="file" 
                      onChange={(e) => setPdfFile(e.target.files[0])} 
                      className="w-full bg-dark-bg border border-dark-border px-5 py-3.5 rounded-2xl text-white text-xs outline-none focus:ring-2 focus:ring-primary/20 file:bg-primary/10 file:text-primary file:border-none file:rounded-lg file:px-4 file:py-1 file:mr-4 file:font-black hover:file:bg-primary/20 transition-all" 
                    />
                  </div>
                  <button type="submit" disabled={isUploading} className="bg-primary text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest">
                    {isUploading ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} />} Publish
                  </button>
                </form>
              </section>

              <section className="bg-dark-card rounded-[40px] border border-dark-border shadow-2xl overflow-hidden">
                <div className="px-10 py-8 border-b border-dark-border flex justify-between items-center">
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Asset Library</h3>
                  <span className="bg-primary/10 text-primary border border-primary/20 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{uploadedPdfs.length} Resources</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-dark-bg/50 text-gray-500 border-b border-dark-border">
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Document Title</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Service Layer</th>
                        <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/30">
                      {uploadedPdfs.map(pdf => (
                        <tr key={pdf.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-10 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20"><FileText size={18} /></div>
                              <span className="font-black text-gray-200 text-sm">{pdf.title}</span>
                            </div>
                          </td>
                          <td className="px-10 py-5 text-gray-500 font-bold text-xs uppercase tracking-wider">{pdf.category}</td>
                          <td className="px-10 py-5 text-right">
                            <button onClick={() => deletePdf(pdf.id)} className="p-3 bg-dark-bg border border-dark-border text-gray-700 hover:text-red-500 hover:border-red-500/30 rounded-xl transition-all"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'worker' && (
            <div className="space-y-10 animate-in fade-in duration-700">
               <section className="bg-dark-card p-10 rounded-[40px] border border-dark-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                  <UserPlus size={18} className="text-amber-500" /> {editingWorker ? 'Update Worker Credentials' : 'Create Worker Credentials'}
                </h3>
                <form onSubmit={handleAddWorker} className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] ml-1">Worker Name</label>
                    <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Full Name" className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-amber-500/20 placeholder:text-gray-700" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] ml-1">Secret Pin / Password</label>
                    <input type="password" value={workerPin} onChange={(e) => setWorkerPin(e.target.value)} placeholder="••••" className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-amber-500/20 placeholder:text-gray-700" />
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" disabled={isAddingWorker} className={`flex-1 ${editingWorker ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-amber-500 shadow-amber-500/20'} text-white font-black py-4 px-8 rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest`}>
                      {isAddingWorker ? <RefreshCw size={18} className="animate-spin" /> : editingWorker ? <Edit2 size={18} /> : <Plus size={18} />} 
                      {editingWorker ? 'Update Account' : 'Create Account'}
                    </button>
                    {editingWorker && (
                      <button type="button" onClick={() => { setEditingWorker(null); setStaffName(''); setWorkerPin(''); }} className="bg-dark-bg text-gray-500 border border-dark-border font-black py-4 px-8 rounded-2xl hover:text-white transition-all text-xs uppercase tracking-widest">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </section>

              <section className="bg-dark-card rounded-[40px] border border-dark-border shadow-2xl overflow-hidden">
                <div className="px-10 py-8 border-b border-dark-border flex justify-between items-center">
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Authorized Personnel</h3>
                  <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{workerList.length} Accounts</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-dark-bg/50 text-gray-500 border-b border-dark-border">
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Worker Name</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Access Pin</th>
                        <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/30">
                      {workerList.map(worker => (
                        <tr key={worker.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-10 py-5 font-black text-gray-200 text-sm">{worker.name}</td>
                          <td className="px-10 py-5 text-gray-500 font-bold text-xs uppercase tracking-wider font-mono">••••</td>
                          <td className="px-10 py-5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button onClick={() => startEditWorker(worker)} className="p-3 bg-dark-bg border border-dark-border text-gray-700 hover:text-primary hover:border-primary/30 rounded-xl transition-all"><Edit2 size={16} /></button>
                              <button onClick={() => deleteStaff(worker.id, true)} className="p-3 bg-dark-bg border border-dark-border text-gray-700 hover:text-red-500 hover:border-red-500/30 rounded-xl transition-all"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-10 animate-in fade-in duration-700">
               <section className="bg-dark-card p-10 rounded-[40px] border border-dark-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                  <ClipboardList size={18} className="text-primary" /> Assign Daily Task
                </h3>
                <form onSubmit={handleAddTask} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end relative z-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Task Title</label>
                      <input type="text" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} placeholder="Ex: Guntur-02 Power Check" className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-700" required />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Assignee</label>
                      <select required value={newTask.assignee} onChange={(e) => setNewTask({...newTask, assignee: e.target.value})} className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                        <option value="">Select Worker</option>
                        {workerList.map(worker => (
                          <option key={worker.id} value={worker.name}>{worker.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Due Date</label>
                      <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 [color-scheme:dark]" required />
                    </div>
                  </div>
                  
                  <div className="space-y-3 relative z-10">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Task Description</label>
                    <textarea 
                      value={newTask.description} 
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})} 
                      placeholder="Enter detailed work instructions here..." 
                      className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-700 min-h-[100px] resize-none"
                    />
                  </div>

                  <button type="submit" className="w-full bg-primary text-white font-black py-5 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest relative z-10">
                    <Plus size={18} /> Deploy Task
                  </button>
                </form>
              </section>

              <section className="bg-dark-card rounded-[40px] border border-dark-border shadow-2xl overflow-hidden">
                <div className="px-10 py-8 border-b border-dark-border flex justify-between items-center">
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Operations Queue</h3>
                  <span className="bg-primary/10 text-primary border border-primary/20 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{tasks.length} Active Tasks</span>
                </div>
                <div className="divide-y divide-dark-border/30">
                  {tasks.map(task => (
                    <div key={task.id} className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-white/[0.01] transition-all group">
                       <div className="flex items-center gap-8">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                             {task.status === 'completed' ? <CheckCircle size={28} /> : <Clock size={28} />}
                          </div>
                          <div>
                             <h4 className={`text-lg font-black tracking-tight ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}`}>{task.title}</h4>
                             {task.description && (
                               <p className="text-gray-500 text-xs mt-1 leading-relaxed max-w-xl">{task.description}</p>
                             )}
                             <div className="flex items-center gap-6 mt-3">
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] flex items-center gap-2"><User size={12} className="text-primary" /> {task.assignee}</span>
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] flex items-center gap-2"><Calendar size={12} className="text-primary" /> {task.dueDate}</span>
                             </div>
                          </div>
                       </div>
                       <button onClick={() => deleteTask(task.id)} className="p-4 bg-dark-bg border border-dark-border text-gray-700 hover:text-red-500 hover:border-red-500/30 rounded-2xl transition-all"><Trash2 size={20} /></button>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="p-20 text-center text-gray-700 font-black uppercase tracking-widest text-xs">No tasks in queue</div>
                  )}
                </div>
              </section>
            </div>
          )}



          {activeTab === 'categories' && (
            <div className="space-y-10 animate-in fade-in duration-700">
               <section className="bg-dark-card p-10 rounded-[40px] border border-dark-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                  <Plus size={18} className="text-primary" /> Create New Menu Sub-Page
                </h3>
                <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Parent Module</label>
                    <select value={newCatModule} onChange={(e) => setNewCatModule(e.target.value)} className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                      <option value="Tariffs">Tariffs</option>
                      <option value="Forms">Forms</option>
                    </select>
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Sub-Page Name</label>
                    <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Ex: Broadband, Lease Line CAF" className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-700" required />
                  </div>
                  <button type="submit" disabled={isAddingCat} className="bg-primary text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest">
                    {isAddingCat ? <RefreshCw size={18} className="animate-spin" /> : <Plus size={18} />} Create Page
                  </button>
                </form>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {['Tariffs', 'Forms'].map(mod => {
                  const defaults = mod === 'Tariffs' ? defaultTariffs : defaultForms;
                  const custom = categories.filter(c => c.module === mod);
                  
                  return (
                    <section key={mod} className="bg-dark-card rounded-[40px] border border-dark-border shadow-2xl overflow-hidden">
                      <div className="px-10 py-8 border-b border-dark-border flex justify-between items-center bg-dark-bg/30">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">{mod} Sub-Pages</h3>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{defaults.length + custom.length} Total</span>
                      </div>
                      <div className="divide-y divide-dark-border/30">
                        {/* Default Items */}
                        {defaults.map(name => (
                          <div key={name} className="px-10 py-5 flex items-center justify-between bg-white/[0.02]">
                            <span className="font-black text-gray-400 text-sm tracking-tight">{name}</span>
                            <span className="text-[8px] font-black text-primary border border-primary/30 px-2 py-0.5 rounded uppercase tracking-widest">Default</span>
                          </div>
                        ))}
                        
                        {/* Custom Items */}
                        {custom.map(cat => (
                          <div key={cat.id} className="px-10 py-5 flex items-center justify-between hover:bg-white/[0.01] transition-all group">
                            <span className="font-black text-gray-200 text-sm tracking-tight">{cat.name}</span>
                            <button onClick={() => deleteCategory(cat.id)} className="p-3 text-gray-700 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-10 animate-in fade-in duration-700">
               <section className="bg-dark-card p-10 rounded-[40px] border border-dark-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                  <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">
                    {editingMetric ? 'Edit Inventory Card' : 'Create New Inventory Card'}
                  </h2>
                </div>

                <form onSubmit={handleAddMetric} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end relative z-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Card Title</label>
                    <input 
                      type="text" 
                      value={newMetric.title}
                      onChange={(e) => setNewMetric({...newMetric, title: e.target.value})}
                      placeholder="Ex: ILL CCTs"
                      className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-800"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Icon Name</label>
                    <select value={newMetric.icon_name} onChange={(e) => setNewMetric({...newMetric, icon_name: e.target.value})} className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                      <option value="Zap">Zap (ILL)</option>
                      <option value="RefreshCw">Refresh (MPLS)</option>
                      <option value="Phone">Phone (PRI)</option>
                      <option value="PhoneCall">Phone Call (SIP)</option>
                      <option value="Server">Server</option>
                      <option value="Building2">Building</option>
                      <option value="Users">Users</option>
                      <option value="Monitor">Monitor</option>
                      <option value="CreditCard">Credit Card</option>
                    </select>
                  </div>
                  <div className="flex gap-4 md:col-span-1">
                    <button type="submit" disabled={isAddingMetric} className="flex-1 bg-primary text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest">
                      {isAddingMetric ? <RefreshCw size={18} className="animate-spin" /> : (editingMetric ? <Check size={18} /> : <Plus size={18} />)} 
                      {editingMetric ? 'Update Card' : 'Add Card'}
                    </button>
                    {editingMetric && (
                      <button type="button" onClick={cancelEdit} className="bg-dark-bg text-gray-400 border border-dark-border font-black py-4 px-6 rounded-2xl hover:text-white transition-all text-xs uppercase tracking-widest">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </section>

              <section className="bg-dark-card rounded-[40px] border border-dark-border shadow-2xl overflow-hidden">
                <div className="px-10 py-8 border-b border-dark-border flex justify-between items-center bg-dark-bg/30">
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Active Inventory Cards</h3>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{metricsList.length} Total</span>
                </div>
                <div className="divide-y divide-dark-border/30">
                  {metricsList.map(metric => {
                    // Dynamic count logic for Admin Panel
                    const regs = JSON.parse(localStorage.getItem('cctRegistrations') || '[]');
                    const processAdminMetricValue = (m, r) => {
                      const rService = (r.serviceType || r.service || '').toLowerCase();
                      const mService = (m.service_type || '').toLowerCase();
                      const mTitle = (m.title || '').toLowerCase();
                      if (!mService || mService === 'none') {
                        return rService === mTitle;
                      }
                      
                      const isMatch = rService === mService || 
                             rService === mTitle ||
                             (rService.includes('ill') && mService.includes('ill')) ||
                             (rService.includes('mpls') && mService.includes('mpls')) ||
                             (rService.includes('sip') && mService.includes('sip')) ||
                             (rService.includes('pri') && mService.includes('pri')) ||
                             (rService.includes('ftth') && mService.includes('ftth')) ||
                             (rService.includes('mmvc') && mService.includes('mmvc'));

                      return isMatch;
                    };
                    
                    const count = regs.filter(r => processAdminMetricValue(metric, r)).length;
                    const prefix = metric.title.split(' ')[0] || '';
                    const displayValue = `${prefix} ${count}`;

                    return (
                      <div key={metric.id} className="px-10 py-5 flex items-center justify-between hover:bg-white/[0.01] transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 font-black text-xs uppercase">
                            {metric.icon_name.substring(0, 1)}
                          </div>
                          <div>
                            <span className="font-black text-gray-200 text-sm tracking-tight">{metric.title}</span>
                            <p className="text-[10px] text-emerald-500 font-bold uppercase">{displayValue}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(metric)} className="p-3 text-gray-700 hover:text-primary transition-all"><Edit2 size={16} /></button>
                          <button onClick={() => deleteMetric(metric.id)} className="p-3 text-gray-700 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    );
                  })}
                  {metricsList.length === 0 && (
                    <div className="p-20 text-center text-gray-700 font-black uppercase tracking-widest text-xs">No metrics configured</div>
                  )}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
