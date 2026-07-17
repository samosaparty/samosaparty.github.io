'use client';

import { useState, useTransition } from 'react';
import { UserPlus, Search, Edit, Trash2, X } from 'lucide-react';
import { addUser, updateUser, deleteUser } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function UserManagementClient({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', role: 'User', permissions: 'read', status: 'Active' });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setFormData({ id: '', name: '', email: '', password: '', role: 'user', permissions: 'read', status: 'active' });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setFormData({ 
      id: user.email, 
      name: user.name, 
      email: user.email, 
      password: user.password,
      role: user.role, 
      permissions: user.permissions || (user.role?.toLowerCase() === 'admin' ? 'all' : ''), 
      status: user.status 
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (email) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    // Optimistic UI update
    setUsers(prev => prev.filter(u => u.email !== email));
    
    const result = await deleteUser(email);
    if (!result?.success) {
      alert(result?.error || 'Failed to delete user');
      // Revert if failed (in a real app you'd refetch)
      startTransition(() => router.refresh());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (isEditMode) {
      const result = await updateUser(formData);
      if (result?.success) {
        setUsers(prev => prev.map(u => u.email === formData.email ? {
          ...u, name: formData.name, email: formData.email, role: formData.role, permissions: formData.permissions, status: formData.status
        } : u));
        setIsModalOpen(false);
      } else {
        alert(result?.error || 'Failed to update user');
      }
    } else {
      const result = await addUser(formData);
      if (result?.success) {
        // Just refresh the page to get the new list from Google Sheets since ID is generated there
        startTransition(() => router.refresh());
        setIsModalOpen(false);
      } else {
        alert(result?.error || 'Failed to add user. Ensure you have set APPS_SCRIPT_URL in .env.local');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>User Management</h2>
        <button onClick={openAddModal} className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.2rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Permissions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.email}>
                  <td>-</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{ 
                      fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', 
                      borderRadius: '999px', background: user.role?.toLowerCase() === 'admin' ? '#fef08a' : '#e0e7ff',
                      color: user.role?.toLowerCase() === 'admin' ? '#854d0e' : '#3730a3', textTransform: 'uppercase'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {user.permissions || (user.role?.toLowerCase() === 'admin' ? 'all' : '-')}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                      {user.status || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={() => openEditModal(user)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(user.email)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--surface)', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '450px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{isEditMode ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              {!isEditMode && (
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="text" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Permissions</label>
                <input className="form-input" type="text" value={formData.permissions} onChange={e => setFormData({...formData, permissions: e.target.value})} placeholder="e.g. read,write or all" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={loading}>
                  {loading ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
