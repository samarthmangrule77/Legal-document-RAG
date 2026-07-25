import React, { useEffect, useState } from 'react';
import { BarChart3, Users, FileText, Cpu, Zap, HardDrive, TrendingUp, Search } from 'lucide-react';
import { AdminAnalytics } from '../types';
import { api } from '../api/client';

export const AdminDashboardView: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);

  useEffect(() => {
    api.getAnalytics().then(setAnalytics);
  }, []);

  if (!analytics) return <div className="p-8 text-center text-slate-400">Loading Analytics...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider">
          <BarChart3 className="w-4 h-4" />
          <span>System Usage & Telemetry Analytics</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
          LexiRAG AI Enterprise Control Center
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor active user volume, indexed document storage, vector query latency, and top queried legal topics.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Total Active Users</span>
            <Users className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{analytics.total_users}</div>
          <div className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14% from last month</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Indexed Documents</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{analytics.total_documents}</div>
          <div className="text-[11px] text-slate-400">PDF, DOCX & TXT Files</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Total RAG Queries</span>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{analytics.total_ai_requests.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Avg Response: {analytics.avg_response_time_ms}ms</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Vector Vault Storage</span>
            <HardDrive className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{(analytics.storage_used_mb / 1024).toFixed(2)} GB</div>
          <div className="text-[11px] text-slate-400">FAISS Index & Chunks</div>
        </div>

      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Most Searched Topics Bar Visualization */}
        <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-brand-500" />
            <span>Most Searched Legal Topics</span>
          </h2>

          <div className="space-y-3">
            {analytics.popular_topics.map((item, idx) => {
              const maxCount = analytics.popular_topics[0].count;
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>{item.topic}</span>
                    <span className="font-mono text-slate-400">{item.count} searches</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-navy-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Query Trend Bar Chart */}
        <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Daily AI Query Volume</span>
          </h2>

          <div className="flex items-end justify-between gap-2 h-48 pt-6 px-2">
            {analytics.daily_query_trend.map((day, idx) => {
              const maxQ = Math.max(...analytics.daily_query_trend.map(d => d.queries));
              const heightPct = Math.round((day.queries / maxQ) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-mono font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.queries}
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-brand-600 to-indigo-400 rounded-t-xl group-hover:from-brand-500 group-hover:to-indigo-300 transition-all"
                    style={{ height: `${heightPct}%` }}
                  ></div>
                  <div className="text-[10px] font-semibold text-slate-500">{day.date}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
