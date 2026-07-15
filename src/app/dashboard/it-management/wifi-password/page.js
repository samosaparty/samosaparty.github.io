'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Wifi, Search, Download, MapPin, X, ChevronLeft, ChevronRight, HardDrive, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';

export default function WifiPasswordPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/1yKGYDJN4Chtk2vow07Kz5hPfirLdYIuqsxtsHXBk588/gviz/tq?tqx=out:csv&sheet=Wifi-Password';
    
    fetch(csvUrl, { cache: 'no-store' })
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: false, // Using false because sheet has duplicate header names
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 1) {
              // Skip first row (headers) and map to objects
              const parsedData = results.data.slice(1).map(row => ({
                outletName: row[0] || '',
                location: row[1] || '',
                wifi1Name: row[2] || '',
                wifi1Pass: row[3] || '',
                wifi2Name: row[4] || '',
                wifi2Pass: row[5] || ''
              }));
              setData(parsedData);
            }
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

  // Apply search
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        item.outletName.toLowerCase().includes(searchLower) ||
        item.location.toLowerCase().includes(searchLower) ||
        item.wifi1Name.toLowerCase().includes(searchLower) ||
        item.wifi2Name.toLowerCase().includes(searchLower)
      );
    });
  }, [data, searchTerm]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wifi_passwords.csv';
    link.click();
  };

  return (
    <div className="max-w-[1950px] mx-auto p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col gap-5 md:gap-6">
      
      <header style={{ paddingTop: '0.8rem', paddingBottom: '0.8rem' }} className="bg-white px-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-2">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Wifi className="text-primary w-6 h-6" />
          Wi-Fi Passwords Directory
        </h1>
        <p className="text-sm font-medium text-slate-500">Primary and secondary Wi-Fi credentials for all outlets and locations.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div style={{ paddingTop: '0.8rem', paddingBottom: '0.8rem', paddingLeft: '2%' }} className="pr-4 md:pr-8 flex flex-col sm:flex-row justify-start items-center gap-4 bg-white rounded-t-2xl">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <div className="relative group" style={{ width: '370px', maxWidth: '100%' }}>
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ paddingLeft: '1.25rem' }}>
                <Search className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search Outlet, Location or Wi-Fi..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '3rem', paddingTop: '0.65rem', paddingBottom: '0.65rem' }}
                className="block w-full pr-4 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white shadow-sm hover:border-slate-400"
              />
            </div>
            
            <button 
              onClick={() => {
                setSearchTerm('');
              }}
              disabled={!searchTerm}
              className="p-[11px] text-rose-500 bg-rose-50 hover:text-rose-600 hover:bg-rose-100 rounded-xl border border-rose-200 hover:border-rose-300 transition-all disabled:opacity-50 flex-shrink-0 shadow-sm"
              title="Reset Filters"
            >
              <X style={{ width: '1.15rem', height: '1.15rem' }} />
            </button>

            <button 
              onClick={handleExportCSV}
              className="p-[11px] text-emerald-500 bg-emerald-50 hover:text-emerald-600 hover:bg-emerald-100 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-all flex-shrink-0 shadow-sm"
              title="Export CSV"
            >
              <Download style={{ width: '1.15rem', height: '1.15rem' }} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto flex flex-col justify-between">
          {loading && data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mb-3 text-primary" />
              <p>Loading Wi-Fi directory...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <HardDrive className="w-12 h-12 text-slate-300 mb-3" />
              <p>No records found matching your criteria.</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-slate-700 text-[11px] font-bold uppercase tracking-wider border-y border-slate-200">
                    <th className="py-5 px-6 cursor-pointer hover:bg-slate-50 group">
                      <div className="flex items-center gap-2">
                        Outlet Details
                        <svg className="w-3 h-3 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                      </div>
                    </th>
                    <th className="py-5 px-6 cursor-pointer hover:bg-slate-50 group">
                      <div className="flex items-center gap-2">
                        Primary Network
                        <svg className="w-3 h-3 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                      </div>
                    </th>
                    <th className="py-5 px-6 cursor-pointer hover:bg-slate-50 group">
                      <div className="flex items-center gap-2">
                        Secondary Network
                        <svg className="w-3 h-3 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white text-sm">
                  {paginatedData.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-b-0">
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-medium text-slate-700">
                            {row.outletName || 'Unknown Outlet'}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5" />
                            {row.location || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-2">
                          {row.wifi1Name && row.wifi1Name.toLowerCase() !== 'nill' ? (
                            <>
                              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg inline-flex border border-slate-200 shadow-sm w-max">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SSID</span>
                                <div className="w-[1px] h-3 bg-slate-200 mx-1"></div>
                                <span className="text-sm font-medium text-primary">{row.wifi1Name}</span>
                              </div>
                              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg inline-flex border border-slate-200 shadow-sm w-max">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PWD</span>
                                <div className="w-[1px] h-3 bg-slate-200 mx-1"></div>
                                <span className="text-sm font-mono font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                  {row.wifi1Pass}
                                </span>
                              </div>
                            </>
                          ) : (
                            <span className="text-sm font-medium italic text-slate-400">No primary network</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-2">
                          {row.wifi2Name && row.wifi2Name.toLowerCase() !== 'nill' ? (
                            <>
                              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg inline-flex border border-slate-200 shadow-sm w-max">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SSID</span>
                                <div className="w-[1px] h-3 bg-slate-200 mx-1"></div>
                                <span className="text-sm font-medium text-slate-700">{row.wifi2Name}</span>
                              </div>
                              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg inline-flex border border-slate-200 shadow-sm w-max">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PWD</span>
                                <div className="w-[1px] h-3 bg-slate-200 mx-1"></div>
                                <span className="text-sm font-mono font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                                  {row.wifi2Pass}
                                </span>
                              </div>
                            </>
                          ) : (
                            <span className="text-sm font-medium italic text-slate-400">No secondary network</span>
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
                        Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of{' '}
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
    </div>
  );
}
