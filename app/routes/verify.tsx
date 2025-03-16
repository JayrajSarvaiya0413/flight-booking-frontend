import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams, Form } from "@remix-run/react";
import { MetaFunction, ActionFunctionArgs, json } from "@remix-run/node";
import { useUser } from "~/utils/userContext";
import { createClient } from "@supabase/supabase-js";
import { verifyEmailToken } from "~/utils/supabase.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Email Verification - Thena Flight Booking" },
    {
      name: "description",
      content: "Verify your email address for Thena Flight Booking.",
    },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const token = formData.get("token") as string;
  const type = (formData.get("type") as string) || "email";

  if (!token) {
    return json({ success: false, error: "Token is required" });
  }

  // Verify the token server-side
  const result = await verifyEmailToken(token, type);

  return json(result);
}

export default function Verify() {
  const { user, supabaseClient } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const [manualToken, setManualToken] = useState("");

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user) {
      navigate("/");
      return;
    }

    const verifyEmail = async () => {
      try {
        // Collect all URL parameters for debugging
        const allParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          allParams[key] = value;
        });
        setDebugInfo((prev) => ({ ...prev, urlParams: allParams }));

        // Check for different parameter formats Supabase might use
        const token =
          searchParams.get("token_hash") || searchParams.get("token");
        const type = searchParams.get("type");

        // Also check for encoded parameters
        const encodedToken = searchParams.get("token%5Fhash");

        setDebugInfo((prev) => ({
          ...prev,
          token: token,
          encodedToken: encodedToken,
          type: type,
          url: window.location.href,
        }));

        // If we don't have the necessary parameters, try to parse them from the URL
        let finalToken = token;
        let finalType = type || "email";

        if (!finalToken && window.location.href.includes("token_hash=")) {
          const urlParts = window.location.href.split("token_hash=");
          if (urlParts.length > 1) {
            finalToken = urlParts[1].split("&")[0];
            setDebugInfo((prev) => ({ ...prev, parsedToken: finalToken }));
          }
        }

        if (!finalToken && !finalType) {
          // No token in URL, show manual verification form
          setVerificationStatus("error");
          setErrorMessage(
            "No verification token found in URL. Please enter your verification token manually."
          );
          return;
        }

        // Try server-side verification first
        try {
          const response = await fetch("/api/verify-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              token: finalToken as string,
              type: finalType,
            }),
          });

          const result = await response.json();
          setDebugInfo((prev) => ({ ...prev, serverVerification: result }));

          if (result.success) {
            setVerificationStatus("success");
            return;
          }
        } catch (serverError) {
          console.error("Server verification failed:", serverError);
          setDebugInfo((prev) => ({
            ...prev,
            serverVerificationError: serverError,
          }));
          // Continue with client-side verification as fallback
        }

        // If server verification failed, try client-side
        if (!supabaseClient) {
          console.error("Supabase client not available from context");

          // Try to create a new client
          const supabaseUrl = process.env.SUPABASE_URL || "";
          const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

          if (!supabaseUrl || !supabaseAnonKey) {
            setVerificationStatus("error");
            setErrorMessage(
              "Authentication service unavailable. Please try again later."
            );
            return;
          }

          const newClient = createClient(supabaseUrl, supabaseAnonKey);
          setDebugInfo((prev) => ({ ...prev, createdNewClient: true }));

          // Verify the email with the new client
          const { error } = await newClient.auth.verifyOtp({
            token_hash: finalToken as string,
            type: finalType as any,
          });

          if (error) {
            console.error("Email verification error:", error);
            setVerificationStatus("error");
            setErrorMessage(
              error.message || "Failed to verify email. Please try again."
            );
            setDebugInfo((prev) => ({ ...prev, error: error }));
            return;
          }
        } else {
          // Verify the email with the existing client
          const { error } = await supabaseClient.auth.verifyOtp({
            token_hash: finalToken as string,
            type: finalType as any,
          });

          if (error) {
            console.error("Email verification error:", error);
            setVerificationStatus("error");
            setErrorMessage(
              error.message || "Failed to verify email. Please try again."
            );
            setDebugInfo((prev) => ({ ...prev, error: error }));
            return;
          }
        }

        // Email verification successful
        setVerificationStatus("success");
      } catch (error) {
        console.error("Unexpected error during verification:", error);
        setVerificationStatus("error");
        setErrorMessage(
          "An unexpected error occurred. Please try again later."
        );
        setDebugInfo((prev) => ({ ...prev, catchError: error }));
      }
    };

    verifyEmail();
  }, [user, navigate, searchParams, supabaseClient]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {verificationStatus === "loading" && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              Verifying your email...
            </h2>
            <p className="mt-2 text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        )}

        {verificationStatus === "success" && (
          <div>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Email Verified Successfully!
            </h2>
            <p className="mt-2 text-gray-600">
              Your email has been verified. You can now sign in to your account.
            </p>
            <div className="mt-6">
              <Link
                to="/auth"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        {verificationStatus === "error" && (
          <div>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-10 w-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Verification Failed
            </h2>
            <p className="mt-2 text-gray-600">
              {errorMessage ||
                "We couldn't verify your email. The link may have expired or is invalid."}
            </p>

            {/* Manual verification form */}
            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Manual Verification
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have a verification token, you can enter it below:
              </p>
              <Form method="post" className="space-y-4">
                <div>
                  <input
                    id="token"
                    name="token"
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Enter verification token"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                  <input type="hidden" name="type" value="email" />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Verify
                </button>
              </Form>
            </div>

            <div className="mt-6 space-y-4">
              <Link
                to="/auth?mode=register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </Link>
              <div>
                <Link
                  to="/contact"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Contact Support
                </Link>
              </div>
            </div>

            {/* Debug information */}
            <div className="mt-8 p-4 bg-gray-100 rounded-md text-left">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Debug Information (for developers)
              </h3>
              <div className="text-xs text-gray-600 overflow-auto max-h-40">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
