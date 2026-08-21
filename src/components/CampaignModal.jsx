import React, { useState, useEffect } from 'react';
import { X, Upload, Sparkles, Image as ImageIcon, Link as LinkIcon, Check } from 'lucide-react';
import { isSupabaseConfigured, uploadProductImage } from '../lib/supabase';

export default function CampaignModal({ isOpen, onClose, onSave, campaignToEdit }) {
  const [formData, setFormData] = useState({
    title: '',
    badge_text: '🌙 Edisi Khusus Ramadhan & Lebaran',
    description: '',
    image_url: '/images/balado_jeruk_1.jpg',
    cta_text: 'Pesan Hampers Sekarang',
    cta_link: 'catalog',
    is_active: true,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (campaignToEdit) {
      setFormData({
        id: campaignToEdit.id,
        title: campaignToEdit.title || '',
        badge_text: campaignToEdit.badge_text || '',
        description: campaignToEdit.description || '',
        image_url: campaignToEdit.image_url || '/images/balado_jeruk_1.jpg',
        cta_text: campaignToEdit.cta_text || 'Lihat Promo',
        cta_link: campaignToEdit.cta_link || 'catalog',
        is_active: campaignToEdit.is_active !== undefined ? campaignToEdit.is_active : true,
      });
    } else {
      setFormData({
        title: '',
        badge_text: '🔥 Promo Spesial',
        description: '',
        image_url: '/images/garlic_butter_1.jpg',
        cta_text: 'Lihat Promo Sekarang',
        cta_link: 'catalog',
        is_active: true,
      });
    }
    setUploadError('');
  }, [campaignToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Hanya file gambar (JPG, PNG, WebP) yang diizinkan.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran gambar maksimal 5MB.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      if (isSupabaseConfigured) {
        const publicUrl = await uploadProductImage(file);
        setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      } else {
        // Create local object URL for preview if offline
        const localPreview = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, image_url: localPreview }));
      }
    } catch (err) {
      setUploadError(err.message || 'Gagal mengunggah foto.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Judul banner wajib diisi!');
      return;
    }
    onSave(formData);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 10, 20, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          border: '1px solid var(--border-color)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} style={{ color: 'var(--accent-gold)' }} />
              {campaignToEdit ? 'Edit Campaign Banner' : 'Tambah Campaign Banner Baru'}
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Atur banner promosi tematik seasonal di landing page
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Badge & Status Aktif */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Label Badge / Tag</label>
              <input
                type="text"
                name="badge_text"
                value={formData.badge_text}
                onChange={handleChange}
                placeholder="Contoh: 🌙 Edisi Khusus Ramadhan"
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Status Tampil</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent-gold)' }}
                />
                <span style={{ fontWeight: 600, color: formData.is_active ? 'var(--status-success)' : 'var(--text-muted)' }}>
                  {formData.is_active ? 'Aktif (Ditampilkan)' : 'Draft (Disembunyikan)'}
                </span>
              </label>
            </div>
          </div>

          {/* Judul Banner */}
          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Judul Promo / Headline *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Say Macaroni Hampers Pack"
              className="form-input"
              style={{ width: '100%' }}
              required
            />
          </div>

          {/* Deskripsi Promo */}
          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Deskripsi Promo</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan detail promo, isi paket hampers, atau diskon khusus..."
              className="form-input"
              rows={3}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Foto Banner Promo */}
          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Foto Produk Promo / Banner</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)',
                flexShrink: 0
              }}>
                <img
                  src={formData.image_url || '/images/balado_jeruk_1.jpg'}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = '/images/balado_jeruk_1.jpg'; }}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="URL Foto atau path: /images/..."
                  className="form-input"
                  style={{ width: '100%', fontSize: '0.825rem' }}
                />
                <label className="btn btn-secondary" style={{ width: 'fit-content', fontSize: '0.8rem', padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
                  <Upload size={14} />
                  <span>{isUploading ? 'Mengunggah...' : 'Unggah File Gambar'}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={isUploading} />
                </label>
              </div>
            </div>
            {uploadError && <div style={{ color: 'var(--status-danger)', fontSize: '0.8rem', marginTop: '0.35rem' }}>{uploadError}</div>}
          </div>

          {/* CTA Text & Link */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Teks Tombol (CTA)</label>
              <input
                type="text"
                name="cta_text"
                value={formData.cta_text}
                onChange={handleChange}
                placeholder="Contoh: Pesan Hampers Sekarang"
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Tujuan Link CTA</label>
              <input
                type="text"
                name="cta_link"
                value={formData.cta_link}
                onChange={handleChange}
                placeholder="contoh: catalog, contact, atau https://wa.me/..."
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={16} /> Simpan Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
