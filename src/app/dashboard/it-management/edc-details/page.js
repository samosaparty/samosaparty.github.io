'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, Search, Filter, AlertCircle, Download, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import Papa from 'papaparse';

export default function EDCDetailsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = () => {
    setLoading(true);
    const csvUrl = 'https://docs.google.com/spreadsheets/d/1yKGYDJN4Chtk2vow07Kz5hPfirLdYIuqsxtsHXBk588/export?format=csv&gid=1142837203';
    
    fetch(csvUrl, { cache: 'no-store' })
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
          complete: (results) => {
            const rows = results.data.slice(2).filter(row => row[0] && row[0].trim() !== '');
            const mappedData = rows.map(row => ({
              outlet: row[0]?.trim() || '',
              location: row[1]?.trim() || '',
              serialNo: row[2]?.trim() || '',
              paytmMid: row[3]?.trim() || '',
              pinelabStoreId: row[4]?.trim() || '',
              pinelabClientId: row[5]?.trim() || '',
              status: row[6]?.trim() || ''
            }));
            setData(mappedData);
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

  // Extract unique values for filters
  const uniqueLocations = useMemo(() => ['All', ...new Set(data.map(item => item.location).filter(Boolean))], [data]);
  const uniqueStatuses = useMemo(() => ['All', ...new Set(data.map(item => item.status).filter(Boolean))], [data]);

  // Apply filters and search
  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchSearch = 
        row.outlet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.paytmMid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.pinelabStoreId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.pinelabClientId.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchLocation = filterLocation === 'All' || row.location === filterLocation;
      const matchStatus = filterStatus === 'All' || row.status === filterStatus;

      return matchSearch && matchLocation && matchStatus;
    });
  }, [data, searchTerm, filterLocation, filterStatus]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterLocation, filterStatus]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleExportCSV = () => {
    const exportData = filteredData.map(item => ({
      'Outlet': item.outlet,
      'Location': item.location,
      'Serial No': item.serialNo,
      'Paytm MID': item.paytmMid,
      'Pinelab Store ID': item.pinelabStoreId,
      'Pinelab Client ID': item.pinelabClientId,
      'Status': item.status
    }));
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'edc_details.csv';
    link.click();
  };

  return (
    <div className="max-w-[1950px] mx-auto p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col gap-5 md:gap-6">
      
      <header style={{ paddingTop: '0.8rem', paddingBottom: '0.8rem' }} className="bg-white px-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-2">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <CreditCard className="text-primary w-6 h-6" />
          EDC Details
        </h1>
        <p className="text-sm font-medium text-slate-500">Manage EDC (Electronic Data Capture) terminal details across all outlets.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div style={{ paddingTop: '0.8rem', paddingBottom: '0.8rem', paddingLeft: '2%' }} className="pr-4 md:pr-8 flex flex-col sm:flex-row justify-start items-center gap-4 bg-white rounded-t-2xl">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            
            <div className="relative group" style={{ width: '250px', maxWidth: '100%' }}>
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-10" style={{ paddingLeft: '1.25rem' }}>
                <Filter className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <select 
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                style={{ paddingLeft: '3rem', paddingTop: '0.65rem', paddingBottom: '0.65rem' }}
                className="block w-full pr-10 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white shadow-sm hover:border-slate-400 cursor-pointer relative z-0"
              >
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ paddingLeft: '3rem', paddingTop: '0.65rem', paddingBottom: '0.65rem' }}
                className="block w-full pr-10 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white shadow-sm hover:border-slate-400 cursor-pointer relative z-0"
              >
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status === 'All' ? 'All Statuses' : status}</option>
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
                placeholder="Search Outlet, MID, Store ID..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '3rem', paddingTop: '0.65rem', paddingBottom: '0.65rem' }}
                className="block w-full pr-4 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white shadow-sm hover:border-slate-400"
              />
            </div>

            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterLocation('All');
                setFilterStatus('All');
              }}
              disabled={!searchTerm && filterLocation === 'All' && filterStatus === 'All'}
              className="p-[11px] text-rose-500 bg-rose-50 hover:text-rose-600 hover:bg-rose-100 rounded-xl border border-rose-200 hover:border-rose-300 transition-all disabled:opacity-50 flex-shrink-0 shadow-sm"
              title="Reset Filters"
            >
              <X style={{ width: '1.15rem', height: '1.15rem' }} />
            </button>
            
            <button 
              onClick={handleExportCSV}
              className="p-[11px] text-emerald-600 bg-emerald-50 hover:text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-all flex-shrink-0 shadow-sm flex items-center gap-2 font-semibold text-sm"
              title="Export CSV Data"
            >
              <Download style={{ width: '1.15rem', height: '1.15rem' }} />
              Export
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-x-auto relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-10">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Loading details...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
              <p>No details found matching your criteria.</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-slate-700 text-[11px] font-bold uppercase tracking-wider border-y border-slate-200">
                    <th className="py-5 px-6">Outlet Name</th>
                    <th className="py-5 px-6">Location</th>
                    <th className="py-5 px-6">Serial No</th>
                    <th className="py-5 px-6">Paytm MID</th>
                    <th className="py-5 px-6">Pinelab Store ID</th>
                    <th className="py-5 px-6">Pinelab Client ID</th>
                    <th className="py-5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-sm">
                  {currentItems.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-b-0">
                      <td className="py-5 px-6 text-center text-slate-400 font-medium">{indexOfFirstItem + index + 1}</td>
                      <td className="py-5 px-6 font-medium text-slate-700 whitespace-nowrap">{row.outlet || '-'}</td>
                      <td className="py-5 px-6 text-slate-600">{row.location || '-'}</td>
                      <td className="py-5 px-6 text-slate-600 font-mono text-[13px]">{row.serialNo || '-'}</td>
                      <td className="py-5 px-6 text-slate-600 font-mono text-[13px]">{row.paytmMid || '-'}</td>
                      <td className="py-5 px-6 text-slate-600 font-mono text-[13px]">{row.pinelabStoreId || '-'}</td>
                      <td className="py-5 px-6 text-slate-600 font-mono text-[13px]">{row.pinelabClientId || '-'}</td>
                      <td className="py-5 px-6">
                        {row.status ? (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            row.status.toLowerCase() === 'done' 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {row.status}
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
