
import { 
  User, UserRole, IdFieldConfig, AttendanceEntry, Shift, ShiftAssignment, 
  ShiftChangeRequest, LeaveRequest, LeaveBalance, LeaveType, Notice, 
  AdminDashboardMetrics, Department, Designation,
  AppConfig, EmailConfig, SecurityConfig, RolePermissionConfig
} from '../types';

// Initial Settings State
let APP_CONFIG: AppConfig = {
  orgName: 'eaSwipe Academy',
  timezone: 'UTC+5:30',
  dateFormat: 'DD/MM/YYYY',
  workingDays: [1, 2, 3, 4, 5]
};

let EMAIL_CONFIG: EmailConfig = {
  smtpHost: 'smtp.easwipe.com',
  smtpPort: 587,
  smtpUser: 'notifications@easwipe.com',
  fromEmail: 'no-reply@easwipe.com',
  enableNotifications: true
};

let SECURITY_CONFIG: SecurityConfig = {
  passwordMinLength: 8,
  sessionTimeout: 60,
  requireMFA: false
};

let ROLE_PERMISSIONS: RolePermissionConfig[] = [
  { role: UserRole.ADMIN, permissions: ['all'] },
  { role: UserRole.RESOURCE_PERSON, permissions: ['view_attendance', 'mark_attendance', 'approve_leave', 'manage_shifts', 'post_notice'] },
  { role: UserRole.SCHOOL, permissions: ['view_attendance', 'mark_attendance', 'approve_leave', 'post_notice'] },
  { role: UserRole.TEACHER, permissions: ['view_attendance', 'mark_attendance', 'post_notice'] },
  { role: UserRole.STUDENT, permissions: ['view_self_id', 'apply_leave'] },
  { role: UserRole.PARENT, permissions: ['view_self_id'] }
];

const getChildDeptIds = (deptId: string, depts: Department[]): string[] => {
  const children = depts.filter(d => d.parentId === deptId);
  let ids = [deptId];
  children.forEach(c => {
    ids = [...ids, ...getChildDeptIds(c.id, depts)];
  });
  return ids;
};

// Mock State
let USERS: Record<string, User & { password: string }> = {
  'admin@easwipe.com': { 
    id: 'u1', name: 'Campus Admin', email: 'admin@easwipe.com', password: 'password', role: UserRole.ADMIN, avatar: 'https://picsum.photos/100/100?random=1', username: 'admin'
  },
  'rp@easwipe.com': { 
    id: 'u_rp', name: 'Mr. Area Manager', email: 'rp@easwipe.com', password: 'password', role: UserRole.RESOURCE_PERSON, avatar: 'https://picsum.photos/100/100?random=10', username: 'areamgr', departmentId: 'd1'
  },
  'school@easwipe.com': { 
    id: 'u_school', name: 'St. Mary Principal', email: 'school@easwipe.com', password: 'password', role: UserRole.SCHOOL, avatar: 'https://picsum.photos/100/100?random=11', username: 'stmary', departmentId: 'd1', schoolId: 's1'
  },
  'teacher@easwipe.com': { 
    id: 'u2', name: 'Dr. Sarah Wilson', email: 'teacher@easwipe.com', password: 'password', role: UserRole.TEACHER, avatar: 'https://picsum.photos/100/100?random=2', username: 'sarahw', departmentId: 'd1', schoolId: 's1', designationId: 'des1'
  },
  'parent@easwipe.com': {
    id: 'u_parent', name: 'Parent of Alice', email: 'parent@easwipe.com', password: 'password', role: UserRole.PARENT, username: 'alice_parent'
  }
};

let DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Primary Education', headIds: ['u_rp'] },
  { id: 's1', name: 'St. Mary High School', parentId: 'd1' }
];

let DESIGNATIONS: Designation[] = [
  { id: 'des1', name: 'Professor', role: UserRole.TEACHER, departmentId: 'd1' }
];

