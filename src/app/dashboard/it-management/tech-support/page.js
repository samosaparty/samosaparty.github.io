'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Headset, Search, AlertCircle, Download, ExternalLink, User } from 'lucide-react';
import Papa from 'papaparse';

export default function TechSupportPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/1yKGYDJN4Chtk2vow07Kz5hPfirLdYIuqsxtsHXBk588/export?format=csv&gid=254229846';
    
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

  // Apply search
  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        row['Name']?.toLowerCase().includes(searchLower) ||
        row['Issue']?.toLowerCase().includes(searchLower) ||
        row['Remark']?.toLowerCase().includes(searchLower)
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
    link.download = 'tech_support.csv';
    link.click();
  };

  return (
    <div className="max-w-[1950px] mx-auto p-4 md:p-8 lg:p-10 flex flex-col gap-8" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-2xl border" style={{ borderColor: 'var(--border)', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)' }}>
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3 tracking-tight" style={{ color: 'var(--text-main)' }}>
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
              <Headset className="w-6 h-6" strokeWidth={2.5} />
            </div>
            Tech Support
          </h1>
          <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
            Tech Support directory for various issues and tools.
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
              placeholder="Search by Name or Issue..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input transition-all"
              style={{ borderRadius: '10px', paddingLeft: '48px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px', width: '100%', fontSize: '0.9rem', backgroundColor: '#f8fafc', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)', flexShrink: 0, opacity: 0.6 }}></div>
          
          {/* Active count badge */}
          <div className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ backgroundColor: 'var(--accent)', color: 'white', boxShadow: '0 2px 8px rgba(255, 85, 0, 0.25)' }}>
            {filteredData.length} Records Found
          </div>
        </div>
        
        {/* Table */}
        <div className="p-8 md:p-10 relative min-h-[400px]">
          <div className="table-responsive">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Loading Tech Support data...</p>
            </div>
          ) : null}

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>URL</th>
                <th>Issue</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                      <AlertCircle className="w-14 h-14 mb-4" style={{ color: 'var(--border)', opacity: 0.8 }} />
                      <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>No records found</p>
                      <p className="text-sm mt-2">Try adjusting your search term.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr key={index} className="group" >
                    {/* Name */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all border border-slate-200">
                          <User className="w-5 h-5 text-slate-500" />
                        </div>
                        <span className="font-extrabold text-[0.95rem]" style={{ color: 'var(--text-main)' }}>
                          {row['Name'] || 'Unknown'}
                        </span>
                      </div>
                    </td>

                    {/* URL */}
                    <td>
                      {row['Url'] ? (
                        <a href={row['Url'].startsWith('http') ? row['Url'] : `https://${row['Url']}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-medium text-[0.95rem] transition-colors">
                          <ExternalLink className="w-4 h-4" />
                          <span className="max-w-[200px] truncate">{row['Url']}</span>
                        </a>
                      ) : (
                        <span className="text-[0.85rem] font-medium italic" style={{ color: 'var(--text-muted)' }}>No URL provided</span>
                      )}
                    </td>

                    {/* Issue */}
                    <td>
                      <span className="text-[0.95rem] font-medium" style={{ color: 'var(--text-main)' }}>
                        {row['Issue'] || '-'}
                      </span>
                    </td>

                    {/* Remark */}
                    <td>
                      <span className="text-[0.95rem] font-medium" style={{ color: 'var(--text-muted)' }}>
                        {row['Remark'] || '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredData.length > 0 && (
          <div className="p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border)', backgroundColor: '#f8fafc' }}>
            <div className="text-[0.9rem] font-medium" style={{ color: 'var(--text-muted)' }}>
              Showing <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{startIndex + 1}</span> to{' '}
              <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                {Math.min(startIndex + itemsPerPage, filteredData.length)}
              </span>{' '}
              of <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{filteredData.length}</span> records
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
