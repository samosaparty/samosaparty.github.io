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

  const { selectedCity, selectedCategory, selectedSeverity, selectedStatus } = useFilterStore();

  const filteredData = useMemo(() => {
    if (!tickets) return [];
    return tickets.filter(t => {
      const cityMatch = selectedCity ? t.City === selectedCity : true;
      const catMatch = selectedCategory ? t.Category === selectedCategory : true;
      const sevMatch = selectedSeverity ? t.Severity.toLowerCase() === selectedSeverity.toLowerCase() : true;
      const statusMatch = selectedStatus ? t.Status.toLowerCase() === selectedStatus.toLowerCase() : true;
      return cityMatch && catMatch && sevMatch && statusMatch;
    });
  }, [tickets, selectedCity, selectedCategory, selectedSeverity, selectedStatus]);

  if (error) return <div className="p-8 text-destructive">Failed to load data</div>;
  if (isLoading || !tickets) return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Enterprise IT & Maintenance Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Live Analytics & Performance Metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-sm font-medium">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
            Live Sync
          </span>
          <span className="text-xs text-muted-foreground">Last updated: {lastUpdated}</span>
        </div>
      </header>

      <AIBanner tickets={filteredData} />
      
      <KPICards tickets={filteredData} />
      
      <div className="text-sm font-semibold text-slate-400 mt-8 mb-4 uppercase tracking-wider">
        Dynamically Generated City-Wise Analytics
      </div>
      <CityAnalytics tickets={filteredData} />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-1 space-y-6">
          <HeatmapSection tickets={filteredData} />
        </div>
        <div className="lg:col-span-2">
          <InteractiveCharts tickets={filteredData} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <SLAPanel tickets={filteredData} />
          <FilterPanel />
          <AutoReport tickets={filteredData} />
        </div>
      </div>

      <div className="mt-8">
        <DataTable data={filteredData} />
      </div>
    </div>
  );
}
