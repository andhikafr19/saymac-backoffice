import React, { useState } from 'react';
import { Lock, Mail, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { loginWithSupabase, loginAsDemoAdmin, isSupabaseConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await loginWithSupabase(email, password);
    } catch (err) {
      setError(err.message || 'Gagal masuk. Periksa email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #1c2541, #0b132b)',
      padding: '1.5rem',
      fontFamily: 'var(--font-body)'
    }}>
      <div className="card animate-fade-in" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '2.5rem 2rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-logo-badge" style={{ margin: '0 auto 1rem', width: 56, height: 56, fontSize: '1.75rem' }}>
            S!
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Say Macaroni</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Backoffice Management System
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--status-danger-bg)',
            color: 'var(--status-danger)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Admin</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="admin@saymacaroni.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Kata Sandi</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.875rem' }}
            disabled={loading}
          >
            {loading ? 'Proses...' : 'Masuk Kebackoffice'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{
          position: 'relative',
          margin: '1.75rem 0',
          textAlign: 'center',
        }}>
          <div style={{ borderTop: '1px solid var(--border-color)', position: 'absolute', top: '50%', left: 0, right: 0 }}></div>
          <span style={{ 
            background: 'var(--bg-secondary)', 
            padding: '0 0.75rem', 
            position: 'relative', 
            fontSize: '0.775rem', 
            color: 'var(--text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase'
          }}>
            Atau
          </span>
        </div>

        {/* Demo Login Quick Button */}
        <button
          type="button"
          onClick={loginAsDemoAdmin}
          className="btn btn-secondary"
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            color: 'var(--accent-gold)',
            borderColor: 'rgba(255, 183, 3, 0.3)',
            background: 'rgba(255, 183, 3, 0.06)'
          }}
        >
          <Sparkles size={18} /> Masuk Mode Demo Admin (Uji Coba)
        </button>

        <div style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center', 
          fontSize: '0.775rem', 
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.375rem'
        }}>
          <ShieldCheck size={14} /> Terhubung dengan database Say Macaroni
        </div>
      </div>
    </div>
  );
}
