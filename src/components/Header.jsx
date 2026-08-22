import React from 'react';
import { Sun, Moon, Menu, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PAGE_HEADERS = {
  dashboard: {
    title: 'Dashboard Overview',
    subtitle: 'Ringkasan statistik produk, varian, dan aktivitas Say Macaroni'
  },
  products: {
    title: 'Manajemen Katalog Produk',
    subtitle: 'Kelola data produk, harga level pedas, varian rasa, dan media foto'
  },
  categories: {
    title: 'Kategori & Klasifikasi',
    subtitle: 'Pengelompokan menu cemilan, best seller, dan varian keju/pedas'
  },
  campaigns: {
    title: 'Promo & Banner Campaign',
    subtitle: 'Kelola banner promosi musiman dan highlight penawaran spesial'
  },
  contact: {
    title: 'CMS Kontak & Info Toko',
    subtitle: 'Kelola nomor WhatsApp pemesanan, jam buka, dan lokasi outlet'
  },
  settings: {
    title: 'Pengaturan System & Koneksi DB',
    subtitle: 'Status koneksi Supabase PostgreSQL, Storage Bucket, dan konfigurasi API'
  },
};

export default function Header({ currentPage, theme, toggleTheme, setMobileOpen }) {
  const { isSupabaseConfigured } = useAuth();
  const currentHeader = PAGE_HEADERS[currentPage] || {
    title: 'Backoffice CMS',
    subtitle: 'Kelola data Say Macaroni'
  };

  return (
    <header className="header">
      <div className="header-title">
        <button 
          className="btn-icon" 
          onClick={() => setMobileOpen(prev => !prev)}
          style={{ display: 'none' }} // Mobile responsive toggle
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>{currentHeader.title}</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {currentHeader.subtitle}
          </div>
        </div>
      </div>

      <div className="header-actions">
        {/* DB Status Badge */}
        <div 
          className={`badge ${isSupabaseConfigured ? 'badge-success' : 'badge-warning'}`}
          style={{ padding: '0.5rem 0.875rem', fontSize: '0.8rem' }}
        >
          <Database size={14} />
          {isSupabaseConfigured ? (
            <span>Supabase Connected</span>
          ) : (
            <span>Supabase Disconnected</span>
          )}
        </div>

        {/* Theme Switcher Toggle */}
        <button 
          onClick={toggleTheme} 
          className="btn-icon"
          title={`Ganti ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
