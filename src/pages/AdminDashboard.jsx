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
  UserPlus,
  ClipboardList,
  Clock,
  User,
  Calendar,
  Lock,
  Edit2
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

  // Task State
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignee: '', dueDate: new Date().toISOString().split('T')[0] });

  const [workerList, setWorkerList] = useState([]);
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [workerPin, setWorkerPin] = useState('');
  const [editingWorker, setEditingWorker] = useState(null);

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

        const savedTasks = JSON.parse(localStorage.getItem('bsnl_tasks') || '[]');
        setTasks(savedTasks);
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
        // Update existing worker
        const { data, error } = await supabase
          .from('staff_salaries')
          .update({ name: staffName, salary: workerPin })
          .eq('id', editingWorker.id)
          .select();

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

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden font-sans">
      {/* Premium Sidebar */}
      <div className="w-72 bg-dark-card border-r border-dark-border flex flex-col shadow-2xl relative z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 shadow-lg">
              <span className="font-black text-xl">B</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-white leading-none">BSNL Admin</h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Control Center</p>
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
          <button onClick={() => setActiveTab('salary')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === 'salary' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <Users size={18} /> Staff Salaries
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
            <h2 className="text-2xl font-black text-white tracking-tight">{activeTab === 'pdf' ? 'Asset Management' : activeTab === 'tasks' ? 'Operational Tasks' : activeTab === 'worker' ? 'Worker Credentials' : 'Payroll Management'}</h2>
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
                <form onSubmit={handlePdfUpload} className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Module</label>
                    <select value={pdfModule} onChange={(e) => setPdfModule(e.target.value)} className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                      <option value="Bulk CCTs">Bulk CCTs</option>
                      <option value="Tariffs">Tariffs</option>
                      <option value="Forms">Forms</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Category</label>
                    <select value={pdfCategory} onChange={(e) => setPdfCategory(e.target.value)} className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                      <option value="">General Service</option>
                      {servicesData.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Title</label>
                    <input type="text" value={pdfTitle} onChange={(e) => setPdfTitle(e.target.value)} placeholder="PDF Filename" className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-700" />
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
                <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
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
                  <button type="submit" className="bg-primary text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest">
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
                             <div className="flex items-center gap-6 mt-2">
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

          {activeTab === 'salary' && (
            <div className="space-y-10 animate-in fade-in duration-700">
               <section className="bg-dark-card p-10 rounded-[40px] border border-dark-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                  <UserPlus size={18} className="text-primary" /> New Staff Record
                </h3>
                <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Full Name</label>
                    <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Employee Name" className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-700" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Designation</label>
                    <input type="text" value={staffRole} onChange={(e) => setStaffRole(e.target.value)} placeholder="Role" className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-700" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Salary</label>
                    <input type="text" value={staffSalary} onChange={(e) => setStaffSalary(e.target.value)} placeholder="Ex: ₹25,000" className="w-full bg-dark-bg border border-dark-border px-5 py-4 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-700" />
                  </div>
                  <button type="submit" disabled={isAddingStaff} className="bg-primary text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest">
                    {isAddingStaff ? <RefreshCw size={18} className="animate-spin" /> : <Plus size={18} />} Save Record
                  </button>
                </form>
              </section>

              <section className="bg-dark-card rounded-[40px] border border-dark-border shadow-2xl overflow-hidden">
                <div className="px-10 py-8 border-b border-dark-border flex justify-between items-center">
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Payroll Ledger</h3>
                  <span className="bg-primary/10 text-primary border border-primary/20 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{staffList.length} Personnel</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-dark-bg/50 text-gray-500 border-b border-dark-border">
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Employee</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Role</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Monthly Salary</th>
                        <th className="px-10 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/30">
                      {staffList.map(staff => (
                        <tr key={staff.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-10 py-5 font-black text-gray-200 text-sm">{staff.name}</td>
                          <td className="px-10 py-5 text-gray-500 font-bold text-xs uppercase tracking-wider">{staff.role}</td>
                          <td className="px-10 py-5 font-black text-primary text-sm">{staff.salary}</td>
                          <td className="px-10 py-5 text-right">
                            <button onClick={() => deleteStaff(staff.id)} className="p-3 bg-dark-bg border border-dark-border text-gray-700 hover:text-red-500 hover:border-red-500/30 rounded-xl transition-all"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
