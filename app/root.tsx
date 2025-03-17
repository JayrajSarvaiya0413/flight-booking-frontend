import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { UserContext } from "./utils/userContext";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const loader: LoaderFunction = async () => {
  // Check if environment variables are set
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables are not set properly!");
  }

  return json({
    env: {
      SUPABASE_URL: supabaseUrl || "",
      SUPABASE_ANON_KEY: supabaseAnonKey || "",
      API_URL: process.env.API_URL || "http://localhost:3000",
    },
  });
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { env } = useLoaderData<typeof loader>();
  const [user, setUser] = useState<User | null>(null);
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(
    null
  );
  const [clientError, setClientError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabaseClient && typeof window !== "undefined") {
      try {
        // Check if environment variables are available
        if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
          console.error("Supabase credentials missing:", {
            url: env.SUPABASE_URL ? "Set" : "Not set",
            key: env.SUPABASE_ANON_KEY ? "Set" : "Not set",
          });
          throw new Error(
            "Supabase URL and API key are required but not available"
          );
        }

        console.log("Creating Supabase client with:", {
          url: env.SUPABASE_URL ? "Set" : "Not set",
          key: env.SUPABASE_ANON_KEY ? "Set" : "Not set",
        });

        const client = createBrowserClient(
          env.SUPABASE_URL,
          env.SUPABASE_ANON_KEY
        );
        setSupabaseClient(client);

        // Check for existing session
        const checkUser = async () => {
          try {
            const { data } = await client.auth.getSession();
            setUser(data?.session?.user || null);
          } catch (error) {
            console.error("Error getting session:", error);
          }
        };
        checkUser();

        // Listen for auth changes
        const { data } = client.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
        });

        return () => {
          data?.subscription?.unsubscribe();
        };
      } catch (error) {
        console.error("Error creating Supabase client:", error);
        setClientError(
          error instanceof Error
            ? error.message
            : "Unknown error creating Supabase client"
        );
      }
    }
  }, [env.SUPABASE_URL, env.SUPABASE_ANON_KEY, supabaseClient]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <UserContext.Provider value={{ user, supabaseClient }}>
          <div className="flex flex-col min-h-screen">
            <header className="bg-blue-600 text-white shadow-md">
              <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                  <Link to="/" className="text-2xl font-bold">
                    Thena Flight Booking
                  </Link>

                  {/* Mobile menu button */}
                  <button
                    className="md:hidden text-white focus:outline-none"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          mobileMenuOpen
                            ? "M6 18L18 6M6 6l12 12"
                            : "M4 6h16M4 12h16M4 18h16"
                        }
                      />
                    </svg>
                  </button>

                  {/* Desktop navigation */}
                  <nav className="hidden md:flex items-center space-x-6">
                    <Link to="/" className="hover:text-blue-200">
                      Home
                    </Link>
                    <Link to="/flights" className="hover:text-blue-200">
                      Flights
                    </Link>
                    {user ? (
                      <>
                        <Link to="/bookings" className="hover:text-blue-200">
                          My Bookings
                        </Link>
                        <Link to="/profile" className="hover:text-blue-200">
                          Profile
                        </Link>
                        <button
                          onClick={async () => {
                            await supabaseClient?.auth.signOut();
                          }}
                          className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/auth"
                        className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100"
                      >
                        Sign In
                      </Link>
                    )}
                  </nav>
                </div>

                {/* Mobile navigation */}
                {mobileMenuOpen && (
                  <nav className="md:hidden mt-4 pb-2 space-y-3">
                    <Link
                      to="/"
                      className="block hover:text-blue-200 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      to="/flights"
                      className="block hover:text-blue-200 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Flights
                    </Link>
                    {user ? (
                      <>
                        <Link
                          to="/bookings"
                          className="block hover:text-blue-200 py-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Bookings
                        </Link>
                        <Link
                          to="/profile"
                          className="block hover:text-blue-200 py-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={async () => {
                            await supabaseClient?.auth.signOut();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-left bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/auth"
                        className="block bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    )}
                  </nav>
                )}
              </div>
            </header>
            <main className="flex-grow container mx-auto px-4 py-8">
              {clientError ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  <p className="font-bold">Error initializing application:</p>
                  <p>{clientError}</p>
                  <p className="mt-2">
                    Please check that your environment variables are properly
                    configured. You can visit{" "}
                    <Link to="/env-check" className="text-blue-600 underline">
                      environment check page
                    </Link>{" "}
                    for more details.
                  </p>
                </div>
              ) : (
                <Outlet />
              )}
            </main>
          </div>
        </UserContext.Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
