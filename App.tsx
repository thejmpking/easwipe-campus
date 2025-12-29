
import React, { useState, useEffect } from 'react';
import { AppSection, User, UserRole, AppConfig } from './types';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Attendance from './components/Attendance';
import SmartID from './components/SmartID';
import ShiftManagement from './components/ShiftManagement';
import Insights from './components/Insights';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import PublicIDCard from './components/PublicIDCard';
import AdminSettings from './components/AdminSettings';
import LeaveManagement from './components/LeaveManagement';
import NoticeBoard from './components/NoticeBoard';
import CampusCalendar from './components/CampusCalendar';
import ParentPortal from './components/ParentPortal';
import UserManagement from './components/UserManagement';
import OrgManagement from './components/OrgManagement';
import { api } from './services/api';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.DASHBOARD);
  const [view, setView] = useState<'login' | 'forgot' | 'app' | 'public_id'>('login');
  const [publicUsername, setPublicUsername] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  
  // Branding State
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    const init = async () => {
      const savedUser = localStorage.getItem('eaSwipe_user');
      const savedToken = localStorage.getItem('eaSwipe_token');
      
      if (savedUser && savedToken) {
        setCurrentUser(JSON.parse(savedUser));
        setView('app');
      }

      const config = await api.getAppConfig();
      setAppConfig(config);
      setIsInitializing(false);
    };
    init();

    const handleConfigUpdate = (e: any) => setAppConfig(e.detail);
    const handleOnline = async () => {
      setIsOnline(true);
      setSyncing(true);
      await api.syncOfflineData();
      setSyncing(false);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('easwipe-config-updated', handleConfigUpdate);
    window.addEventListener('easwipe-nfc-tap', (e: any) => {
      setPublicUsername(e.detail);
      setView('public_id');
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('easwipe-config-updated', handleConfigUpdate);
    };
  }, []);

  const handleLoginSuccess = (user: User, newToken: string) => {
    setCurrentUser(user);
    localStorage.setItem('eaSwipe_user', JSON.stringify(user));
    localStorage.setItem('eaSwipe_token', newToken);
    setView('app');
    setCurrentSection(user.role === UserRole.STUDENT ? AppSection.SMART_ID : 
                     user.role === UserRole.PARENT ? AppSection.PARENT_PORTAL : AppSection.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('eaSwipe_user');
    localStorage.removeItem('eaSwipe_token');
    setView('login');
  };

  const renderContent = () => {
    switch (currentSection) {
      case AppSection.DASHBOARD: return <Dashboard onNavigate={setCurrentSection} />;
      case AppSection.ATTENDANCE: return <Attendance />;
      case AppSection.SMART_ID: return <SmartID />;
      case AppSection.SHIFTS: return <ShiftManagement />;
      case AppSection.LEAVE: return <LeaveManagement />;
      case AppSection.NOTICE_BOARD: return <NoticeBoard />;
      case AppSection.CALENDAR: return <CampusCalendar />;
      case AppSection.PARENT_PORTAL: return <ParentPortal />;
      case AppSection.INSIGHTS: return <Insights />;
      case AppSection.SETTINGS: return <AdminSettings />;
      case AppSection.USER_MANAGEMENT: return <UserManagement />;
      case AppSection.ORG_MANAGEMENT: return <OrgManagement />;
      default: return <Dashboard onNavigate={setCurrentSection} />;
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (view === 'public_id') return <PublicIDCard username={publicUsername} onClose={() => setView('app')} />;
  if (view === 'login') return <Login onLoginSuccess={handleLoginSuccess} onGoToReset={() => setView('forgot')} />;
  if (view === 'forgot') return <ForgotPassword onBackToLogin={() => setView('login')} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <Sidebar 
        currentSection={currentSection} 
        onNavigate={setCurrentSection} 
        appConfig={appConfig} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg overflow-hidden">
              {appConfig?.orgLogo ? (
                <img src={appConfig.orgLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <i className="fa-solid fa-swatchbook text-sm"></i>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-slate-900 leading-none">
                {appConfig?.orgName || 'eaSwipe'}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Mobile Access</span>
            </div>
          </div>

          <div className="hidden md:block">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight capitalize">
              {currentSection.replace('_', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-100 rounded-full">
              {syncing ? (
                <i className="fa-solid fa-cloud-arrow-up text-indigo-500 animate-bounce text-xs"></i>
              ) : !isOnline ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-[10px] font-bold text-rose-600 uppercase">Offline</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Live</span>
                </div>
              )}
            </div>
            <button onClick={handleLogout} className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-md active:scale-95 transition-transform md:hidden">
              <img src={currentUser?.avatar || "https://picsum.photos/100/100"} alt="Profile" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {renderContent()}
        </main>
      </div>

      <Navigation currentSection={currentSection} onNavigate={setCurrentSection} />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-1/4 h-1 bg-slate-200/50 rounded-b-full z-50 pointer-events-none md:hidden"></div>
    </div>
  );
};

export default App;
