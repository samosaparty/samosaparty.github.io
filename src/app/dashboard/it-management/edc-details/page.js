'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, Search, Filter, AlertCircle, Download } from 'lucide-react';
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

  useEffect(() => {
    // The GID is 1142837203 based on the user's request
    const csvUrl = 'https://docs.google.com/spreadsheets/d/1yKGYDJN4Chtk2vow07Kz5hPfirLdYIuqsxtsHXBk588/export?format=csv&gid=1142837203';
    
    fetch(csvUrl, { cache: 'no-store' })
      .then(res => res.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
          complete: (results) => {
            // Data starts at row index 2 because row 0 is main headers and row 1 is sub-headers
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
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleExportCSV = () => {
    // Convert mappedData to something Papa.unparse understands as headers
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
    <div className="max-w-[1950px] mx-auto p-4 md:p-8 lg:p-10 flex flex-col gap-8" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-2xl border" style={{ borderColor: 'var(--border)', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)' }}>
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3 tracking-tight" style={{ color: 'var(--text-main)' }}>
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
              <CreditCard className="w-6 h-6" strokeWidth={2.5} />
            </div>
            EDC Details
          </h1>
          <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
            Manage EDC (Electronic Data Capture) terminal details across all outlets.
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

      {/* Main Table Container */}
      <div className="card flex flex-col flex-1" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* Controls Bar (Search & Filters) */}
        <div className="p-5 border-b flex flex-row items-center gap-5 overflow-x-auto custom-scrollbar" style={{ borderColor: 'var(--border)', backgroundColor: '#ffffff', whiteSpace: 'nowrap' }}>
          
          {/* Search */}
          <div style={{ position: 'relative', width: '300px', flexShrink: 0 }}>
            <Search className="w-5 h-5" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input 
              type="text" 
              placeholder="Search Outlet, MID, Store ID..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input transition-all"
              style={{ borderRadius: '10px', paddingLeft: '48px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px', width: '100%', fontSize: '0.9rem', backgroundColor: '#f8fafc', border: '1px solid var(--border)' }}
            />
          </div>

          {/* Filters Divider */}
          <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)', flexShrink: 0, opacity: 0.6 }}></div>

          {/* Filters */}
          <div className="flex flex-row items-center gap-4 flex-nowrap" style={{ flexShrink: 0 }}>
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              <Filter className="w-4 h-4" />
              Filters:
            </div>
            
            <div style={{ position: 'relative', minWidth: '150px' }}>
              <select 
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="form-input appearance-none cursor-pointer transition-colors hover:bg-slate-50"
                style={{ borderRadius: '10px', padding: '10px 36px 10px 16px', width: '100%', fontSize: '0.9rem', fontWeight: 600, backgroundColor: 'white', border: '1px solid var(--border)' }}
              >
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
                ))}
              </select>
              <div className="pointer-events-none" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                ▼
              </div>
            </div>

            <div style={{ position: 'relative', minWidth: '150px' }}>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-input appearance-none cursor-pointer transition-colors hover:bg-slate-50"
                style={{ borderRadius: '10px', padding: '10px 36px 10px 16px', width: '100%', fontSize: '0.9rem', fontWeight: 600, backgroundColor: 'white', border: '1px solid var(--border)' }}
              >
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status === 'All' ? 'All Statuses' : status}</option>
                ))}
              </select>
              <div className="pointer-events-none" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                ▼
              </div>
            </div>
            
            {/* Active count badge */}
            <div className="ml-2 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ backgroundColor: 'var(--accent)', color: 'white', boxShadow: '0 2px 8px rgba(255, 85, 0, 0.25)' }}>
              {filteredData.length} Results
            </div>
          </div>
        </div>
        
        {/* Table */}
        <div className="p-8 md:p-10 relative min-h-[400px]">
          <div className="table-responsive">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Syncing EDC details...</p>
            </div>
          ) : null}

          <table>
            <thead>
              <tr>
                <th>Outlet Name</th>
                <th>Location</th>
                <th>Serial No</th>
                <th>Paytm MID</th>
                <th>Pinelab Store ID</th>
                <th>Pinelab Client ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                      <AlertCircle className="w-14 h-14 mb-4" style={{ color: 'var(--border)', opacity: 0.8 }} />
                      <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>No details found</p>
                      <p className="text-sm mt-2">Try adjusting your filters or search term.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr key={index} className="group">
                    <td>
                      <span className="font-extrabold text-[0.95rem]" style={{ color: 'var(--text-main)' }}>
                        {row.outlet || '-'}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-[0.9rem]" style={{ color: 'var(--text-muted)' }}>
                        {row.location || '-'}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-[0.85rem] font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#f1f5f9', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                        {row.serialNo || '-'}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-[0.85rem] font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
                        {row.paytmMid || '-'}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-[0.85rem] font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                        {row.pinelabStoreId || '-'}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-[0.85rem] font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#fce7f3', color: '#be185d', border: '1px solid #fbcfe8' }}>
                        {row.pinelabClientId || '-'}
                      </span>
                    </td>
                    <td>
                      {row.status ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ 
                          backgroundColor: row.status.toLowerCase() === 'done' ? '#dcfce7' : '#f1f5f9',
                          color: row.status.toLowerCase() === 'done' ? '#166534' : '#475569'
                        }}>
                          {row.status}
                        </span>
                      ) : '-'}
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
              of <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{filteredData.length}</span> entries
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
