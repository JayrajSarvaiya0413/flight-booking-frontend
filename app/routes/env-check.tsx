import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader() {
  return json({
    supabaseUrl: process.env.SUPABASE_URL || "Not set",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY
      ? "Set (hidden for security)"
      : "Not set",
    apiUrl: process.env.API_URL || "Not set",
    nodeEnv: process.env.NODE_ENV || "Not set",
  });
}

export default function EnvCheck() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Check</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
