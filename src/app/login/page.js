'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
      const csvUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_CSV_URL;
      if (!csvUrl) {
        setError('Google Sheet URL not configured in .env.local');
        setLoading(false);
        return;
      }

      const response = await fetch(csvUrl, { cache: 'no-store' });
      if (!response.ok) {
        setError('Failed to connect to database');
        setLoading(false);
        return;
      }

      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const users = results.data;
          const user = users.find(u => u.email === email);

          if (!user || user.password !== password) {
            setError('Invalid credentials');
            setLoading(false);
            return;
          }

          if (user.status && user.status.toLowerCase() !== 'active' && user.status.trim() !== '') {
            setError('Account is not active');
            setLoading(false);
            return;
          }

          // Successfully authenticated!
          localStorage.setItem('user', JSON.stringify({
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: user.permissions || (user.role?.toLowerCase() === 'admin' ? 'all' : '')
          }));
          
          router.push('/dashboard');
        },
        error: (err) => {
          console.error(err);
          setError('Failed to parse database');
          setLoading(false);
        }
      });
      
    } catch (err) {
      console.error(err);
      setError('An error occurred during login');
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Samosa Party</h1>
        </div>

        {error && (
          <div className="auth-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input 
              className="form-input" 
              type="email" 
              id="email" 
              name="email" 
              required 
              placeholder="admin@example.com"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              className="form-input" 
              type="password" 
              id="password" 
              name="password" 
              required 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ marginTop: '1rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <a href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
