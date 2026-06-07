import React from 'react';
import { Wifi, Globe, Activity, ShieldCheck } from 'lucide-react';

export default function InternetDetailsPage() {
  return (
    <div className="max-w-[1950px] mx-auto p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col gap-5 md:gap-6">
      <header className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Wifi className="text-primary w-6 h-6" />
          Internet Details & Connectivity
        </h1>
        <p className="text-sm font-medium text-slate-500">Monitor ISP status, bandwidth usage, and network health across all locations.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Total Connections</p>
          <p className="text-3xl font-bold text-slate-800">45</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Avg Uptime</p>
          <p className="text-3xl font-bold text-emerald-600">99.8%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Active Outages</p>
          <p className="text-3xl font-bold text-rose-600">0</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Secure Networks</p>
          <p className="text-3xl font-bold text-slate-800">100%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-700">Network Topology & Details</h2>
          <p className="text-sm text-slate-500 mt-1">Connect your ISP data source to view detailed metrics here.</p>
        </div>
      </div>
    </div>
  );
}
