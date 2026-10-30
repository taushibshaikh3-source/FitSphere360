// src/lib/supabaseClient.js
// Supabase client for FitSphere 360
// The anon key is safe to expose — RLS enforces data security on the server side

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[FitSphere 360] Missing Supabase environment variables. Check frontend/.env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper: get current authenticated user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper: get current user's profile from profiles table
export const getCurrentProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error) { console.error('[FitSphere360] Profile fetch error:', error); return null; }
  return data;
};

// Helper: upload trainer image to Supabase Storage
export const uploadTrainerImage = async (file) => {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `trainer_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `trainers/${fileName}`;

  const { data, error } = await supabase.storage
    .from('trainer-images')
    .upload(filePath, file, { cacheControl: '3600', upsert: true });

  if (error) {
    console.warn('[FitSphere 360] Supabase storage upload notice:', error.message);
    // If bucket issue, fallback to data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  const { data: { publicUrl } } = supabase.storage
    .from('trainer-images')
    .getPublicUrl(filePath);

  return publicUrl;
};
