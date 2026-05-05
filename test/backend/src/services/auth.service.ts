import { supabaseClient, supabaseAdmin, createAuthenticatedClient } from '../config/supabase';

export async function login(email: string, password: string) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw { statusCode: 401, message: error.message };
  return data;
}

export async function register(email: string, password: string, displayName?: string) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });
  if (error) throw { statusCode: 400, message: error.message };
  return data;
}

export async function logout(token: string) {
  const { error } = await supabaseAdmin.auth.admin.signOut(token);
  if (error) throw { statusCode: 400, message: error.message };
}

export async function refreshToken(refreshToken: string) {
  const { data, error } = await supabaseClient.auth.refreshSession({
    refresh_token: refreshToken,
  });
  if (error) throw { statusCode: 401, message: error.message };
  return data;
}

export async function getProfile(accessToken: string, userId: string) {
  const client = createAuthenticatedClient(accessToken);
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw { statusCode: 404, message: 'Profile not found' };
  return data;
}

export async function updateProfile(accessToken: string, userId: string, updates: { default_currency?: string; display_name?: string }) {
  const client = createAuthenticatedClient(accessToken);
  const { data, error } = await client
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
}