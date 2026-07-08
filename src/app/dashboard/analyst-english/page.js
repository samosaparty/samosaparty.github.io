'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { fetchAnalystData } from '../../../services/googleSheetsService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { motion } from 'framer-motion';
import { Eye, Heart, MessageSquare, UserPlus, Trophy, Calendar, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AnalystEnglishDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const sheetData = await fetchAnalystData();
      // Sort by parsedDate descending by default
      const sorted = sheetData.sort((a, b) => {
        if (a._parsedDate && b._parsedDate) return b._parsedDate - a._parsedDate;
        return 0;
      });
      setData(sorted);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter Data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(item => item._parsedDate && item._parsedDate >= startDate);
    }
    
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => item._parsedDate && item._parsedDate <= endDate);
    }

    return filtered;
  }, [data, searchTerm, dateRange]);

  // Aggregate KPIs
  const kpis = useMemo(() => {
    if (!filteredData.length) return null;

    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalNetFollows = 0;
    let bestVideo = filteredData[0];

    filteredData.forEach(item => {
      totalViews += item.views || 0;
      totalLikes += item.likes || 0;
      totalComments += item.comments || 0;
      totalNetFollows += item.netFollows || 0;
      
      if (item.views > (bestVideo.views || 0)) {
        bestVideo = item;
      }
    });

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalNetFollows,
      bestVideoTitle: bestVideo?.title || 'N/A',
      bestVideoViews: bestVideo?.views || 0
    };
  }, [filteredData]);

  // Chart Data preparation
  const chartData = useMemo(() => {
    // Reverse for chronological order in charts if it's descending
    const chronological = [...filteredData].reverse();
    return chronological.map(item => ({
      date: item._parsedDate ? format(item._parsedDate, 'MMM dd, yyyy') : 'Unknown',
      shortDate: item._parsedDate ? format(item._parsedDate, 'MM/dd') : '',
      views: item.views || 0,
      likes: item.likes || 0,
      comments: item.comments || 0,
      title: item.title || ''
    }));
  }, [filteredData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <RefreshCw size={32} className="text-blue-500" />
        </motion.div>
        <p className="mt-4 text-gray-500 font-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-red-500">
        <AlertCircle size={48} className="mb-4" />
        <h2 className="text-xl font-bold">Error Loading Data</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button onClick={loadData} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
          Retry
        </button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div 
      className="p-6 max-w-[1600px] mx-auto space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header & Filters */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Analyst English Dashboard</h1>
          <p className="text-slate-500 text-sm">Real-time performance metrics</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search videos..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-lg px-2">
            <Calendar size={16} className="text-slate-400" />
            <input 
              type="date" 
              className="bg-transparent border-none text-sm py-2 focus:outline-none text-slate-600"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <span className="text-slate-400">-</span>
            <input 
              type="date" 
              className="bg-transparent border-none text-sm py-2 focus:outline-none text-slate-600"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      {kpis && (
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPIBox title="Total Views" value={kpis.totalViews.toLocaleString()} icon={<Eye className="text-blue-500" size={24} />} bg="bg-blue-50" />
          <KPIBox title="Net Followers" value={kpis.totalNetFollows.toLocaleString()} icon={<UserPlus className="text-green-500" size={24} />} bg="bg-green-50" />
          <KPIBox title="Total Likes" value={kpis.totalLikes.toLocaleString()} icon={<Heart className="text-pink-500" size={24} />} bg="bg-pink-50" />
          <KPIBox title="Total Comments" value={kpis.totalComments.toLocaleString()} icon={<MessageSquare className="text-amber-500" size={24} />} bg="bg-amber-50" />
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 shadow-sm text-white flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={20} className="text-yellow-300" />
              <h3 className="font-medium text-indigo-100 text-sm">Top Performing Video</h3>
            </div>
            <div>
              <p className="font-bold text-lg leading-tight line-clamp-2">{kpis.bestVideoTitle}</p>
              <p className="text-indigo-200 text-sm mt-2">{kpis.bestVideoViews.toLocaleString()} Views</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Views Over Time</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Engagement (Likes vs Comments)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="likes" name="Likes" fill="#ec4899" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comments" name="Comments" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Data Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Detailed Video Performance</h3>
        </div>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 sticky top-0 z-10 text-xs uppercase text-slate-500 font-semibold shadow-sm">
              <tr>
                <th className="px-6 py-4 w-1/3">Video Title</th>
                <th className="px-6 py-4 text-right">Views</th>
                <th className="px-6 py-4 text-right">Likes</th>
                <th className="px-6 py-4 text-right">Comments</th>
                <th className="px-6 py-4 text-right">Follows</th>
                <th className="px-6 py-4 text-right">Duration (s)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-[300px] truncate font-medium text-slate-800" title={row.title}>
                        {row.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-700">
                      {row.views?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      {row.likes?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      {row.comments?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      <span className={row.netFollows > 0 ? 'text-green-600 font-medium' : ''}>
                        {row.netFollows > 0 ? '+' : ''}{row.netFollows?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">
                      {row.duration}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No videos found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

    </motion.div>
  );
}

function KPIBox({ title, value, icon, bg }) {
  return (
    <motion.div 
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
      }}
      className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow"
    >
      <div className={`p-4 rounded-xl ${bg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
    </motion.div>
  );
}
