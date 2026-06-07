'use server';

import { authenticateUser, createSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const result = await authenticateUser(email, password);

  if (!result.success) {
    return { error: result.error };
  }

  // Create JWT session token
  const token = await createSession(result.user);

  // Set HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  redirect('/dashboard');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}

// User Management CRUD Actions
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || ''; // The URL will be configured in .env.local

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

