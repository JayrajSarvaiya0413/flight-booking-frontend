import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";

export function loader() {
  return json({
    serverEnv: {
      supabaseUrl: process.env.SUPABASE_URL || "Not set",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
        ? "Set (hidden)"
        : "Not set",
      apiUrl: process.env.API_URL || "Not set",
      nodeEnv: process.env.NODE_ENV || "Not set",
    },
  });
}

export default function Debug() {
  const { serverEnv } = useLoaderData<typeof loader>();
  const [clientEnv, setClientEnv] = useState({
    supabaseUrl: "Loading...",
    supabaseAnonKey: "Loading...",
    apiUrl: "Loading...",
  });

  useEffect(() => {
    setClientEnv({
      supabaseUrl: process.env.SUPABASE_URL || "Not set",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
        ? "Set (hidden)"
        : "Not set",
      apiUrl: process.env.API_URL || "Not set",
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Debug Information</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Server Environment Variables
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(serverEnv, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Client Environment Variables
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(clientEnv, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Window Object Check</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>Check the browser console for window object information.</p>
          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => {
              console.log("Window object:", window);
              console.log("process.env:", process.env);
              alert("Check the browser console for details");
            }}
          >
            Log Window Object
          </button>
        </div>
      </div>
    </div>
  );
}
