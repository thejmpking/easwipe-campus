
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Department, Designation, UserRole, User } from '../types';

const OrgManagement: React.FC = () => {
  const [tab, setTab] = useState<'DEPTS' | 'DESIGNATIONS'>('DEPTS');
  const [depts, setDepts] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [d, des, users] = await Promise.all([api.getDepartments(), api.getDesignations(), api.getUsers()]);
    setDepts(d);
    setDesignations(des);
    setAllUsers(users);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'DEPTS') {
      await api.saveDepartment(editingItem);
    } else {
      await api.saveDesignation(editingItem);
    }
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure? This cannot be undone.')) {
      if (tab === 'DEPTS') await api.deleteDepartment(id);
      else await api.deleteDesignation(id);
      fetchData();
    }
  };

  const toggleHead = (userId: string) => {
    setEditingItem((prev: any) => {
      const headIds = prev.headIds || [];
      if (headIds.includes(userId)) {
        return { ...prev, headIds: headIds.filter((id: string) => id !== userId) };
      }
      return { ...prev, headIds: [...headIds, userId] };
    });
  };

  const getDeptHeadsNames = (headIds?: string[]) => {
    if (!headIds || headIds.length === 0) return 'No Head Assigned';
    return headIds.map(id => allUsers.find(u => u.id === id)?.name).filter(Boolean).join(', ');
  };

  const buildDeptList = (parentId?: string, level: number = 0): React.ReactNode[] => {
    const list = depts.filter(d => d.parentId === parentId);
    let items: React.ReactNode[] = [];
    list.forEach(dept => {
      items.push(
        <div key={dept.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group" style={{ marginLeft: `${level * 16}px` }}>
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-semibold shrink-0">
                 <i className={`fa-solid ${level > 0 ? 'fa-folder-tree' : 'fa-sitemap'}`}></i>
              </div>
              <div>
                 <h3 className="font-semibold text-slate-800 text-sm">{dept.name}</h3>
                 <p className="text-[10px] font-medium text-slate-400">
                    Heads: <span className="text-indigo-600 font-semibold">{getDeptHeadsNames(dept.headIds)}</span>
                 </p>
              </div>
           </div>
           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={() => { setEditingItem(dept); setShowModal(true); }} className="w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                 <i className="fa-solid fa-pen-to-square text-xs"></i>
              </button>
              <button onClick={() => handleDelete(dept.id)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 transition-all">
                 <i className="fa-solid fa-trash text-xs"></i>
              </button>
           </div>
        </div>
      );
      items = [...items, ...buildDeptList(dept.id, level + 1)];
    });
    return items;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <header className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Campus Structure</h1>
          <p className="text-slate-500 font-medium text-sm">Departments & Hierarchies</p>
        </div>
        <button 
          onClick={() => { setEditingItem({}); setShowModal(true); }}
          className="bg-indigo-600 text-white w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center active:scale-95 transition-all hover:bg-indigo-700"
        >
          <i className="fa-solid fa-plus text-lg"></i>
        </button>
      </header>

      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
        <button 
          onClick={() => setTab('DEPTS')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${tab === 'DEPTS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
        >
          Departments
        </button>
        <button 
          onClick={() => setTab('DESIGNATIONS')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${tab === 'DESIGNATIONS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
        >
          Designations
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div></div>
        ) : tab === 'DEPTS' ? (
          buildDeptList()
        ) : (
          designations.map((item: any) => (
            <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-semibold">
                     <i className="fa-solid fa-id-badge"></i>
                  </div>
                  <div>
                     <h3 className="font-semibold text-slate-800 text-sm">{item.name}</h3>
                     <p className="text-[10px] font-medium text-slate-400">{item.role}</p>
                  </div>
               </div>
               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                     <i className="fa-solid fa-pen-to-square text-xs"></i>
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 transition-all">
                     <i className="fa-solid fa-trash text-xs"></i>
                  </button>
               </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
           <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-2xl animate-backdrop" onClick={() => setShowModal(false)}></div>
           <div className="relative bg-white w-full max-w-xl rounded-[40px] p-8 md:p-10 shadow-2xl animate-slideUp max-h-[90vh] flex flex-col border border-slate-100/50">
              <div className="flex justify-between items-center mb-8 shrink-0">
                <h2 className="text-xl font-semibold text-slate-800 leading-tight">{editingItem?.id ? 'Edit' : 'Add'} {tab === 'DEPTS' ? 'Department' : 'Designation'}</h2>
                <button onClick={() => setShowModal(false)} className="w-11 h-11 rounded-full hover:bg-slate-50 text-slate-400 flex items-center justify-center transition-all active:scale-90 border border-slate-100">
                   <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6 overflow-y-auto no-scrollbar pr-1 pb-1 flex-1">
                 <div>
                    <label className="text-[10px] font-semibold uppercase text-slate-400 tracking-widest ml-1 mb-2.5 block">Display Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all"
                      value={editingItem?.name || ''}
                      onChange={e => setEditingItem((prev: any) => ({ ...prev, name: e.target.value }))}
                    />
                 </div>
                 {tab === 'DEPTS' ? (
                   <>
                     <div>
                        <label className="text-[10px] font-semibold uppercase text-slate-400 tracking-widest ml-1 mb-2.5 block">Parent Department</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all appearance-none cursor-pointer"
                          value={editingItem?.parentId || ''}
                          onChange={e => setEditingItem((prev: any) => ({ ...prev, parentId: e.target.value }))}
                        >
                           <option value="">None (Top Level)</option>
                           {depts.filter(d => d.id !== editingItem?.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="text-[10px] font-semibold uppercase text-slate-400 tracking-widest ml-1 mb-2.5 block">Resource Head(s)</label>
                        <div className="max-h-56 overflow-y-auto border border-slate-100 rounded-2xl p-3 space-y-1 bg-slate-50 no-scrollbar">
                           {allUsers.filter(u => [UserRole.RESOURCE_PERSON, UserRole.TEACHER, UserRole.ADMIN].includes(u.role)).map(user => (
                             <label key={user.id} className="flex items-center gap-3 p-3 hover:bg-white rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-100">
                                <input 
                                  type="checkbox" 
                                  checked={editingItem?.headIds?.includes(user.id)}
                                  onChange={() => toggleHead(user.id)}
                                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 transition-all"
                                />
                                <span className="text-xs font-semibold text-slate-700">{user.name}</span>
                             </label>
                           ))}
                        </div>
                     </div>
                   </>
                 ) : (
                   <div>
                      <label className="text-[10px] font-semibold uppercase text-slate-400 tracking-widest ml-1 mb-2.5 block">System Mapping Role</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all appearance-none cursor-pointer"
                        value={editingItem?.role || ''}
                        onChange={e => setEditingItem((prev: any) => ({ ...prev, role: e.target.value as UserRole }))}
                      >
                         <option value="">Select a role</option>
                         {Object.values(UserRole).map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                      </select>
                   </div>
                 )}
                 <div className="flex gap-4 pt-4 shrink-0">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-slate-200 py-4 rounded-2xl font-semibold text-slate-500 hover:bg-slate-50 transition-all active:scale-95">Cancel</button>
                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-semibold shadow-xl shadow-indigo-100 active:scale-95 hover:bg-indigo-700 transition-all">Save Changes</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default OrgManagement;
