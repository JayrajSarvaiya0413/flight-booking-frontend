// Simple script to check if environment variables are loaded correctly
import * as dotenv from "dotenv";
dotenv.config();

console.log("Environment Variables Check:");
console.log("---------------------------");
console.log(
  "SUPABASE_URL:",
  process.env.SUPABASE_URL ? "Set ✅" : "Not set ❌"
);
console.log(
  "SUPABASE_ANON_KEY:",
  process.env.SUPABASE_ANON_KEY ? "Set ✅" : "Not set ❌"
);
console.log("API_URL:", process.env.API_URL ? "Set ✅" : "Not set ❌");
console.log("NODE_ENV:", process.env.NODE_ENV || "Not set");
console.log("---------------------------");

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error("⚠️ Supabase environment variables are missing!");
  console.log(
    "Make sure you have a .env file in the root of your project with the following variables:"
  );
  console.log("SUPABASE_URL=your_supabase_url");
  console.log("SUPABASE_ANON_KEY=your_supabase_anon_key");
} else {
  console.log("✅ All required environment variables are set!");
}
