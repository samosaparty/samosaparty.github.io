import { authenticateUser } from '@/lib/auth';

export async function login(email, password) {
  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const result = await authenticateUser(email, password);

  if (!result.success) {
    return { error: result.error };
  }

  return { success: true, user: result.user };
}

// User Management CRUD Actions
const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || ''; 

export async function addUser(userData) {
  if (!APPS_SCRIPT_URL) return { success: false, error: 'APPS_SCRIPT_URL is not configured' };
  
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ADD_USER', user: userData })
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateUser(userData) {
  if (!APPS_SCRIPT_URL) return { success: false, error: 'APPS_SCRIPT_URL is not configured' };
  
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'UPDATE_USER', user: userData })
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteUser(id) {
  if (!APPS_SCRIPT_URL) return { success: false, error: 'APPS_SCRIPT_URL is not configured' };
  
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE_USER', id })
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

