import { Ticket } from '@/types';
import { FileText } from 'lucide-react';
import { useFilterStore } from '@/store/useFilterStore';

export function AutoReport({ tickets }: { tickets: Ticket[] }) {
  const { selectedCity } = useFilterStore();
  const city = selectedCity || 'Overall network';

  const total = tickets.length;
  const critical = tickets.filter(t => t.Severity.toLowerCase() === 'critical').length;
  const resRate = total ? Math.round((tickets.filter(t => t.IsResolved).length / total) * 100) : 0;
  
  const itIssues = tickets.filter(t => t.Category === 'IT').length;
  const maintIssues = total - itIssues;

  return (
    <div className="glass-panel p-5 rounded-xl space-y-3 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
        <FileText className="w-24 h-24 text-blue-400" />
      </div>
      
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider relative z-10 flex items-center gap-2">
        <FileText className="w-4 h-4 text-blue-400" /> Executive Report
      </h3>
      
      <div className="text-sm text-slate-300 leading-relaxed relative z-10 font-serif italic">
        "{city} recorded <span className="text-slate-100 font-bold">{total}</span> total issues, with <span className="text-blue-400 font-semibold">{itIssues} IT-related</span> and <span className="text-emerald-400 font-semibold">{maintIssues} maintenance-related</span> incidents. 
        Critical issues currently account for <span className="text-destructive font-bold">{critical} tickets</span>. 
        The resolution rate stands at <span className="text-success font-bold">{resRate}%</span>."
      </div>
    </div>
  );
}
