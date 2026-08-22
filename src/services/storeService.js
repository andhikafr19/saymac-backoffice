import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const DEFAULT_STORE_SETTINGS = {
  id: 'default-store-settings',
  whatsapp_number: '6285797987872',
  whatsapp_display: '+62 857-9798-7872',
  instagram_handle: '@saymacaroni',
  instagram_url: 'https://instagram.com/saymacaroni',
  email_address: 'hello@saymacaroni.com',
  operational_weekdays: 'Senin - Sabtu: 09:00 - 21:00 WIB',
  operational_weekends: 'Minggu / Libur: 10:00 - 17:00 WIB',
  store_address: 'Kompleks Ruko Primarasa, Blok B-10, Jl. Macaroni Raya No. 45, Jakarta Selatan',
  maps_url: 'https://maps.google.com',
};

/**
 * Fetch store settings in Backoffice
 */
export async function fetchStoreSettings() {
  if (!isSupabaseConfigured || !supabase) {
    const local = localStorage.getItem('saymac_store_settings_cache');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
    return DEFAULT_STORE_SETTINGS;
  }

  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return DEFAULT_STORE_SETTINGS;
  }

  return {
    ...DEFAULT_STORE_SETTINGS,
    ...data
  };
}

/**
 * Update store settings in Backoffice
 */
export async function updateStoreSettings(payload) {
  if (!isSupabaseConfigured || !supabase) {
    const updated = {
      ...DEFAULT_STORE_SETTINGS,
      ...payload,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem('saymac_store_settings_cache', JSON.stringify(updated));
    return updated;
  }

  const current = await fetchStoreSettings();

  const updateData = {
    whatsapp_number: payload.whatsapp_number,
    whatsapp_display: payload.whatsapp_display || `+${payload.whatsapp_number}`,
    instagram_handle: payload.instagram_handle,
    instagram_url: payload.instagram_url,
    email_address: payload.email_address,
    operational_weekdays: payload.operational_weekdays,
    operational_weekends: payload.operational_weekends,
    store_address: payload.store_address,
    maps_url: payload.maps_url,
    updated_at: new Date().toISOString()
  };

  if (current && current.id && current.id !== 'default-store-settings') {
    const { data, error } = await supabase
      .from('store_settings')
      .update(updateData)
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Insert new row if table was empty
    const { data, error } = await supabase
      .from('store_settings')
      .insert([updateData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
