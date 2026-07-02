import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cvlemtmsixmxokmfqvoj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bGVtdG1zaXhteG9rbWZxdm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTI0OTcsImV4cCI6MjA5ODU4ODQ5N30.QF0ADcq4-l8syO3MwF-ZIlKJ6XOk15dIKfysYO4VWvE";

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
