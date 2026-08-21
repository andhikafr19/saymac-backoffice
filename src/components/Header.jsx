import React from 'react';
import { Sun, Moon, Menu, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
  dashboard: 'Dashboard Overview',
  products: 'Manajemen Katalog Produk',
  categories: 'Kategori & Klasifikasi',
  settings: 'Pengaturan System & Koneksi DB',
};

export default function Header({ currentPage, theme, toggleTheme, setMobileOpen }) {
  const { isSupabaseConfigured, isDemoMode } = useAuth();

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
          <h2 style={{ fontSize: '1.25rem' }}>{PAGE_TITLES[currentPage] || 'Backoffice CMS'}</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Kelola data produk, harga level pedas, & media Say Macaroni
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
