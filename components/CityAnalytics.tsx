import { Ticket, CityData } from '@/types';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, MoreVertical } from 'lucide-react';

export function CityAnalytics({ tickets }: { tickets: Ticket[] }) {
  const citiesData: CityData[] = useMemo(() => {
    const cities = ['Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai', 'Others'];
    return cities.map(city => {
      const cityTickets = tickets.filter(t => t.City === city);
      return {
        city,
        total: cityTickets.length,
        it: cityTickets.filter(t => t.Category === 'IT').length,
        maintenance: cityTickets.filter(t => t.Category !== 'IT').length,
        critical: cityTickets.filter(t => t.Severity.toLowerCase() === 'critical').length,
        resolved: cityTickets.filter(t => t.IsResolved).length,
        open: cityTickets.filter(t => !t.IsResolved).length,
        slaBreached: cityTickets.filter(t => !t.IsResolved && t.Ageing.includes('d') && parseInt(t.Ageing) > 7).length, // Fake SLA logic
      };
    });
  }, [tickets]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {citiesData.map((data, idx) => (
        <motion.div 
          key={data.city}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="glass-panel p-5 rounded-xl flex flex-col hover:bg-slate-800/80 transition-colors cursor-pointer group relative"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg text-slate-100">{data.city}</h3>
            <button className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Total</p>
              <p className="text-xl font-bold font-mono">{data.total}</p>
            </div>
            <div className="flex flex-col gap-1 items-end pt-1">
              <p className="text-[10px] text-slate-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> IT: {data.it}</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Maint: {data.maintenance}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50 mt-auto">
            <div>
              <p className="text-xs text-slate-400 mb-1">Critical</p>
              <p className="text-sm font-semibold text-destructive">{data.critical}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Res Rate</p>
              <p className="text-sm font-semibold text-success">
                {data.total ? Math.round((data.resolved / data.total) * 100) : 0}%
              </p>
            </div>
          </div>
          <FileText className="absolute bottom-4 right-4 w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
        </motion.div>
      ))}
    </div>
  );
}
