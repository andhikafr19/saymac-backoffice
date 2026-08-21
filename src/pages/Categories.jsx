import React, { useState, useEffect } from 'react';
import { Tags, Eye, Star, Plus } from 'lucide-react';
import { fetchCategoryStats } from '../services/backofficeService';

export default function Categories({ onOpenCreateModal }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const stats = await fetchCategoryStats();
        setCategories(stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Klasifikasi Kategori Produk</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Distribusi varian rasa dan status publikasi per kelompok kategori
          </p>
        </div>
        <button onClick={onOpenCreateModal} className="btn btn-primary">
          <Plus size={18} /> Tambah Produk Baru
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {loading ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            Memuat statistik kategori...
          </div>
        ) : categories.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            Belum ada data kategori terdaftar.
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat.name} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                    {cat.name}
                  </span>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(255, 183, 3, 0.12)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Tags size={18} />
                  </div>
                </div>

                <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
                  {cat.total} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Varian</span>
                </div>
              </div>

              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Eye size={14} style={{ color: 'var(--status-success)' }} /> {cat.active} Aktif
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Star size={14} style={{ color: 'var(--accent-gold)' }} /> {cat.featured} Featured
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
