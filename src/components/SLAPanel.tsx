import { Ticket } from '@/types';
import { Clock, Activity } from 'lucide-react';

export function SLAPanel({ tickets }: { tickets: Ticket[] }) {
  const resolvedTickets = tickets.filter(t => t.IsResolved && t.ResolutionTimeMinutes);
  
  const mttrMsg = resolvedTickets.length > 0 
    ? Math.round((resolvedTickets.reduce((acc, t) => acc + (t.ResolutionTimeMinutes || 0), 0) / resolvedTickets.length) / 60) 
    : 0;

  const slaCompliance = tickets.length > 0 
    ? Math.round(100 - ((tickets.filter(t => !t.IsResolved && t.Ageing.includes('d') && parseInt(t.Ageing) > 7).length / tickets.length) * 100))
    : 100;

  return (
    <div className="glass-panel p-5 rounded-xl space-y-4">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">SLA & Performance</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/40 p-3 rounded-lg flex flex-col items-center justify-center border border-slate-700/50">
          <Clock className="w-5 h-5 text-blue-400 mb-1" />
          <p className="text-[10px] text-slate-400 uppercase">MTTR</p>
          <p className="text-lg font-bold font-mono">{mttrMsg}h</p>
        </div>
        <div className="bg-slate-800/40 p-3 rounded-lg flex flex-col items-center justify-center border border-slate-700/50">
          <Activity className="w-5 h-5 text-emerald-400 mb-1" />
          <p className="text-[10px] text-slate-400 uppercase">SLA Comply</p>
          <p className="text-lg font-bold font-mono text-emerald-400">{slaCompliance}%</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs text-slate-400 flex justify-between mb-1">
          <span>Ticket Aging &lt; 7 Days</span>
          <span className="text-slate-200 font-mono">{slaCompliance}%</span>
        </p>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${slaCompliance}%` }}></div>
        </div>
      </div>
    </div>
  );
}
