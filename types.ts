
export enum AppSection {
  DASHBOARD = 'DASHBOARD',
  ATTENDANCE = 'ATTENDANCE',
  SMART_ID = 'SMART_ID',
  SHIFTS = 'SHIFTS',
  LEAVE = 'LEAVE',
  NOTICE_BOARD = 'NOTICE_BOARD',
  CALENDAR = 'CALENDAR',
  PARENT_PORTAL = 'PARENT_PORTAL',
  INSIGHTS = 'INSIGHTS',
  SETTINGS = 'SETTINGS',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  ORG_MANAGEMENT = 'ORG_MANAGEMENT',
  REPORTS = 'REPORTS'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  RESOURCE_PERSON = 'RESOURCE_PERSON',
  SCHOOL = 'SCHOOL',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT'
}

export interface AttendanceTrend {
  day: string;
  percentage: number;
}

export interface RoleDistribution {
  name: string;
  value: number;
  color: string;
}

export interface SchoolMetric {
  id: string;
  name: string;
  users: number;
  attendance: number;
  status: 'active' | 'warning' | 'issue';
}

export interface SystemActivity {
  id: string;
  type: 'USER' | 'LEAVE' | 'SHIFT' | 'NOTICE';
  message: string;
  time: string;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  totalSchools: number;
  totalDepts: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  overtimeHours: number;
  pendingLeaves: number;
  pendingSwaps: number;
  shiftData: ShiftMetrics[];
  attendanceTrend: AttendanceTrend[];
  roleDistribution: RoleDistribution[];
  schoolMetrics: SchoolMetric[];
  recentActivity: SystemActivity[];
}

export interface ShiftMetrics {
  shiftName: string;
  present: number;
  absent: number;
  late: number;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  username?: string;
  departmentId?: string;
  subDepartmentId?: string;
  schoolId?: string;
  designationId?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  idNumber?: string;
  phone?: string;
  permissions?: string[];
  createdAt?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  type: 'INFO' | 'URGENT' | 'ALERT';
  readBy: string[];
  createdAt: string;
}

export type EventType = 'HOLIDAY' | 'EXAM' | 'PTM' | 'EVENT';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: EventType;
  location?: string;
}

export interface Department {
  id: string;
  name: string;
  parentId?: string;
  headIds?: string[];
}

export interface Designation {
  id: string;
  name: string;
  role: UserRole;
  departmentId?: string;
}

export interface AppConfig {
  orgName: string;
  orgLogo?: string;
  timezone: string;
  dateFormat: string;
  workingDays: number[];
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  fromEmail: string;
  enableNotifications: boolean;
}

export interface SecurityConfig {
  passwordMinLength: number;
  sessionTimeout: number;
  requireMFA: boolean;
}

export interface RolePermissionConfig {
  role: UserRole;
  permissions: string[];
}

export interface AppPermission {
  key: string;
  label: string;
  module: string;
}

export interface IdFieldConfig {
  showBloodGroup: boolean;
  showEmergencyContact: boolean;
  showDepartment: boolean;
  showIdNumber: boolean;
}

export interface AttendanceEntry {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  type: string;
  status: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
}

export interface ShiftAssignment {
  id: string;
  shiftId: string;
  userId: string;
  userName: string;
  date: string;
}

export interface ShiftChangeRequest {
  id: string;
  userId: string;
  userName: string;
  currentShiftName: string;
  requestedShiftName: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}

export interface LeaveBalance {
  type: string;
  total: number;
  used: number;
}

export interface ChildStatus {
  id: string;
  name: string;
  avatar: string;
  status: string;
  attendancePercentage: number;
  lastActivity: string;
  assignedTeacher: {
    name: string;
    phone: string;
    avatar: string;
  };
}
