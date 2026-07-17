'use client';

import React, { useEffect, useState } from 'react';
import { Monitor, HardDrive, Cpu, Mouse, Search, RefreshCw, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import Papa from 'papaparse';

async function getAssetsData() {
  const url = 'https://docs.google.com/spreadsheets/d/1yKGYDJN4Chtk2vow07Kz5hPfirLdYIuqsxtsHXBk588/export?format=csv&gid=1999860716';
  
  const response = await fetch(url, { cache: 'no-store' });
  
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  const csvText = await response.text();
  
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return result.data;
}

export default function AssetsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('All');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = async () => {
    try {
      setLoading(true);
      const sheetData = await getAssetsData();
      setData(sheetData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStore]);

  // Unique stores for filter dropdown
  const uniqueStores = ['All', ...new Set(data.map(item => item['Store Name']?.trim()).filter(Boolean))].sort();

  const filteredData = data.filter(item => {
    // Store filter
    if (selectedStore !== 'All' && item['Store Name']?.trim() !== selectedStore) {
      return false;
    }
    
    // Search filter
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    
    const entryDate = item['Entry Date'] || item['Date'] || item['Timestamp'] || '';
    
    return (
      (item['Store Name'] && item['Store Name'].toLowerCase().includes(term)) ||
      (item['Products Name'] && item['Products Name'].toLowerCase().includes(term)) ||
      (item['Person Name'] && item['Person Name'].toLowerCase().includes(term)) ||
      (entryDate.toLowerCase().includes(term))
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);



  return (
    <div className="max-w-[1950px] mx-auto p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col gap-5 md:gap-6">
      <header style={{ paddingTop: '0.8rem', paddingBottom: '0.8rem' }} className="bg-white px-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-2">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Monitor className="text-primary w-6 h-6" />
          IT Assets Management
        </h1>
        <p className="text-sm font-medium text-slate-500">Track and manage all enterprise hardware and software assets.</p>
      </header>



      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div style={{ paddingTop: '0.8rem', paddingBottom: '0.8rem', paddingLeft: '2%' }} className="pr-4 md:pr-8 flex flex-col sm:flex-row justify-start items-center gap-4 bg-white rounded-t-2xl">

          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <div className="relative group" style={{ width: '250px', maxWidth: '100%' }}>
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ paddingLeft: '1.25rem' }}>
                <Filter className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <select 
                value={selectedStore} 
                onChange={(e) => setSelectedStore(e.target.value)}
                style={{ paddingLeft: '3rem', paddingTop: '0.65rem', paddingBottom: '0.65rem' }}
                className="block w-full pr-10 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white shadow-sm hover:border-slate-400 cursor-pointer relative z-0"
              >
                {uniqueStores.map(store => (
                  <option key={store} value={store}>{store === 'All' ? 'All Stores' : store}</option>
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
                placeholder="Search assets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '3rem', paddingTop: '0.65rem', paddingBottom: '0.65rem' }}
                className="block w-full pr-4 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white shadow-sm hover:border-slate-400"
              />
            </div>
            
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedStore('All');
              }}
              disabled={!searchTerm && selectedStore === 'All'}
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
          </div>
        </div>
        
        <div className="flex-1 overflow-x-auto flex flex-col justify-between">
          {loading && data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mb-3 text-primary" />
              <p>Loading assets data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <HardDrive className="w-12 h-12 text-slate-300 mb-3" />
              <p>No assets found matching your criteria.</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-slate-700 text-[11px] font-bold uppercase tracking-wider border-y border-slate-200">
                    <th className="py-5 px-6 w-16 text-center">#</th>
                    <th className="py-5 px-6 cursor-pointer hover:bg-slate-50 group">
                      <div className="flex items-center gap-2">
                        Entry Date
                        <svg className="w-3 h-3 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                      </div>
                    </th>
                    <th className="py-5 px-6 cursor-pointer hover:bg-slate-50 group">
                      <div className="flex items-center gap-2">
                        Store Name
                        <svg className="w-3 h-3 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                      </div>
                    </th>
                    <th className="py-5 px-6 cursor-pointer hover:bg-slate-50 group">
                      <div className="flex items-center gap-2">
                        Products Name
                        <svg className="w-3 h-3 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                      </div>
                    </th>
                    <th className="py-5 px-6 cursor-pointer hover:bg-slate-50 group">
                      <div className="flex items-center gap-2">
                        Person Name
                        <svg className="w-3 h-3 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white text-sm">
                  {currentItems.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-b-0">
                      <td className="py-5 px-6 text-center text-slate-400 font-medium">{indexOfFirstItem + index + 1}</td>
                      <td className="py-5 px-6 text-slate-500 whitespace-nowrap">
                        {item['Entry Date'] || item['Date'] || item['Timestamp'] || '-'}
                      </td>
                      <td className="py-5 px-6 font-medium text-slate-700">{item['Store Name'] || '-'}</td>
                      <td className="py-5 px-6 text-slate-600">{item['Products Name'] || '-'}</td>
                      <td className="py-5 px-6 text-slate-600">
                        {item['Person Name'] ? (
                          <span className="text-blue-500 hover:text-blue-600 hover:underline cursor-pointer transition-colors">
                            {item['Person Name']}
                          </span>
                        ) : '-'}
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
