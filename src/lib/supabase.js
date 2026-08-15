import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-project-id.supabase.co' &&
  !supabaseUrl.includes('your-supabase-project-id')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper to upload image file to Supabase Storage 'product-images' bucket
 */
export async function uploadProductImage(file) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum terkonfigurasi di environment variables.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
