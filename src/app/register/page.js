'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    setLoading(true);

    // In a fully functional app, this would call a server action that securely 
    // appends a row to the Google Sheet via a Google Cloud Service Account.
    // For this demo, we simulate a request.
    setTimeout(() => {
      setLoading(false);
      setStatus('Registration request submitted! An admin will review and add you to the system.');
    }, 1500);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create an Account</h1>
          <p>Request access to Samosa Party</p>
        </div>

        {status && (
          <div style={{
            background: '#dcfce7', color: '#16a34a', padding: '0.75rem', 
            borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem',
            border: '1px solid #bbf7d0', textAlign: 'center'
          }}>
            {status}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input 
              className="form-input" 
              type="text" 
              id="name" 
              name="name" 
              required 
              placeholder="John Doe"
            />
          </div>

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
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Submitting...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
