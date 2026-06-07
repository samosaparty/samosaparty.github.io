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
        maintenance: cityTickets.filter(t => t.Category === 'Repair and Maintenance' || t.Category === 'Maintenance').length,
        marketing: cityTickets.filter(t => t.Category === 'Marketing').length,
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 xl:p-6 rounded-2xl flex flex-col hover:bg-slate-50 transition-all cursor-pointer group relative border border-sky-100 shadow-sm hover:border-sky-200 hover:shadow-md"
        >
          <div className="flex justify-between items-start mb-5 xl:mb-6">
            <h3 className="font-bold text-xl xl:text-2xl text-black">{data.city}</h3>
            <button className="text-slate-400 hover:text-slate-600 transition-colors mt-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <p className="text-[11px] font-bold text-black uppercase tracking-widest mb-2">Total</p>
              <p className="text-3xl xl:text-4xl font-bold text-black">{data.total}</p>
            </div>
            <div className="flex flex-col gap-1.5 items-end pt-1 pr-1">
              <p className="text-[12px] font-bold text-black flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#f05a28]"></span> IT: {data.it}</p>
              <p className="text-[12px] font-bold text-black flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#d97706]"></span> MNT: {data.maintenance}</p>
              <p className="text-[12px] font-bold text-black flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#0284c7]"></span> MKT: {data.marketing}</p>
            </div>
          </div>

          <div className="mx-2 my-4 xl:my-5 border-t border-slate-100"></div>

          <div className="grid grid-cols-2 gap-4 mt-auto px-1">
            <div>
              <p className="text-[11px] font-bold text-black uppercase mb-1">Critical</p>
              <p className="text-xl xl:text-2xl font-bold text-red-500">{data.critical}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-black uppercase mb-1">Res Rate</p>
              <p className="text-xl xl:text-2xl font-bold text-[#10b981]">
                {data.total ? Math.round((data.resolved / data.total) * 100) : 0}%
              </p>
            </div>
          </div>
          <FileText className="absolute bottom-4 right-4 xl:bottom-5 xl:right-5 w-5 h-5 text-slate-100 group-hover:text-slate-200 transition-colors" />
        </motion.div>
      ))}
    </div>
  );
}
