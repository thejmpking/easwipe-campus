
import React, { useState, useEffect } from 'react';
import IDCardVisual from './IDCardVisual';
import { User, IdFieldConfig } from '../types';
import { api } from '../services/api';

const SmartID: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<IdFieldConfig | null>(null);
  const [isSimulatingNFC, setIsSimulatingNFC] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('eaSwipe_user');
    if (data) setUser(JSON.parse(data));
    
    api.getFieldConfig().then(setConfig);
  }, []);

  const handleNFCSimulation = () => {
    setIsSimulatingNFC(true);
    setTimeout(() => {
      setIsSimulatingNFC(false);
      // Open simulated public URL
      if (user?.username) {
        window.dispatchEvent(new CustomEvent('easwipe-nfc-tap', { detail: user.username }));
      }
    }, 1500);
  };

  if (!user || !config) return null;

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">Your Campus ID</h1>
        <p className="text-slate-500 text-sm">Valid for Academic Year 2024-2025</p>
      </header>

      <IDCardVisual user={user} config={config} />

      {/* Quick Access Actions */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button 
          onClick={handleNFCSimulation}
          className={`col-span-2 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg ${
            isSimulatingNFC 
            ? 'bg-amber-100 text-amber-700' 
            : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'
          }`}
        >
          {isSimulatingNFC ? (
            <>
              <div className="w-5 h-5 border-2 border-amber-400 border-t-amber-700 rounded-full animate-spin"></div>
              Simulating NFC Tap...
            </>
          ) : (
            <>
              <i className="fa-solid fa-nfc-symbol"></i>
              Simulate NFC Tap
            </>
          )}
        </button>
        
        <button className="bg-indigo-50 text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2">
          <i className="fa-solid fa-cloud-arrow-down"></i>
          Offline Copy
        </button>
        
        <button 
          onClick={() => {
            navigator.clipboard.writeText(`https://easwipe.campus/id/${user.username}`);
            alert('Public Profile URL copied!');
          }}
          className="bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-share-nodes"></i>
          Share URL
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
          <i className="fa-solid fa-shield-check"></i>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">Security Note</p>
          <p className="text-[11px] text-slate-500 leading-tight">This ID uses dynamic tokens for QR verification. Do not share screenshots of the live QR code.</p>
        </div>
      </div>
    </div>
  );
};

export default SmartID;
