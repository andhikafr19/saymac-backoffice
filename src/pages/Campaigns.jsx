import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Edit2, Trash2, CheckCircle2, Eye, EyeOff, ExternalLink, ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchBackofficeCampaigns, toggleCampaignActive, deleteCampaign } from '../services/campaignService';

export default function Campaigns({ onOpenCreateModal, onOpenEditModal, showToast }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchBackofficeCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      showToast('Gagal memuat daftar banner promo', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('saymac_campaigns_updated', handleUpdate);
    return () => window.removeEventListener('saymac_campaigns_updated', handleUpdate);
  }, []);

  const handleToggle = async (campaign) => {
    try {
      const newStatus = await toggleCampaignActive(campaign.id, campaign.is_active);
      setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, is_active: newStatus } : c));
      showToast(`Banner "${campaign.title}" sekarang ${newStatus ? 'AKTIF' : 'NONAKTIF'}`, 'success');
    } catch (err) {
      showToast(`Gagal mengubah status: ${err.message}`, 'danger');
    }
  };

  const handleDelete = async (campaign) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus banner "${campaign.title}"?`)) {
      return;
    }

    try {
      await deleteCampaign(campaign.id);
      setCampaigns(prev => prev.filter(c => c.id !== campaign.id));
      showToast('Banner promo berhasil dihapus!', 'success');
    } catch (err) {
      showToast(`Gagal menghapus: ${err.message}`, 'danger');
    }
  };

  // Find active campaign for live preview
  const activeCampaign = campaigns.find(c => c.is_active) || campaigns[0];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Kelola Promo & Campaign Banner</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Atur banner seasonal, promo hampers, atau penawaran khusus di halaman utama landing web
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadData} className="btn btn-secondary" title="Refresh Data">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={onOpenCreateModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Buat Banner Baru
          </button>
        </div>
      </div>

      {/* Live Preview Box */}
      {activeCampaign && (
        <div className="card" style={{ border: '1px solid var(--border-color)', background: 'linear-gradient(180deg, rgba(33, 158, 188, 0.05) 0%, rgba(10, 15, 29, 0.2) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-gold)' }} />
              <h3 style={{ fontSize: '1.05rem' }}>Live Preview di Landing Web</h3>
              {activeCampaign.is_active ? (
                <span className="badge badge-success" style={{ marginLeft: '0.5rem' }}>Sedang Ditampilkan</span>
              ) : (
                <span className="badge badge-danger" style={{ marginLeft: '0.5rem' }}>Draft / Nonaktif</span>
              )}
            </div>
            <button
              onClick={() => onOpenEditModal(activeCampaign)}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              <Edit2 size={14} /> Edit Banner Ini
            </button>
          </div>

          {/* Banner Preview Card */}
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.9) 0%, rgba(33, 158, 188, 0.15) 100%)',
              border: '1px solid rgba(255, 183, 3, 0.2)',
              display: 'grid',
              gridTemplateColumns: '1.3fr 0.7fr',
              gap: '1.5rem',
              alignItems: 'center',
            }}
          >
            <div>
              {activeCampaign.badge_text && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 183, 3, 0.15)',
                    color: 'var(--accent-gold)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    marginBottom: '0.75rem',
                  }}
                >
                  {activeCampaign.badge_text}
                </div>
              )}
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
                {activeCampaign.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                {activeCampaign.description || 'Tidak ada deskripsi.'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  className="btn btn-primary"
                  style={{ pointerEvents: 'none', display: 'inline-flex', gap: '6px', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  {activeCampaign.cta_text || 'Pesan Sekarang'} <ShoppingBag size={14} />
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Aksi: <code style={{ color: 'var(--accent-cyan)' }}>{activeCampaign.cta_link || 'catalog'}</code>
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={activeCampaign.image_url || '/images/balado_jeruk_1.jpg'}
                alt={activeCampaign.title}
                style={{
                  maxWidth: '180px',
                  maxHeight: '180px',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'cover',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  border: '2px solid rgba(255,255,255,0.1)',
                }}
                onError={(e) => { e.target.src = '/images/balado_jeruk_1.jpg'; }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Daftar Semua Campaign & Promo ({campaigns.length})</h3>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
            <div>Memuat data campaign...</div>
          </div>
        ) : campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--accent-gold)' }} />
            <div>Belum ada banner promo yang dibuat.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {campaigns.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* Thumbnail & Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
                  <img
                    src={c.image_url || '/images/balado_jeruk_1.jpg'}
                    alt={c.title}
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 'var(--radius-sm)',
                      objectFit: 'cover',
                      border: '1px solid var(--border-color)',
                      flexShrink: 0,
                    }}
                    onError={(e) => { e.target.src = '/images/balado_jeruk_1.jpg'; }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>{c.title}</span>
                      {c.is_active ? (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Aktif</span>
                      ) : (
                        <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>Nonaktif</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Badge: <span style={{ color: 'var(--accent-gold)' }}>{c.badge_text || '-'}</span> | CTA: <span style={{ color: 'var(--accent-cyan)' }}>{c.cta_text} ({c.cta_link})</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleToggle(c)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    title={c.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {c.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{c.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span>
                  </button>

                  <button
                    onClick={() => onOpenEditModal(c)}
                    className="btn-icon"
                    title="Edit Banner"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(c)}
                    className="btn-icon"
                    title="Hapus Banner"
                    style={{ color: 'var(--status-danger)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
