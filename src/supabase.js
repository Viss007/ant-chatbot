import { createClient } from "@supabase/supabase-js";
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabase = (url && key) ? createClient(url, key, { auth: { autoRefreshToken:false, persistSession:false }}) : null;
