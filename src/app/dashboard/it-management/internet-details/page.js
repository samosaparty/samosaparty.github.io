'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Wifi, Search, Filter, AlertCircle, Download, SignalHigh, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import Papa from 'papaparse';

export default function InternetDetailsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterBrand, setFilterBrand] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/1yKGYDJN4Chtk2vow07Kz5hPfirLdYIuqsxtsHXBk588/export?format=csv&gid=55870335';
    
    fetch(csvUrl, { cache: 'no-store' })
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data);
            setLoading(false);
          },
          error: (err) => {
            console.error('Failed to parse CSV:', err);
            setLoading(false);
          }
        });
      })
      .catch(err => {
        console.error('Failed to fetch CSV:', err);
        setLoading(false);
      });
  }, []);

  // Extract unique values for filters
  const uniqueStates = useMemo(() => ['All', ...new Set(data.map(item => item['State']).filter(Boolean))], [data]);
  const uniqueTypes = useMemo(() => ['All', ...new Set(data.map(item => item['Type of the Premise']).filter(Boolean))], [data]);
  const uniqueBrands = useMemo(() => ['All', ...new Set(data.map(item => item['Brand']).filter(Boolean))], [data]);

  // Apply filters and search
  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchSearch = 
        row['Kitchen Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row['Wifi Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row['Account No']?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchState = filterState === 'All' || row['State'] === filterState;
      const matchType = filterType === 'All' || row['Type of the Premise'] === filterType;
      const matchBrand = filterBrand === 'All' || row['Brand'] === filterBrand;

      return matchSearch && matchState && matchType && matchBrand;
    });
  }, [data, searchTerm, filterState, filterType, filterBrand]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterState, filterType, filterBrand]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'internet_details.csv';
    link.click();
  };

  return (
    <div className="max-w-[1950px] mx-auto p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col gap-5 md:gap-6">
      
      <header style={{ paddingTop: '0.8rem', paddingBottom: '0.8rem' }} className="bg-white px-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-2">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <SignalHigh className="text-primary w-6 h-6" />
          Network Operations Center
        </h1>
        <p className="text-sm font-medium text-slate-500">Live internet connectivity and ISP tracking across all premises.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div style={{ paddingTop: '0.8rem', paddingBottom: '0.8rem', paddingLeft: '2%' }} className="pr-4 md:pr-8 flex flex-col sm:flex-row justify-start items-center gap-4 bg-white rounded-t-2xl">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            
            <div className="relative group" style={{ width: '250px', maxWidth: '100%' }}>
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ paddingLeft: '1.25rem' }}>
                <Filter className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <select 
                value={filterState} 
                onChange={(e) => setFilterState(e.target.value)}
                style={{ paddingLeft: '3rem', paddingTop: '0.65rem', paddingBottom: '0.65rem' }}
                className="block w-full pr-10 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white shadow-sm hover:border-slate-400 cursor-pointer relative z-0"
              >
                {uniqueStates.map(state => (
                  <option key={state} value={state}>{state === 'All' ? 'All States' : state}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center z-10" style={{ paddingRight: '1.25rem' }}>
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="relative group" style={{ width: '250px', maxWidth: '100%' }}>
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ paddingLeft: '1.25rem' }}>
                <Filter className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                style={{ paddingLeft: '3rem', paddingTop: '0.65rem', paddingBottom: '0.65rem' }}
                className="block w-full pr-10 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white shadow-sm hover:border-slate-400 cursor-pointer relative z-0"
              >
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center z-10" style={{ paddingRight: '1.25rem' }}>
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="relative group" style={{ width: '250px', maxWidth: '100%' }}>
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ paddingLeft: '1.25rem' }}>
                <Filter className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <select 
                value={filterBrand} 
                onChange={(e) => setFilterBrand(e.target.value)}
                style={{ paddingLeft: '3rem', paddingTop: '0.65rem', paddingBottom: '0.65rem' }}
                className="block w-full pr-10 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white shadow-sm hover:border-slate-400 cursor-pointer relative z-0"
              >
                {uniqueBrands.map(brand => (
                  <option key={brand} value={brand}>{brand === 'All' ? 'All Brands' : brand}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center z-10" style={{ paddingRight: '1.25rem' }}>
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="relative group" style={{ width: '370px', maxWidth: '100%' }}>
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ paddingLeft: '1.25rem' }}>
                <Search className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search Kitchen, WiFi..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '3rem', paddingTop: '0.65rem', paddingBottom: '0.65rem' }}
                className="block w-full pr-4 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white shadow-sm hover:border-slate-400"
              />
            </div>
            
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterState('All');
                setFilterType('All');
                setFilterBrand('All');
              }}
              disabled={!searchTerm && filterState === 'All' && filterType === 'All' && filterBrand === 'All'}
              className="p-[11px] text-rose-500 bg-rose-50 hover:text-rose-600 hover:bg-rose-100 rounded-xl border border-rose-200 hover:border-rose-300 transition-all disabled:opacity-50 flex-shrink-0 shadow-sm"
              title="Reset Filters"
            >
              <X style={{ width: '1.15rem', height: '1.15rem' }} />
            </button>

            <button 
              onClick={handleExportCSV}
              className="p-[11px] text-emerald-500 bg-emerald-50 hover:text-emerald-600 hover:bg-emerald-100 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-all flex-shrink-0 shadow-sm"
              title="Export CSV Data"
            >
              <Download style={{ width: '1.15rem', height: '1.15rem' }} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto flex flex-col justify-between">
          {loading && data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mb-3 text-primary" />
              <p>Syncing network data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
              <p>No networks found matching your criteria.</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-slate-700 text-[11px] font-bold uppercase tracking-wider border-y border-slate-200">
                    <th className="py-5 px-6 w-16 text-center">#</th>
                    <th className="py-5 px-6">Premise Details</th>
                    <th className="py-5 px-6">Location</th>
                    <th className="py-5 px-6">Network Info</th>
                    <th className="py-5 px-6">Account</th>
                    <th className="py-5 px-6">Credentials</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-sm">
                  {paginatedData.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-b-0">
                      <td className="py-5 px-6 text-center text-slate-400 font-medium">{startIndex + index + 1}</td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-slate-700">
                            {row['Kitchen Name'] || 'Unknown'}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-50 text-primary text-[11px] px-2 py-0.5 rounded-md font-medium">
                              {row['Type of the Premise'] || 'N/A'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {row['Contact Number'] || 'No contact'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-slate-600">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]"></div>
                          <span className="font-medium">{row['State'] || '-'}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-primary" />
                          <span className="font-medium text-slate-700">
                            {row['Brand'] || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="font-mono text-xs font-medium px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 border border-slate-200">
                          {row['Account No'] || 'N/A'}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-2">
                          {row['Wifi Name'] && (
                            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 w-max">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SSID</span>
                              <div className="w-[1px] h-3 bg-slate-300"></div>
                              <span className="text-sm font-medium text-primary">{row['Wifi Name']}</span>
                            </div>
                          )}
                          {row['Passowrd'] && (
                            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 w-max">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PWD</span>
                              <div className="w-[1px] h-3 bg-slate-300"></div>
                              <span className="text-sm font-mono font-medium px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100">
                                {row['Passowrd']}
                              </span>
                            </div>
                          )}
                          {!row['Wifi Name'] && !row['Passowrd'] && (
                            <span className="text-xs text-slate-400 italic">No credentials</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

                            {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ marginTop: '1%' }} className="flex items-center justify-between px-4 py-4 bg-white sm:px-6 mt-auto">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      style={{ color: 'var(--primary)' }}
                      className="relative inline-flex items-center justify-center rounded-md px-4 h-10 text-sm font-medium bg-white ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:z-10 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      style={{ color: 'var(--primary)' }}
                      className="relative ml-3 inline-flex items-center justify-center rounded-md px-4 h-10 text-sm font-medium bg-white ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:z-10 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-600">
                        Showing <span className="font-semibold text-slate-800">{startIndex + 1}</span> to <span className="font-semibold text-slate-800">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of{' '}
                        <span className="font-semibold text-slate-800">{filteredData.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          style={{ color: 'var(--primary)' }}
                          className="relative inline-flex items-center justify-center rounded-l-lg px-4 h-10 text-sm font-medium bg-white ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:z-10 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
                        >
                          Previous
                        </button>
                        
                        {/* Page Numbers */}
                        {[...Array(totalPages)].map((_, i) => {
                          const pageNumber = i + 1;
                          if (
                            pageNumber === 1 || 
                            pageNumber === totalPages || 
                            (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                          ) {
                            const isActive = currentPage === pageNumber;
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => setCurrentPage(pageNumber)}
                                style={isActive ? { backgroundColor: 'var(--primary)', color: 'white' } : { color: 'var(--primary)' }}
                                className={`relative inline-flex items-center justify-center w-10 h-10 text-sm font-semibold focus:z-20 transition-all duration-200 ease-in-out ${
                                  isActive
                                    ? 'z-10 ring-1 ring-inset shadow-md'
                                    : 'bg-white ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:z-10'
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          } else if (
                            pageNumber === currentPage - 3 ||
                            pageNumber === currentPage + 3
                          ) {
                            return (
                              <span key={pageNumber} className="relative inline-flex items-center justify-center w-10 h-10 text-sm font-semibold text-slate-400 bg-white ring-1 ring-inset ring-slate-200">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          style={{ color: 'var(--primary)' }}
                          className="relative inline-flex items-center justify-center rounded-r-lg px-4 h-10 text-sm font-medium bg-white ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:z-10 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
