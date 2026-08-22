import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, Key, RefreshCw, Phone, Instagram, Mail, Clock, MapPin, Save, Check } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { fetchStoreSettings, updateStoreSettings, DEFAULT_STORE_SETTINGS } from '../services/storeService';

export default function Settings({ showToast }) {
  const [testing, setTesting] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);

  // Store contact settings state
  const [storeData, setStoreData] = useState(DEFAULT_STORE_SETTINGS);
  const [savingStore, setSavingStore] = useState(false);
  const [loadingStore, setLoadingStore] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      setLoadingStore(true);
      try {
        const data = await fetchStoreSettings();
        setStoreData(data);
      } catch (err) {
        console.error('Error loading store settings:', err);
      } finally {
        setLoadingStore(false);
      }
    }
    loadSettings();
  }, []);

  const handleStoreChange = (e) => {
    const { name, value } = e.target;
    setStoreData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    setSavingStore(true);
    try {
      await updateStoreSettings(storeData);
      showToast('Informasi Kontak & Toko berhasil diperbarui!', 'success');
    } catch (err) {
      showToast(`Gagal menyimpan kontak: ${err.message}`, 'danger');
    } finally {
      setSavingStore(false);
    }
  };

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
      showToast('Koneksi Supabase Terverifikasi!', 'success');
    } catch (err) {
      setDbStatus({
        success: false,
        message: `Gagal menghubungkan ke Supabase: ${err.message || 'Periksa RLS Policy atau credentials.'}`
      });
      showToast('Gagal terhubung ke Supabase DB', 'danger');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem' }}>Pengaturan System & Kontak Toko</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Kelola nomor WhatsApp pemesanan, jam operasional, media sosial, dan koneksi Supabase
        </p>
      </div>

      {/* Card 1: Store & Contact Information Management (Priority 2 CMS) */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(255, 183, 3, 0.12)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Informasi Kontak & Nomor WhatsApp Pemesanan</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Tersinkronisasi langsung ke Keranjang Checkout, Halaman Kontak, dan Footer landing web
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveStore} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* WhatsApp Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Nomor WhatsApp Admin (Format 62...) *
              </label>
              <input
                type="text"
                name="whatsapp_number"
                value={storeData.whatsapp_number}
                onChange={handleStoreChange}
                placeholder="Contoh: 6285797987872"
                className="form-input"
                style={{ width: '100%' }}
                required
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Link WA: <a href={`https://wa.me/${storeData.whatsapp_number}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>https://wa.me/{storeData.whatsapp_number}</a>
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Tampilan Format Nomor di UI
              </label>
              <input
                type="text"
                name="whatsapp_display"
                value={storeData.whatsapp_display}
                onChange={handleStoreChange}
                placeholder="Contoh: +62 857-9798-7872"
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Instagram & Email Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Instagram Handle & URL
              </label>
              <input
                type="text"
                name="instagram_handle"
                value={storeData.instagram_handle}
                onChange={handleStoreChange}
                placeholder="Contoh: @saymacaroni"
                className="form-input"
                style={{ width: '100%', marginBottom: '0.5rem' }}
              />
              <input
                type="text"
                name="instagram_url"
                value={storeData.instagram_url}
                onChange={handleStoreChange}
                placeholder="Contoh: https://instagram.com/saymacaroni"
                className="form-input"
                style={{ width: '100%', fontSize: '0.825rem' }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Email Resmi Toko
              </label>
              <input
                type="email"
                name="email_address"
                value={storeData.email_address}
                onChange={handleStoreChange}
                placeholder="Contoh: hello@saymacaroni.com"
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Jam Operasional Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Jam Operasional Weekdays
              </label>
              <input
                type="text"
                name="operational_weekdays"
                value={storeData.operational_weekdays}
                onChange={handleStoreChange}
                placeholder="Contoh: Senin - Sabtu: 09:00 - 21:00 WIB"
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                Jam Operasional Weekend / Hari Libur
              </label>
              <input
                type="text"
                name="operational_weekends"
                value={storeData.operational_weekends}
                onChange={handleStoreChange}
                placeholder="Contoh: Minggu / Hari Libur: 10:00 - 17:00 WIB"
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Alamat Fisik & Google Maps */}
          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
              Alamat Fisik Toko / Outlet
            </label>
            <textarea
              name="store_address"
              value={storeData.store_address}
              onChange={handleStoreChange}
              placeholder="Masukkan alamat lengkap toko..."
              className="form-input"
              rows={2}
              style={{ width: '100%', resize: 'vertical', marginBottom: '0.5rem' }}
            />
            <input
              type="text"
              name="maps_url"
              value={storeData.maps_url}
              onChange={handleStoreChange}
              placeholder="Link Google Maps (https://maps.google.com/...)"
              className="form-input"
              style={{ width: '100%', fontSize: '0.825rem' }}
            />
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingStore || loadingStore}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem' }}
            >
              <Save size={16} />
              <span>{savingStore ? 'Menyimpan...' : 'Simpan Pengaturan Kontak'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Connection Status Diagnostic */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(76, 201, 240, 0.12)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Status Koneksi Supabase</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Status integrasi data real-time dengan landing page `saymac-web`
              </div>
            </div>
          </div>

          <button onClick={testConnection} className="btn btn-primary" disabled={testing}>
            <RefreshCw size={16} className={testing ? 'animate-spin' : ''} /> Uji Koneksi DB
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
              {isSupabaseConfigured ? 'Supabase Credentials Terpasang' : 'Kredensial Supabase Belum Terpasang'}
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {isSupabaseConfigured 
                ? `URL: ${import.meta.env.VITE_SUPABASE_URL}` 
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

      {/* Card 3: Environment setup guide */}
      <div className="card">
        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Key size={18} style={{ color: 'var(--accent-gold)' }} />
          Cara Menghubungkan Supabase Produksi
        </h3>
        <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
          <li>
            Buka file <code style={{ color: 'var(--accent-gold)' }}>.env</code> pada direktori <code style={{ color: 'var(--accent-gold)' }}>saymac-backoffice</code> (salin dari <code style={{ color: 'var(--accent-gold)' }}>.env.example</code>).
          </li>
          <li>
            Isi variabel <code style={{ color: 'var(--accent-gold)' }}>VITE_SUPABASE_URL</code> dan <code style={{ color: 'var(--accent-gold)' }}>VITE_SUPABASE_ANON_KEY</code> dengan API Key dari Supabase Dashboard.
          </li>
          <li>
            Jalankan script <code style={{ color: 'var(--accent-gold)' }}>supabase_setup.sql</code> yang berada di folder <code style={{ color: 'var(--accent-gold)' }}>saymac-web/supabase_setup.sql</code> pada SQL Editor Supabase untuk membuat tabel <code style={{ color: 'var(--accent-gold)' }}>products</code>, <code style={{ color: 'var(--accent-gold)' }}>campaigns</code>, <code style={{ color: 'var(--accent-gold)' }}>store_settings</code>, dan Storage Bucket <code style={{ color: 'var(--accent-gold)' }}>product-images</code>.
          </li>
        </ol>
      </div>
    </div>
  );
}
