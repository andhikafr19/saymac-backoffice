import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Flame, Image as ImageIcon, Check } from 'lucide-react';
import { isSupabaseConfigured, uploadProductImage } from '../lib/supabase';

const ALL_SPICY_LEVELS = [0, 1, 2, 3, 4, 5];
const DEFAULT_CATEGORIES = ['Best Seller', 'Classic', 'Spicy Fusion', 'Cheese Lover', 'Specialty', 'General'];

export default function ProductModal({ isOpen, onClose, onSave, productToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    flavor_variant: '',
    category: 'General',
    weight: '150g',
    price: 25000,
    spicy_levels: [0, 1, 2, 3, 4, 5],
    level_prices: [],
    description: '',
    ingredients: '',
    images: [],
    is_active: true,
    is_featured: false,
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (productToEdit) {
      const levels = Array.isArray(productToEdit.spicy_levels) && productToEdit.spicy_levels.length > 0 
        ? productToEdit.spicy_levels 
        : [0, 1, 2, 3, 4, 5];

      // Parse level_prices
      let parsedLevelPrices = [];
      if (Array.isArray(productToEdit.level_prices)) {
        parsedLevelPrices = productToEdit.level_prices.map(lp => ({
          level: Number(lp.level),
          price: Number(lp.price || lp.harga || productToEdit.price || 0)
        }));
      }

      setFormData({
        id: productToEdit.id,
        name: productToEdit.name || productToEdit.nama || '',
        slug: productToEdit.slug || '',
        flavor_variant: productToEdit.flavor_variant || productToEdit.varian_rasa || '',
        category: productToEdit.category || productToEdit.kategori || 'General',
        weight: productToEdit.weight || productToEdit.berat || '150g',
        price: Number(productToEdit.price || productToEdit.harga || 0),
        spicy_levels: levels,
        level_prices: parsedLevelPrices,
        description: productToEdit.description || productToEdit.deskripsi || '',
        ingredients: productToEdit.ingredients || productToEdit.komposisi || '',
        images: Array.isArray(productToEdit.images) ? [...productToEdit.images] : (Array.isArray(productToEdit.foto) ? [...productToEdit.foto] : []),
        is_active: productToEdit.is_active !== undefined ? productToEdit.is_active : (productToEdit.stok_tampil !== undefined ? productToEdit.stok_tampil : true),
        is_featured: productToEdit.is_featured !== undefined ? productToEdit.is_featured : Boolean(productToEdit.unggulan),
      });
    } else {
      // Default initial form
      const defaultPrice = 25000;
      setFormData({
        name: '',
        slug: '',
        flavor_variant: '',
        category: 'General',
        weight: '150g',
        price: defaultPrice,
        spicy_levels: [0, 1, 2, 3, 4, 5],
        level_prices: ALL_SPICY_LEVELS.map(lvl => ({ level: lvl, price: defaultPrice })),
        description: '',
        ingredients: '',
        images: [],
        is_active: true,
        is_featured: false,
      });
    }
    setUploadError('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (e) => {
    const newName = e.target.value;
    const generatedSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData(prev => ({
      ...prev,
      name: newName,
      slug: productToEdit ? prev.slug : generatedSlug
    }));
  };

  const handleBasePriceChange = (e) => {
    const val = Number(e.target.value);
    setFormData(prev => {
      // update level prices that haven't been manually altered or keep sync
      const updatedLevelPrices = prev.spicy_levels.map(lvl => {
        const existing = prev.level_prices.find(lp => lp.level === lvl);
        return {
          level: lvl,
          price: existing && existing.price > 0 ? existing.price : val
        };
      });
      return {
        ...prev,
        price: val,
        level_prices: updatedLevelPrices
      };
    });
  };

  const toggleSpicyLevel = (lvl) => {
    setFormData(prev => {
      const exists = prev.spicy_levels.includes(lvl);
      let newLevels;
      if (exists) {
        newLevels = prev.spicy_levels.filter(l => l !== lvl).sort((a, b) => a - b);
      } else {
        newLevels = [...prev.spicy_levels, lvl].sort((a, b) => a - b);
      }

      // Re-sync level_prices array
      const newLevelPrices = newLevels.map(l => {
        const found = prev.level_prices.find(lp => lp.level === l);
        return found || { level: l, price: prev.price };
      });

      return {
        ...prev,
        spicy_levels: newLevels,
        level_prices: newLevelPrices
      };
    });
  };

  const handleLevelPriceChange = (lvl, newPrice) => {
    setFormData(prev => {
      const updatedLevelPrices = prev.spicy_levels.map(l => {
        if (l === lvl) {
          return { level: l, price: Number(newPrice) };
        }
        const existing = prev.level_prices.find(lp => lp.level === l);
        return existing || { level: l, price: prev.price };
      });
      return {
        ...prev,
        level_prices: updatedLevelPrices
      };
    });
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()]
    }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isSupabaseConfigured) {
      setUploadError('Upload gambar langsung ke Supabase Storage memerlukan kredensial VITE_SUPABASE_URL. Anda dapat memasukkan URL gambar secara manual di bawah.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError('');
      const uploadedUrl = await uploadProductImage(file);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, uploadedUrl]
      }));
    } catch (err) {
      console.error(err);
      setUploadError(`Gagal upload: ${err.message || 'Error tidak diketahui'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(255, 183, 3, 0.15)',
              color: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Flame size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>
                {productToEdit ? 'Edit Data Produk' : 'Tambah Produk Baru'}
              </h3>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Isi informasi varian, level pedas, & matriks harga
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: 32, height: 32 }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* Row 1: Name & Slug */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nama Produk *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Say Macaroni - Garlic Butter"
                  value={formData.name}
                  onChange={handleNameChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Slug URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="say-macaroni-garlic-butter"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                />
              </div>
            </div>

            {/* Row 2: Flavor, Category, Weight */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Varian Rasa *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="Garlic Butter / Balado"
                  value={formData.flavor_variant}
                  onChange={(e) => setFormData(prev => ({ ...prev, flavor_variant: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  {DEFAULT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Berat Kemasan</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="150g"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
            </div>

            {/* Row 3: Base Price */}
            <div className="form-group">
              <label className="form-label">Harga Dasar / Mulai (Rp) *</label>
              <input
                type="number"
                required
                min="0"
                step="500"
                className="form-control"
                value={formData.price}
                onChange={handleBasePriceChange}
              />
            </div>

            {/* Spicy Levels Selection Checkboxes */}
            <div className="form-group">
              <label className="form-label">Pilihan Level Pedas Yang Tersedia</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {ALL_SPICY_LEVELS.map(lvl => {
                  const selected = formData.spicy_levels.includes(lvl);
                  return (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => toggleSpicyLevel(lvl)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: selected ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                        background: selected ? 'rgba(255, 183, 3, 0.15)' : 'var(--bg-input)',
                        color: selected ? 'var(--accent-gold)' : 'var(--text-muted)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem'
                      }}
                    >
                      <Flame size={14} style={{ color: selected ? '#ef4444' : 'inherit' }} />
                      Level {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level Prices Customization Matrix Table */}
            {formData.spicy_levels.length > 0 && (
              <div className="form-group" style={{ 
                background: 'rgba(11, 19, 43, 0.4)', 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)' 
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--accent-gold)' }}>
                  Matriks Harga Khusus Per Level Pedas
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  {formData.spicy_levels.map(lvl => {
                    const found = formData.level_prices.find(lp => lp.level === lvl);
                    const currentPrice = found ? found.price : formData.price;
                    return (
                      <div key={lvl} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Harga Level {lvl} (Rp):
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          className="form-control"
                          style={{ padding: '0.4rem 0.625rem', fontSize: '0.85rem' }}
                          value={currentPrice}
                          onChange={(e) => handleLevelPriceChange(lvl, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Product Description & Ingredients */}
            <div className="form-group">
              <label className="form-label">Deskripsi Produk</label>
              <textarea
                rows={3}
                className="form-control"
                placeholder="Tuliskan cerita singkat atau keunggulan rasa produk..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Komposisi / Bahan</label>
              <input
                type="text"
                className="form-control"
                placeholder="Makaroni gandum, minyak sawit, rempah..."
                value={formData.ingredients}
                onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
              />
            </div>

            {/* Images Upload & List Section */}
            <div className="form-group">
              <label className="form-label">Foto Produk</label>
              
              {/* Image Previews */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
                {formData.images.map((imgUrl, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      position: 'relative', 
                      width: 70, 
                      height: 70, 
                      borderRadius: 'var(--radius-md)', 
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-input)'
                    }}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Foto ${idx+1}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = '/images/placeholder.svg'; 
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{
                        position: 'absolute',
                        top: 2, right: 2,
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 'var(--radius-full)',
                        width: 20, height: 20,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload file directly or enter URL */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tempel URL Gambar (/images/garlic.jpg atau https://...)"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={handleAddImageUrl} 
                  className="btn btn-secondary"
                  style={{ flexShrink: 0 }}
                >
                  <Plus size={16} /> Tambah URL
                </button>
              </div>

              {/* Direct Supabase File Upload Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                  <Upload size={16} /> {isUploading ? 'Mengunggah...' : 'Upload dari Perangkat'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    style={{ display: 'none' }}
                  />
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Format JPG, PNG, WEBP (Otomatis masuk bucket storage `product-images`)
                </span>
              </div>
              {uploadError && (
                <div style={{ color: 'var(--status-danger)', fontSize: '0.775rem', marginTop: '0.375rem' }}>
                  {uploadError}
                </div>
              )}
            </div>

            {/* Status Switches: Active & Featured */}
            <div style={{ 
              display: 'flex', 
              gap: '2rem', 
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <span className="switch">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <span className="slider"></span>
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Tampilkan di Website (`is_active`)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <span className="switch">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  />
                  <span className="slider"></span>
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Produk Unggulan Banner (`is_featured`)</span>
              </label>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={18} /> Simpan Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
