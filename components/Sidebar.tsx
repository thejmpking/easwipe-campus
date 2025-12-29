
import React from 'react';
import { AppSection, UserRole, User, AppConfig } from '../types';
import { NAV_ITEMS } from '../constants';

interface SidebarProps {
  currentSection: AppSection;
  onNavigate: (section: AppSection) => void;
  appConfig: AppConfig | null;
  currentUser: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentSection, onNavigate, appConfig, currentUser, onLogout }) => {
  const role = currentUser?.role;

  const filteredItems = NAV_ITEMS.filter(item => {
    if (!role) return false;
    if (role === UserRole.ADMIN) return true;
    
    if (role === UserRole.RESOURCE_PERSON) {
      return [AppSection.DASHBOARD, AppSection.ATTENDANCE, AppSection.NOTICE_BOARD, AppSection.CALENDAR, AppSection.SHIFTS, AppSection.LEAVE, AppSection.INSIGHTS].includes(item.id);
    }
    
    if (role === UserRole.SCHOOL) {
      return [AppSection.DASHBOARD, AppSection.ATTENDANCE, AppSection.NOTICE_BOARD, AppSection.CALENDAR, AppSection.LEAVE].includes(item.id);
    }

    if (role === UserRole.STUDENT) {
      return [AppSection.DASHBOARD, AppSection.NOTICE_BOARD, AppSection.CALENDAR, AppSection.SMART_ID, AppSection.LEAVE, AppSection.INSIGHTS].includes(item.id);
    }
    if (role === UserRole.TEACHER) {
      return [AppSection.DASHBOARD, AppSection.ATTENDANCE, AppSection.NOTICE_BOARD, AppSection.CALENDAR, AppSection.SHIFTS, AppSection.LEAVE, AppSection.INSIGHTS].includes(item.id);
    }
    if (role === UserRole.PARENT) {
      return [AppSection.DASHBOARD, AppSection.PARENT_PORTAL, AppSection.NOTICE_BOARD, AppSection.CALENDAR, AppSection.INSIGHTS, AppSection.SMART_ID].includes(item.id);
    }
    return false;
  });

  const managementAdditions = (role === UserRole.ADMIN || role === UserRole.RESOURCE_PERSON || role === UserRole.SCHOOL) ? [
    { id: AppSection.USER_MANAGEMENT, label: 'User Directory', icon: 'fa-users-gear' },
    { id: AppSection.ORG_MANAGEMENT, label: 'Org Structure', icon: 'fa-sitemap' },
    { id: AppSection.SETTINGS, label: 'App Settings', icon: 'fa-gear' }
  ] : [];

  const finalItems = [...filteredItems];
  
  if (role === UserRole.ADMIN || role === UserRole.RESOURCE_PERSON || role === UserRole.SCHOOL) {
    managementAdditions.forEach(add => {
      if (role === UserRole.SCHOOL && (add.id === AppSection.ORG_MANAGEMENT || add.id === AppSection.SETTINGS)) return;
      if (!finalItems.some(i => i.id === add.id)) finalItems.push(add);
    });
  }

  // Add Analytics link for Admin explicitly
  if (role === UserRole.ADMIN && !finalItems.some(i => i.id === AppSection.REPORTS)) {
    finalItems.push({ id: AppSection.REPORTS, label: 'Advanced Analytics', icon: 'fa-chart-pie' });
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 h-screen sticky top-0 z-50">
      <div className="p-6 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 shrink-0">
            {appConfig?.orgLogo ? (
              <img src={appConfig.orgLogo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <i className="fa-solid fa-swatchbook text-lg"></i>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-black text-slate-900 tracking-tight truncate">
              {appConfig?.orgName || 'eaSwipe'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
        {finalItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm group ${
              currentSection === item.id 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            <i className={`fa-solid ${item.icon} ${currentSection === item.id ? 'text-white' : 'text-slate-300 group-hover:text-indigo-400'} transition-colors w-5 text-center`}></i>
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-50">
        <div className="bg-slate-50 p-4 rounded-2xl mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden">
              <img src={currentUser?.avatar || "https://picsum.photos/100/100"} alt="User" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-400 uppercase font-black truncate">{role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-power-off"></i>
            Logout Session
          </button>
        </div>
        <p className="text-[9px] text-center text-slate-300 font-bold uppercase tracking-widest">eaSwipe v3.2.0-Ent</p>
      </div>
    </aside>
  );
};

export default Sidebar;
