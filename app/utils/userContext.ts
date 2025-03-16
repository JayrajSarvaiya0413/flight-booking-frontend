import { createContext, useContext } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";

type UserContextType = {
  user: User | null;
  supabaseClient: SupabaseClient | null;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  supabaseClient: null,
});

export const useUser = () => useContext(UserContext);
