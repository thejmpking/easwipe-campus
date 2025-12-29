
import React, { useState, useEffect } from 'react';
import { getCampusInsights } from '../services/geminiService';
import { MOCK_CHART_DATA } from '../constants';

const Insights: React.FC = () => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      const res = await getCampusInsights(MOCK_CHART_DATA);
      setInsight(res);
      setLoading(false);
    };
    fetchInsights();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">AI Campus Insights</h1>
        <p className="text-slate-500 text-sm">Powered by Gemini AI</p>
      </header>

      <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden min-h-[300px] flex flex-col items-center justify-center text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
             <p className="text-indigo-100 font-medium">Analyzing campus data...</p>
          </div>
        ) : (
          <div className="relative z-10 max-w-md">
             <i className="fa-solid fa-sparkles text-3xl mb-4 text-amber-300 animate-pulse"></i>
             <div className="prose prose-invert max-w-none text-left">
                {insight.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 text-indigo-50 leading-relaxed text-sm">{line}</p>
                ))}
             </div>
             <button 
                onClick={() => window.location.reload()} 
                className="mt-6 bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-sm font-semibold transition-all"
             >
               Refresh Insights
             </button>
          </div>
        )}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full -ml-20 -mb-20 blur-3xl"></div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-indigo-500"></i> Why this matters
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Our AI analysis monitors subtle patterns in attendance and schedule density. These recommendations are tailored specifically to your institution's current performance levels compared to historic trends.
        </p>
      </div>
    </div>
  );
};

export default Insights;
