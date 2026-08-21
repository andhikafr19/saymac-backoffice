import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const DEFAULT_FALLBACK_CAMPAIGN = {
  id: 'ramadhan-hampers-default',
  badge_text: '🌙 Edisi Khusus Ramadhan & Lebaran',
  title: 'Say Macaroni Hampers Pack',
  description: 'Bagikan kebahagiaan kriuk premium di hari kemenangan! Dapatkan paket hampers cantik isi 4 botol/pouch varian rasa bebas pilih dengan kartu ucapan Lebaran eksklusif. Stok terbatas selama bulan suci!',
  image_url: '/images/balado_jeruk_1.jpg',
  cta_text: 'Pesan Hampers Sekarang',
  cta_link: 'catalog',
  is_active: true,
  created_at: new Date().toISOString()
};

/**
 * Fetch all campaigns for Backoffice management
 */
export async function fetchBackofficeCampaigns() {
  if (!isSupabaseConfigured || !supabase) {
    // Return local fallback list if Supabase is offline/unconfigured
    const local = localStorage.getItem('saymac_campaigns_cache');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // pass
      }
    }
    return [DEFAULT_FALLBACK_CAMPAIGN];
  }

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return [DEFAULT_FALLBACK_CAMPAIGN];
  }

  return data;
}

/**
 * Create a new campaign banner
 */
export async function createCampaign(payload) {
  if (!isSupabaseConfigured || !supabase) {
    // Store in local storage cache for offline demo
    const current = await fetchBackofficeCampaigns();
    const newItem = {
      ...payload,
      id: 'campaign-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [newItem, ...current];
    localStorage.setItem('saymac_campaigns_cache', JSON.stringify(updated));
    return newItem;
  }

  const newCampaign = {
    title: payload.title,
    badge_text: payload.badge_text || '🌙 Promo Spesial',
    description: payload.description || '',
    image_url: payload.image_url || '/images/balado_jeruk_1.jpg',
    cta_text: payload.cta_text || 'Lihat Promo',
    cta_link: payload.cta_link || 'catalog',
    is_active: payload.is_active !== undefined ? payload.is_active : true,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('campaigns')
    .insert([newCampaign])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing campaign banner
 */
export async function updateCampaign(id, payload) {
  if (!isSupabaseConfigured || !supabase) {
    const current = await fetchBackofficeCampaigns();
    const updated = current.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...payload,
          updated_at: new Date().toISOString()
        };
      }
      return item;
    });
    localStorage.setItem('saymac_campaigns_cache', JSON.stringify(updated));
    return updated.find(i => i.id === id);
  }

  const updateData = {
    title: payload.title,
    badge_text: payload.badge_text,
    description: payload.description,
    image_url: payload.image_url,
    cta_text: payload.cta_text,
    cta_link: payload.cta_link,
    is_active: payload.is_active,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('campaigns')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Quick toggle active status
 */
export async function toggleCampaignActive(id, currentActiveStatus) {
  const newStatus = !currentActiveStatus;

  if (!isSupabaseConfigured || !supabase) {
    const current = await fetchBackofficeCampaigns();
    const updated = current.map(item => {
      if (item.id === id) {
        return { ...item, is_active: newStatus, updated_at: new Date().toISOString() };
      }
      return item;
    });
    localStorage.setItem('saymac_campaigns_cache', JSON.stringify(updated));
    return newStatus;
  }

  const { error } = await supabase
    .from('campaigns')
    .update({ is_active: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
  return newStatus;
}

/**
 * Delete a campaign banner
 */
export async function deleteCampaign(id) {
  if (!isSupabaseConfigured || !supabase) {
    const current = await fetchBackofficeCampaigns();
    const updated = current.filter(i => i.id !== id);
    localStorage.setItem('saymac_campaigns_cache', JSON.stringify(updated));
    return true;
  }

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
