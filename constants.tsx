
import React from 'react';
import { AppSection } from './types';

export const NAV_ITEMS = [
  { id: AppSection.DASHBOARD, label: 'Home', icon: 'fa-house' },
  { id: AppSection.ATTENDANCE, label: 'Attendance', icon: 'fa-calendar-check' },
  { id: AppSection.PARENT_PORTAL, label: 'Portal', icon: 'fa-children' },
  { id: AppSection.CALENDAR, label: 'Calendar', icon: 'fa-calendar-days' },
  { id: AppSection.NOTICE_BOARD, label: 'Notices', icon: 'fa-bullhorn' },
  { id: AppSection.SMART_ID, label: 'Smart ID', icon: 'fa-id-card' },
  { id: AppSection.SHIFTS, label: 'Shifts', icon: 'fa-clock' },
  { id: AppSection.LEAVE, label: 'Leave', icon: 'fa-calendar-plus' },
  { id: AppSection.INSIGHTS, label: 'AI Tips', icon: 'fa-wand-magic-sparkles' },
];

export const MOCK_STUDENTS = [
  { id: '1', name: 'Alice Johnson', rollNumber: 'CS101', className: 'Year 1 CS', attendanceStatus: 'present' as const },
  { id: '2', name: 'Bob Smith', rollNumber: 'CS102', className: 'Year 1 CS', attendanceStatus: 'absent' as const },
  { id: '3', name: 'Charlie Davis', rollNumber: 'CS103', className: 'Year 2 IT', attendanceStatus: 'late' as const },
  { id: '4', name: 'Diana Ross', rollNumber: 'CS104', className: 'Year 3 ME', attendanceStatus: 'present' as const },
];

export const MOCK_CHART_DATA = [
  { name: 'Mon', attendance: 92 },
  { name: 'Tue', attendance: 88 },
  { name: 'Wed', attendance: 95 },
  { name: 'Thu', attendance: 91 },
  { name: 'Fri', attendance: 85 },
  { name: 'Sat', attendance: 40 },
  { name: 'Sun', attendance: 10 },
];
