'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Mail, Search, AlertCircle, Download, KeyRound, Smartphone } from 'lucide-react';
import Papa from 'papaparse';

export default function PrimeDirectoryPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/1yKGYDJN4Chtk2vow07Kz5hPfirLdYIuqsxtsHXBk588/gviz/tq?tqx=out:csv&sheet=Prime';
    
    fetch(csvUrl, { cache: 'no-store' })
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 1) {
              // Skip first row (headers) and map to objects by index
              const parsedData = results.data.slice(1).map(row => ({
                storeName: row[0] || '',
                emailId: row[1] || '',
                emailPass: row[2] || '',
                primePass: row[3] || '',
                recoveryEmail: row[4] || '',
                recoveryPhone: row[5] || ''
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
        item.storeName.toLowerCase().includes(searchLower) ||
        item.emailId.toLowerCase().includes(searchLower)
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
    link.download = 'prime_directory.csv';
    link.click();
  };

  return (
    <div className="max-w-[1950px] mx-auto p-4 md:p-8 lg:p-10 flex flex-col gap-8" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-2xl border" style={{ borderColor: 'var(--border)', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)' }}>
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3 tracking-tight" style={{ color: 'var(--text-main)' }}>
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
              <KeyRound className="w-6 h-6" strokeWidth={2.5} />
            </div>
            Prime Accounts Directory
          </h1>
          <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
            Store email credentials, Prime passwords, and recovery details.
          </p>
        </div>
        
        <button 
          onClick={handleExportCSV}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          style={{ width: 'auto', borderRadius: '10px', boxShadow: '0 4px 12px rgba(3, 105, 161, 0.2)' }}
        >
          <Download className="w-4 h-4" />
          Export CSV Data
        </button>
      </div>

      {/* Main Container */}
      <div className="card flex flex-col flex-1" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* Controls Bar (Search) */}
        <div className="p-5 border-b flex flex-row items-center gap-5 overflow-x-auto custom-scrollbar" style={{ borderColor: 'var(--border)', backgroundColor: '#ffffff', whiteSpace: 'nowrap' }}>
          
          {/* Search */}
          <div style={{ position: 'relative', width: '350px', flexShrink: 0 }}>
            <Search className="w-5 h-5" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input 
              type="text" 
              placeholder="Search Store Name or Email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input transition-all"
              style={{ borderRadius: '10px', paddingLeft: '48px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px', width: '100%', fontSize: '0.9rem', backgroundColor: '#f8fafc', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)', flexShrink: 0, opacity: 0.6 }}></div>
          
          {/* Active count badge */}
          <div className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ backgroundColor: 'var(--accent)', color: 'white', boxShadow: '0 2px 8px rgba(255, 85, 0, 0.25)' }}>
            {filteredData.length} Accounts Found
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Loading Prime directory...</p>
            </div>
          ) : null}

          <table className="w-full text-left border-collapse data-table" style={{ backgroundColor: 'white' }}>
            <thead style={{ backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <tr>
                <th className="px-8 py-5 text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)', borderBottom: '2px solid var(--border)', width: '25%' }}>Store Info</th>
                <th className="px-8 py-5 text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)', borderBottom: '2px solid var(--border)', width: '40%' }}>Account & Passwords</th>
                <th className="px-8 py-5 text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)', borderBottom: '2px solid var(--border)', width: '35%' }}>Recovery Details</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredData.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                      <AlertCircle className="w-14 h-14 mb-4" style={{ color: 'var(--border)', opacity: 0.8 }} />
                      <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>No accounts found</p>
                      <p className="text-sm mt-2">Try adjusting your search term.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr key={index} className="group" style={{ borderBottom: '1px solid var(--border)', transition: 'all 0.2s ease', cursor: 'default' }}>
                    {/* Store Name */}
                    <td className="px-8 py-5 group-hover:bg-slate-50 transition-colors">
                      <span className="font-extrabold text-[0.95rem]" style={{ color: 'var(--text-main)' }}>
                        {row.storeName || 'Unknown Store'}
                      </span>
                    </td>

                    {/* Account & Passwords */}
                    <td className="px-8 py-5 group-hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col gap-2">
                        {row.emailId ? (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                            <span className="font-semibold text-[0.9rem]" style={{ color: 'var(--text-main)' }}>{row.emailId}</span>
                          </div>
                        ) : (
                          <span className="text-[0.85rem] font-medium italic" style={{ color: 'var(--text-muted)' }}>No Email</span>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {row.emailPass && (
                            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg inline-flex" style={{ border: '1px solid var(--border)' }}>
                              <span className="text-[0.7rem] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>EMAIL PWD</span>
                              <div className="w-[1px] h-3 bg-slate-200 mx-1"></div>
                              <span className="text-[0.8rem] font-mono font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5' }}>
                                {row.emailPass}
                              </span>
                            </div>
                          )}
                          
                          {row.primePass && (
                            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg inline-flex" style={{ border: '1px solid var(--border)' }}>
                              <span className="text-[0.7rem] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>PRIME PWD</span>
                              <div className="w-[1px] h-3 bg-slate-200 mx-1"></div>
                              <span className="text-[0.8rem] font-mono font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                                {row.primePass}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Recovery Details */}
                    <td className="px-8 py-5 group-hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col gap-2">
                        {row.recoveryEmail && (
                          <div className="flex items-center gap-2">
                            <span className="text-[0.75rem] font-bold uppercase tracking-wider w-16" style={{ color: 'var(--text-muted)' }}>EMAIL:</span>
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{row.recoveryEmail}</span>
                          </div>
                        )}
                        {row.recoveryPhone && (
                          <div className="flex items-center gap-2">
                            <span className="text-[0.75rem] font-bold uppercase tracking-wider w-16" style={{ color: 'var(--text-muted)' }}>PHONE:</span>
                            <div className="flex items-center gap-1.5">
                              <Smartphone className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                              <span className="font-mono text-sm font-bold" style={{ color: 'var(--primary)', letterSpacing: '0.5px' }}>
                                {row.recoveryPhone}
                              </span>
                            </div>
                          </div>
                        )}
                        {!row.recoveryEmail && !row.recoveryPhone && (
                          <span className="text-[0.85rem] font-medium italic" style={{ color: 'var(--text-muted)' }}>No recovery details</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredData.length > 0 && (
          <div className="p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border)', backgroundColor: '#f8fafc' }}>
            <div className="text-[0.9rem] font-medium" style={{ color: 'var(--text-muted)' }}>
              Showing <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{startIndex + 1}</span> to{' '}
              <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                {Math.min(startIndex + itemsPerPage, filteredData.length)}
              </span>{' '}
              of <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{filteredData.length}</span> accounts
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                style={{ 
                  backgroundColor: currentPage === 1 ? '#f1f5f9' : 'white', 
                  color: currentPage === 1 ? '#94a3b8' : 'var(--text-main)',
                  border: '1px solid var(--border)',
                  boxShadow: currentPage === 1 ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1 px-2">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Show max 5 pages, with current page in middle when possible
                  if (
                    totalPages <= 5 || 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-extrabold transition-all hover:scale-105"
                        style={{
                          backgroundColor: currentPage === page ? 'var(--primary)' : 'white',
                          color: currentPage === page ? 'white' : 'var(--text-main)',
                          border: currentPage === page ? 'none' : '1px solid var(--border)',
                          boxShadow: currentPage === page ? '0 4px 10px rgba(3, 105, 161, 0.25)' : '0 1px 2px rgba(0,0,0,0.02)'
                        }}
                      >
                        {page}
                      </button>
                    );
                  }
                  // Ellipsis
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="text-slate-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                style={{ 
                  backgroundColor: currentPage === totalPages ? '#f1f5f9' : 'white', 
                  color: currentPage === totalPages ? '#94a3b8' : 'var(--text-main)',
                  border: '1px solid var(--border)',
                  boxShadow: currentPage === totalPages ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
