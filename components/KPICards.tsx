import { Ticket } from '@/types';
import { Activity, Clock, AlertOctagon, CheckCircle2, Ticket as TicketIcon, Wrench, Laptop, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const KPICard = ({ title, value, sub, icon: Icon, trend, colorClass }: any) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      className={`glass-panel rounded-xl p-4 sm:p-5 flex flex-col justify-between border-t-2 ${colorClass}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-2xl font-bold font-mono tracking-tight text-slate-100">{value}</p>
        </div>
        <div className={`p-2 rounded-lg bg-slate-800/50`}>
          <Icon className="w-5 h-5 opacity-80" />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        {/* Fake sparkline rendering deterministic from title/trend */}
        <svg className="w-16 h-4 stroke-current opacity-50" viewBox="0 0 100 20" fill="none">
          <path d={`M0,10 L20,${15 + (trend % 5)} L40,${5 + (trend % 10)} L60,${12 + (trend % 4)} L80,${8 + (trend % 8)} L100,5`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={`text-xs ml-auto font-medium ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </span>
      </div>
    </motion.div>
  );
}

export function KPICards({ tickets }: { tickets: Ticket[] }) {
  const stats = useMemo(() => {
    const total = tickets.length;
    const it = tickets.filter(t => t.Category === 'IT').length;
    const mnt = tickets.filter(t => t.Category !== 'IT').length;
    const critical = tickets.filter(t => t.Severity.toLowerCase() === 'critical').length;
    const open = tickets.filter(t => !t.IsResolved).length;
    const closed = tickets.filter(t => t.IsResolved).length;
    const resRate = total ? Math.round((closed / total) * 100) : 0;
    
    return { total, it, mnt, critical, open, closed, resRate };
  }, [tickets]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
      <KPICard title="Total Issues" value={stats.total} icon={TicketIcon} trend={12} colorClass="border-t-blue-500" />
      <KPICard title="IT Issues" value={stats.it} icon={Laptop} trend={5} colorClass="border-t-indigo-500" />
      <KPICard title="Maintenance" value={stats.mnt} icon={Wrench} trend={-2} colorClass="border-t-emerald-500" />
      <KPICard title="Critical Pending" value={stats.critical} icon={AlertOctagon} trend={18} colorClass="border-t-red-500 bg-red-950/20" />
      <KPICard title="Open Tickets" value={stats.open} icon={AlertTriangle} trend={-5} colorClass="border-t-orange-500" />
      <KPICard title="Closed Tickets" value={stats.closed} icon={CheckCircle2} trend={24} colorClass="border-t-emerald-400" />
      <KPICard title="Resolution Rate" value={`${stats.resRate}%`} icon={Activity} trend={8} colorClass="border-t-teal-500" />
    </div>
  );
}
