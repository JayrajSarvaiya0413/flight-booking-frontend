import { useState, useEffect } from "react";
import { Link, useNavigate } from "@remix-run/react";
import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useUser } from "~/utils/userContext";

export const meta: MetaFunction = () => {
  return [
    { title: "My Bookings - Thena Flight Booking" },
    { name: "description", content: "View and manage your flight bookings." },
  ];
};

type Booking = {
  id: string;
  booking_reference: string;
  booking_date: string;
  status: string;
  total_amount: number;
  outbound_flight: {
    id: string;
    airline: string;
    flight_number: string;
    departure_airport: string;
    arrival_airport: string;
    departure_time: string;
    arrival_time: string;
  };
  return_flight?: {
    id: string;
    airline: string;
    flight_number: string;
    departure_airport: string;
    arrival_airport: string;
    departure_time: string;
    arrival_time: string;
  };
  cabin_class: string;
};

export default function Bookings() {
  const { user, supabaseClient } = useUser();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user && !loading) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || !supabaseClient) return;

      try {
        setLoading(true);

        // Get API URL from environment variable
        const apiUrl = process.env.API_URL || "http://localhost:3000";

        // Get user token for authentication
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error("Authentication token not available");
        }

        // Fetch user bookings
        const response = await fetch(`${apiUrl}/bookings/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching bookings: ${response.statusText}`);
        }

        const data = await response.json();
        setBookings(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings. Please try again later.");
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, supabaseClient]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCabinClassName = (cabinClass: string) => {
    switch (cabinClass) {
      case "economy":
        return "Economy";
      case "premium_economy":
        return "Premium Economy";
      case "business":
        return "Business";
      case "first":
        return "First Class";
      default:
        return cabinClass;
    }
  };

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
      <h1 className="text-3xl font-bold mb-6 text-black">My Bookings</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg
            className="h-16 w-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
          <h2 className="text-xl font-semibold mb-2 text-black">
            No Bookings Found
          </h2>
          <p className="mb-6">You haven't made any bookings yet.</p>
          <Link
            to="/flights"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Search Flights
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">
                    Booking #{booking.booking_reference}
                  </h2>
                  <p className="text-sm text-blue-100">
                    Booked on {formatDate(booking.booking_date)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                  <span className="text-lg font-bold">
                    ${booking.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-black">
                    Outbound Flight
                  </h3>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="w-24 flex-shrink-0">
                        <div className="text-lg font-semibold">
                          {booking.outbound_flight.airline}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.outbound_flight.flight_number}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-xl font-bold">
                            {formatTime(booking.outbound_flight.departure_time)}
                          </div>
                          <div className="text-sm">
                            {formatDate(booking.outbound_flight.departure_time)}
                          </div>
                          <div className="text-sm font-medium">
                            {booking.outbound_flight.departure_airport}
                          </div>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="w-24 h-px bg-gray-300 my-2"></div>
                          <div className="text-xs">Direct</div>
                        </div>

                        <div className="text-center">
                          <div className="text-xl font-bold">
                            {formatTime(booking.outbound_flight.arrival_time)}
                          </div>
                          <div className="text-sm">
                            {formatDate(booking.outbound_flight.arrival_time)}
                          </div>
                          <div className="text-sm font-medium">
                            {booking.outbound_flight.arrival_airport}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0">
                      <span className="text-sm font-medium">
                        {getCabinClassName(booking.cabin_class)}
                      </span>
                    </div>
                  </div>
                </div>

                {booking.return_flight && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-black">
                      Return Flight
                    </h3>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="w-24 flex-shrink-0">
                          <div className="text-lg font-semibold">
                            {booking.return_flight.airline}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.return_flight.flight_number}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-xl font-bold">
                              {formatTime(booking.return_flight.departure_time)}
                            </div>
                            <div className="text-sm">
                              {formatDate(booking.return_flight.departure_time)}
                            </div>
                            <div className="text-sm font-medium">
                              {booking.return_flight.departure_airport}
                            </div>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="w-24 h-px bg-gray-300 my-2"></div>
                            <div className="text-xs">Direct</div>
                          </div>

                          <div className="text-center">
                            <div className="text-xl font-bold">
                              {formatTime(booking.return_flight.arrival_time)}
                            </div>
                            <div className="text-sm">
                              {formatDate(booking.return_flight.arrival_time)}
                            </div>
                            <div className="text-sm font-medium">
                              {booking.return_flight.arrival_airport}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0">
                        <span className="text-sm font-medium">
                          {getCabinClassName(booking.cabin_class)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 mt-6">
                  <Link
                    to={`/booking/confirmation?reference=${booking.booking_reference}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
