import { Ticket } from '@/types';
import { Activity, Clock, AlertOctagon, CheckCircle2, Ticket as TicketIcon, Wrench, Laptop, AlertTriangle, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const KPICard = ({ title, value, sub, icon: Icon, trend, colorClass }: any) => {
  return (
    <motion.div 
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`bg-white rounded-xl py-3 px-3 xl:py-4 xl:px-4 flex flex-col justify-between border border-slate-200 border-l-[3px] shadow-sm hover:border-slate-300 hover:shadow-md transition-all relative overflow-hidden group ${colorClass}`}
    >
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="space-y-1 overflow-hidden pr-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate">{title}</p>
          <p className="text-xl xl:text-2xl font-bold tracking-tight text-slate-800">{value}</p>
        </div>
        <div className={`p-1.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors`}>
          <Icon className="w-4 h-4 xl:w-4 xl:h-4 text-slate-400 group-hover:text-primary transition-colors" />
        </div>
      </div>
      
      <div className="flex items-center gap-2 relative z-10 mt-1">
        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, 60 + (trend % 40))}%` }}
            className={`h-full rounded-full ${trend >= 0 ? 'bg-success' : 'bg-destructive'}`}
          />
        </div>
        <span className={`text-[10px] font-bold whitespace-nowrap ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
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
    const mnt = tickets.filter(t => t.Category === 'Repair and Maintenance' || t.Category === 'Maintenance').length;
    const marketing = tickets.filter(t => t.Category === 'Marketing').length;
    const critical = tickets.filter(t => t.Severity.toLowerCase() === 'critical').length;
    const open = tickets.filter(t => !t.IsResolved).length;
    const closed = tickets.filter(t => t.IsResolved).length;
    const resRate = total ? Math.round((closed / total) * 100) : 0;
    
    return { total, it, mnt, marketing, critical, open, closed, resRate };
  }, [tickets]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-3">
      <KPICard title="Total Issues" value={stats.total} icon={TicketIcon} trend={12} colorClass="border-l-orange-500" />
      <KPICard title="IT Support" value={stats.it} icon={Laptop} trend={5} colorClass="border-l-blue-500" />
      <KPICard title="Maintenance" value={stats.mnt} icon={Wrench} trend={-2} colorClass="border-l-amber-500" />
      <KPICard title="Marketing" value={stats.marketing} icon={Megaphone} trend={15} colorClass="border-l-purple-500" />
      <KPICard title="Critical" value={stats.critical} icon={AlertOctagon} trend={18} colorClass="border-l-red-500 bg-red-50/50 animate-pulse" />
      <KPICard title="Open" value={stats.open} icon={AlertTriangle} trend={-5} colorClass="border-l-teal-500" />
      <KPICard title="Resolved" value={stats.closed} icon={CheckCircle2} trend={24} colorClass="border-l-green-500" />
      <KPICard title="Rate" value={`${stats.resRate}%`} icon={Activity} trend={8} colorClass="border-l-primary" />
    </div>
  );
}
