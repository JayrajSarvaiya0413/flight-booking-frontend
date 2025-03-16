import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { loadEnv } from "vite";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  console.log("Vite Config - Environment Variables:");
  console.log("SUPABASE_URL:", env.SUPABASE_URL ? "Set ✅" : "Not set ❌");
  console.log(
    "SUPABASE_ANON_KEY:",
    env.SUPABASE_ANON_KEY ? "Set ✅" : "Not set ❌"
  );

  return {
    define: {
      "process.env.SUPABASE_URL": JSON.stringify(env.SUPABASE_URL),
      "process.env.SUPABASE_ANON_KEY": JSON.stringify(env.SUPABASE_ANON_KEY),
      "process.env.API_URL": JSON.stringify(
        env.API_URL || "http://localhost:3000"
      ),
    },
    plugins: [
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_singleFetch: true,
          v3_lazyRouteDiscovery: true,
        },
        serverModuleFormat: "esm",
      }),
      tsconfigPaths(),
    ],
  };
});
