
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shift, ShiftAssignment, ShiftChangeRequest, User, UserRole } from '../types';

type ViewMode = 'ROSTER' | 'MANAGE' | 'REQUESTS';

const ShiftManagement: React.FC = () => {
  const [view, setView] = useState<ViewMode>('ROSTER');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [roster, setRoster] = useState<ShiftAssignment[]>([]);
  const [requests, setRequests] = useState<ShiftChangeRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAddShift, setShowAddShift] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userJson = localStorage.getItem('eaSwipe_user');
    if (userJson) {
      const u = JSON.parse(userJson);
      setCurrentUser(u);
      fetchData(u);
    }
  }, []);

  const fetchData = async (user: User) => {
    setLoading(true);
    const [s, r, rq] = await Promise.all([
      api.getShifts(),
      api.getRoster(),
      api.getShiftRequests(user)
    ]);
    setShifts(s);
    setRoster(r);
    setRequests(rq);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    await api.updateShiftRequest(id, 'approved');
    if (currentUser) fetchData(currentUser);
  };

  const handleReject = async (id: string) => {
    await api.updateShiftRequest(id, 'rejected');
    if (currentUser) fetchData(currentUser);
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Shift Hub</h1>
          <p className="text-slate-500 text-sm">Coordinate campus operations</p>
        </div>
        {currentUser?.role === UserRole.ADMIN && view === 'MANAGE' && (
          <button 
            onClick={() => setShowAddShift(true)}
            className="bg-indigo-600 text-white w-12 h-12 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center transition-transform active:scale-95"
          >
            <i className="fa-solid fa-plus text-lg"></i>
          </button>
        )}
      </header>

      {/* View Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'ROSTER', label: 'Roster', icon: 'fa-calendar-days' },
          { id: 'MANAGE', label: 'Define Shifts', icon: 'fa-gear', roles: [UserRole.ADMIN] },
          { id: 'REQUESTS', label: 'Requests', icon: 'fa-envelope-open-text' }
        ].filter(m => !m.roles || (currentUser && m.roles.includes(currentUser.role))).map(m => (
          <button
            key={m.id}
            onClick={() => setView(m.id as ViewMode)}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              view === m.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            <i className={`fa-solid ${m.icon}`}></i>
            {m.label}
          </button>
        ))}
      </div>

      {/* ROSTER VIEW */}
      {view === 'ROSTER' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
              Weekly Roster
              <span className="text-xs font-medium text-slate-400">Current Week</span>
            </h3>
            
            <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
              {daysOfWeek.map((day, i) => (
                <div key={i} className={`flex-shrink-0 w-12 flex flex-col items-center py-2 rounded-xl border ${i === new Date().getDay() ? 'bg-indigo-50 border-indigo-100' : 'border-transparent'}`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400">{day}</span>
                  <span className={`text-sm font-black mt-0.5 ${i === new Date().getDay() ? 'text-indigo-600' : 'text-slate-600'}`}>{new Date().getDate() + i}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {roster.length > 0 ? roster.map(r => {
                const shift = shifts.find(s => s.id === r.shiftId);
                return (
                  <div key={r.id} className="flex gap-4 items-start group">
                    <div className="w-16 pt-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{shift?.startTime}</p>
                    </div>
                    <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all hover:border-indigo-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800 text-sm">{r.userName}</h4>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: shift?.color || '#cbd5e1' }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-lg font-bold text-slate-500 uppercase">
                          {shift?.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{shift?.startTime} - {shift?.endTime}</span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-10 text-center text-slate-400 text-xs">No assignments for your department.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANAGE SHIFTS VIEW */}
      {view === 'MANAGE' && (
        <div className="space-y-4">
          {shifts.map(shift => (
            <div key={shift.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: shift.color }}>
                    <i className="fa-solid fa-clock-rotate-left"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{shift.name}</h3>
                    <p className="text-xs text-slate-400">{shift.startTime} - {shift.endTime}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REQUESTS VIEW */}
      {view === 'REQUESTS' && (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                    {req.userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{req.userName}</h4>
                    <p className="text-[10px] text-slate-400">{req.date}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${
                  req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                  req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {req.status}
                </span>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-2xl mb-4 text-xs">
                <p className="text-slate-500 mb-1 leading-relaxed">
                  Requested swap: <span className="font-bold text-slate-800">{req.currentShiftName}</span> 
                  <i className="fa-solid fa-arrow-right mx-2 scale-75 opacity-30"></i> 
                  <span className="font-bold text-indigo-600">{req.requestedShiftName}</span>
                </p>
              </div>

              {/* Fix: Replaced DEPT_HEAD with RESOURCE_PERSON */}
              {req.status === 'pending' && (currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.RESOURCE_PERSON) && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleApprove(req.id)}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(req.id)}
                    className="flex-1 bg-white border border-slate-200 text-slate-500 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 active:scale-95 transition-all"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}

          {requests.length === 0 && (
            <div className="py-20 text-center text-slate-400">
               No swap requests in your department scope.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;
