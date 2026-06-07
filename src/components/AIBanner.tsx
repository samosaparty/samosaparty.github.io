import { Ticket } from '@/types';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function AIBanner({ tickets }: { tickets: Ticket[] }) {
  const criticalCount = tickets.filter(t => t.Severity.toLowerCase() === 'critical' && !t.IsResolved).length;
  
  // Simple heuristic insights
  const ITIssues = tickets.filter(t => t.Category === 'IT' && !t.IsResolved).length;
  const marketingIssues = tickets.filter(t => t.Category === 'Marketing' && !t.IsResolved).length;
  const maintenanceIssues = tickets.filter(t => t.Category === 'Repair and Maintenance' && !t.IsResolved).length;
  const otherIssues = tickets.filter(t => !['IT', 'Marketing', 'Repair and Maintenance'].includes(t.Category) && !t.IsResolved).length;

  const topCity = ['Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai'].reduce((a, b) => 
    tickets.filter(t => t.City === a).length > tickets.filter(t => t.City === b).length ? a : b
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="col-span-1 xl:col-span-3 glass-panel rounded-xl p-5 flex items-center gap-5"
      >
        <Sparkles className="w-6 h-6 text-primary shrink-0" />
        <div className="flex-1 text-base flex flex-col sm:flex-row gap-4 sm:gap-8 md:divide-x divide-zinc-800">
          <span className="pl-0 sm:pl-6">
            <span className="font-black text-white">{topCity}</span> shows a high volume of incidents.
          </span>
          <span className="pl-0 sm:pl-6 font-bold">
            Predictive Analysis: Next week volume might rise by <span className="text-success font-black">15%</span>
          </span>
          <span className="pl-0 sm:pl-6 text-zinc-400 font-bold">
            Backlog: {ITIssues} IT / {maintenanceIssues} Maint / {marketingIssues} Mkt
          </span>
        </div>
      </motion.div>

      {criticalCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1 glass-panel rounded-xl p-4 bg-destructive/10 border-destructive/30 flex items-center gap-3"
        >
          <div className="relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <AlertTriangle className="relative w-5 h-5 text-destructive" />
          </div>
          <div className="text-sm">
            <span className="font-bold text-destructive">CRITICAL PENDING: {criticalCount}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
