
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CampusEvent, EventType, User, UserRole } from '../types';

const CampusCalendar: React.FC = () => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);

  useEffect(() => {
    const userJson = localStorage.getItem('eaSwipe_user');
    if (userJson) setCurrentUser(JSON.parse(userJson));
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const data = await api.getEvents();
    setEvents(data);
    setLoading(false);
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const startDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getEventsForDay = (day: number) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const iso = d.toISOString().split('T')[0];
    return events.filter(e => e.date === iso);
  };

  const selectedDayEvents = getEventsForDay(selectedDate.getDate());

  const getEventColor = (type: EventType) => {
    switch (type) {
      case 'HOLIDAY': return 'bg-emerald-500';
      case 'EXAM': return 'bg-rose-500';
      case 'PTM': return 'bg-amber-500';
      default: return 'bg-indigo-500';
    }
  };

  const renderCalendarDays = () => {
    const totalDays = [];
    for (let i = 0; i < startDay; i++) {
      totalDays.push(<div key={`pad-${i}`} className="h-14"></div>);
    }
    for (let d = 1; d <= days; d++) {
      const isSelected = selectedDate.getDate() === d && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear();
      const isToday = new Date().getDate() === d && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
      const dayEvents = getEventsForDay(d);

      totalDays.push(
        <button
          key={d}
          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), d))}
          className={`h-14 flex flex-col items-center justify-center rounded-2xl transition-all relative group active:scale-90 ${
            isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-slate-50'
          }`}
        >
          <span className={`text-sm font-bold ${isToday && !isSelected ? 'text-indigo-600' : ''}`}>
            {d}
          </span>
          {dayEvents.length > 0 && (
            <div className="flex gap-0.5 mt-1">
              {dayEvents.slice(0, 3).map((e, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : getEventColor(e.type)}`}></div>
              ))}
            </div>
          )}
          {isToday && !isSelected && (
             <div className="absolute bottom-1 w-1 h-1 bg-indigo-600 rounded-full"></div>
          )}
        </button>
      );
    }
    return totalDays;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <header className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Campus Calendar</h1>
          <p className="text-slate-500 text-sm">Holidays, Exams & Events</p>
        </div>
        {currentUser?.role === UserRole.ADMIN && (
          <button 
            onClick={() => setShowAddEvent(true)}
            className="bg-indigo-600 text-white w-12 h-12 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center transition-transform active:scale-95 hover:bg-indigo-700"
          >
            <i className="fa-solid fa-plus text-lg"></i>
          </button>
        )}
      </header>

      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-slate-800 tracking-tight">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all">
              <i className="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <button onClick={handleNextMonth} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all">
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-slate-300 uppercase py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
             {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
           </h4>
           <span className="text-[10px] font-bold text-indigo-600">{selectedDayEvents.length} Events</span>
        </div>

        {selectedDayEvents.length > 0 ? (
          selectedDayEvents.map((e) => (
            <div key={e.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${getEventColor(e.type)}`}>
                <i className={`fa-solid ${
                  e.type === 'HOLIDAY' ? 'fa-umbrella-beach' : 
                  e.type === 'EXAM' ? 'fa-file-signature' : 
                  e.type === 'PTM' ? 'fa-users-rectangle' : 'fa-calendar-check'
                }`}></i>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-bold text-slate-800 text-sm">{e.title}</h5>
                  <span className={`text-[8px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    e.type === 'HOLIDAY' ? 'bg-emerald-50 text-emerald-600' :
                    e.type === 'EXAM' ? 'bg-rose-50 text-rose-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {e.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-2">{e.description}</p>
                {e.location && (
                  <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase tracking-tight">
                    <i className="fa-solid fa-location-dot"></i>
                    {e.location}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-10 text-center">
             <i className="fa-solid fa-calendar-xmark text-4xl text-slate-200 mb-4"></i>
             <p className="text-sm text-slate-400 font-medium">No events scheduled for this day.</p>
          </div>
        )}
      </div>

      {showAddEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
           <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-2xl animate-backdrop" onClick={() => setShowAddEvent(false)}></div>
           <div className="relative bg-white w-full max-w-xl rounded-[40px] p-8 md:p-10 shadow-2xl animate-slideUp border border-white/50 max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-8 shrink-0">
                 <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Add Campus Schedule</h2>
                 <button onClick={() => setShowAddEvent(false)} className="w-11 h-11 rounded-full hover:bg-slate-50 text-slate-400 flex items-center justify-center transition-all active:scale-90 border border-slate-100">
                   <i className="fa-solid fa-xmark"></i>
                 </button>
              </div>
              <form className="space-y-6 overflow-y-auto no-scrollbar pr-1 pb-1 flex-1" onSubmit={(e) => { e.preventDefault(); setShowAddEvent(false); }}>
                 <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Event Title</label>
                    <input type="text" placeholder="e.g. Science Fair 2024" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Date</label>
                        <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Category</label>
                        <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all appearance-none cursor-pointer">
                            <option value="HOLIDAY">Holiday</option>
                            <option value="EXAM">Examination</option>
                            <option value="PTM">PTM / Meeting</option>
                            <option value="EVENT">Cultural Event</option>
                        </select>
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Event Description</label>
                    <textarea rows={4} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all" placeholder="Enter session details..."></textarea>
                 </div>
                 <div className="pt-2 shrink-0">
                   <button 
                     className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-semibold shadow-2xl shadow-indigo-200 mt-4 active:scale-95 hover:bg-indigo-700 transition-all text-sm tracking-wide"
                   >
                     Schedule Event
                   </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default CampusCalendar;
