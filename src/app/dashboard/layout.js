'use client';

import { useEffect, useState } from 'react';
import { Home, Users, Settings, LogOut, Menu, BarChart3, Bell, ChevronDown, Ticket, Monitor } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTicketMenuOpen, setIsTicketMenuOpen] = useState(false);
  const [isITMenuOpen, setIsITMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Global click-to-copy handler for table cells
  useEffect(() => {
    const handleTableClick = (e) => {
      const td = e.target.closest('td');
      if (td) {
        const textToCopy = td.innerText?.trim();
        if (textToCopy) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            setToastMessage('Copied: ' + (textToCopy.length > 30 ? textToCopy.substring(0, 30) + '...' : textToCopy));
            setTimeout(() => setToastMessage(''), 2000);
          }).catch(err => console.error('Failed to copy', err));
        }
      }
    };
    document.addEventListener('click', handleTableClick);
    return () => document.removeEventListener('click', handleTableClick);
  }, []);

  useEffect(() => {
    if (pathname.includes('/ticket-analyst')) {
      setIsTicketMenuOpen(true);
    } else {
      setIsTicketMenuOpen(false);
    }
    if (pathname.includes('/it-management')) {
      setIsITMenuOpen(true);
    } else {
      setIsITMenuOpen(false);
    }
    
    // Auto-close sidebar on mobile when navigating
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setSession(JSON.parse(storedUser));
      } catch (e) {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!session) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  return (
    <div className="admin-layout">
      {/* Mobile Backdrop */}
      <div 
        className={`sidebar-backdrop ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <BarChart3 style={{ marginRight: '10px', color: 'var(--primary)' }} />
          <a href="https://docs.google.com/spreadsheets/d/1yKGYDJN4Chtk2vow07Kz5hPfirLdYIuqsxtsHXBk588/edit?gid=0#gid=0" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            Admin Analysis
          </a>
        </div>
        <nav className="sidebar-nav">
          <Link href="/dashboard" className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`}>
            <Home size={18} />
            <span>Dashboard</span>
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div 
              className={`nav-item ${pathname.includes('/ticket-analyst') ? 'active' : ''}`} 
              style={{ cursor: 'pointer', borderBottomLeftRadius: isTicketMenuOpen ? '0' : '', borderBottomRightRadius: isTicketMenuOpen ? '0' : '' }}
              onClick={() => setIsTicketMenuOpen(!isTicketMenuOpen)}
            >
              <Ticket size={18} />
              <span style={{ flex: 1 }}>Ticket Analyst</span>
              <ChevronDown 
                size={16} 
                style={{ 
                  transform: isTicketMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </div>
            {isTicketMenuOpen && (
              <div className="sub-menu">
                <Link href="/dashboard/ticket-analyst" className={`sub-nav-item ${pathname === '/dashboard/ticket-analyst' ? 'active' : ''}`}>
                  Dashboard
                </Link>
                <Link href="/dashboard/ticket-analyst/table" className={`sub-nav-item ${pathname === '/dashboard/ticket-analyst/table' ? 'active' : ''}`}>
                  Table
                </Link>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div 
              className={`nav-item ${pathname.includes('/it-management') ? 'active' : ''}`} 
              style={{ cursor: 'pointer', borderBottomLeftRadius: isITMenuOpen ? '0' : '', borderBottomRightRadius: isITMenuOpen ? '0' : '' }}
              onClick={() => setIsITMenuOpen(!isITMenuOpen)}
            >
              <Monitor size={18} />
              <span style={{ flex: 1 }}>IT Management</span>
              <ChevronDown 
                size={16} 
                style={{ 
                  transform: isITMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </div>
            {isITMenuOpen && (
              <div className="sub-menu">
                <Link href="/dashboard/it-management/assets" className={`sub-nav-item ${pathname === '/dashboard/it-management/assets' ? 'active' : ''}`}>
                  Assets
                </Link>
                <Link href="/dashboard/it-management/prime-details" className={`sub-nav-item ${pathname === '/dashboard/it-management/prime-details' ? 'active' : ''}`}>
                  Prime Details
                </Link>
                <Link href="/dashboard/it-management/internet-details" className={`sub-nav-item ${pathname === '/dashboard/it-management/internet-details' ? 'active' : ''}`}>
                  Internet Details
                </Link>
                <Link href="/dashboard/it-management/wifi-password" className={`sub-nav-item ${pathname === '/dashboard/it-management/wifi-password' ? 'active' : ''}`}>
                  Wifi-Password
                </Link>
                <Link href="/dashboard/it-management/camera-password" className={`sub-nav-item ${pathname === '/dashboard/it-management/camera-password' ? 'active' : ''}`}>
                  Camera-Password
                </Link>
                <Link href="/dashboard/it-management/anydesk-id" className={`sub-nav-item ${pathname === '/dashboard/it-management/anydesk-id' ? 'active' : ''}`}>
                  Anydesk ID
                </Link>

              </div>
            )}
          </div>
          {session.permissions === 'all' && (
            <Link href="/dashboard/users" className={`nav-item ${pathname.includes('/users') ? 'active' : ''}`}>
              <Users size={18} />
              <span>Manage Users</span>
            </Link>
          )}
          <Link href="/dashboard/settings" className={`nav-item ${pathname.includes('/settings') ? 'active' : ''}`}>
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Menu 
              className="mobile-menu-btn" 
              size={20} 
              color="var(--text-muted)" 
              style={{ cursor: 'pointer' }} 
              onClick={() => setIsSidebarOpen(true)}
            />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Overview</h2>
          </div>
          
          <div className="header-user">
            <Bell size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid var(--border)', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{session.name}</div>
                <div className="user-role-badge">{session.role}</div>
              </div>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--primary), #818cf8)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.9rem'
              }}>
                {session.name.charAt(0)}
              </div>
              <ChevronDown size={14} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
            </div>

            <button 
              onClick={handleLogout}
              style={{ 
                background: 'none', border: 'none', color: 'var(--text-muted)', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '0.5rem' 
              }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="page-content">
          {children}
        </main>
      </div>

      {/* Global Toast for Copy actions */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          backgroundColor: 'var(--success, #10b981)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontWeight: 'bold',
          fontSize: '0.9rem',
          animation: 'fadein 0.3s'
        }}>
          <style>{`
            @keyframes fadein {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
