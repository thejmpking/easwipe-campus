
import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
  onGoToReset: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onGoToReset }) => {
  const [email, setEmail] = useState('admin@easwipe.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.login(email, password);
      onLoginSuccess(result.user, result.token);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center text-white shadow-2xl shadow-indigo-200 mb-6">
            <i className="fa-solid fa-swatchbook text-3xl"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">eaSwipe Campus</h1>
          <p className="text-slate-500 mt-2 font-medium">Empowering Smart Institutions</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="email"
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-slate-800"
                  placeholder="name@campus.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="password"
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-slate-800"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-medium flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Sign In <i className="fa-solid fa-arrow-right"></i></>
              )}
            </button>
          </form>

          <button 
            onClick={onGoToReset}
            className="w-full mt-6 text-slate-400 hover:text-indigo-600 text-sm font-medium transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Not registered? <span className="text-indigo-600 font-bold">Contact Admin</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
