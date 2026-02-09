import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
let _configured = false;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !!(url && key && url.startsWith("http"));
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    if (!isSupabaseConfigured()) {
      console.warn(
        "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
      );
      // Return a dummy client that won't crash — queries will return errors
      // which stores.ts handles by returning empty arrays
      _client = createClient("https://placeholder.supabase.co", "placeholder");
      _configured = false;
    } else {
      _client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      _configured = true;
    }
  }
  return _client;
}

// Lazy proxy — only creates the client when first accessed
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as any)[prop];
  },
});
