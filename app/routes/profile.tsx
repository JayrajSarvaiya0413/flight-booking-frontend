import { useState, useEffect } from "react";
import { Form, useNavigate, useActionData } from "@remix-run/react";
import { json, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useUser } from "~/utils/userContext";

export const meta: MetaFunction = () => {
  return [
    { title: "My Profile - Thena Flight Booking" },
    {
      name: "description",
      content: "View and update your profile information.",
    },
  ];
};

type ProfileData = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  date_of_birth: string;
  passport_number: string;
  passport_expiry: string;
};

type ActionData =
  | { success: true; data: ProfileData; error?: never }
  | { success: false; error: string; data?: never };

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const apiUrl = process.env.API_URL || "http://localhost:3000";

  // Extract the token from the form data
  const token = formData.get("token") as string;

  // Remove token from form data before sending to API
  formData.delete("token");

  try {
    const response = await fetch(`${apiUrl}/users/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json<ActionData>({
        success: false,
        error: errorData.message || "Failed to update profile",
      });
    }

    const data = await response.json();
    return json<ActionData>({ success: true, data });
  } catch (error) {
    return json<ActionData>({
      success: false,
      error: "An error occurred while updating your profile",
    });
  }
}

export default function Profile() {
  const { user, supabaseClient } = useUser();
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user && !loading) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !supabaseClient) return;

      try {
        setLoading(true);

        // Get API URL from environment variable
        const apiUrl = process.env.API_URL || "http://localhost:3000";

        // Get user token for authentication
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();
        const accessToken = session?.access_token;

        if (!accessToken) {
          throw new Error("Authentication token not available");
        }

        setToken(accessToken);

        // Fetch user profile
        const response = await fetch(`${apiUrl}/users/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching profile: ${response.statusText}`);
        }

        const data = await response.json();
        setProfileData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again later.");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, supabaseClient]);

  // Handle action data response
  useEffect(() => {
    if (actionData) {
      if (actionData.success === true) {
        setSuccessMessage("Profile updated successfully!");
        // Update the profile data with the new data
        setProfileData(actionData.data);
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else if (actionData.success === false) {
        setError(actionData.error);
        // Clear error message after 3 seconds
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    }
  }, [actionData]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <p className="text-sm text-blue-100">
              Update your personal details
            </p>
          </div>

          <div className="p-6">
            <Form method="post" className="space-y-6">
              {/* Hidden field for token */}
              <input type="hidden" name="token" value={token || ""} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={profileData?.email || user.email || ""}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    defaultValue={profileData?.phone_number || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* First Name */}
                <div>
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    defaultValue={profileData?.first_name || ""}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    defaultValue={profileData?.last_name || ""}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label
                    htmlFor="date_of_birth"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    defaultValue={profileData?.date_of_birth || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    defaultValue={profileData?.address || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    defaultValue={profileData?.city || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Country */}
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    defaultValue={profileData?.country || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label
                    htmlFor="postal_code"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    defaultValue={profileData?.postal_code || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold mb-4">Travel Documents</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Passport Number */}
                  <div>
                    <label
                      htmlFor="passport_number"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Passport Number
                    </label>
                    <input
                      type="text"
                      id="passport_number"
                      name="passport_number"
                      defaultValue={profileData?.passport_number || ""}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Passport Expiry */}
                  <div>
                    <label
                      htmlFor="passport_expiry"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Passport Expiry Date
                    </label>
                    <input
                      type="date"
                      id="passport_expiry"
                      name="passport_expiry"
                      defaultValue={profileData?.passport_expiry || ""}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save Changes
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
