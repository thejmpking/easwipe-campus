
import React from 'react';
import { AppSection, UserRole } from '../types';
import { NAV_ITEMS } from '../constants';

interface NavigationProps {
  currentSection: AppSection;
  onNavigate: (section: AppSection) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentSection, onNavigate }) => {
  const savedUser = localStorage.getItem('eaSwipe_user');
  const role = savedUser ? JSON.parse(savedUser).role : null;

  if (!role) return null;

  const filteredItems = NAV_ITEMS.filter(item => {
    if (role === UserRole.ADMIN) return true;
    
    if (role === UserRole.RESOURCE_PERSON) {
       return [AppSection.DASHBOARD, AppSection.ATTENDANCE, AppSection.NOTICE_BOARD, AppSection.SHIFTS, AppSection.LEAVE].includes(item.id);
    }

    if (role === UserRole.SCHOOL) {
       return [AppSection.DASHBOARD, AppSection.ATTENDANCE, AppSection.NOTICE_BOARD, AppSection.CALENDAR, AppSection.LEAVE].includes(item.id);
    }

    if (role === UserRole.STUDENT) {
      return [AppSection.DASHBOARD, AppSection.NOTICE_BOARD, AppSection.CALENDAR, AppSection.SMART_ID, AppSection.LEAVE].includes(item.id);
    }
    if (role === UserRole.TEACHER) {
      return [AppSection.DASHBOARD, AppSection.ATTENDANCE, AppSection.NOTICE_BOARD, AppSection.SHIFTS, AppSection.LEAVE].includes(item.id);
    }
    if (role === UserRole.PARENT) {
      return [AppSection.DASHBOARD, AppSection.PARENT_PORTAL, AppSection.NOTICE_BOARD, AppSection.CALENDAR, AppSection.SMART_ID].includes(item.id);
    }
    return false;
  });

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-2 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto overflow-x-auto no-scrollbar">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center min-w-[64px] h-full transition-all shrink-0 ${
              currentSection === item.id 
              ? 'text-indigo-600 scale-110' 
              : 'text-slate-300 hover:text-slate-400'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-0.5 transition-colors ${currentSection === item.id ? 'bg-indigo-50' : ''}`}>
              <i className={`fa-solid ${item.icon} text-lg`}></i>
            </div>
            <span className="text-[8px] font-black uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
