import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Instagram, 
  Mail, 
  Clock, 
  MapPin, 
  Save, 
  Check, 
  ExternalLink, 
  MessageSquare,
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';
import { fetchStoreSettings, updateStoreSettings, DEFAULT_STORE_SETTINGS } from '../services/storeService';

export default function Contacts({ showToast }) {
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
        if (showToast) showToast('Gagal memuat data kontak toko', 'danger');
      } finally {
        setLoadingStore(false);
      }
    }
    loadSettings();
  }, [showToast]);

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
      if (showToast) {
        showToast('Informasi Kontak & Toko berhasil disimpan dan disinkronkan!', 'success');
      }
    } catch (err) {
      if (showToast) {
        showToast(`Gagal menyimpan kontak: ${err.message}`, 'danger');
      }
    } finally {
      setSavingStore(false);
    }
  };

  const cleanWhatsapp = (storeData.whatsapp_number || '').replace(/[^0-9]/g, '');

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Phone style={{ color: 'var(--accent-gold)' }} size={24} />
            CMS Kontak & Informasi Toko
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Kelola nomor WhatsApp pemesanan, akun sosial media, jam buka outlet, dan alamat toko
          </p>
        </div>

        {/* Sync Info Pill */}
        <div style={{
          padding: '0.5rem 0.875rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(76, 201, 240, 0.12)',
          border: '1px solid rgba(76, 201, 240, 0.25)',
          color: 'var(--accent-cyan)',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <Sparkles size={15} />
          <span>Tersinkronisasi ke Web Publik</span>
        </div>
      </div>

      <form onSubmit={handleSaveStore} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Section 1: WhatsApp Checkout & CS */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Nomor WhatsApp Pemesanan (Checkout Utama)</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Target penerima pesan saat pelanggan melakukan checkout keranjang belanja di web
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label className="form-label">
                Nomor WhatsApp Admin (Format 62...) <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <div className="input-group">
                <span className="input-group-addon">+</span>
                <input
                  type="text"
                  name="whatsapp_number"
                  value={storeData.whatsapp_number || ''}
                  onChange={handleStoreChange}
                  placeholder="Contoh: 6285797987872"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-hint" style={{ justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span>Format angka internasional tanpa tanda '+' atau '08' di awal</span>
                {cleanWhatsapp && (
                  <a 
                    href={`https://wa.me/${cleanWhatsapp}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}
                  >
                    <ExternalLink size={12} /> Tes Chat WA
                  </a>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">
                Tampilan Format Nomor di UI Web
              </label>
              <input
                type="text"
                name="whatsapp_display"
                value={storeData.whatsapp_display || ''}
                onChange={handleStoreChange}
                placeholder="Contoh: +62 857-9798-7872"
                className="form-input"
              />
              <div className="form-hint">
                Format yang dilihat pengunjung di kontak footer & halaman web
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Media Sosial & Email */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(255, 183, 3, 0.15)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Instagram size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Media Sosial & Email Resmi</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Tautan profil Instagram dan alamat email resmi untuk korespondensi
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label className="form-label">
                Instagram Username & Tautan
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  type="text"
                  name="instagram_handle"
                  value={storeData.instagram_handle || ''}
                  onChange={handleStoreChange}
                  placeholder="Contoh: @saymacaroni"
                  className="form-input"
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    name="instagram_url"
                    value={storeData.instagram_url || ''}
                    onChange={handleStoreChange}
                    placeholder="https://instagram.com/saymacaroni"
                    className="form-input"
                    style={{ fontSize: '0.85rem' }}
                  />
                  {storeData.instagram_url && (
                    <a
                      href={storeData.instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '0 0.875rem', flexShrink: 0 }}
                      title="Buka Instagram"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
              <div className="form-hint">
                Username dan link akun resmi Instagram Say Macaroni
              </div>
            </div>

            <div>
              <label className="form-label">
                Email Resmi Toko
              </label>
              <div className="input-with-icon">
                <span className="input-icon-prefix">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  name="email_address"
                  value={storeData.email_address || ''}
                  onChange={handleStoreChange}
                  placeholder="Contoh: hello@saymacaroni.com"
                  className="form-input"
                />
              </div>
              <div className="form-hint">
                Email kontak yang tertera pada bagian customer service & footer
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Jam Operasional */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(76, 201, 240, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Jam Operasional & Waktu Layanan</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Waktu pemrosesan pesanan dan jam buka toko untuk pelanggan
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label className="form-label">
                Jam Operasional Hari Kerja (Weekdays)
              </label>
              <div className="input-with-icon">
                <span className="input-icon-prefix">
                  <Calendar size={16} />
                </span>
                <input
                  type="text"
                  name="operational_weekdays"
                  value={storeData.operational_weekdays || ''}
                  onChange={handleStoreChange}
                  placeholder="Contoh: Senin - Sabtu: 09:00 - 21:00 WIB"
                  className="form-input"
                />
              </div>
              <div className="form-hint">
                Jadwal buka reguler Senin hingga Sabtu
              </div>
            </div>

            <div>
              <label className="form-label">
                Jam Operasional Akhir Pekan / Hari Libur
              </label>
              <div className="input-with-icon">
                <span className="input-icon-prefix">
                  <Clock size={16} />
                </span>
                <input
                  type="text"
                  name="operational_weekends"
                  value={storeData.operational_weekends || ''}
                  onChange={handleStoreChange}
                  placeholder="Contoh: Minggu / Hari Libur: 10:00 - 17:00 WIB"
                  className="form-input"
                />
              </div>
              <div className="form-hint">
                Jadwal khusus untuk hari Minggu atau tanggal merah nasional
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Alamat Fisik & Google Maps */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--status-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Alamat Fisik Toko & Lokasi Google Maps</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Alamat toko offline / pickup point dan tautan penunjuk arah Google Maps
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="form-label">
                Alamat Lengkap Outlet / Toko
              </label>
              <textarea
                name="store_address"
                value={storeData.store_address || ''}
                onChange={handleStoreChange}
                placeholder="Masukkan alamat lengkap toko (nama jalan, gedung, blok, RT/RW, kelurahan, kota, kode pos)..."
                className="form-input"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div>
              <label className="form-label">
                Tautan / Link Google Maps
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="url"
                  name="maps_url"
                  value={storeData.maps_url || ''}
                  onChange={handleStoreChange}
                  placeholder="Contoh: https://maps.google.com/..."
                  className="form-input"
                />
                {storeData.maps_url && (
                  <a
                    href={storeData.maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '0 1rem', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <ExternalLink size={16} />
                    <span>Buka Maps</span>
                  </a>
                )}
              </div>
              <div className="form-hint">
                Link navigasi titik lokasi Google Maps untuk kemudahan rute pelanggan
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={16} style={{ color: 'var(--accent-gold)' }} />
            <span>Perubahan akan otomatis terupdate di website publik secara real-time.</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={savingStore || loadingStore}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
          >
            {savingStore ? (
              <>
                <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid #0b132b', borderTopColor: 'transparent', borderRadius: '50%' }} />
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Simpan Informasi Kontak</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
