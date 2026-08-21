import React, { useState, useEffect } from 'react';
import { Package, Eye, Star, Tags, Plus, Sparkles, RefreshCw, ArrowUpRight } from 'lucide-react';
import StatCard from '../components/StatCard';
import { fetchBackofficeProducts, toggleProductActive, getPriceDisplay } from '../services/backofficeService';

export default function Dashboard({ setCurrentPage, onOpenCreateModal, onOpenEditModal, showToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await fetchBackofficeProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active !== false && p.stok_tampil !== false).length;
  const featuredProducts = products.filter(p => p.is_featured || p.unggulan).length;
  const totalCategories = new Set(products.map(p => p.category || p.kategori || 'General')).size;

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const newStatus = await toggleProductActive(id, currentStatus);
      setProducts(prev => prev.map(p => String(p.id) === String(id) ? { ...p, is_active: newStatus } : p));
      showToast(`Status produk berhasil diubah menjadi ${newStatus ? 'Aktif' : 'Non-aktif'}`, 'success');
    } catch (err) {
      showToast(`Gagal mengubah status: ${err.message}`, 'danger');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(28, 37, 65, 0.9), rgba(11, 19, 43, 0.95))',
        borderLeft: '4px solid var(--accent-gold)',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Selamat Datang di Backoffice Say Macaroni 🍿</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Kelola katalog camilan, level pedas (0–5), penyesuaian harga dinamis, dan produk unggulan website.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadDashboardData} className="btn btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Data
          </button>
          <button onClick={onOpenCreateModal} className="btn btn-primary">
            <Plus size={18} /> Tambah Produk Baru
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="stat-grid">
        <StatCard
          title="Total Produk Katalog"
          value={loading ? '...' : totalProducts}
          subtitle="Variasi produk terdaftar"
          icon={Package}
          color="var(--accent-gold)"
        />
        <StatCard
          title="Produk Tampil di FE"
          value={loading ? '...' : activeProducts}
          subtitle={`${totalProducts ? Math.round((activeProducts / totalProducts) * 100) : 0}% terpublikasi`}
          icon={Eye}
          color="var(--status-success)"
        />
        <StatCard
          title="Produk Unggulan"
          value={loading ? '...' : featuredProducts}
          subtitle="Tampil di banner home"
          icon={Star}
          color="var(--accent-cyan)"
        />
        <StatCard
          title="Kategori Produk"
          value={loading ? '...' : totalCategories}
          subtitle="Klasifikasi varian rasa"
          icon={Tags}
          color="var(--accent-orange)"
        />
      </div>

      {/* Main Section: Recent Products Table & Quick Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '1.5rem' }}>
        
        {/* Left: Product Table */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Daftar Produk Terbaru</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ringkasan varian rasa dan status publikasi di website landing
              </div>
            </div>
            <button 
              onClick={() => setCurrentPage('products')} 
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              Lihat Semua ({totalProducts}) <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Kategori</th>
                  <th>Kisaran Harga</th>
                  <th>Level Pedas</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Memuat data produk...</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Belum ada produk. Klik Tambah Produk Baru.</td>
                  </tr>
                ) : (
                  products.slice(0, 5).map(p => {
                    const priceText = getPriceDisplay(p);
                    const levels = p.spicy_levels || p.level_pedas || [0,1,2,3,4,5];
                    const isActive = p.is_active !== false && p.stok_tampil !== false;
                    const img = (Array.isArray(p.images) && p.images[0]) || (Array.isArray(p.foto) && p.foto[0]) || '/images/placeholder.svg';

                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="product-cell">
                            <img 
                              src={img} 
                              alt={p.name || p.nama} 
                              className="product-img-thumb" 
                              onError={(e) => { 
                                e.target.onerror = null; 
                                e.target.src = '/images/placeholder.svg'; 
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: 600 }}>{p.name || p.nama}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {p.flavor_variant || p.varian_rasa} • {p.weight || p.berat || '150g'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-info">{p.category || p.kategori || 'General'}</span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                          {priceText}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {levels.map(l => (
                              <span key={l} className="spicy-pill">{l}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() => handleToggleActive(p.id, isActive)}
                            />
                            <span className="slider"></span>
                          </label>
                        </td>
                        <td>
                          <button 
                            onClick={() => onOpenEditModal(p)} 
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Info Sidebar Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Quick Guide */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem', color: 'var(--accent-gold)' }}>
              <Sparkles size={20} />
              <h4 style={{ fontSize: '0.975rem' }}>Petunjuk Cepat CMS</h4>
            </div>
            <ul style={{ paddingLeft: '1.1rem', fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--text-main)' }}>Matriks Harga Pedas:</strong> Anda bisa menetapkan harga beda per level (misal Level 5 lebih mahal Rp 2.000).
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--text-main)' }}>Unggulan Banner:</strong> Centang `is_featured` agar produk masuk banner pilihan di landing page `saymac-web`.
              </li>
              <li>
                <strong style={{ color: 'var(--text-main)' }}>Upload Supabase:</strong> Foto otomatis tersimpan di bucket storage Supabase `product-images`.
              </li>
            </ul>
          </div>

          {/* Quick Action Shortcut */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.1), rgba(251, 133, 0, 0.15))', border: '1px solid rgba(255, 183, 3, 0.25)' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
              Pengaturan Database
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
              Pastikan environment variables `VITE_SUPABASE_URL` terhubung ke project Supabase Say Macaroni.
            </p>
            <button 
              onClick={() => setCurrentPage('settings')} 
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '0.825rem' }}
            >
              Cek Koneksi DB
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
