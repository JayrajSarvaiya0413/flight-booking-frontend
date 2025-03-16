import { useEffect, useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

export function loader() {
  return json({
    serverEnv: {
      supabaseUrl: process.env.SUPABASE_URL || "Not set",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
        ? "Set (hidden for security)"
        : "Not set",
      apiUrl: process.env.API_URL || "Not set",
    },
  });
}

export default function ClientEnvCheck() {
  const { serverEnv } = useLoaderData<typeof loader>();
  const [clientEnv, setClientEnv] = useState<Record<string, string>>({});

  useEffect(() => {
    setClientEnv({
      supabaseUrl:
        (typeof process !== "undefined" && process.env.SUPABASE_URL) ||
        "Not set",
      supabaseAnonKey:
        typeof process !== "undefined" && process.env.SUPABASE_ANON_KEY
          ? "Set (hidden for security)"
          : "Not set",
      apiUrl:
        (typeof process !== "undefined" && process.env.API_URL) || "Not set",
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Check</h1>

      <h2 className="text-xl font-semibold mt-6 mb-3">
        Server Environment Variables
      </h2>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(serverEnv, null, 2)}
        </pre>
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-3">
        Client Environment Variables
      </h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(clientEnv, null, 2)}
        </pre>
      </div>
    </div>
  );
}
