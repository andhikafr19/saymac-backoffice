import React, { useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, Key, RefreshCw, Sparkles, ExternalLink, Phone, ShieldCheck, Server } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export default function Settings({ showToast, setCurrentPage }) {
  const [testing, setTesting] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);

  const testConnection = async () => {
    setTesting(true);
    setDbStatus(null);

    if (!isSupabaseConfigured || !supabase) {
      setDbStatus({
        success: false,
        message: 'Variabel lingkungan VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum dikonfigurasi pada file .env.'
      });
      setTesting(false);
      return;
    }

    try {
      // Test query to products table
      const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
      if (error) throw error;

      // Test storage bucket
      await supabase.storage.getBucket('product-images');

      setDbStatus({
        success: true,
        message: 'Koneksi ke Supabase Database PostgreSQL & Storage Bucket `product-images` BERHASIL!',
        details: `Tabel public.products terdeteksi aktif. Total baris: ${data || 0}`
      });
      if (showToast) showToast('Koneksi Supabase Terverifikasi!', 'success');
    } catch (err) {
      setDbStatus({
        success: false,
        message: `Gagal menghubungkan ke Supabase: ${err.message || 'Periksa RLS Policy atau credentials.'}`
      });
      if (showToast) showToast('Gagal terhubung ke Supabase DB', 'danger');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem' }}>Pengaturan System & Koneksi Database</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Status integrasi Supabase PostgreSQL, Storage Bucket, dan konfigurasi environment
        </p>
      </div>

      {/* Card 1: Connection Status Diagnostic */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(76, 201, 240, 0.12)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Status Koneksi Supabase DB & Storage</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Status integrasi data real-time dengan landing page `saymac-web`
              </div>
            </div>
          </div>

          <button onClick={testConnection} className="btn btn-primary" disabled={testing}>
            <RefreshCw size={16} className={testing ? 'animate-spin' : ''} /> 
            <span>{testing ? 'Menguji...' : 'Uji Koneksi DB'}</span>
          </button>
        </div>

        {/* Current status pill */}
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: isSupabaseConfigured ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.875rem'
        }}>
          {isSupabaseConfigured ? (
            <CheckCircle2 size={22} style={{ color: 'var(--status-success)', flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertTriangle size={22} style={{ color: 'var(--status-warning)', flexShrink: 0, marginTop: '2px' }} />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isSupabaseConfigured ? 'var(--status-success)' : 'var(--status-warning)' }}>
              {isSupabaseConfigured ? 'Supabase Credentials Terpasang Aktif' : 'Kredensial Supabase Belum Terpasang'}
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem', wordBreak: 'break-all' }}>
              {isSupabaseConfigured 
                ? `Endpoint URL: ${import.meta.env.VITE_SUPABASE_URL}` 
                : 'Variabel lingkungan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY belum diisi pada file .env.'}
            </div>
          </div>
        </div>

        {dbStatus && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: dbStatus.success ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
            border: `1px solid ${dbStatus.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            fontSize: '0.85rem'
          }}>
            <strong style={{ color: dbStatus.success ? 'var(--status-success)' : 'var(--status-danger)' }}>
              {dbStatus.message}
            </strong>
            {dbStatus.details && (
              <div style={{ marginTop: '0.375rem', color: 'var(--text-main)', fontSize: '0.8rem' }}>
                {dbStatus.details}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card 2: Environment setup guide */}
      <div className="card">
        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Key size={18} style={{ color: 'var(--accent-gold)' }} />
          Cara Menghubungkan Supabase Produksi
        </h3>
        <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
          <li>
            Buka file <code style={{ color: 'var(--accent-gold)', background: 'rgba(255,183,3,0.1)', padding: '2px 6px', borderRadius: '4px' }}>.env</code> pada direktori <code style={{ color: 'var(--accent-gold)', background: 'rgba(255,183,3,0.1)', padding: '2px 6px', borderRadius: '4px' }}>saymac-backoffice</code> (salin dari <code style={{ color: 'var(--accent-gold)', background: 'rgba(255,183,3,0.1)', padding: '2px 6px', borderRadius: '4px' }}>.env.example</code>).
          </li>
          <li>
            Isi variabel <code style={{ color: 'var(--accent-gold)', background: 'rgba(255,183,3,0.1)', padding: '2px 6px', borderRadius: '4px' }}>VITE_SUPABASE_URL</code> dan <code style={{ color: 'var(--accent-gold)', background: 'rgba(255,183,3,0.1)', padding: '2px 6px', borderRadius: '4px' }}>VITE_SUPABASE_ANON_KEY</code> dengan Project URL & Public Anon Key dari Supabase Project Settings.
          </li>
          <li>
            Jalankan script <code style={{ color: 'var(--accent-gold)', background: 'rgba(255,183,3,0.1)', padding: '2px 6px', borderRadius: '4px' }}>supabase_setup.sql</code> yang berada di folder <code style={{ color: 'var(--accent-gold)', background: 'rgba(255,183,3,0.1)', padding: '2px 6px', borderRadius: '4px' }}>saymac-web/supabase_setup.sql</code> pada SQL Editor Supabase untuk membuat tabel <code style={{ color: 'var(--accent-gold)' }}>products</code>, <code style={{ color: 'var(--accent-gold)' }}>campaigns</code>, <code style={{ color: 'var(--accent-gold)' }}>store_settings</code>, dan Storage Bucket <code style={{ color: 'var(--accent-gold)' }}>product-images</code>.
          </li>
        </ol>
      </div>

      {/* Card 3: CMS Quick Navigation */}
      {setCurrentPage && (
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 183, 3, 0.05)', borderColor: 'rgba(255, 183, 3, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'rgba(255, 183, 3, 0.15)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Ingin Mengatur Nomor WhatsApp & Kontak Toko?</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Informasi kontak, jam operasional, dan lokasi outlet kini telah dipindahkan ke menu khusus <strong>Kontak & Info Toko</strong>.
              </div>
            </div>
          </div>
          <button 
            onClick={() => setCurrentPage('contact')} 
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
          >
            <span>Buka CMS Kontak</span>
            <ExternalLink size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
