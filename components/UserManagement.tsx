
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, UserRole, Department, Designation } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem('eaSwipe_user');
    if (userJson) {
      const u = JSON.parse(userJson);
      setCurrentUser(u);
      fetchData(u);
    }
  }, []);

  const fetchData = async (userContext: User) => {
    setLoading(true);
    const [u, d, des] = await Promise.all([
      api.getUsers(userContext),
      api.getDepartments(),
      api.getDesignations()
    ]);
    setUsers(u);
    setDepts(d);
    setDesignations(des);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser?.email && editingUser?.name) {
      await api.saveUser({
        ...editingUser,
        id: editingUser.id || `u${Date.now()}`,
        role: editingUser.role || UserRole.STUDENT,
        createdAt: editingUser.createdAt || new Date().toISOString()
      } as User);
      setShowModal(false);
      if (currentUser) fetchData(currentUser);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await api.deleteUser(id);
      if (currentUser) fetchData(currentUser);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-rose-100 text-rose-700';
      case UserRole.RESOURCE_PERSON: return 'bg-amber-100 text-amber-700';
      case UserRole.SCHOOL: return 'bg-indigo-100 text-indigo-700';
      case UserRole.TEACHER: return 'bg-emerald-100 text-emerald-700';
      case UserRole.STUDENT: return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800 tracking-tight leading-none mb-2">User Directory</h1>
          <p className="text-slate-500 font-medium">
            {currentUser?.role === UserRole.RESOURCE_PERSON 
              ? `Resource Management for ${depts.find(d => d.id === currentUser.departmentId)?.name || 'Department'}`
              : currentUser?.role === UserRole.SCHOOL
              ? `School Administration Hub`
              : 'Global administration of staff, students & parents'}
          </p>
        </div>
        {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.RESOURCE_PERSON || currentUser?.role === UserRole.SCHOOL) && (
          <button 
            onClick={() => { setEditingUser({ departmentId: currentUser?.departmentId, schoolId: currentUser?.schoolId }); setShowModal(true); }}
            className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 font-semibold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all"
          >
            <i className="fa-solid fa-user-plus"></i>
            Add Profile
          </button>
        )}
      </header>

      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="w-full lg:flex-1 relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Search name, email or ID..."
            className="w-full bg-white border border-slate-200 rounded-[20px] py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full lg:w-auto flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['ALL', ...Object.values(UserRole)].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-6 py-2 rounded-full text-[10px] font-semibold uppercase tracking-widest transition-all whitespace-nowrap ${
                filterRole === role ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              {role.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div></div>
        ) : filteredUsers.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-4 group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden shrink-0 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                <img src={user.avatar || `https://picsum.photos/100/100?u=${user.id}`} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <span className={`text-[8px] font-semibold uppercase px-2 py-0.5 rounded-full ${getRoleColor(user.role)} mb-1 inline-block`}>
                  {user.role.replace('_', ' ')}
                </span>
                <h3 className="font-semibold text-slate-800 truncate text-sm">{user.name}</h3>
                <p className="text-[10px] font-medium text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
               <div className="flex flex-col gap-1">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-1">Affiliation</p>
                  <p className="text-xs font-semibold text-indigo-500 truncate leading-none">
                    {depts.find(d => d.id === (user.schoolId || user.departmentId))?.name || 'Central Office'}
                  </p>
               </div>
            </div>

            <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => { setEditingUser(user); setShowModal(true); }} className="flex-1 bg-indigo-50 text-indigo-600 py-2 rounded-xl text-[10px] font-semibold uppercase hover:bg-indigo-100 transition-colors">
                  Edit
               </button>
               <button onClick={() => handleDelete(user.id)} className="flex-1 bg-rose-50 text-rose-600 py-2 rounded-xl text-[10px] font-semibold uppercase hover:bg-rose-100 transition-colors">
                  Remove
               </button>
            </div>
          </div>
        ))}
        {!loading && filteredUsers.length === 0 && (
          <div className="col-span-full text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
             <i className="fa-solid fa-user-slash text-4xl text-slate-200 mb-2"></i>
             <p className="text-slate-400 text-sm font-medium">No users match your criteria.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 md:p-8 animate-backdrop">
           <div className="bg-white w-full max-w-xl md:max-w-2xl rounded-[40px] p-8 md:p-12 shadow-2xl animate-slideUp overflow-hidden flex flex-col max-h-[85vh] border border-slate-100/50">
              <div className="flex justify-between items-center mb-8 shrink-0">
                 <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">{editingUser?.id ? 'Profile Update' : 'New User Profile'}</h2>
                 <button onClick={() => setShowModal(false)} className="w-11 h-11 rounded-full hover:bg-slate-50 text-slate-400 flex items-center justify-center transition-all active:scale-90 border border-slate-100">
                   <i className="fa-solid fa-xmark"></i>
                 </button>
              </div>
              <form onSubmit={handleSave} className="space-y-8 overflow-y-auto no-scrollbar pb-2 px-1 flex-1">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                       <label className="text-[10px] font-semibold uppercase text-slate-400 tracking-widest ml-1 mb-2.5 block">Full Legal Name</label>
                       <input 
                         required
                         type="text" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold transition-all"
                         value={editingUser?.name || ''}
                         onChange={e => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-semibold uppercase text-slate-400 tracking-widest ml-1 mb-2.5 block">Primary Email</label>
                       <input 
                         required
                         type="email" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold transition-all"
                         value={editingUser?.email || ''}
                         onChange={e => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-semibold uppercase text-slate-400 tracking-widest ml-1 mb-2.5 block">Access Role</label>
                       <select 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold appearance-none cursor-pointer transition-all"
                         value={editingUser?.role || ''}
                         onChange={e => setEditingUser(prev => ({ ...prev, role: e.target.value as UserRole }))}
                       >
                          {Object.values(UserRole).map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                       </select>
                    </div>
                    <div className="md:col-span-2">
                       <label className="text-[10px] font-semibold uppercase text-slate-400 tracking-widest ml-1 mb-2.5 block">Department Link</label>
                       <select 
                         disabled={currentUser?.role !== UserRole.ADMIN}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold appearance-none cursor-pointer disabled:opacity-60 transition-all"
                         value={editingUser?.departmentId || ''}
                         onChange={e => setEditingUser(prev => ({ ...prev, departmentId: e.target.value }))}
                       >
                          <option value="">None (Top Level)</option>
                          {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                       </select>
                    </div>
                 </div>
                 
                 <div className="pt-4 shrink-0">
                    <button 
                      type="submit"
                      className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-semibold uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Confirm and Save Profile
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
