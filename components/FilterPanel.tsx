import { Filter } from 'lucide-react';
import { useFilterStore } from '@/store/useFilterStore';

export function FilterPanel() {
  const { selectedCity, selectedCategory, selectedSeverity, selectedStatus, setFilter, resetFilters } = useFilterStore();

  return (
    <div className="glass-panel p-5 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filters
        </h3>
        <button onClick={resetFilters} className="text-xs text-blue-400 hover:text-blue-300">Reset</button>
      </div>

      <div className="space-y-3">
        <select 
          className="w-full bg-slate-800/50 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 outline-none focus:ring-1 ring-blue-500"
          value={selectedCity || 'all'}
          onChange={(e) => setFilter('selectedCity', e.target.value)}
        >
          <option value="all">City: All</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Delhi NCR">Delhi NCR</option>
          <option value="Chennai">Chennai</option>
          <option value="Others">Others</option>
        </select>

        <select 
          className="w-full bg-slate-800/50 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 outline-none focus:ring-1 ring-blue-500"
          value={selectedCategory || 'all'}
          onChange={(e) => setFilter('selectedCategory', e.target.value)}
        >
          <option value="all">Category: All</option>
          <option value="IT">IT</option>
          <option value="Repair and Maintenance">Maintenance</option>
        </select>

        <select 
          className="w-full bg-slate-800/50 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 outline-none focus:ring-1 ring-blue-500"
          value={selectedSeverity || 'all'}
          onChange={(e) => setFilter('selectedSeverity', e.target.value)}
        >
          <option value="all">Priority: All</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select 
          className="w-full bg-slate-800/50 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 outline-none focus:ring-1 ring-blue-500"
          value={selectedStatus || 'all'}
          onChange={(e) => setFilter('selectedStatus', e.target.value)}
        >
          <option value="all">Status: All</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
    </div>
  );
}
