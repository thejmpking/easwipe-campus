
import React, { useState, useEffect } from 'react';
import { User, IdFieldConfig } from '../types';
import { api } from '../services/api';
import IDCardVisual from './IDCardVisual';

interface PublicIDCardProps {
  username: string;
  onClose: () => void;
}

const PublicIDCard: React.FC<PublicIDCardProps> = ({ username, onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<IdFieldConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const u = await api.getUserByUsername(username);
      const c = await api.getFieldConfig();
      setUser(u);
      setConfig(c);
      setLoading(false);
    };
    fetchData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Fetching Profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !config) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <i className="fa-solid fa-user-slash text-6xl text-slate-200 mb-6"></i>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile Not Found</h2>
        <p className="text-slate-500 mb-8">The requested ID profile does not exist or has been disabled.</p>
        <button onClick={onClose} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center animate-fadeIn">
      <div className="w-full max-w-sm flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-shield-check text-emerald-500 text-xl"></i>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Verified ID</span>
        </div>
        <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-slate-400">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <IDCardVisual user={user} config={config} isPublic />

      {/* Emergency Quick Actions */}
      <div className="w-full max-w-sm space-y-4 mt-8">
        <h3 className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <a 
            href={`tel:${user.emergencyContact}`}
            className="bg-rose-600 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-xl shadow-rose-100 transition-transform active:scale-95"
          >
            <i className="fa-solid fa-phone text-2xl"></i>
            <span className="text-xs font-bold">Call Guardian</span>
          </a>
          
          <a 
            href={`https://wa.me/${user.emergencyContact?.replace(/\D/g, '')}`}
            className="bg-emerald-600 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-xl shadow-emerald-100 transition-transform active:scale-95"
          >
            <i className="fa-brands fa-whatsapp text-2xl"></i>
            <span className="text-xs font-bold">WhatsApp</span>
          </a>
        </div>

        <button 
          onClick={() => window.print()}
          className="w-full bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50"
        >
          <i className="fa-solid fa-print"></i>
          Generate Visitor Log
        </button>
      </div>

      <footer className="mt-12 text-center">
        <p className="text-[10px] text-slate-400 font-medium">eaSwipe Secure Profile System v3.1</p>
        <p className="text-[10px] text-slate-300">Timestamp: {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
};

export default PublicIDCard;
