
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ChildStatus, User } from '../types';

const ParentPortal: React.FC = () => {
  const [children, setChildren] = useState<ChildStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem('eaSwipe_user');
    if (userJson) {
      const user = JSON.parse(userJson);
      setCurrentUser(user);
      fetchData(user.id);
    }
  }, []);

  const fetchData = async (parentId: string) => {
    setLoading(true);
    const data = await api.getLinkedChildren(parentId);
    setChildren(data);
    setLoading(false);
  };

  const handleWhatsApp = (phone: string, childName: string) => {
    const message = encodeURIComponent(`Hi, I'm ${currentUser?.name}, parent of ${childName}. I wanted to check in about...`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Parent Connect</h1>
        <p className="text-slate-500 text-sm">Stay informed about your child's day</p>
      </header>

      {children.map((child) => (
        <div key={child.id} className="space-y-6">
          {/* Child Status Card */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-white shadow-sm overflow-hidden">
                  <img src={child.avatar} alt={child.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">{child.name}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${child.status === 'ABSENT' ? 'bg-slate-300' : 'bg-emerald-500 animate-pulse'}`}></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {child.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-2xl font-black text-indigo-600">{child.attendancePercentage}%</p>
                 <p className="text-[8px] font-black uppercase text-slate-300 tracking-tighter">Attendance</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <div className="flex items-center gap-3 mb-1">
                  <i className="fa-solid fa-location-dot text-indigo-500 text-sm"></i>
                  <span className="text-sm font-bold text-slate-700">{child.currentShift || 'No active shift'}</span>
               </div>
               <p className="text-[10px] text-slate-400 ml-7">{child.lastActivity}</p>
            </div>
            
            <i className="fa-solid fa-child absolute -right-6 -bottom-6 text-9xl text-slate-50 opacity-[0.03]"></i>
          </div>

          {/* Teacher Contact Section */}
          <div className="bg-indigo-900 text-white rounded-[32px] p-6 shadow-xl shadow-indigo-100">
            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-300 mb-6">Department Head</h3>
            <div className="flex items-center gap-4 mb-8">
               <div className="w-14 h-14 rounded-full border-2 border-indigo-500/30 p-0.5 overflow-hidden">
                  <img src={child.assignedTeacher.avatar} alt={child.assignedTeacher.name} className="w-full h-full rounded-full object-cover" />
               </div>
               <div>
                  <h4 className="text-lg font-bold leading-tight">{child.assignedTeacher.name}</h4>
                  <p className="text-xs text-indigo-300">Available for queries</p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleWhatsApp(child.assignedTeacher.phone, child.name)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-1 transition-all active:scale-95"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i>
                Message
              </button>
              <a 
                href={`tel:${child.assignedTeacher.phone}`}
                className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-1 transition-all active:scale-95"
              >
                <i className="fa-solid fa-phone text-lg"></i>
                Call Now
              </a>
            </div>
          </div>

          {/* Personalized Alerts */}
          <div className="space-y-3">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Recent Child Alerts</h4>
             <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-4">
                <div className="w-8 h-8 bg-amber-200 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                   <i className="fa-solid fa-bolt"></i>
                </div>
                <div>
                   <p className="text-xs font-bold text-amber-900 mb-0.5">Early Exit Alert</p>
                   <p className="text-[10px] text-amber-700 leading-relaxed">Alice checked out 15 minutes before the shift ended today.</p>
                </div>
             </div>
          </div>
        </div>
      ))}

      {children.length === 0 && !loading && (
        <div className="py-20 text-center">
           <i className="fa-solid fa-user-group text-4xl text-slate-200 mb-4"></i>
           <p className="text-slate-400">No child profiles linked to this account.</p>
        </div>
      )}
    </div>
  );
};

export default ParentPortal;
