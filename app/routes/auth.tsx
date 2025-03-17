import { useState, useEffect } from "react";
import {
  Form,
  useNavigate,
  useActionData,
  useLoaderData,
  Link,
} from "@remix-run/react";
import {
  json,
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useUser } from "~/utils/userContext";
import { createClient } from "@supabase/supabase-js";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign In or Register - Thena Flight Booking" },
    {
      name: "description",
      content: "Sign in to your account or create a new one.",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // Get environment variables
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

  return json({
    supabaseUrl,
    supabaseAnonKey,
  });
}

type ActionData =
  | {
      success: true;
      message: string;
      error?: never;
      emailConfirmation?: boolean;
      confirmationToken?: string | null;
    }
  | { success: false; error: string; message?: never };

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const action = formData.get("action") as string;

    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.SUPABASE_URL || "";
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (action === "login") {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      if (!email || !password) {
        return json<ActionData>({
          success: false,
          error: "Email and password are required",
        });
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return json<ActionData>({
          success: false,
          error: error.message,
        });
      }

      return json<ActionData>({
        success: true,
        message: "Logged in successfully",
      });
    } else if (action === "register") {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      if (!email || !password || !confirmPassword) {
        return json<ActionData>({
          success: false,
          error: "All fields are required",
        });
      }

      if (password !== confirmPassword) {
        return json<ActionData>({
          success: false,
          error: "Passwords do not match",
        });
      }

      // Get the current URL for redirection
      const origin = new URL(request.url).origin;
      // Use a more reliable redirect URL with explicit token parameter handling
      const redirectUrl = `${origin}/verify`;

      // Log the redirect URL for debugging
      console.log("Signup redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            email: email,
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        return json<ActionData>({
          success: false,
          error: error.message,
        });
      }

      // Check if email confirmation was sent and capture the token if available
      const emailConfirmationSent = !data.user?.confirmed_at;
      const confirmationToken = data.user?.confirmation_sent_at
        ? `${data.user.id}_${new Date(
            data.user.confirmation_sent_at
          ).getTime()}`
        : null;

      return json<ActionData>({
        success: true,
        emailConfirmation: emailConfirmationSent,
        confirmationToken: confirmationToken,
        message: emailConfirmationSent
          ? "Registration successful. Please check your email to confirm your account."
          : "Registration successful. You can now log in with your credentials.",
      });
    } else if (action === "forgot-password") {
      const email = formData.get("email") as string;

      if (!email) {
        return json<ActionData>({
          success: false,
          error: "Email is required",
        });
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${new URL(request.url).origin}/reset-password`,
      });

      if (error) {
        return json<ActionData>({
          success: false,
          error: error.message,
        });
      }

      return json<ActionData>({
        success: true,
        message: "Password reset instructions sent to your email",
      });
    }

    return json<ActionData>({
      success: false,
      error: "Invalid action",
    });
  } catch (error) {
    console.error("Auth action error:", error);
    return json<ActionData>({
      success: false,
      error: "An error occurred. Please try again.",
    });
  }
}

export default function Auth() {
  const { user, supabaseClient } = useUser();
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const { supabaseUrl, supabaseAnonKey } = useLoaderData<typeof loader>();

  const [authMode, setAuthMode] = useState<
    "login" | "register" | "forgot-password"
  >("login");
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Check for verification parameter in URL
    const url = new URL(window.location.href);
    const verification = url.searchParams.get("verification");

    if (verification === "success") {
      setVerificationStatus(
        "Your email has been verified successfully. You can now log in."
      );
    }

    // Redirect to home if already authenticated
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setSuccess(actionData.message);
        setError(null);

        // If login was successful, redirect to home
        if (authMode === "login" && actionData.success) {
          setTimeout(() => {
            navigate("/");
          }, 1000);
        }
      } else {
        setError(actionData.error);
        setSuccess(null);
      }
    }
  }, [actionData, navigate, authMode]);

  const toggleAuthMode = (mode: "login" | "register" | "forgot-password") => {
    setAuthMode(mode);
    setError(null);
    setSuccess(null);
  };

  // Handle form submission manually to avoid turbo-stream errors
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const response = await fetch("/auth", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);

        // If login was successful, redirect to home after Supabase session is established
        if (authMode === "login") {
          const email = formData.get("email") as string;
          const password = formData.get("password") as string;

          // Create a client-side Supabase client
          const supabase = createClient(supabaseUrl, supabaseAnonKey);

          // Sign in with Supabase directly
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!error) {
            setTimeout(() => {
              navigate("/");
            }, 1000);
          } else {
            setError("Error establishing session. Please try again.");
          }
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {authMode === "login" && "Sign in to your account"}
            {authMode === "register" && "Create a new account"}
            {authMode === "forgot-password" && "Reset your password"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {authMode === "login" && "Or "}
            {authMode === "login" && (
              <button
                onClick={() => toggleAuthMode("register")}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                create a new account
              </button>
            )}
            {authMode === "register" && "Already have an account? "}
            {authMode === "register" && (
              <button
                onClick={() => toggleAuthMode("login")}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </button>
            )}
          </p>
        </div>

        {/* Display verification status if available */}
        {verificationStatus && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {verificationStatus}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Display success message if available */}
        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Display error message if available */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Use regular form instead of Remix Form to avoid turbo-stream errors */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="action" value={authMode} />
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Login Form */}
            {authMode === "login" && (
              <>
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                  />
                </div>
              </>
            )}

            {/* Register Form */}
            {authMode === "register" && (
              <>
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="sr-only">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm Password"
                  />
                </div>
              </>
            )}

            {/* Forgot Password Form */}
            {authMode === "forgot-password" && (
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            )}
          </div>

          {authMode === "login" && (
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => toggleAuthMode("forgot-password")}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          )}

          {authMode === "forgot-password" && (
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => toggleAuthMode("login")}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Back to login
                </button>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
              {authMode === "login" && "Sign in"}
              {authMode === "register" && "Register"}
              {authMode === "forgot-password" && "Reset Password"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <Link
              to="/"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Continue as Guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
