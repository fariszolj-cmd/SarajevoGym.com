const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? 'https://example-project.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'demo-anon-key',
};

export const appEnv = {
  ...env,
  isDemoMode: !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY,
};

export function validateAppEnv() {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables are not configured yet. Demo mode is active.');
  }
}
