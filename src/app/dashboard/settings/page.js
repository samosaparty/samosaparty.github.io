import { Settings, Shield, Bell, Key } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>System Settings</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 250px) 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ padding: '1rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Settings size={18} /> General Settings
          </div>
          <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', border: '1px solid var(--border)' }}>
            <Shield size={18} color="var(--text-muted)" /> Security
          </div>
          <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', border: '1px solid var(--border)' }}>
            <Bell size={18} color="var(--text-muted)" /> Notifications
          </div>
          <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', border: '1px solid var(--border)' }}>
            <Key size={18} color="var(--text-muted)" /> API Keys
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>General Settings</h3>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Platform Name</label>
            <input type="text" className="form-input" defaultValue="Admin Analysis" />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Support Email</label>
            <input type="email" className="form-input" defaultValue="admin@example.com" />
          </div>

          <div className="form-group" style={{ marginTop: '2.5rem' }}>
            <label className="form-label">Maintenance Mode</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>When enabled, only administrators can log in to the platform.</p>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
              <span style={{ fontWeight: 500 }}>Enable Maintenance Mode</span>
            </label>
          </div>

          <button className="btn-primary" style={{ width: 'auto', marginTop: '2.5rem', padding: '0.75rem 2rem' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
