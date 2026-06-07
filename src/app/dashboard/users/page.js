import { fetchUsers } from '@/lib/auth';
import UserManagementClient from './UserManagementClient';

export default async function UsersPage() {
  let users = [];
  try {
    users = await fetchUsers();
  } catch (error) {
    console.error('Failed to load users', error);
  }

  return (
    <div>
      <UserManagementClient initialUsers={users} />
    </div>
  );
}
