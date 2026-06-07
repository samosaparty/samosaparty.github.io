'use client';

import { useEffect, useState } from 'react';
import { fetchUsers } from '@/lib/auth';
import UserManagementClient from './UserManagementClient';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchUsers();
        setUsers(data || []);
      } catch (error) {
        console.error('Failed to load users', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</div>;
  }

  return (
    <div>
      <UserManagementClient initialUsers={users} />
    </div>
  );
}
