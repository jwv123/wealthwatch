import { SupabaseClient } from '@supabase/supabase-js';
import { CategoryRow } from '../types/database';

export async function getUserCategories(
  client: SupabaseClient,
  userId: string,
  type?: 'income' | 'expense'
): Promise<CategoryRow[]> {
  let query = client
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  if (type) query = query.eq('type', type);

  const { data, error } = await query;
  if (error) throw { statusCode: 500, message: error.message };
  return data;
}

export async function createCategory(
  client: SupabaseClient,
  userId: string,
  payload: { name: string; type: 'income' | 'expense'; icon?: string; color?: string }
): Promise<CategoryRow> {
  const { data, error } = await client
    .from('categories')
    .insert({ ...payload, user_id: userId, is_default: false })
    .select('*')
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  return data;
}

export async function updateCategory(
  client: SupabaseClient,
  userId: string,
  categoryId: string,
  updates: Partial<Pick<CategoryRow, 'name' | 'type' | 'icon' | 'color'>>
): Promise<CategoryRow> {
  const { data, error } = await client
    .from('categories')
    .update(updates)
    .eq('id', categoryId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  if (!data) throw { statusCode: 404, message: 'Category not found' };
  return data;
}

export async function deleteCategory(client: SupabaseClient, userId: string, categoryId: string): Promise<void> {
  const { error } = await client
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('user_id', userId);

  if (error) throw { statusCode: 400, message: error.message };
}

export async function resetToDefaults(client: SupabaseClient, userId: string): Promise<CategoryRow[]> {
  const { error: delError } = await client
    .from('categories')
    .delete()
    .eq('user_id', userId);

  if (delError) throw { statusCode: 500, message: delError.message };

  const { error: rpcError } = await client.rpc('seed_default_categories', { p_user_id: userId });

  if (rpcError) throw { statusCode: 500, message: rpcError.message };

  return getUserCategories(client, userId);
}