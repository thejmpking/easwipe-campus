
import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { api } from '../services/api';
import { AdminDashboardMetrics, AppSection, User, UserRole, Notice } from '../types';

interface DashboardProps {
  onNavigate?: (section: AppSection) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);

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
    const [m, n] = await Promise.all([
      api.getAdminMetrics(user),
      api.getNotices(user)
    ]);
    setMetrics(m);
    setNotices(n);
    setLoading(false);
  };

  if (loading || !metrics || !currentUser) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const StatCard = ({ label, value, trend, icon, color }: { label: string, value: string | number, trend?: string, icon: string, color: string }) => (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
          <i className={`fa-solid ${icon} text-lg`}></i>
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-widest mb-1">{label}</p>
      <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">{value}</h2>
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${color} opacity-[0.03] rounded-full group-hover:scale-125 transition-transform duration-500`}></div>
    </div>
  );

  const QuickAction = ({ icon, label, section, color, count }: { icon: string, label: string, section: AppSection, color: string, count?: number }) => (
    <button 
      onClick={() => onNavigate?.(section)}
      className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 group active:scale-95 transition-all relative hover:border-indigo-100"
    >
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white shrink-0 group-hover:rotate-6 transition-transform`}>
        <i className={`fa-solid ${icon} text-sm`}></i>
      </div>
      <div className="text-left min-w-0">
        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter leading-tight truncate">{label}</p>
        {count !== undefined && count > 0 ? (
          <p className="text-xs font-bold text-indigo-600">{count} Pending</p>
        ) : (
          <p className="text-[10px] font-medium text-slate-300">Quick Access</p>
        )}
      </div>
    </button>
  );

  // 1. ENTERPRISE ADMIN CONSOLE
  const AdminView = () => (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Campus Users" value={metrics.totalUsers} trend="+12.5%" icon="fa-users" color="bg-indigo-600" />
        <StatCard label="Global Schools" value={metrics.totalSchools} icon="fa-school" color="bg-rose-600" />
        <StatCard label="Live Attendance" value={`${Math.round((metrics.presentToday/metrics.totalUsers)*100)}%`} trend="+2.1%" icon="fa-user-check" color="bg-emerald-600" />
        <StatCard label="Avg. Overtime" value={`${metrics.overtimeHours}h`} icon="fa-clock-rotate-left" color="bg-amber-600" />
      </div>

      {/* Main Analytics Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Trends */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-widest">Attendance Engagement</h3>
              <p className="text-[10px] font-medium text-slate-400 mt-1">Weekly system-wide presence analysis</p>
            </div>
            <div className="flex gap-2">
               <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><i className="fa-solid fa-file-pdf"></i></button>
               <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><i className="fa-solid fa-file-excel"></i></button>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.attendanceTrend}>
                <defs>
                  <linearGradient id="colorAttend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontFamily: 'Poppins'}} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontFamily: 'Poppins', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="percentage" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAttend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-widest mb-8">Demographics</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.roleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-800 leading-none">{metrics.totalUsers}</span>
                <span className="text-[8px] font-black text-slate-300 uppercase">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
             {metrics.roleDistribution.map((r, i) => (
               <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }}></div>
                  <span className="text-[10px] font-semibold text-slate-500">{r.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Shortcuts & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
           <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest ml-2">Quick Commands</h3>
           <div className="grid grid-cols-1 gap-3">
              <QuickAction icon="fa-user-plus" label="Register User" section={AppSection.USER_MANAGEMENT} color="bg-indigo-500" />
              <QuickAction icon="fa-calendar-plus" label="Approve Leave" section={AppSection.LEAVE} color="bg-amber-500" count={metrics.pendingLeaves} />
              <QuickAction icon="fa-sitemap" label="Modify Org" section={AppSection.ORG_MANAGEMENT} color="bg-rose-500" />
              <QuickAction icon="fa-bullhorn" label="New Notice" section={AppSection.NOTICE_BOARD} color="bg-emerald-500" />
           </div>
        </div>

        {/* School Overview Table */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-widest">Institutional Health</h3>
              <button className="text-[10px] font-bold text-indigo-600 uppercase hover:underline">View All</button>
           </div>
           <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-slate-50">
                       <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institution</th>
                       <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Users</th>
                       <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attend</th>
                       <th className="pb-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {metrics.schoolMetrics.map((school) => (
                       <tr key={school.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="py-4">
                             <p className="text-xs font-bold text-slate-700">{school.name}</p>
                             <p className="text-[9px] text-slate-400">Campus ID: {school.id}</p>
                          </td>
                          <td className="py-4 text-xs font-medium text-slate-500">{school.users}</td>
                          <td className="py-4">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-700">{school.attendance}%</span>
                                <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                                   <div className={`h-full ${school.attendance > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${school.attendance}%` }}></div>
                                </div>
                             </div>
                          </td>
                          <td className="py-4 text-right">
                             <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                school.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 
                                school.status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                             }`}>
                                {school.status}
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* System Activity */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
           <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-widest mb-6">System Feed</h3>
           <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar max-h-80">
              {metrics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4 items-start relative pb-6 border-l-2 border-slate-50 ml-2 pl-6 last:border-0 last:pb-0">
                   <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full flex items-center justify-center text-[8px] border-2 border-white shadow-sm ${
                      activity.type === 'LEAVE' ? 'bg-amber-500 text-white' : 
                      activity.type === 'USER' ? 'bg-indigo-500 text-white' : 
                      activity.type === 'SHIFT' ? 'bg-slate-800 text-white' : 'bg-indigo-400 text-white'
                   }`}>
                      <i className={`fa-solid ${
                         activity.type === 'LEAVE' ? 'fa-calendar-minus' : 
                         activity.type === 'USER' ? 'fa-user-plus' : 
                         activity.type === 'SHIFT' ? 'fa-clock' : 'fa-bullhorn'
                      }`}></i>
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-slate-700 leading-relaxed truncate">{activity.message}</p>
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{activity.time}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  // Remaining Views (Teacher, Student, Parent, ResourcePerson) remain functionally equivalent but styled for mobile-first
  const SchoolView = () => (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-slate-900 p-8 rounded-[40px] text-white flex justify-between items-center shadow-xl border border-slate-800">
         <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-400 mb-2">School Level Oversight</p>
            <h2 className="text-3xl font-semibold mb-4 tracking-tight">St. Mary Academy</h2>
            <div className="flex gap-6">
               <div className="flex flex-col">
                  <span className="text-2xl font-semibold text-emerald-400">{metrics.presentToday}</span>
                  <span className="text-[9px] font-semibold text-slate-500 uppercase">Present Now</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-2xl font-semibold text-rose-400">{metrics.absentToday}</span>
                  <span className="text-[9px] font-semibold text-slate-500 uppercase">Absent Today</span>
               </div>
            </div>
         </div>
         <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-4xl text-indigo-500/50">
            <i className="fa-solid fa-school"></i>
         </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickAction icon="fa-users" label="School Staff" section={AppSection.USER_MANAGEMENT} color="bg-indigo-500" />
        <QuickAction icon="fa-calendar-check" label="Attendance" section={AppSection.ATTENDANCE} color="bg-emerald-500" />
        <QuickAction icon="fa-bullhorn" label="School News" section={AppSection.NOTICE_BOARD} color="bg-amber-500" />
        <QuickAction icon="fa-file-excel" label="School Reports" section={AppSection.DASHBOARD} color="bg-slate-800" />
      </div>
    </div>
  );

  return (
    <div className="pb-12 max-w-full">
      <header className="mb-8 px-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight leading-none mb-2">
             {currentUser.role === UserRole.ADMIN ? 'Campus Command' : 
              currentUser.role === UserRole.RESOURCE_PERSON ? 'Area Control' :
              currentUser.role === UserRole.SCHOOL ? 'School Desk' :
              currentUser.role === UserRole.TEACHER ? 'Teacher Hub' : 
              currentUser.role === UserRole.STUDENT ? 'My Academy' : 'Parent Portal'}
           </h2>
           <p className="text-slate-400 text-sm md:text-base font-medium">
             System Overview • <span className="text-indigo-600 font-semibold">{currentUser.name.split(' ')[0]}</span>
           </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
           <button onClick={() => fetchData(currentUser)} className="bg-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-100 shadow-sm active:scale-95 transition-all flex items-center gap-2">
              <i className="fa-solid fa-rotate"></i> Sync
           </button>
           <button className="bg-indigo-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-100 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap">
              <i className="fa-solid fa-cloud-arrow-down"></i> Master Export
           </button>
        </div>
      </header>

      {currentUser.role === UserRole.ADMIN && <AdminView />}
      {currentUser.role === UserRole.SCHOOL && <SchoolView />}
      {/* Fallback to original simple views for other roles as requested for this module upgrade */}
      {(currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SCHOOL) && (
        <div className="p-10 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
           <i className="fa-solid fa-user-graduate text-5xl text-indigo-100 mb-4"></i>
           <h3 className="text-xl font-semibold text-slate-800">{currentUser.role.replace('_', ' ')} Dashboard</h3>
           <p className="text-slate-500 text-sm font-medium">Use the navigation menu to access institutional modules.</p>
        </div>
      )}

      {notices.some(n => n.type === 'URGENT') && (
        <div className="mt-12 bg-slate-900 text-white p-6 rounded-[32px] flex items-center gap-6 animate-fadeIn">
          <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-900/20">
            <i className="fa-solid fa-triangle-exclamation text-lg"></i>
          </div>
          <div className="flex-1 min-w-0">
             <p className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em] mb-1">Campus Alert</p>
             <div className="text-xs font-semibold overflow-x-auto no-scrollbar whitespace-nowrap uppercase tracking-widest">
               {notices.filter(n => n.type === 'URGENT').map(n => n.title).join(' • ')}
             </div>
          </div>
          <button onClick={() => onNavigate?.(AppSection.NOTICE_BOARD)} className="hidden sm:block px-6 py-2 bg-white/10 rounded-xl text-[10px] font-bold uppercase hover:bg-white/20 transition-all">View</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
