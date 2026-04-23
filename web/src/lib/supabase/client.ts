import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

export function createClient() {
  const { supabaseUrl, publishableKey } = getSupabaseConfig();

  return createBrowserClient(supabaseUrl, publishableKey);
}
