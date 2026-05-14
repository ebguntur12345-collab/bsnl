import React from 'react';
import { Rocket, Shield, Zap, Bell, Target, Globe } from 'lucide-react';

const Complaints = () => {
  const upcomingFeatures = [
    { title: "Real-time Fault Tracking", description: "Monitor active faults on a live geographical map of Guntur.", icon: Target, date: "Q3 2026" },
    { title: "Customer Portal App", description: "Mobile application for enterprise customers to manage lines.", icon: Globe, date: "Q4 2026" },
    { title: "AI-Powered Diagnostics", description: "Predictive maintenance alerts for leased line health.", icon: Zap, date: "Q1 2027" },
    { title: "Automated Ticket Dispatch", description: "Smart routing of complaints based on worker location.", icon: Rocket, date: "Q2 2027" },
  ];

  return (
    <div className="h-[calc(100vh-100px)] flex items-center justify-center p-8 animate-in fade-in duration-700">
      <div className="relative group">
        {/* Animated Background Glow */}
        <div className="absolute -inset-20 bg-primary/20 blur-[100px] rounded-full opacity-50 animate-pulse"></div>
        
        <div className="relative flex flex-col items-center text-center space-y-8 bg-dark-card/40 backdrop-blur-3xl border border-white/5 p-20 rounded-[60px] shadow-2xl">
          <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary border border-primary/20 shadow-2xl">
            <Rocket size={48} className="animate-bounce" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic italic">Upcoming</h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.4em]">Enterprise Complaint Tracking System</p>
          </div>
          
          <div className="flex items-center gap-4 pt-4">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary"></div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">In Development</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaints;
