
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_STUDENTS } from '../constants';
import { api } from '../services/api';
import { AttendanceEntry, User, UserRole, GeoLocation } from '../types';

type AttendanceMode = 'SELF' | 'STAFF' | 'GUARD' | 'REPORTS';

const Attendance: React.FC = () => {
  const [mode, setMode] = useState<AttendanceMode>('SELF');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [records, setRecords] = useState<AttendanceEntry[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Guard Mode Camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    const userJson = localStorage.getItem('eaSwipe_user');
    if (userJson) {
      const user = JSON.parse(userJson);
      setCurrentUser(user);
      // Auto-switch mode based on role
      // Fix: Replaced DEPT_HEAD with RESOURCE_PERSON
      if ([UserRole.ADMIN, UserRole.RESOURCE_PERSON, UserRole.TEACHER].includes(user.role)) setMode('STAFF');
      else setMode('SELF');
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchRecords();
      fetchStaffUsers();
    }
  }, [currentUser]);

  const fetchRecords = async () => {
    const data = await api.getAttendance(currentUser || undefined);
    setRecords(data);
  };

  const fetchStaffUsers = async () => {
    const users = await api.getUsers(currentUser || undefined);
    setStaffUsers(users);
  };

  const handleSelfAttendance = async (type: 'clock-in' | 'clock-out') => {
    if (!currentUser) return;
    setLoading(true);
    
    let location: GeoLocation | undefined;
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => 
        navigator.geolocation.getCurrentPosition(res, rej)
      );
      location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (e) {
      console.warn("Geolocation denied or unavailable");
    }

    await api.markAttendance({
      userId: currentUser.id,
      userName: currentUser.name,
      type: type,
      location: location,
      status: 'on-time' // Simplified for mock
    });
    
    await fetchRecords();
    setLoading(false);
    alert(`${type === 'clock-in' ? 'Clocked In' : 'Clocked Out'} successfully!`);
  };

  const handleNFCMode = async () => {
    if (!currentUser) return;
    setLoading(true);
    // Simulate NFC scan delay
    await new Promise(r => setTimeout(r, 1000));
    await api.markAttendance({
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'nfc',
      status: 'on-time'
    });
    await fetchRecords();
    setLoading(false);
    alert("NFC Attendance marked!");
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      alert("Camera access denied");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
      setCameraActive(false);
    }
  };

  const handleGuardMark = async (studentId: string, studentName: string) => {
    setLoading(true);
    await api.markAttendance({
      userId: studentId,
      userName: studentName,
      type: 'guard',
      status: 'on-time',
      photoUrl: 'https://picsum.photos/200/200' // Mocked photo
    });
    await fetchRecords();
    setLoading(false);
    alert(`Marked entry for ${studentName}`);
  };

  const filteredStudents = staffUsers.filter(s => 
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.idNumber?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    s.role === UserRole.STUDENT
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance Hub</h1>
          <p className="text-slate-500 text-sm">Efficient tracking for everyone</p>
        </div>
      </header>

      {/* Mode Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
        {[
          // Fix: Replaced DEPT_HEAD with RESOURCE_PERSON in all occurrences below
          { id: 'SELF', label: 'Self', icon: 'fa-user-clock', roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.RESOURCE_PERSON] },
          { id: 'STAFF', label: 'Manual', icon: 'fa-list-check', roles: [UserRole.TEACHER, UserRole.ADMIN, UserRole.RESOURCE_PERSON] },
          { id: 'GUARD', label: 'Gate', icon: 'fa-shield-halved', roles: [UserRole.ADMIN, UserRole.RESOURCE_PERSON] },
          { id: 'REPORTS', label: 'Reports', icon: 'fa-chart-pie', roles: [UserRole.TEACHER, UserRole.ADMIN, UserRole.RESOURCE_PERSON] }
        ]
        .filter(m => currentUser && m.roles.includes(currentUser.role))
        .map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as AttendanceMode)}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              mode === m.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            <i className={`fa-solid ${m.icon}`}></i>
            {m.label}
          </button>
        ))}
      </div>

      {/* --- SELF MODE --- */}
      {mode === 'SELF' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              <i className="fa-solid fa-clock"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Ready to Clock?</h2>
            <p className="text-sm text-slate-500 mt-1 mb-8">Mark your attendance for today's session.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleSelfAttendance('clock-in')}
                disabled={loading}
                className="bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 flex flex-col items-center gap-1 active:scale-95 transition-transform"
              >
                <i className="fa-solid fa-right-to-bracket text-lg"></i>
                Clock In
              </button>
              <button 
                onClick={() => handleSelfAttendance('clock-out')}
                disabled={loading}
                className="bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 flex flex-col items-center gap-1 active:scale-95 transition-transform"
              >
                <i className="fa-solid fa-right-from-bracket text-lg"></i>
                Clock Out
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Logs</span>
                <span className="text-xs font-bold text-indigo-600">Today</span>
             </div>
             {records.filter(r => r.userId === currentUser?.id).slice(0, 3).map((r, i) => (
               <div key={i} className="p-4 flex items-center justify-between border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${r.type === 'clock-in' ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                      <i className={`fa-solid ${r.type === 'clock-in' ? 'fa-arrow-right-to-bracket' : 'fa-arrow-right-from-bracket'}`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 capitalize">{r.type.replace('-', ' ')}</p>
                      <p className="text-[10px] text-slate-400">{new Date(r.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* --- STAFF MODE (MANUAL MARKING) --- */}
      {mode === 'STAFF' && (
        <div className="space-y-4">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search students..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {filteredStudents.length > 0 ? filteredStudents.map((student) => (
              <div key={student.id} className="p-4 flex items-center justify-between border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{student.name}</p>
                    <p className="text-[10px] text-slate-400">{student.idNumber || 'No ID'} • {student.departmentId}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleGuardMark(student.id, student.name)} className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100">Present</button>
                  <button className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-100">Absent</button>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-slate-400">No students found in scope.</div>
            )}
          </div>
        </div>
      )}

      {/* --- GUARD MODE --- */}
      {mode === 'GUARD' && (
        <div className="space-y-4">
          <div className="bg-slate-900 aspect-video rounded-3xl relative overflow-hidden flex items-center justify-center text-white">
            {cameraActive ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <i className="fa-solid fa-camera text-4xl mb-3 opacity-20"></i>
                <p className="text-sm font-medium opacity-60">Security Camera Feed</p>
                <button 
                  onClick={startCamera}
                  className="mt-4 bg-indigo-600 px-6 py-2 rounded-xl text-sm font-bold"
                >
                  Activate Guard Mode
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
             <h3 className="font-bold text-slate-800 mb-2">Gate Scanning Active</h3>
             <p className="text-xs text-slate-500 mb-6">Verify students entering {currentUser?.departmentId ? `the ${currentUser.departmentId} zone` : 'the campus'}.</p>
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleGuardMark('v1', 'Visitor')} className="bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold flex flex-col items-center gap-1">
                   <i className="fa-solid fa-user-plus"></i>
                   Visitor Entry
                </button>
                <button onClick={stopCamera} className="bg-rose-50 text-rose-600 py-4 rounded-2xl font-bold flex flex-col items-center gap-1">
                   <i className="fa-solid fa-power-off"></i>
                   Stop Feed
                </button>
             </div>
          </div>
        </div>
      )}

      {/* --- REPORTS MODE --- */}
      {mode === 'REPORTS' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">Attendance Summary</h3>
                <div className="flex gap-2">
                   <button className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center text-xs">
                      <i className="fa-solid fa-file-excel"></i>
                   </button>
                </div>
             </div>
             <div className="space-y-3">
                {records.length > 0 ? records.slice(0, 10).map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                     <div>
                        <p className="text-xs font-bold text-slate-800">{r.userName}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{r.type} • {new Date(r.timestamp).toLocaleString()}</p>
                     </div>
                     <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        r.status === 'on-time' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                     }`}>
                        {r.status}
                     </span>
                  </div>
                )) : (
                  <p className="text-center py-6 text-slate-400 text-xs font-medium">No records found for your department scope.</p>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
