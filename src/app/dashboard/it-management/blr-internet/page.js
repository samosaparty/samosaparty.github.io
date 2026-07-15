'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Wifi, Search, Filter, AlertCircle, Download, SignalHigh, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';

export default function BlrInternetPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterBrand, setFilterBrand] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = () => {
    setLoading(true);
    setError(null);
    const csvUrl = 'https://docs.google.com/spreadsheets/d/1uTtnMb8VPvIDkHO2qexz_3RRtzKHayVr/export?format=csv&gid=817868033';
    
    fetch(csvUrl, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch. Status: ${res.status}`);
        }
        return res.text();
      })
      .then(csvText => {
        if (csvText.trim().toLowerCase().startsWith('<!doctype html>')) {
          throw new Error('Access denied. Please ensure the Google Sheet is shared as "Anyone with the link can view".');
        }

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data);
            setLoading(false);
          },
          error: (err) => {
            console.error('Failed to parse CSV:', err);
            setError('Failed to parse the data.');
            setLoading(false);
          }
        });
      })
      .catch(err => {
        console.error('Failed to fetch CSV:', err);
        if (err.message.includes('Failed to fetch')) {
          setError('Network Error (CORS). Please ensure the Google Sheet is shared publicly as "Anyone with the link can view".');
        } else {
          setError(err.message || 'An error occurred while loading data.');
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Extract unique values for filters
  const uniqueStates = useMemo(() => ['All', ...new Set(data.map(item => item['State']).filter(Boolean))].sort(), [data]);
  const uniqueTypes = useMemo(() => ['All', ...new Set(data.map(item => item['Type of the Premise']).filter(Boolean))].sort(), [data]);
  const uniqueBrands = useMemo(() => ['All', ...new Set(data.map(item => item['Brand']).filter(Boolean))].sort(), [data]);

  // Apply filters and search
  const filteredData = useMemo(() => {
    return data.filter(row => {
      const term = searchTerm.toLowerCase();
      const matchSearch = 
        !searchTerm ||
        (row['Outlet'] && row['Outlet'].toLowerCase().includes(term)) ||
        (row['Account No.'] && row['Account No.'].toLowerCase().includes(term));
        
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
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'blr_internet_2026.csv';
    link.click();
  };

  return (
    <div className="max-w-[1950px] mx-auto p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col gap-5 md:gap-6">
      <header style={{ paddingTop: '0.8rem', paddingBottom: '0.8rem' }} className="bg-white px-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-2">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <SignalHigh className="text-primary w-6 h-6" />
          BLR Internet (2026)
        </h1>
        <p className="text-sm font-medium text-slate-500">Complete details from the 2026 Internet data sheet.</p>
      </header>

      {error ? (
        <div className="bg-red-50 p-8 rounded-2xl border border-red-200 text-center flex flex-col items-center gap-4">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <h2 className="text-xl font-bold text-red-700">Could not load data</h2>
          <p className="text-red-600 font-medium max-w-lg">{error}</p>
          <div className="mt-4 p-4 bg-white rounded-lg border border-red-100 shadow-sm">
            <p className="text-sm text-slate-600 font-bold mb-2">How to fix this:</p>
            <ol className="text-sm text-slate-600 text-left list-decimal list-inside flex flex-col gap-1">
              <li>Open your Google Sheet: <a href="https://docs.google.com/spreadsheets/d/1uTtnMb8VPvIDkHO2qexz_3RRtzKHayVr/edit" target="_blank" className="text-blue-500 underline">Link</a></li>
              <li>Click the green <strong>Share</strong> button in the top right.</li>
              <li>Under "General access", change it from "Restricted" to <strong>"Anyone with the link"</strong>.</li>
              <li>Refresh this page.</li>
            </ol>
          </div>
        </div>
      ) : (
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
                onClick={loadData}
                disabled={loading}
                className="p-[11px] text-indigo-500 bg-indigo-50 hover:text-indigo-600 hover:bg-indigo-100 rounded-xl border border-indigo-200 hover:border-indigo-300 transition-all disabled:opacity-50 flex-shrink-0 shadow-sm"
                title="Refresh Data"
              >
                <RefreshCw style={{ width: '1.15rem', height: '1.15rem' }} className={`${loading ? 'animate-spin' : ''}`} />
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
                <p>Loading networks data...</p>
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
                      <th className="py-5 px-6 cursor-pointer hover:bg-slate-50 group">
                        <div className="flex items-center gap-2">
                          Premise Details
                          <svg className="w-3 h-3 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                        </div>
                      </th>
                      <th className="py-5 px-6 cursor-pointer hover:bg-slate-50 group">
                        <div className="flex items-center gap-2">
                          Location
                          <svg className="w-3 h-3 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                        </div>
                      </th>
                      <th className="py-5 px-6 cursor-pointer hover:bg-slate-50 group">
                        <div className="flex items-center gap-2">
                          Network Info
                          <svg className="w-3 h-3 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                        </div>
                      </th>
                      <th className="py-5 px-6 cursor-pointer hover:bg-slate-50 group">
                        <div className="flex items-center gap-2">
                          Account
                          <svg className="w-3 h-3 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                        </div>
                      </th>
                      <th className="py-5 px-6 cursor-pointer hover:bg-slate-50 group">
                        <div className="flex items-center gap-2">
                          Credentials
                          <svg className="w-3 h-3 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white text-sm">
                    {paginatedData.map((row, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-b-0">
                        <td className="py-5 px-6 text-center text-slate-400 font-medium">{indexOfFirstItem + index + 1}</td>
                        <td className="py-5 px-6">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-semibold text-slate-700">
                              {row['Outlet'] || 'Unknown'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium border border-blue-100">
                                {row['Type of the Premise'] || 'N/A'}
                              </span>
                              <span className="text-xs font-medium text-slate-500">
                                {row['Contact Number'] || 'No contact'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6 font-medium text-slate-700">
                          <div className="flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                            <span>{row['State'] || '-'}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6 text-slate-600">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2.5">
                              <Wifi className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-slate-700">
                                {row['Brand'] || '-'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 border border-slate-200">
                            {row['Account No.'] || 'N/A'}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex flex-col gap-2">
                            {row['Remarks'] ? (
                              <div className="flex flex-col gap-1 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Remarks / Credentials</span>
                                <span className="text-xs font-medium text-slate-700 whitespace-pre-wrap">
                                  {row['Remarks']}
                                  {row[''] ? ` - ${row['']}` : ''}
                                  {row['_1'] ? ` - ${row['_1']}` : ''}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-medium italic text-slate-400 pl-1">No credentials</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white sm:px-6 mt-auto">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-slate-700">
                          Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredData.length)}</span> of{' '}
                          <span className="font-medium">{filteredData.length}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                          </button>
                          
                          {/* Page Numbers */}
                          {[...Array(totalPages)].map((_, i) => {
                            const pageNumber = i + 1;
                            if (
                              pageNumber === 1 || 
                              pageNumber === totalPages || 
                              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={pageNumber}
                                  onClick={() => setCurrentPage(pageNumber)}
                                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                                    currentPage === pageNumber
                                      ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                                      : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  {pageNumber}
                                </button>
                              );
                            } else if (
                              pageNumber === currentPage - 2 ||
                              pageNumber === currentPage + 2
                            ) {
                              return (
                                <span key={pageNumber} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 focus:outline-offset-0">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                          
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
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
      )}
    </div>
  );
}

