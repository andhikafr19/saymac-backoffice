import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Settings, 
  LogOut, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Kelola Produk', icon: Package },
  { id: 'categories', label: 'Kategori Produk', icon: Tags },
  { id: 'settings', label: 'Pengaturan System', icon: Settings },
];

export default function Sidebar({ currentPage, setCurrentPage, mobileOpen, setMobileOpen }) {
  const { user, isDemoMode, logout } = useAuth();

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-logo-badge">
          S!
        </div>
        <div>
          <div className="brand-title">Say Macaroni</div>
          <div className="brand-subtitle">Backoffice CMS</div>
        </div>
      </div>

      {/* Mode Banner if Demo */}
      {isDemoMode && (
        <div style={{
          margin: '0.875rem 0.875rem 0',
          padding: '0.625rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 183, 3, 0.12)',
          border: '1px solid rgba(255, 183, 3, 0.25)',
          color: 'var(--accent-gold)',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <Sparkles size={16} />
          <span>Demo Mode (Local Data)</span>
        </div>
      )}

      {/* Menu Nav Links */}
      <nav className="sidebar-menu">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="icon" />
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && <ChevronRight size={16} />}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer User & Logout */}
      <div className="sidebar-footer">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.user_metadata?.name || user?.email || 'Admin'}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
              {isDemoMode ? 'Administrator' : 'Supabase Auth'}
            </div>
          </div>
          <button 
            onClick={logout} 
            className="btn-icon" 
            title="Keluar / Sign Out"
            style={{ flexShrink: 0, width: '36px', height: '36px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
