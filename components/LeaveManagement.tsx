
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LeaveRequest, LeaveBalance, LeaveType, User, UserRole } from '../types';

type LeaveMode = 'MY_LEAVE' | 'APPLY' | 'APPROVALS';

const LeaveManagement: React.FC = () => {
  const [mode, setMode] = useState<LeaveMode>('MY_LEAVE');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const userJson = localStorage.getItem('eaSwipe_user');
    if (userJson) {
      const user = JSON.parse(userJson);
      setCurrentUser(user);
      // Fix: Replaced DEPT_HEAD with RESOURCE_PERSON
      if (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER || user.role === UserRole.RESOURCE_PERSON) {
        setMode('APPROVALS');
      } else {
        setMode('MY_LEAVE');
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    const [reqs, bals] = await Promise.all([
      api.getLeaveRequests(currentUser),
      api.getLeaveBalances(currentUser.id)
    ]);
    setRequests(reqs);
    setBalances(bals);
    setLoading(false);
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!startDate || !endDate || !reason) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    await api.applyLeave({
      userId: currentUser.id,
      userName: currentUser.name,
      type: leaveType,
      startDate,
      endDate,
      reason
    });
    setLoading(false);
    alert("Leave application submitted successfully!");
    setMode('MY_LEAVE');
    fetchData();
    // Reset form
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    await api.updateLeaveRequest(id, status);
    await fetchData();
    setLoading(false);
  };

  const myRequests = requests.filter(r => r.userId === currentUser?.id);
  const pendingApprovals = requests.filter(r => r.status === 'pending' && r.userId !== currentUser?.id);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leave Management</h1>
          <p className="text-slate-500 text-sm">
             {/* Fix: Replaced DEPT_HEAD with RESOURCE_PERSON */}
             {currentUser?.role === UserRole.RESOURCE_PERSON 
               ? `Department Approvals Scope` 
               : `Track balances and applications`}
          </p>
        </div>
        {mode !== 'APPLY' && (
          <button 
            onClick={() => setMode('APPLY')}
            className="bg-indigo-600 text-white w-12 h-12 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center transition-transform active:scale-95"
          >
            <i className="fa-solid fa-plus text-lg"></i>
          </button>
        )}
      </header>

      {/* Mode Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
        {[
          // Fix: Replaced DEPT_HEAD with RESOURCE_PERSON in all occurrences below
          { id: 'MY_LEAVE', label: 'My Leaves', icon: 'fa-calendar-user', roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.RESOURCE_PERSON] },
          { id: 'APPLY', label: 'Apply', icon: 'fa-paper-plane', roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.RESOURCE_PERSON] },
          { id: 'APPROVALS', label: 'Approvals', icon: 'fa-user-shield', roles: [UserRole.TEACHER, UserRole.ADMIN, UserRole.RESOURCE_PERSON] }
        ]
        .filter(m => currentUser && m.roles.includes(currentUser.role))
        .map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as LeaveMode)}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              mode === m.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            <i className={`fa-solid ${m.icon}`}></i>
            {m.label}
          </button>
        ))}
      </div>

      {/* LEAVE BALANCES */}
      {mode === 'MY_LEAVE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {balances.map((b, i) => (
              <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{b.type}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800">{b.total - b.used}</span>
                  <span className="text-xs text-slate-400">/ {b.total} days</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">My Applications</span>
             </div>
             {myRequests.length > 0 ? (
               <div className="divide-y divide-slate-50">
                 {myRequests.map((r) => (
                   <div key={r.id} className="p-4 flex items-center justify-between">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">{r.type} Leave</span>
                         <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                           r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                           r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                         }`}>
                           {r.status}
                         </span>
                       </div>
                       <p className="text-[10px] text-slate-400">{r.startDate} to {r.endDate}</p>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-10 text-center text-slate-400 text-xs">No applications yet.</div>
             )}
          </div>
        </div>
      )}

      {/* APPROVALS VIEW */}
      {mode === 'APPROVALS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Requests</h3>
             <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{pendingApprovals.length} New</span>
          </div>

          {pendingApprovals.length > 0 ? (
            pendingApprovals.map((r) => (
              <div key={r.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm animate-fadeIn">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {r.userName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{r.userName}</h4>
                      <p className="text-[10px] text-slate-400">Applied {new Date(r.appliedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl mb-4 text-xs">
                  <p className="font-bold text-slate-700 mb-1">{r.startDate} to {r.endDate}</p>
                  <p className="text-slate-500 italic">"{r.reason}"</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => handleUpdateStatus(r.id, 'approved')} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-indigo-100">Approve</button>
                  <button onClick={() => handleUpdateStatus(r.id, 'rejected')} className="flex-1 bg-white border border-slate-200 text-slate-500 py-3 rounded-xl text-xs font-bold">Reject</button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-400 font-medium">No pending approvals in your department.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
