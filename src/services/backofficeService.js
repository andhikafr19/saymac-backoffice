import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Seed dataset matching supabase_setup.sql for offline/demo mode
const INITIAL_DEMO_PRODUCTS = [
  {
    id: "d1a8f5b2-3c1e-4f2a-9e1d-8a5b2c1e4f3a",
    name: "Say Macaroni - Garlic Butter",
    slug: "say-macaroni-garlic-butter",
    flavor_variant: "Garlic Butter",
    spicy_levels: [0, 1, 2, 3, 4, 5],
    price: 25000,
    level_prices: [
      { level: 0, price: 25000 },
      { level: 1, price: 25000 },
      { level: 2, price: 26000 },
      { level: 3, price: 27000 },
      { level: 4, price: 28000 },
      { level: 5, price: 30000 }
    ],
    weight: "150g",
    is_active: true,
    description: "Makaroni goreng renyah berpadu dengan gurihnya mentega premium dan aroma bawang putih asli yang harum. Sangat cocok untuk menemani waktu santai Anda.",
    ingredients: "Makaroni gandum pilihan, minyak kelapa sawit, bawang putih segar, butter powder, garam, penyedap rasa nabati.",
    images: ["/images/garlic_butter_1.jpg", "/images/garlic_butter_2.jpg"],
    category: "Best Seller",
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: "d2a8f5b2-3c1e-4f2a-9e1d-8a5b2c1e4f3b",
    name: "Say Macaroni - Original Classic",
    slug: "say-macaroni-original-classic",
    flavor_variant: "Original",
    spicy_levels: [0, 1, 2, 3, 4, 5],
    price: 22000,
    level_prices: [
      { level: 0, price: 22000 },
      { level: 1, price: 22000 },
      { level: 2, price: 23000 },
      { level: 3, price: 24000 },
      { level: 4, price: 25000 },
      { level: 5, price: 27000 }
    ],
    weight: "150g",
    is_active: true,
    description: "Varian rasa klasik asin gurih alami yang disukai semua kalangan. Menggunakan garam laut premium yang memberikan rasa asin pas.",
    ingredients: "Makaroni gandum pilihan, minyak kelapa sawit, garam laut premium, penyedap rasa alami.",
    images: ["/images/original_1.jpg", "/images/original_2.jpg"],
    category: "Classic",
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: "d3a8f5b2-3c1e-4f2a-9e1d-8a5b2c1e4f3c",
    name: "Say Macaroni - Balado Daun Jeruk",
    slug: "say-macaroni-balado-daun-jeruk",
    flavor_variant: "Balado",
    spicy_levels: [1, 2, 3, 4, 5],
    price: 26000,
    level_prices: [
      { level: 1, price: 26000 },
      { level: 2, price: 26000 },
      { level: 3, price: 28000 },
      { level: 4, price: 29000 },
      { level: 5, price: 31000 }
    ],
    weight: "150g",
    is_active: true,
    description: "Perpaduan rasa manis, asam, dan pedas khas bumbu Balado yang diracik khusus dengan irisan daun jeruk segar.",
    ingredients: "Makaroni gandum, minyak kelapa sawit, bubuk cabai merah asli, gula, garam, ekstrak daun jeruk purut segar.",
    images: ["/images/balado_jeruk_1.jpg"],
    category: "Spicy Fusion",
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: "d4a8f5b2-3c1e-4f2a-9e1d-8a5b2c1e4f3d",
    name: "Say Macaroni - Keju Premium",
    slug: "say-macaroni-keju-premium",
    flavor_variant: "Keju",
    spicy_levels: [0, 1, 2, 3],
    price: 27000,
    level_prices: [
      { level: 0, price: 27000 },
      { level: 1, price: 27000 },
      { level: 2, price: 28000 },
      { level: 3, price: 29000 }
    ],
    weight: "150g",
    is_active: true,
    description: "Makaroni gurih berselimut bubuk keju cheddar premium yang tebal dan creamy.",
    ingredients: "Makaroni gandum, minyak kelapa sawit, bubuk keju cheddar impor, whey powder, garam.",
    images: ["/images/keju_premium_1.jpg"],
    category: "Cheese Lover",
    is_featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: "d5a8f5b2-3c1e-4f2a-9e1d-8a5b2c1e4f3e",
    name: "Say Macaroni - Salted Egg Creamy",
    slug: "say-macaroni-salted-egg-creamy",
    flavor_variant: "Salted Egg",
    spicy_levels: [0, 1, 2, 3],
    price: 28000,
    level_prices: [
      { level: 0, price: 28000 },
      { level: 1, price: 28000 },
      { level: 2, price: 29500 },
      { level: 3, price: 31000 }
    ],
    weight: "150g",
    is_active: true,
    description: "Saus telur asin asli yang creamy dan gurih berpadu dengan daun kari segar dan sedikit cabai.",
    ingredients: "Makaroni gandum, minyak kelapa sawit, kuning telur asin asli bubuk, susu bubuk, daun kari segar, garam.",
    images: ["/images/salted_egg_1.jpg"],
    category: "Specialty",
    is_featured: false,
    created_at: new Date().toISOString()
  }
];

