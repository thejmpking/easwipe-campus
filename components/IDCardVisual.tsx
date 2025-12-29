
import React from 'react';
import { User, IdFieldConfig } from '../types';

interface IDCardVisualProps {
  user: User;
  config: IdFieldConfig;
  isPublic?: boolean;
}

const IDCardVisual: React.FC<IDCardVisualProps> = ({ user, config, isPublic }) => {
  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-3xl shadow-2xl bg-white border border-slate-100 flex flex-col">
      {/* Top Brand Stripe */}
      <div className="bg-indigo-600 h-2"></div>
      
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i className="fa-solid fa-swatchbook text-xs"></i>
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 leading-none">eaSwipe</h2>
              <p className="text-[8px] uppercase tracking-tighter text-slate-400 font-bold">Campus ID</p>
            </div>
          </div>
          <div className="text-right">
            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              {isPublic ? 'Validated' : 'Active'}
            </span>
          </div>
        </div>

        {/* Profile Section */}
        <div className="flex gap-4 mb-6">
          <div className="w-24 h-32 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-50 shadow-inner">
            <img 
              src={user.avatar || `https://picsum.photos/200/300?u=${user.id}`} 
              alt={user.name} 
              className="w-full h-full object-crop"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1 uppercase">{user.name}</h3>
            {/* Fix: Changed user.department to user.departmentId as User interface defines departmentId */}
            {config.showDepartment && user.departmentId && (
              <p className="text-sm text-indigo-600 font-medium mb-2">{user.departmentId}</p>
            )}
            {config.showIdNumber && user.idNumber && (
              <div className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded inline-block w-fit">
                {user.idNumber}
              </div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
          {config.showBloodGroup && user.bloodGroup && (
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-0.5">Blood Group</p>
              <p className="text-sm font-bold text-slate-800">{user.bloodGroup}</p>
            </div>
          )}
          {config.showEmergencyContact && user.emergencyContact && (
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-0.5">Emergency</p>
              <p className="text-sm font-bold text-slate-800">{user.emergencyContact}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer / QR Area */}
      <div className="bg-slate-50 p-6 flex justify-between items-center">
        <div className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[60%]">
          Property of eaSwipe Academy. If found, please return to any campus administrator or call security.
        </div>
        <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://easwipe.campus/id/${user.username || user.id}`} 
            alt="QR Code" 
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default IDCardVisual;
