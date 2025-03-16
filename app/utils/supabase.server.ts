import { createClient } from "@supabase/supabase-js";

// Create a Supabase client for server-side operations
export function getSupabaseServer() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase credentials");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Verify an email token directly from the server
export async function verifyEmailToken(token: string, type: string = "email") {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    });

    if (error) {
      console.error("Server-side verification error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error during server-side verification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Manually confirm a user's email using their user ID
export async function confirmUserEmail(userId: string) {
  try {
    const supabase = getSupabaseServer();

    // This is an admin-level operation that requires service_role key
    // It's included here for reference but won't work with the anon key
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (error) {
      console.error("Error confirming user email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error during email confirmation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
