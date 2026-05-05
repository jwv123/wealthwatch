import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabaseClient: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

export const supabaseAdmin: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Create a Supabase client authenticated as a specific user.
 * This is required for RLS-protected queries where policies use auth.uid().
 * The anon-key client alone cannot satisfy RLS policies because auth.uid() returns null.
 */
export function createAuthenticatedClient(accessToken: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}