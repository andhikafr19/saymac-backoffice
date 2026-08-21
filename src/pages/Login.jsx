import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { loginWithSupabase } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
                type={showPassword ? 'text' : 'password'}
                required
                className="form-control"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s',
                }}
                title={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.875rem' }}
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Masuk ke Backoffice'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ 
          marginTop: '1.75rem', 
          textAlign: 'center', 
          fontSize: '0.775rem', 
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.375rem'
        }}>
          <ShieldCheck size={14} /> Autentikasi aman melalui Supabase Auth
        </div>
      </div>
    </div>
  );
}
