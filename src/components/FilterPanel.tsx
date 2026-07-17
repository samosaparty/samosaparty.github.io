import { Filter, X } from 'lucide-react';
import { useFilterStore } from '@/store/useFilterStore';

export function FilterPanel() {
  const { selectedCity, selectedCategory, selectedSeverity, selectedStatus, showOnlyDuplicates, setFilter, resetFilters } = useFilterStore();

  const isAnyFilterActive = selectedCity || selectedCategory || selectedSeverity || selectedStatus || showOnlyDuplicates;

  return (
    <div className="bg-white p-2 rounded-xl flex flex-wrap items-center gap-2 border border-slate-200 shadow-sm w-full lg:w-auto">
      <div className="flex items-center gap-1.5 pr-2 border-r border-slate-100">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Controls</span>
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* Existing selects... */}
        <div className="flex-1 min-w-[130px] sm:flex-none sm:min-w-[160px]">
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-md p-1.5 outline-none focus:ring-2 ring-primary/20 hover:bg-slate-100 transition-all cursor-pointer"
            value={selectedCity || 'all'}
            onChange={(e) => setFilter('selectedCity', e.target.value)}
          >
            <option value="all">All Cities</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Chennai">Chennai</option>
            <option value="Others">Others</option>
          </select>
        </div>

        <div className="flex-1 min-w-[130px] sm:flex-none sm:min-w-[160px]">
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-md p-1.5 outline-none focus:ring-2 ring-primary/20 hover:bg-slate-100 transition-all cursor-pointer"
            value={selectedCategory || 'all'}
            onChange={(e) => setFilter('selectedCategory', e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="IT">IT</option>
            <option value="Repair and Maintenance">Maintenance</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        <div className="flex-1 min-w-[130px] sm:flex-none sm:min-w-[160px]">
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-md p-1.5 outline-none focus:ring-2 ring-primary/20 hover:bg-slate-100 transition-all cursor-pointer"
            value={selectedSeverity || 'all'}
            onChange={(e) => setFilter('selectedSeverity', e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex-1 min-w-[130px] sm:flex-none sm:min-w-[160px]">
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-md p-1.5 outline-none focus:ring-2 ring-primary/20 hover:bg-slate-100 transition-all cursor-pointer"
            value={selectedStatus || 'all'}
            onChange={(e) => setFilter('selectedStatus', e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <button
          onClick={() => setFilter('showOnlyDuplicates', !showOnlyDuplicates)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border active:scale-95 ${
            showOnlyDuplicates 
              ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' 
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-primary hover:border-slate-300 hover:bg-slate-100'
          }`}
        >
          {showOnlyDuplicates ? 'Showing Duplicates' : 'Show Duplicates'}
        </button>
      </div>

      {isAnyFilterActive && (
        <button 
          onClick={resetFilters} 
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-all active:scale-95"
        >
          <X className="w-3.5 h-3.5" />
          Reset All
        </button>
      )}
    </div>
  );
}
