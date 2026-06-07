import { Ticket } from '@/types';
import { useMemo } from 'react';

export function HeatmapSection({ tickets }: { tickets: Ticket[] }) {
  const cities = ['Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai', 'Others'];
  const severities = ['critical', 'high', 'medium', 'low'];

  const matrix = useMemo(() => {
    return cities.map(city => {
      const cityTickets = tickets.filter(t => t.City.toLowerCase() === city.toLowerCase());
      
      return severities.map(sev => {
        return cityTickets.filter(t => t.Severity.toLowerCase() === sev).length;
      });
    });
  }, [tickets, cities, severities]);

  const maxVal = Math.max(...matrix.flat(), 1);

  const getColor = (val: number) => {
    if (val === 0) return 'bg-slate-800/40 text-slate-600';
    const intensity = val / maxVal;
    if (intensity > 0.7) return 'bg-red-500/80 text-white font-bold';
    if (intensity > 0.4) return 'bg-orange-500/80 text-white font-semibold';
    if (intensity > 0.1) return 'bg-amber-500/60 text-white';
    return 'bg-blue-500/30 text-blue-100';
  };

  return (
    <div className="glass-panel rounded-xl p-5 h-full">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6">Priority Heatmap</h3>
      
      <div className="grid grid-cols-5 gap-2 mb-2">
        <div className="col-span-1"></div>
        {severities.map(s => (
          <div key={s} className="text-[10px] text-center text-slate-400 uppercase font-medium">{s}</div>
        ))}
      </div>
      
      <div className="space-y-2">
        {cities.map((city, rIdx) => (
          <div key={city} className="grid grid-cols-5 gap-2 items-center">
            <div className="col-span-1 text-xs text-slate-300 truncate pr-2 font-medium" title={city}>{city}</div>
            {severities.map((sev, cIdx) => {
              const val = matrix[rIdx][cIdx];
              return (
                <div 
                  key={`${rIdx}-${cIdx}`} 
                  className={`col-span-1 aspect-square md:aspect-auto md:py-3 rounded flex items-center justify-center text-xs transition-colors hover:ring-2 ring-white/20 cursor-crosshair ${getColor(val)}`}
                >
                  {val}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
        <span>Low Density</span>
        <div className="flex-1 h-2 mx-4 bg-gradient-to-r from-blue-500/30 via-orange-500/60 to-red-500/80 rounded-full"></div>
        <span>High Density</span>
      </div>
    </div>
  );
}
