import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Plus, 
  User, 
  Calendar,
  AlertCircle,
  MoreVertical,
  CheckCircle,
  LogOut
} from 'lucide-react';

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isWorker, setIsWorker] = useState(false);
  const [workerName, setWorkerName] = useState('');
  const [workerList, setWorkerList] = useState([]);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Check Auth Status
    const adminAuth = localStorage.getItem('adminAuth');
    const workerAuth = localStorage.getItem('workerAuth');
    let currentWorkerName = '';
    
    if (adminAuth) {
      setIsAdmin(true);
    } else if (workerAuth) {
      setIsWorker(true);
      currentWorkerName = localStorage.getItem('workerName') || '';
      setWorkerName(currentWorkerName);
    } else {
      navigate('/workers-login');
      return;
    }

    const savedTasks = JSON.parse(localStorage.getItem('bsnl_tasks') || '[]');
    setTasks(savedTasks);

    const fetchWorkers = async () => {
      const { data, error } = await supabase
        .from('staff_salaries')
        .select('name')
        .eq('role', 'worker');
      if (!error && data) {
        setWorkerList(data);
      }
    };
    fetchWorkers();
  }, [navigate]);

  const displayTasks = isAdmin 
    ? tasks 
    : tasks.filter(t => t.assignee.toLowerCase() === workerName.toLowerCase());

  const handleLogout = () => {
    localStorage.removeItem('workerAuth');
    localStorage.removeItem('workerName');
    navigate('/workers-login');
  };

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem('bsnl_tasks', JSON.stringify(newTasks));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    const task = {
      ...newTask,
      id: Date.now(),
      status: 'pending',
      createdAt: new Date().toLocaleString()
    };
    saveTasks([task, ...tasks]);
    setShowAddModal(false);
    setNewTask({ title: '', description: '', assignee: '', dueDate: new Date().toISOString().split('T')[0] });
  };

  const toggleStatus = (id) => {
    const updatedTasks = tasks.map(t => 
      t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
    );
    saveTasks(updatedTasks);
  };

  const deleteTask = (id) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 max-w-[1400px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-white tracking-tight">
            {isWorker ? `Welcome, ${workerName}` : 'Task Management'}
          </h1>
          <p className="text-gray-400 font-medium text-lg">
            {isWorker ? 'Here are your assigned operations for today.' : 'Assign, track, and manage daily operations for Guntur SSA.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/20"
            >
              <Plus size={18} />
              New Task
            </button>
          )}
          
          {isWorker && (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-red-500/20"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-dark-card p-6 rounded-3xl border border-dark-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <ClipboardList size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Tasks</p>
              <p className="text-2xl font-black text-white tracking-tight">{displayTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-card p-6 rounded-3xl border border-dark-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pending</p>
              <p className="text-2xl font-black text-white tracking-tight">{displayTasks.filter(t => t.status === 'pending').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-card p-6 rounded-3xl border border-dark-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Completed</p>
              <p className="text-2xl font-black text-white tracking-tight">{displayTasks.filter(t => t.status === 'completed').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-6 pb-20">
        {displayTasks.length === 0 ? (
          <div className="bg-dark-card border border-dark-border border-dashed rounded-3xl p-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-dark-bg border border-dark-border rounded-3xl flex items-center justify-center text-gray-700 mb-6">
              <ClipboardList size={40} />
            </div>
            <h3 className="text-xl font-black text-white mb-2">No Tasks Found</h3>
            <p className="text-gray-500 max-w-sm">
              {isAdmin ? "Get started by assigning your first task to the field team." : "Relax! No tasks are assigned to you for now."}
            </p>
          </div>
        ) : (
          displayTasks.map(task => (
            <div 
              key={task.id}
              className={`bg-dark-card rounded-3xl border transition-all duration-300 relative overflow-hidden group ${task.status === 'completed' ? 'border-emerald-500/20 opacity-60' : 'border-dark-border hover:border-primary/30 shadow-2xl'}`}
            >
              <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex-1 flex gap-6">
                  <div className="pt-1">
                    <button 
                      onClick={() => toggleStatus(task.id)}
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-dark-border text-transparent hover:border-primary/50'}`}
                    >
                      <CheckCircle size={18} strokeWidth={3} />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-xl font-black tracking-tight ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-6">{task.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2 text-gray-500">
                        <User size={14} className="text-primary" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">{task.assignee}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar size={14} className="text-primary" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {!isAdmin && task.status === 'pending' && (
                    <button 
                      onClick={() => toggleStatus(task.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/20"
                    >
                      Complete Task
                    </button>
                  )}
                  {isAdmin && (
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-3 bg-dark-bg border border-dark-border text-gray-500 hover:text-red-400 hover:border-red-400/30 rounded-2xl transition-all"
                    >
                      <AlertCircle size={20} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Progress Indicator */}
              <div className="h-1 w-full bg-dark-bg">
                <div className={`h-full transition-all duration-1000 ${task.status === 'completed' ? 'w-full bg-emerald-500' : 'w-0 bg-primary'}`}></div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-dark-card w-full max-w-lg rounded-[40px] border border-dark-border shadow-[0_0_50px_rgba(0,180,216,0.15)] relative overflow-hidden">
            <div className="p-10">
              <div className="flex flex-col gap-2 mb-10">
                <h2 className="text-3xl font-black text-white tracking-tight">Create Task</h2>
                <p className="text-gray-400 font-medium">Define a new operation and assign it to a team member.</p>
              </div>

              <form onSubmit={handleAddTask} className="space-y-8">
                <div className="flex flex-col space-y-2.5">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Ex: FTTH Maintenance at GNT-01"
                    className="w-full px-5 py-4 bg-dark-bg border border-dark-border rounded-2xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-700"
                  />
                </div>

                 <div className="flex flex-col space-y-2.5">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Assign To</label>
                  <select
                    required
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                    className="w-full px-5 py-4 bg-dark-bg border border-dark-border rounded-2xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-dark-card">Select Worker</option>
                    {workerList.map((worker, idx) => (
                      <option key={idx} value={worker.name} className="bg-dark-card">
                        {worker.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-2.5">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Task Description</label>
                  <textarea
                    rows="3"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Detailed instructions for the worker..."
                    className="w-full px-5 py-4 bg-dark-bg border border-dark-border rounded-2xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-700 resize-none"
                  />
                </div>

                <div className="flex items-center gap-6 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Deploy Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-dark-bg text-gray-400 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-dark-border hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
