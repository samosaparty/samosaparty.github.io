'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Camera, Search, AlertCircle, Download, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Papa from 'papaparse';

export default function CameraPasswordPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const loadData = () => {
    setLoading(true);
    const csvUrl = 'https://docs.google.com/spreadsheets/d/1yKGYDJN4Chtk2vow07Kz5hPfirLdYIuqsxtsHXBk588/gviz/tq?tqx=out:csv&sheet=Camera-Password';
    
    fetch(csvUrl, { cache: 'no-store' })
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 1) {
              const parsedData = results.data.slice(1).map(row => ({
                storeName: row[0] || '',
                camUser: row[1] || '',
                camPass: row[2] || '',
                anydeskId: row[3] || '',
                anydeskPass: row[4] || ''
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
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        item.storeName.toLowerCase().includes(searchLower) ||
        item.camUser.toLowerCase().includes(searchLower) ||
        item.anydeskId.toLowerCase().includes(searchLower)
      );
    });
  }, [data, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'camera_passwords.csv';
    link.click();
  };

  return (
    <div className="max-w-[1950px] mx-auto p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col gap-5 md:gap-6">
      
      <header style={{ paddingTop: '0.8rem', paddingBottom: '0.8rem' }} className="bg-white px-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-2">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Camera className="text-primary w-6 h-6" />
          Camera Passwords Directory
        </h1>
        <p className="text-sm font-medium text-slate-500">CCTV access credentials and associated Anydesk details for all stores.</p>
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
                placeholder="Search Store, Username or Anydesk ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '3rem', paddingTop: '0.65rem', paddingBottom: '0.65rem' }}
                className="block w-full pr-4 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white shadow-sm hover:border-slate-400"
              />
            </div>
            
            <button 
              onClick={() => setSearchTerm('')}
              disabled={!searchTerm}
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
              className="p-[11px] text-emerald-500 bg-emerald-50 hover:text-emerald-600 hover:bg-emerald-100 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-all flex-shrink-0 shadow-sm flex items-center gap-2"
              title="Export CSV Data"
            >
              <Download style={{ width: '1.15rem', height: '1.15rem' }} />
              <span className="hidden sm:inline text-sm font-medium">Export</span>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-x-auto flex flex-col justify-between">
          {loading && data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mb-3 text-primary" />
              <p>Loading Camera directory...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
              <p>No records found matching your criteria.</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-slate-700 text-[11px] font-bold uppercase tracking-wider border-y border-slate-200">
                    <th className="py-5 px-6 w-16 text-center">#</th>
                    <th className="py-5 px-6 cursor-pointer hover:bg-slate-50 group">
                      <div className="flex items-center gap-2">
                        Store Name
                      </div>
                    </th>
                    <th className="py-5 px-6 cursor-pointer hover:bg-slate-50 group">
                      <div className="flex items-center gap-2">
                        Camera Credentials
                      </div>
                    </th>
                    <th className="py-5 px-6 cursor-pointer hover:bg-slate-50 group">
                      <div className="flex items-center gap-2">
                        Associated Anydesk
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white text-sm">
                  {paginatedData.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-b-0">
                      <td className="py-5 px-6 text-center text-slate-400 font-medium">{indexOfFirstItem + index + 1}</td>
                      <td className="py-5 px-6 font-medium text-slate-700">
                        {row.storeName || 'Unknown Store'}
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-2">
                          {row.camUser || row.camPass ? (
                            <>
                              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg inline-flex border border-slate-200">
                                <span className="text-[0.75rem] font-bold uppercase tracking-wider text-slate-500">USER</span>
                                <div className="w-[1px] h-3 bg-slate-200 mx-1"></div>
                                <span className="text-sm font-extrabold text-primary">{row.camUser || '-'}</span>
                              </div>
                              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg inline-flex border border-slate-200">
                                <span className="text-[0.75rem] font-bold uppercase tracking-wider text-slate-500">PWD</span>
                                <div className="w-[1px] h-3 bg-slate-200 mx-1"></div>
                                <span className="text-sm font-mono font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100">
                                  {row.camPass || '-'}
                                </span>
                              </div>
                            </>
                          ) : (
                            <span className="text-[0.85rem] font-medium italic text-slate-500">No credentials</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-2">
                          {row.anydeskId || row.anydeskPass ? (
                            <>
                              {row.anydeskId && (
                                <span className="font-mono text-[1.05rem] font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-2 w-max bg-emerald-50 text-emerald-600 border border-emerald-200" style={{ letterSpacing: '0.5px' }}>
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                  {row.anydeskId}
                                </span>
                              )}
                              {row.anydeskPass && (
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg inline-flex border border-slate-200">
                                  <span className="text-[0.75rem] font-bold uppercase tracking-wider text-slate-500">ANYDESK PWD</span>
                                  <div className="w-[1px] h-3 bg-slate-200 mx-1"></div>
                                  <span className="text-sm font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                    {row.anydeskPass}
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-[0.85rem] font-medium italic text-slate-500">No Anydesk linked</span>
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
                        Showing <span className="font-semibold text-slate-800">{indexOfFirstItem + 1}</span> to <span className="font-semibold text-slate-800">{Math.min(indexOfLastItem, filteredData.length)}</span> of{' '}
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