function getDemoProducts() {
  const stored = localStorage.getItem('saymac_backoffice_products');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // invalid json fallback
    }
  }
  localStorage.setItem('saymac_backoffice_products', JSON.stringify(INITIAL_DEMO_PRODUCTS));
  return INITIAL_DEMO_PRODUCTS;
}

function saveDemoProducts(products) {
  localStorage.setItem('saymac_backoffice_products', JSON.stringify(products));
}

/**
 * Fetch all products for Backoffice management
 */
export async function fetchBackofficeProducts() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data;
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local store:', err.message);
    }
  }

  return getDemoProducts();
}

/**
 * Create a new product
 */
export async function createProduct(payload) {
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
    images: payload.images && payload.images.length > 0 ? payload.images : ['/images/placeholder.jpg'],
    category: payload.category || 'General',
    is_featured: Boolean(payload.is_featured),
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Local storage fallback
  const demoList = getDemoProducts();
  newProduct.id = `demo-${Date.now()}`;
  demoList.unshift(newProduct);
  saveDemoProducts(demoList);
  return newProduct;
}

/**
 * Update an existing product
 */
export async function updateProduct(id, payload) {
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

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Local storage fallback
  const demoList = getDemoProducts();
  const index = demoList.findIndex(p => String(p.id) === String(id));
  if (index !== -1) {
    demoList[index] = { ...demoList[index], ...updateData };
    saveDemoProducts(demoList);
    return demoList[index];
  }
  throw new Error('Produk tidak ditemukan');
}

/**
 * Quick toggle active/published status
 */
export async function toggleProductActive(id, currentActiveStatus) {
  const newStatus = !currentActiveStatus;
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('products')
      .update({ is_active: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return newStatus;
  }

  const demoList = getDemoProducts();
  const index = demoList.findIndex(p => String(p.id) === String(id));
  if (index !== -1) {
    demoList[index].is_active = newStatus;
    saveDemoProducts(demoList);
    return newStatus;
  }
  return newStatus;
}

/**
 * Quick toggle featured status
 */
export async function toggleProductFeatured(id, currentFeaturedStatus) {
  const newStatus = !currentFeaturedStatus;
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('products')
      .update({ is_featured: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return newStatus;
  }

  const demoList = getDemoProducts();
  const index = demoList.findIndex(p => String(p.id) === String(id));
  if (index !== -1) {
    demoList[index].is_featured = newStatus;
    saveDemoProducts(demoList);
    return newStatus;
  }
  return newStatus;
}

/**
 * Delete product
 */
export async function deleteProduct(id) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  const demoList = getDemoProducts();
  const filtered = demoList.filter(p => String(p.id) !== String(id));
  saveDemoProducts(filtered);
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
