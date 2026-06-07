"use client";

import React, { useRef, useState, useMemo } from 'react';

export default function CategorySection({ category, categoryData, oldIssuesCount }) {
  const sectionRef = useRef(null);
  const [filters, setFilters] = useState({});

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const filteredData = useMemo(() => {
    return categoryData.filter(row => {
      return Object.entries(filters).every(([col, val]) => {
        if (!val) return true;
        return row[col] === val;
      });
    });
  }, [categoryData, filters]);

  const handleScreenshot = async (e) => {
    if (!sectionRef.current) return;
    
    const button = e.currentTarget; // The screenshot button
    const tableWrapper = sectionRef.current.querySelector('.table-wrapper');
    const headers = sectionRef.current.querySelectorAll('.data-table th');
    
    // Cache original styles
    const originalMaxHeight = tableWrapper.style.maxHeight;
    const originalOverflow = tableWrapper.style.overflow;
    
    try {
      // 1. Hide the screenshot button from the final image
      button.style.display = 'none';

      // 2. Remove max-height and overflow to expose the FULL table data
      tableWrapper.style.maxHeight = 'none';
      tableWrapper.style.overflow = 'visible';
      tableWrapper.style.border = 'none'; // Remove scroll wrapper border for clean look
      tableWrapper.style.boxShadow = 'none';
      
      // 3. Remove sticky positioning from headers temporarily
      headers.forEach(th => th.style.position = 'static');

      // Wait a tiny bit for the DOM layout to completely update
      await new Promise(resolve => setTimeout(resolve, 150));

      // Dynamically import to avoid SSR issues
      const domtoimage = (await import('dom-to-image-more')).default;

      const scale = 2;
      const dataUrl = await domtoimage.toPng(sectionRef.current, {
        bgcolor: '#ffffff',
        width: sectionRef.current.scrollWidth * scale,
        height: sectionRef.current.scrollHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          margin: '0'
        }
      });

      // RESTORE STYLES IMMEDIATELY
      button.style.display = '';
      tableWrapper.style.maxHeight = originalMaxHeight;
      tableWrapper.style.overflow = originalOverflow;
      tableWrapper.style.border = '';
      tableWrapper.style.boxShadow = '';
      headers.forEach(th => th.style.position = '');

      // Download
      const link = document.createElement('a');
      link.download = `${category.replace(/[^a-zA-Z0-9-_\s]/g, '')}-issues.png`; // Sanitize filename just in case
      link.href = dataUrl;
      document.body.appendChild(link); // Append to DOM for Firefox/Chrome security
      link.click();
      document.body.removeChild(link); // Cleanup
    } catch (error) {
      // Ensure styles are restored even if it fails
      button.style.display = '';
      tableWrapper.style.maxHeight = originalMaxHeight;
      tableWrapper.style.overflow = originalOverflow;
      tableWrapper.style.border = '';
      tableWrapper.style.boxShadow = '';
      headers.forEach(th => th.style.position = '');

      console.error('Failed to take screenshot', error);
      alert(`Failed to capture screenshot: ${error.message || 'Unknown error'}`);
    }
  };

  function getSeverityClass(severity) {
    if (!severity) return '';
    const s = severity.toLowerCase();
    if (s.includes('critical')) return 'critical';
    if (s.includes('high')) return 'high';
    if (s.includes('medium')) return 'medium';
    if (s.includes('low')) return 'low';
    return '';
  }
  
  function getStatusClass(status) {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s.includes('open')) return 'open';
    if (s.includes('closed') || s.includes('resolved')) return 'closed';
    return '';
  }

  return (
    <section ref={sectionRef} className="category-section">
      <div className="category-header-wrap">
        <h2 className="category-title">{category}</h2>
        <div className="header-actions">
          <div className="total-issues-badge">
            Total Issues: <strong>{categoryData.length}</strong>
          </div>
          {oldIssuesCount > 0 && (
            <div className="old-issues-badge">
              Open Issues Older Than 5 Days: <strong>{oldIssuesCount}</strong>
            </div>
          )}
          <button onClick={handleScreenshot} className="screenshot-btn" title="Download Screenshot">
            📸 Screenshot
          </button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {['ID', 'Title', 'Issue Location', 'Reported by', 'Status', 'Severity', 'Created On', 'Ageing'].map(col => (
                <th key={col}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{col}</span>
                      {filters[col] && (
                        <span style={{ fontSize: '0.65rem', color: '#fef08a', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={filters[col]}>
                          {filters[col]}
                        </span>
                      )}
                    </div>
                    <div 
                      style={{ 
                        position: 'relative', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: '24px', 
                        height: '24px',
                        backgroundColor: filters[col] ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      title="Filter"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                      </svg>
                      <select 
                        value={filters[col] || ''}
                        onChange={(e) => handleFilterChange(col, e.target.value)}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                      >
                        <option value="" style={{ color: '#000' }}>All</option>
                        {[...new Set(categoryData.map(r => r[col]))].filter(Boolean).sort().map(val => (
                          <option key={val} value={val} style={{ color: '#000' }}>
                            {val.length > 25 ? val.substring(0, 25) + '...' : val}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, idx) => (
              <tr key={idx}>
                <td>{row['ID']}</td>
                <td className="title-cell" title={row['Title']}>{row['Title']}</td>
                <td>{row['Issue Location']}</td>
                <td>{row['Reported by']}</td>
                <td>
                  <span className={`badge ${getStatusClass(row['Status'])}`}>
                    {row['Status'] || '-'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getSeverityClass(row['Severity'])}`}>
                    {row['Severity'] || '-'}
                  </span>
                </td>
                <td>{row['Created On']}</td>
                <td>{row['Ageing']}</td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
