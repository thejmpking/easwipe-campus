
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Notice, User, UserRole } from '../types';

const NoticeBoard: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'URGENT' | 'UNREAD'>('ALL');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const userJson = localStorage.getItem('eaSwipe_user');
    if (userJson) setCurrentUser(JSON.parse(userJson));
  }, []);

  useEffect(() => {
    if (currentUser) fetchNotices();
  }, [currentUser]);

  const fetchNotices = async () => {
    if (!currentUser) return;
    setLoading(true);
    const data = await api.getNotices(currentUser);
    setNotices(data);
    setLoading(false);
  };

  const handleRead = async (id: string) => {
    if (!currentUser) return;
    await api.markNoticeAsRead(id, currentUser.id);
    setNotices(prev => prev.map(n => n.id === id ? { ...n, readBy: [...n.readBy, currentUser.id] } : n));
  };

  const filteredNotices = notices.filter(n => {
    if (filter === 'URGENT') return n.type === 'URGENT';
    if (filter === 'UNREAD') return currentUser && !n.readBy.includes(currentUser.id);
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <header className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Notice Board</h1>
          <p className="text-slate-500 font-medium text-sm">Official updates & alerts</p>
        </div>
        {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.TEACHER || currentUser?.role === UserRole.RESOURCE_PERSON) && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white w-12 h-12 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center transition-transform active:scale-95 hover:bg-indigo-700"
          >
            <i className="fa-solid fa-plus text-lg"></i>
          </button>
        )}
      </header>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'ALL', label: 'All', icon: 'fa-list' },
          { id: 'URGENT', label: 'Urgent', icon: 'fa-bolt-lightning' },
          { id: 'UNREAD', label: 'Unread', icon: 'fa-envelope' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              filter === f.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            <i className={`fa-solid ${f.icon}`}></i>
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <div 
              key={notice.id} 
              onClick={() => handleRead(notice.id)}
              className={`bg-white rounded-3xl p-6 border shadow-sm transition-all relative cursor-pointer active:scale-[0.99] ${
                notice.type === 'URGENT' ? 'border-rose-100 bg-rose-50/10' : 'border-slate-100 hover:border-indigo-100'
              } ${currentUser && !notice.readBy.includes(currentUser.id) ? 'ring-1 ring-indigo-500/20' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    notice.type === 'URGENT' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <i className={`fa-solid ${notice.type === 'URGENT' ? 'fa-triangle-exclamation' : 'fa-bullhorn'}`}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm leading-tight pr-4">{notice.title}</h3>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">{notice.authorName} • {new Date(notice.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {currentUser && !notice.readBy.includes(currentUser.id) && (
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse shadow-lg shadow-indigo-100 shrink-0"></span>
                )}
              </div>

              <p className="text-xs font-medium text-slate-600 leading-relaxed mb-4">
                {notice.content}
              </p>

              <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                 <div className="flex gap-2">
                    <span className={`text-[8px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded ${notice.type === 'URGENT' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                        {notice.type}
                    </span>
                 </div>
                 <div className="text-[9px] font-semibold text-slate-300">
                    <i className="fa-regular fa-eye mr-1"></i>
                    {notice.readBy.length} Viewed
                 </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-envelope-open text-3xl text-slate-300"></i>
             </div>
             <p className="text-slate-400 font-medium">No notices found.</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
           <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-2xl animate-backdrop" onClick={() => setShowCreateModal(false)}></div>
           <div className="relative bg-white w-full max-w-xl rounded-[40px] p-8 md:p-10 shadow-2xl animate-slideUp flex flex-col max-h-[90vh] border border-white/50">
              <div className="flex justify-between items-center mb-8 shrink-0">
                 <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Post New Update</h2>
                 <button onClick={() => setShowCreateModal(false)} className="w-11 h-11 rounded-full hover:bg-slate-50 text-slate-400 flex items-center justify-center transition-all active:scale-90 border border-slate-100">
                   <i className="fa-solid fa-xmark"></i>
                 </button>
              </div>
              <form className="space-y-6 overflow-y-auto no-scrollbar pr-1 pb-1 flex-1" onSubmit={(e) => { e.preventDefault(); setShowCreateModal(false); }}>
                 <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Broadcast Title</label>
                    <input type="text" placeholder="e.g. Campus Holiday Announcement" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Priority Level</label>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium appearance-none cursor-pointer transition-all">
                       <option value="INFO">General Information</option>
                       <option value="URGENT">Urgent Alert</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Broadcast Content</label>
                    <textarea rows={6} placeholder="Detailed message for the campus community..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"></textarea>
                 </div>
                 <div className="pt-4 shrink-0">
                   <button 
                     className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-semibold shadow-2xl shadow-indigo-200 active:scale-95 hover:bg-indigo-700 transition-all text-sm tracking-wide"
                   >
                     Broadcast Update
                   </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
