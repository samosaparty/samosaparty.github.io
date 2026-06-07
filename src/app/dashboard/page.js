'use client';

import { useEffect, useState } from 'react';
import { fetchUsers } from '@/lib/auth';
import { Users, Shield, UserCheck, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchUsers();
        setUsers(data || []);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.Status?.toLowerCase() === 'active').length;
  const admins = users.filter(u => u.Role?.toLowerCase() === 'admin').length;
  
  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard data...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Dashboard Overview</h2>
      
      <div className="dashboard-grid">
        <div className="widget-card">
          <div className="widget-info">
            <h3>Total Users</h3>
            <p>{totalUsers}</p>
          </div>
          <div className="widget-icon blue">
            <Users size={24} />
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-info">
            <h3>Active Accounts</h3>
            <p>{activeUsers}</p>
          </div>
          <div className="widget-icon green">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-info">
            <h3>Administrators</h3>
            <p>{admins}</p>
          </div>
          <div className="widget-icon purple">
            <Shield size={24} />
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-info">
            <h3>System Status</h3>
            <p>Online</p>
          </div>
          <div className="widget-icon orange">
            <Activity size={24} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Users List</h3>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map(user => (
                <tr key={user.ID || user.Email}>
                  <td>{user.ID}</td>
                  <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{user['Full Name']}</td>
                  <td>{user.Email}</td>
                  <td>
                    <span style={{ 
                      fontSize: '0.8rem', fontWeight: 600, padding: '0.2rem 0.5rem', 
                      borderRadius: '4px', background: user.Role === 'Admin' ? '#fef08a' : '#e0e7ff',
                      color: user.Role === 'Admin' ? '#854d0e' : '#3730a3'
                    }}>
                      {user.Role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.Status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                      {user.Status || 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No users found in Google Sheet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
