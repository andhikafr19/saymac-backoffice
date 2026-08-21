import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Flame, 
  Star, 
  Eye, 
  EyeOff, 
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { 
  fetchBackofficeProducts, 
  toggleProductActive, 
  toggleProductFeatured, 
  deleteProduct,
  getPriceDisplay 
} from '../services/backofficeService';

export default function Products({ onOpenCreateModal, onOpenEditModal, showToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchBackofficeProducts();
      setProducts(data);
    } catch (err) {
      showToast(`Gagal memuat produk: ${err.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const newStatus = await toggleProductActive(id, currentStatus);
      setProducts(prev => prev.map(p => String(p.id) === String(id) ? { ...p, is_active: newStatus } : p));
      showToast(`Status publikasi produk diperbarui: ${newStatus ? 'Tampil' : 'Sembunyi'}`, 'success');
    } catch (err) {
      showToast(`Gagal mengubah status: ${err.message}`, 'danger');
    }
  };

  const handleToggleFeatured = async (id, currentFeaturedStatus) => {
    try {
      const newStatus = await toggleProductFeatured(id, currentFeaturedStatus);
      setProducts(prev => prev.map(p => String(p.id) === String(id) ? { ...p, is_featured: newStatus } : p));
      showToast(`Produk ${newStatus ? 'ditambahkan ke' : 'dihapus dari'} Banner Unggulan`, 'success');
    } catch (err) {
      showToast(`Gagal mengubah status unggulan: ${err.message}`, 'danger');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => String(p.id) !== String(id)));
      setDeleteConfirmId(null);
      showToast('Produk berhasil dihapus dari katalog', 'warning');
    } catch (err) {
      showToast(`Gagal menghapus produk: ${err.message}`, 'danger');
    }
  };

  // Filter products by search term, category, status
  const filteredProducts = products.filter(p => {
    const nameStr = (p.name || p.nama || '').toLowerCase();
    const flavorStr = (p.flavor_variant || p.varian_rasa || '').toLowerCase();
    const catStr = (p.category || p.kategori || 'General').toLowerCase();
    const matchesSearch = nameStr.includes(searchTerm.toLowerCase()) || flavorStr.includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || (p.category || p.kategori || 'General') === selectedCategory;
    
    const isActive = p.is_active !== false && p.stok_tampil !== false;
    const isFeatured = Boolean(p.is_featured || p.unggulan);

    let matchesStatus = true;
    if (selectedStatus === 'ACTIVE') matchesStatus = isActive;
    if (selectedStatus === 'INACTIVE') matchesStatus = !isActive;
    if (selectedStatus === 'FEATURED') matchesStatus = isFeatured;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categoriesList = Array.from(new Set(products.map(p => p.category || p.kategori || 'General')));

  return (
    <div className="animate-fade-in">
      {/* Header Actions Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Kelola Katalog Produk</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Total {products.length} varian produk terdaftar di database Say Macaroni
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadProducts} className="btn btn-secondary">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={onOpenCreateModal} className="btn btn-primary">
            <Plus size={18} /> Tambah Produk Baru
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
          
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Cari nama produk, varian rasa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <select
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">Semua Kategori</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <select
              className="form-control"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif (Tampil FE)</option>
              <option value="INACTIVE">Non-Aktif (Sembunyi)</option>
              <option value="FEATURED">Unggulan Banner</option>
            </select>
          </div>

        </div>
      </div>

      {/* Products Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Foto & Produk</th>
              <th>Kategori</th>
              <th>Harga Dinamis</th>
              <th>Pilihan Level</th>
              <th>Unggulan</th>
              <th>Tampil FE</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                  Memuat daftar produk dari database...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Tidak ada produk yang sesuai dengan kriteria pencarian/filter.
                </td>
              </tr>
            ) : (
              filteredProducts.map(p => {
                const priceText = getPriceDisplay(p);
                const levels = p.spicy_levels || p.level_pedas || [0,1,2,3,4,5];
                const isActive = p.is_active !== false && p.stok_tampil !== false;
                const isFeatured = Boolean(p.is_featured || p.unggulan);
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
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.name || p.nama}</div>
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                            Varian: <strong style={{ color: 'var(--accent-gold)' }}>{p.flavor_variant || p.varian_rasa}</strong> • {p.weight || p.berat || '150g'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            slug: /{p.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{p.category || p.kategori || 'General'}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '0.95rem' }}>
                        {priceText}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '140px' }}>
                        {levels.map(l => (
                          <span key={l} className="spicy-pill">{l}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleFeatured(p.id, isFeatured)}
                        style={{
                          background: isFeatured ? 'rgba(255, 183, 3, 0.2)' : 'var(--bg-input)',
                          border: isFeatured ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                          color: isFeatured ? 'var(--accent-gold)' : 'var(--text-muted)',
                          padding: '0.35rem 0.625rem',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          fontSize: '0.775rem',
                          fontWeight: 600
                        }}
                        title="Klik untuk ubah status banner unggulan"
                      >
                        <Star size={14} style={{ fill: isFeatured ? 'var(--accent-gold)' : 'none' }} />
                        {isFeatured ? 'Ya' : 'Tidak'}
                      </button>
                    </td>
                    <td>
                      <label className="switch" title="Sembunyikan atau tampilkan di website">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => handleToggleActive(p.id, isActive)}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                          onClick={() => onOpenEditModal(p)} 
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                        >
                          <Edit3 size={15} /> Edit
                        </button>
                        
                        {deleteConfirmId === p.id ? (
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button 
                              onClick={() => handleDelete(p.id)} 
                              className="btn btn-danger"
                              style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Ya, Hapus
                            </button>
                            <button 
                              onClick={() => setDeleteConfirmId(null)} 
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeleteConfirmId(p.id)} 
                            className="btn-icon"
                            style={{ width: 34, height: 34, color: 'var(--status-danger)' }}
                            title="Hapus Produk"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
