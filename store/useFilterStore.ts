import { create } from "zustand";

interface FilterState {
  selectedCity: string | null;
  selectedCategory: string | null;
  selectedSeverity: string | null;
  selectedStatus: string | null;

  setFilter: (key: keyof FilterState, value: string | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedCity: null,
  selectedCategory: null,
  selectedSeverity: null,
  selectedStatus: null,

  setFilter: (key, value) => set((state) => ({ ...state, [key]: value === 'all' ? null : value })),
  resetFilters: () => set({
    selectedCity: null,
    selectedCategory: null,
    selectedSeverity: null,
    selectedStatus: null,
  }),
}));
