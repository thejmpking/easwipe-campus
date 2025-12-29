
import React, { useState, useEffect } from 'react';
import { IdFieldConfig, AppConfig, EmailConfig, SecurityConfig, UserRole, RolePermissionConfig, AppPermission } from '../types';
import { api } from '../services/api';

type SettingsTab = 'BRANDING' | 'ROLES' | 'EMAIL' | 'SECURITY' | 'ID_CARD';

const PERMISSIONS: AppPermission[] = [
  { key: 'view_attendance', label: 'View Attendance', module: 'Attendance' },
  { key: 'mark_attendance', label: 'Manual Marking', module: 'Attendance' },
  { key: 'approve_leave', label: 'Approve Leaves', module: 'Leave' },
  { key: 'manage_shifts', label: 'Manage Shifts', module: 'Shifts' },
  { key: 'post_notice', label: 'Post Notices', module: 'Notice Board' },
  { key: 'view_reports', label: 'View Analytics', module: 'Reports' },
];

const AdminSettings: React.FC = () => {
  const [tab, setTab] = useState<SettingsTab>('BRANDING');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings State
  const [idConfig, setIdConfig] = useState<IdFieldConfig | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig | null>(null);
  const [rolePerms, setRolePerms] = useState<RolePermissionConfig[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const [id, app, email, sec, roles] = await Promise.all([
      api.getFieldConfig(),
      api.getAppConfig(),
      api.getEmailConfig(),
      api.getSecurityConfig(),
      api.getRolePermissions()
    ]);
    setIdConfig(id);
    setAppConfig(app);
    setEmailConfig(email);
    setSecurityConfig(sec);
    setRolePerms(roles);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (appConfig) await api.updateAppConfig(appConfig);
      if (emailConfig) await api.updateEmailConfig(emailConfig);
      if (securityConfig) await api.updateSecurityConfig(securityConfig);
      if (rolePerms) await api.updateRolePermissions(rolePerms);
      
      // Dispatch event to update global header brand
      window.dispatchEvent(new CustomEvent('easwipe-config-updated', { detail: appConfig }));
      alert('Settings saved successfully!');
    } catch (e) {
      alert('Failed to save settings.');
    }
    setSaving(false);
  };

  const toggleRolePermission = (role: UserRole, permKey: string) => {
    setRolePerms(prev => prev.map(rp => {
      if (rp.role === role) {
        const has = rp.permissions.includes(permKey);
        return {
          ...rp,
          permissions: has ? rp.permissions.filter(p => p !== permKey) : [...rp.permissions, permKey]
        };
      }
      return rp;
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Control</h1>
          <p className="text-slate-500 text-sm">Configure global campus behavior</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all flex items-center gap-2"
        >
          {saving ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
          Save All
        </button>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'BRANDING', label: 'Branding', icon: 'fa-paint-roller' },
          { id: 'ROLES', label: 'Roles', icon: 'fa-user-lock' },
          { id: 'EMAIL', label: 'Email/SMTP', icon: 'fa-envelope-circle-check' },
          { id: 'SECURITY', label: 'Security', icon: 'fa-shield-halved' },
          { id: 'ID_CARD', label: 'ID Card', icon: 'fa-id-card' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as SettingsTab)}
            className={`flex-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              tab === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
            }`}
          >
            <i className={`fa-solid ${t.icon}`}></i>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm min-h-[400px]">
        {/* BRANDING TAB */}
        {tab === 'BRANDING' && appConfig && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Organization Name</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                value={appConfig.orgName}
                onChange={e => setAppConfig({ ...appConfig, orgName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Branding Logo URL</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="https://yourdomain.com/logo.png"
                value={appConfig.orgLogo || ''}
                onChange={e => setAppConfig({ ...appConfig, orgLogo: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Timezone</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm outline-none"
                  value={appConfig.timezone}
                  onChange={e => setAppConfig({ ...appConfig, timezone: e.target.value })}
                >
                  <option value="UTC-5">EST (New York)</option>
                  <option value="UTC+0">GMT (London)</option>
                  <option value="UTC+5:30">IST (Mumbai)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Date Format</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm outline-none"
                  value={appConfig.dateFormat}
                  onChange={e => setAppConfig({ ...appConfig, dateFormat: e.target.value })}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ROLES TAB */}
        {tab === 'ROLES' && (
          <div className="space-y-6 animate-fadeIn">
            {Object.values(UserRole).map(role => {
              const config = rolePerms.find(rp => rp.role === role);
              return (
                <div key={role} className="border-b border-slate-50 pb-6 last:border-0">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">
                      {role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {PERMISSIONS.map(perm => (
                      <label key={perm.key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                          checked={config?.permissions.includes(perm.key) || config?.permissions.includes('all')}
                          disabled={config?.permissions.includes('all')}
                          onChange={() => toggleRolePermission(role, perm.key)}
                        />
                        <span className="text-[11px] font-bold text-slate-600">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* EMAIL TAB */}
        {tab === 'EMAIL' && emailConfig && (
          <div className="space-y-6 animate-fadeIn">
             <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl">
               <div>
                  <h4 className="text-xs font-bold text-indigo-900">Enable Email Alerts</h4>
                  <p className="text-[10px] text-indigo-700">Send notifications for attendance & leave</p>
               </div>
               <button 
                  onClick={() => setEmailConfig({...emailConfig, enableNotifications: !emailConfig.enableNotifications})}
                  className={`w-12 h-6 rounded-full transition-colors relative ${emailConfig.enableNotifications ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${emailConfig.enableNotifications ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>

             <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">SMTP Host</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm" value={emailConfig.smtpHost} onChange={e => setEmailConfig({...emailConfig, smtpHost: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Port</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm" value={emailConfig.smtpPort} onChange={e => setEmailConfig({...emailConfig, smtpPort: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Username</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm" value={emailConfig.smtpUser} onChange={e => setEmailConfig({...emailConfig, smtpUser: e.target.value})} />
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    const ok = await api.testSmtp();
                    alert(ok ? 'SMTP Connection Successful!' : 'Connection Failed.');
                  }}
                  className="w-full border-2 border-dashed border-slate-200 py-3 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-colors"
                >
                   Test SMTP Handshake
                </button>
             </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {tab === 'SECURITY' && securityConfig && (
          <div className="space-y-6 animate-fadeIn">
             <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Min Password Length</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm" value={securityConfig.passwordMinLength} onChange={e => setSecurityConfig({...securityConfig, passwordMinLength: parseInt(e.target.value)})} />
             </div>
             <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Session Timeout (Minutes)</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm" value={securityConfig.sessionTimeout} onChange={e => setSecurityConfig({...securityConfig, sessionTimeout: parseInt(e.target.value)})} />
             </div>
             <div className="flex items-center justify-between">
                <div>
                   <h4 className="text-xs font-bold text-slate-800">Enforce MFA</h4>
                   <p className="text-[10px] text-slate-400">Require multi-factor for admins</p>
                </div>
                <button 
                  onClick={() => setSecurityConfig({...securityConfig, requireMFA: !securityConfig.requireMFA})}
                  className={`w-12 h-6 rounded-full transition-colors relative ${securityConfig.requireMFA ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${securityConfig.requireMFA ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>
          </div>
        )}

        {/* ID CARD TAB (Existing controls) */}
        {tab === 'ID_CARD' && idConfig && (
          <div className="space-y-6 animate-fadeIn">
            {Object.keys(idConfig).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 text-sm capitalize">{key.replace('show', '').replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-[10px] text-slate-400">Visibility on profile and ID cards</p>
                </div>
                <button 
                  onClick={() => {
                    const next = { ...idConfig, [key]: !idConfig[key as keyof IdFieldConfig] };
                    setIdConfig(next);
                    api.updateFieldConfig(next);
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative ${idConfig[key as keyof IdFieldConfig] ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${idConfig[key as keyof IdFieldConfig] ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900 text-white rounded-[32px] border border-slate-800">
        <div className="flex gap-4">
          <i className="fa-solid fa-wand-magic-sparkles text-indigo-400 text-xl mt-1"></i>
          <div>
            <h4 className="font-bold text-sm">AI Configuration Tip</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
              For schools with over 500 students, we recommend setting "Session Timeout" to 120 minutes to prevent frequent relogins during morning rush hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