let ATTENDANCE_RECORDS: AttendanceEntry[] = [];
let LEAVE_REQUESTS: LeaveRequest[] = [];
let SHIFT_REQUESTS: ShiftChangeRequest[] = [];
let SHIFTS: Shift[] = [
  { id: 'sh1', name: 'Morning Shift', startTime: '08:00 AM', endTime: '02:00 PM', color: '#4f46e5' },
  { id: 'sh2', name: 'Evening Shift', startTime: '02:00 PM', endTime: '08:00 PM', color: '#10b981' }
];
let NOTICES: Notice[] = [
  { id: 'n1', title: 'Welcome to eaSwipe', content: 'Campus automation made simple.', authorId: 'u1', authorName: 'Admin', type: 'INFO', readBy: [], createdAt: new Date().toISOString() }
];

export const api = {
  getAppConfig: async () => APP_CONFIG,
  updateAppConfig: async (config: AppConfig) => { APP_CONFIG = config; },
  getEmailConfig: async () => EMAIL_CONFIG,
  updateEmailConfig: async (config: EmailConfig) => { EMAIL_CONFIG = config; },
  getSecurityConfig: async () => SECURITY_CONFIG,
  updateSecurityConfig: async (config: SecurityConfig) => { SECURITY_CONFIG = config; },
  getRolePermissions: async () => ROLE_PERMISSIONS,
  updateRolePermissions: async (configs: RolePermissionConfig[]) => { ROLE_PERMISSIONS = configs; },

  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = Object.values(USERS).find(u => u.email === email && u.password === password);
        if (user) {
          const { password: _, ...u } = user;
          resolve({ user: u, token: 'mock-token' });
        } else reject(new Error('Invalid credentials'));
      }, 800);
    });
  },

  getUsers: async (requestingUser?: User) => {
    let allUsers = Object.values(USERS).map(({ password: _, ...u }) => u);
    if (!requestingUser) return allUsers;
    if (requestingUser.role === UserRole.ADMIN) return allUsers;
    if (requestingUser.role === UserRole.RESOURCE_PERSON && requestingUser.departmentId) {
      const allowedDepts = getChildDeptIds(requestingUser.departmentId, DEPARTMENTS);
      return allUsers.filter(u => u.departmentId && allowedDepts.includes(u.departmentId));
    }
    return allUsers.filter(u => u.id === requestingUser.id);
  },
  saveUser: async (user: User) => { USERS[user.email] = { ...user, password: 'password123' } as any; return user; },
  deleteUser: async (id: string) => { const k = Object.keys(USERS).find(x => USERS[x].id === id); if (k) delete USERS[k]; },
  getDepartments: async () => DEPARTMENTS,
  saveDepartment: async (d: Department) => { const i = DEPARTMENTS.findIndex(x => x.id === d.id); if (i>-1) DEPARTMENTS[i]=d; else DEPARTMENTS.push({...d, id: `d${Date.now()}`}); },
  deleteDepartment: async (id: string) => { DEPARTMENTS = DEPARTMENTS.filter(d => d.id !== id); },
  getDesignations: async () => DESIGNATIONS,
  saveDesignation: async (d: Designation) => { const i = DESIGNATIONS.findIndex(x => x.id === d.id); if (i>-1) DESIGNATIONS[i]=d; else DESIGNATIONS.push({...d, id: `des${Date.now()}`}); },
  deleteDesignation: async (id: string) => { DESIGNATIONS = DESIGNATIONS.filter(d => d.id !== id); },

  getAttendance: async (requestingUser?: User) => {
    if (!requestingUser) return ATTENDANCE_RECORDS;
    return ATTENDANCE_RECORDS.filter(r => r.userId === requestingUser.id || requestingUser.role === UserRole.ADMIN);
  },
  markAttendance: async (entry: any) => { const e = { ...entry, id: `a${Date.now()}`, timestamp: new Date().toISOString() }; ATTENDANCE_RECORDS.push(e); return e; },
  syncOfflineData: async () => 0,
  getShifts: async () => SHIFTS,
  getRoster: async () => [],
  getShiftRequests: async (requestingUser?: User) => SHIFT_REQUESTS,
  updateShiftRequest: async (id: string, status: any) => { const r = SHIFT_REQUESTS.find(x => x.id === id); if (r) r.status = status; },
  getLeaveRequests: async (requestingUser?: User) => LEAVE_REQUESTS,
  applyLeave: async (req: any) => { const n = { ...req, id: `l${Date.now()}`, status: 'pending', appliedAt: new Date().toISOString() }; LEAVE_REQUESTS.push(n); return n; },
  updateLeaveRequest: async (id: string, status: any) => { const r = LEAVE_REQUESTS.find(x => x.id === id); if (r) r.status = status; },
  getLeaveBalances: async (uid: string) => [{ type: 'CASUAL', total: 12, used: 2 }],
  getNotices: async (u: User) => NOTICES,
  markNoticeAsRead: async (nid: string, uid: string) => { const n = NOTICES.find(x => x.id === nid); if (n && !n.readBy.includes(uid)) n.readBy.push(uid); },
  getEvents: async () => [],
  getAdminMetrics: async (requestingUser?: User): Promise<AdminDashboardMetrics> => {
    const totalUsers = Object.keys(USERS).length;
    return {
      totalUsers,
      totalSchools: 8,
      totalDepts: DEPARTMENTS.length,
      presentToday: Math.floor(totalUsers * 0.85),
      absentToday: Math.floor(totalUsers * 0.10),
      lateToday: Math.floor(totalUsers * 0.05),
      overtimeHours: 12.5,
      pendingLeaves: LEAVE_REQUESTS.filter(l => l.status === 'pending').length,
      pendingSwaps: SHIFT_REQUESTS.filter(s => s.status === 'pending').length,
      shiftData: SHIFTS.map(s => ({ shiftName: s.name, present: 12, absent: 2, late: 1, color: s.color })),
      attendanceTrend: [
        { day: 'Mon', percentage: 92 }, { day: 'Tue', percentage: 88 }, { day: 'Wed', percentage: 95 },
        { day: 'Thu', percentage: 91 }, { day: 'Fri', percentage: 94 }, { day: 'Sat', percentage: 40 }, { day: 'Sun', percentage: 10 }
      ],
      roleDistribution: [
        { name: 'Admins', value: 2, color: '#4f46e5' }, { name: 'Teachers', value: 15, color: '#10b981' },
        { name: 'Students', value: 120, color: '#f43f5e' }, { name: 'Staff', value: 12, color: '#f59e0b' }
      ],
      schoolMetrics: [
        { id: 's1', name: 'St. Mary High', users: 140, attendance: 92.4, status: 'active' },
        { id: 's2', name: 'Springfield Academy', users: 85, attendance: 88.1, status: 'warning' },
        { id: 's3', name: 'Central Coaching', users: 210, attendance: 94.6, status: 'active' },
        { id: 's4', name: 'Westside Vocational', users: 45, attendance: 65.2, status: 'issue' }
      ],
      recentActivity: [
        { id: '1', type: 'LEAVE', message: 'Dr. Sarah Wilson applied for sick leave', time: '2m ago' },
        { id: '2', type: 'USER', message: '5 new students added to Springfield Academy', time: '15m ago' },
        { id: '3', type: 'SHIFT', message: 'Evening shift rotation completed for Primary Dept', time: '1h ago' },
        { id: '4', type: 'NOTICE', message: 'Annual Sports Day announcement published', time: '3h ago' }
      ]
    };
  },
  getLinkedChildren: async (pid: string) => [],
  getFieldConfig: async () => ({ showBloodGroup: true, showEmergencyContact: true, showDepartment: true, showIdNumber: true }),
  updateFieldConfig: async (config: IdFieldConfig) => {},
  getUserByUsername: async (username: string) => null,
  resetPassword: async (email: string) => {},
  testSmtp: async () => true
};
