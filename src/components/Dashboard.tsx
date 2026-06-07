"use client";

import useSWR from 'swr';
import { fetchTickets } from '@/lib/data-fetcher';
import { AIBanner } from './AIBanner';
import { KPICards } from './KPICards';
import { CityAnalytics } from './CityAnalytics';
import { HeatmapSection } from './HeatmapSection';
import { InteractiveCharts } from './InteractiveCharts';
import { SLAPanel } from './SLAPanel';
import { FilterPanel } from './FilterPanel';
import { DataTable } from './DataTable';
import { AutoReport } from './AutoReport';
import { useFilterStore } from '@/store/useFilterStore';
import { useMemo, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState('');
  
  const { data: tickets, error, isLoading } = useSWR('tickets', fetchTickets, {
    refreshInterval: 30000 // 30s auto-refresh
  });

  useEffect(() => {
    if (tickets) {
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, [tickets]);

  const { selectedCity, selectedCategory, selectedSeverity, selectedStatus, showOnlyDuplicates } = useFilterStore();

  const { processedOriginals, processedDuplicates } = useMemo(() => {
    if (!tickets) return { processedOriginals: [], processedDuplicates: [] };
    
    const originals: typeof tickets = [];
    const duplicates: typeof tickets = [];

    tickets.forEach(ticket => {
      const isClosed = ticket.Status?.toLowerCase() === 'closed';

      // Rule: Deduplication only works on OPEN tickets. Closed tickets are always originals.
      if (isClosed) {
        originals.push(ticket);
        return;
      }

      // Deduplication Rule: 
      // 1. City must match 100%
      // 2. Any 2 out of 3 (ID, Title, Category) must match
      // 3. Both must be OPEN tickets
      const matchingOrig = originals.find(orig => {
        const origIsOpen = orig.Status?.toLowerCase() !== 'closed';
        if (!origIsOpen) return false;

        // City must match 100%
        if (orig.City !== ticket.City) return false;

        let matches = 0;
        if (orig.ID && ticket.ID && orig.ID === ticket.ID) matches++;
        if (orig.Title && ticket.Title && orig.Title === ticket.Title) matches++;
        if (orig.Category && ticket.Category && orig.Category === ticket.Category) matches++;
        return matches >= 2;
      });

      if (matchingOrig) {
        duplicates.push({
          ...ticket,
          DuplicateOf: `ID: ${matchingOrig.ID} | ${matchingOrig.Title}`
        });
      } else {
        originals.push(ticket);
      }
    });

    return { processedOriginals: originals, processedDuplicates: duplicates };
  }, [tickets]);

  const filteredData = useMemo(() => {
    const baseData = showOnlyDuplicates ? processedDuplicates : processedOriginals;
    
    return baseData.filter(t => {
      const cityMatch = selectedCity ? t.City === selectedCity : true;
      const catMatch = selectedCategory ? t.Category === selectedCategory : true;
      const sevMatch = selectedSeverity ? t.Severity.toLowerCase() === selectedSeverity.toLowerCase() : true;
      const statusMatch = selectedStatus ? t.Status.toLowerCase() === selectedStatus.toLowerCase() : true;
      return cityMatch && catMatch && sevMatch && statusMatch;
    });
  }, [processedOriginals, processedDuplicates, showOnlyDuplicates, selectedCity, selectedCategory, selectedSeverity, selectedStatus]);

  if (error) return <div className="p-8 text-destructive">Failed to load data</div>;
  if (isLoading || !tickets) return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-0 min-h-screen">
      <header className="bg-slate-900 px-4 md:px-6 py-2 md:py-3 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-2 md:gap-4 shadow-sm border-b border-slate-800">
        <h1 className="text-base md:text-lg lg:text-xl font-bold text-slate-100 uppercase tracking-wider flex items-center flex-wrap gap-2 md:gap-4">
          <span className="bg-primary/90 text-white px-2 py-0.5 rounded shadow-sm text-sm">SP</span>
          Operations Ticket Dashboard: Performance Report
        </h1>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">System Active</span>
          </div>
          <div className="text-[10px] text-sky-400 font-mono">GEN: {lastUpdated}</div>
        </div>
      </header>

      <div className="max-w-[1950px] mx-auto p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col gap-5 md:gap-6">
        <FilterPanel />
        <KPICards tickets={filteredData} />
      
      

      <div className="flex flex-col gap-2 md:gap-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest border-l-[3px] border-primary pl-3">
          City-Wise Performance Analytics
        </div>
        <CityAnalytics tickets={filteredData} />
      </div>
      
      <DataTable data={filteredData} />
    </div>
    </div>
  );
}
