import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://slgknodykpnizqbrmbyo.supabase.co";
const supabaseAnonKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZ2tub2R5a3BuaXpxYnJtYnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMjQ5MzksImV4cCI6MjA1NzYwMDkzOX0.hZ3JxfbJg-cUE7Ps-WloX1euFqbQL9ybzdnutFX4B70`;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
