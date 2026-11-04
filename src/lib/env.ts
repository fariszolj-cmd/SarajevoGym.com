import { z } from 'zod';

const publicEnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

const parsedEnv = publicEnvSchema.safeParse({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || undefined,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || undefined,
});

if (!parsedEnv.success) {
  throw new Error(`Invalid public environment configuration: ${parsedEnv.error.message}`);
}

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = parsedEnv.data;

export const isSupabaseConfigured = Boolean(VITE_SUPABASE_URL && VITE_SUPABASE_ANON_KEY);

export function getSupabaseConfig() {
  if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured. Copy .env.example to .env.local and add your project values.');
  }

  return {
    url: VITE_SUPABASE_URL,
    anonKey: VITE_SUPABASE_ANON_KEY,
  };
}
