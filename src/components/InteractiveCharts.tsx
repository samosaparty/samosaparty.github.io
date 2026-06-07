import { Ticket } from '@/types';
import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = ['#FF5500', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export function InteractiveCharts({ tickets }: { tickets: Ticket[] }) {
  
  const barData = useMemo(() => {
    const categories = ['Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai', 'Others'];
    return categories.map(city => ({
      name: city,
      IT: tickets.filter(t => t.City === city && t.Category === 'IT').length,
      Maintenance: tickets.filter(t => t.City === city && (t.Category === 'Repair and Maintenance' || t.Category === 'Maintenance')).length,
      Marketing: tickets.filter(t => t.City === city && t.Category === 'Marketing').length
    }));
  }, [tickets]);

  const pieData = useMemo(() => {
    const severities = ['critical', 'high', 'medium', 'low'];
    return severities.map(s => ({
      name: s.toUpperCase(),
      value: tickets.filter(t => t.Severity.toLowerCase() === s).length
    })).filter(d => d.value > 0);
  }, [tickets]);

  const trendData = useMemo(() => {
    // Mocking trend data for realistic look from existing tickets lengths
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, i) => ({
      name: month,
      Open: Math.max(10, tickets.filter(t => !t.IsResolved).length - (i * 5)),
      Resolved: Math.max(5, tickets.filter(t => t.IsResolved).length + (i * 8))
    }));
  }, [tickets]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xl text-xs">
          <p className="font-bold text-slate-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-slate-500 capitalize">{entry.name}:</span>
              <span className="font-mono text-slate-900 font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg h-full flex flex-col border border-sky-200 shadow-sm">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Data Intelligence Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
        
        {/* Stacked Bar Chart */}
        <div className="h-[220px] flex flex-col">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Department Volume by City</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 10}} tickLine={false} axisLine={false} />
              <YAxis tick={{fill: '#64748b', fontSize: 10}} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#1e293b'}} />
              <Legend iconType="circle" wrapperStyle={{fontSize: '10px'}} />
              <Bar dataKey="IT" stackId="a" fill="#ea580c" radius={[0, 0, 4, 4]} />
              <Bar dataKey="Maintenance" stackId="a" fill="#d97706" />
              <Bar dataKey="Marketing" stackId="a" fill="#FF5500" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="h-[200px] flex flex-col">
          <h4 className="text-xs text-slate-400 mb-2 text-center">Severity Distribution</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    entry.name === 'CRITICAL' ? '#ef4444' :
                    entry.name === 'HIGH' ? '#f97316' :
                    entry.name === 'MEDIUM' ? '#f59e0b' : '#10b981'
                  } />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Area Chart */}
        <div className="h-[200px] flex flex-col md:col-span-2">
          <h4 className="text-xs text-slate-400 mb-2 text-center">Resolution Trend</h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 10}} tickLine={false} axisLine={false} />
              <YAxis tick={{fill: '#64748b', fontSize: 10}} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Open" stroke="#f97316" fillOpacity={1} fill="url(#colorOpen)" />
              <Area type="monotone" dataKey="Resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
