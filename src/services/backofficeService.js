import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Fetch all products for Backoffice management
 */
export async function fetchBackofficeProducts() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum terkonfigurasi pada file .env.');
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Create a new product
 */
export async function createProduct(payload) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum terkonfigurasi pada file .env.');
  }

  const slug = payload.slug || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newProduct = {
    name: payload.name,
    slug,
    flavor_variant: payload.flavor_variant || 'Original',
    spicy_levels: payload.spicy_levels || [0, 1, 2, 3, 4, 5],
    price: Number(payload.price || 0),
    level_prices: payload.level_prices || [],
    weight: payload.weight || '150g',
    is_active: payload.is_active !== undefined ? payload.is_active : true,
    description: payload.description || '',
    ingredients: payload.ingredients || '',
    images: payload.images && payload.images.length > 0 ? payload.images : ['/images/placeholder.svg'],
    category: payload.category || 'General',
    is_featured: Boolean(payload.is_featured),
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('products')
    .insert([newProduct])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing product
 */
export async function updateProduct(id, payload) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum terkonfigurasi pada file .env.');
  }

  const updateData = {
    name: payload.name,
    slug: payload.slug,
    flavor_variant: payload.flavor_variant,
    spicy_levels: payload.spicy_levels,
    price: Number(payload.price || 0),
    level_prices: payload.level_prices,
    weight: payload.weight,
    is_active: payload.is_active,
    description: payload.description,
    ingredients: payload.ingredients,
    images: payload.images,
    category: payload.category,
    is_featured: payload.is_featured,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Quick toggle active/published status
 */
export async function toggleProductActive(id, currentActiveStatus) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum terkonfigurasi pada file .env.');
  }

  const newStatus = !currentActiveStatus;
  const { error } = await supabase
    .from('products')
    .update({ is_active: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
  return newStatus;
}

/**
 * Quick toggle featured status
 */
export async function toggleProductFeatured(id, currentFeaturedStatus) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum terkonfigurasi pada file .env.');
  }

  const newStatus = !currentFeaturedStatus;
  const { error } = await supabase
    .from('products')
    .update({ is_featured: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
  return newStatus;
}

/**
 * Delete product
 */
export async function deleteProduct(id) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum terkonfigurasi pada file .env.');
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * Get category breakdown and counts
 */
export async function fetchCategoryStats() {
  const products = await fetchBackofficeProducts();
  const categoryMap = {};

  products.forEach(p => {
    const cat = p.category || 'General';
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        name: cat,
        total: 0,
        active: 0,
        featured: 0
      };
    }
    categoryMap[cat].total += 1;
    if (p.is_active) categoryMap[cat].active += 1;
    if (p.is_featured) categoryMap[cat].featured += 1;
  });

  return Object.values(categoryMap);
}

/**
 * Helper to display dynamic price range or single price
 */
export function getPriceDisplay(product) {
  if (!product) return 'Rp 0';
  const levelPrices = product.level_prices || product.harga_level;
  if (Array.isArray(levelPrices) && levelPrices.length > 0) {
    const prices = levelPrices.map(item => item.price || item.harga).filter(h => h > 0);
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice !== maxPrice) {
        return `Mulai Rp ${minPrice.toLocaleString('id-ID')}`;
      }
      return `Rp ${minPrice.toLocaleString('id-ID')}`;
    }
  }
  return `Rp ${(product.price || product.harga || 0).toLocaleString('id-ID')}`;
}
