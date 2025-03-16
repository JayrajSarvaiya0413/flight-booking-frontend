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
  const formData = await request.formData();
  const action = formData.get("action") as string;

  // Get Supabase credentials from environment variables
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
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

  const toggleAuthMode = (mode: "login" | "register" | "forgot-password") => {
    setAuthMode(mode);
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
            {authMode === "forgot-password" && (
              <button
                onClick={() => toggleAuthMode("login")}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Back to sign in
              </button>
            )}
          </p>
        </div>

        {verificationStatus && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {verificationStatus}
          </div>
        )}

        {actionData?.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {actionData.message}
          </div>
        )}

        {actionData?.success === false && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {actionData.error}
          </div>
        )}

        {/* Debug information for email verification */}
        {actionData?.success && actionData.emailConfirmation && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-800">
              Email Verification Information
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              A verification email has been sent to your email address. Please
              check your inbox and spam folder.
            </p>
            <p className="text-sm text-blue-700 mt-1">
              If you don't receive the email within a few minutes, you can try
              registering again or contact support.
            </p>
            <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
              <p>Verification URL: {window.location.origin}/verify</p>
              <p>
                Make sure your Supabase project has email verification enabled
                in the Authentication settings.
              </p>
              <p>
                Check that your Supabase project has a valid email provider
                configured.
              </p>
            </div>

            {/* Troubleshooting section */}
            <div className="mt-4 border-t border-blue-200 pt-4">
              <h4 className="text-sm font-medium text-blue-800">
                Having trouble with verification?
              </h4>
              <p className="text-xs text-blue-700 mt-1">
                If you're not receiving the verification email, you can:
              </p>
              <ul className="list-disc list-inside text-xs text-blue-700 mt-1">
                <li>Check your spam/junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>
                  Try using a different email provider (Gmail, Outlook, etc.)
                </li>
                <li>
                  <Link to="/verify" className="underline">
                    Go to the verification page
                  </Link>{" "}
                  and enter your verification token manually
                </li>
              </ul>

              {actionData.confirmationToken && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs font-medium text-yellow-800">
                    If you can't access your email, you can use this temporary
                    verification code:
                  </p>
                  <code className="block mt-1 p-1 bg-white text-xs font-mono overflow-auto">
                    {actionData.confirmationToken}
                  </code>
                  <p className="text-xs text-yellow-700 mt-1">
                    Note: This is for development purposes only and should not
                    be used in production.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <Form method="post" className="mt-8 space-y-6">
          <input type="hidden" name="action" value={authMode} />

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            {authMode !== "forgot-password" && (
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={
                    authMode === "login" ? "current-password" : "new-password"
                  }
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white ${
                    authMode === "register" ? "" : "rounded-b-md"
                  } focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Password"
                />
              </div>
            )}

            {authMode === "register" && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                />
              </div>
            )}
          </div>

          {authMode === "login" && (
            <div className="flex items-center justify-end">
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

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
        </Form>
      </div>
    </div>
  );
}
