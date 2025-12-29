
import React, { useState } from 'react';
import { api } from '../services/api';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await api.resetPassword(email);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
          {!submitted ? (
            <>
              <button 
                onClick={onBackToLogin}
                className="text-slate-400 hover:text-indigo-600 flex items-center gap-2 text-sm mb-6 transition-colors"
              >
                <i className="fa-solid fa-arrow-left"></i> Back to Login
              </button>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Reset Password</h2>
              <p className="text-slate-500 text-sm mb-6">Enter your campus email to receive a password reset link.</p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Campus Email</label>
                  <input 
                    type="email"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-slate-800"
                    placeholder="name@campus.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-check text-2xl"></i>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Email Sent!</h2>
              <p className="text-slate-500 text-sm mb-8">If an account exists for {email}, you will receive reset instructions shortly.</p>
              <button 
                onClick={onBackToLogin}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl transition-all"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
