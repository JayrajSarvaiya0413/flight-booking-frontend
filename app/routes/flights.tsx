import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "@remix-run/react";
import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import FlightSearch from "~/components/FlightSearch";

export const meta: MetaFunction = () => {
  return [
    { title: "Flight Search Results - Thena Flight Booking" },
    {
      name: "description",
      content: "Search and compare flights to find the best deals.",
    },
  ];
};

type Flight = {
  id: string;
  airline: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  duration: number;
  price: number;
  available_seats: number;
};

export default function Flights() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [outboundFlights, setOutboundFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<
    string | null
  >(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<
    string | null
  >(null);

  // Get search parameters
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const departureDate = searchParams.get("departureDate") || "";
  const returnDate = searchParams.get("returnDate") || "";
  const passengers = parseInt(searchParams.get("passengers") || "1");
  const cabinClass = searchParams.get("cabinClass") || "economy";
  const tripType = searchParams.get("tripType") || "round-trip";

  useEffect(() => {
    const fetchFlights = async () => {
      if (!origin || !destination || !departureDate) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get API URL from environment variable
        const apiUrl = process.env.API_URL || "http://localhost:3000";

        // Fetch outbound flights
        const outboundResponse = await fetch(
          `${apiUrl}/flights/search?origin=${origin}&destination=${destination}&date=${departureDate}&cabin_class=${cabinClass}`
        );

        if (!outboundResponse.ok) {
          throw new Error(
            `Error fetching outbound flights: ${outboundResponse.statusText}`
          );
        }

        const outboundData = await outboundResponse.json();
        setOutboundFlights(outboundData);

        // Fetch return flights if round trip
        if (tripType === "round-trip" && returnDate) {
          const returnResponse = await fetch(
            `${apiUrl}/flights/search?origin=${destination}&destination=${origin}&date=${returnDate}&cabin_class=${cabinClass}`
          );

          if (!returnResponse.ok) {
            throw new Error(
              `Error fetching return flights: ${returnResponse.statusText}`
            );
          }

          const returnData = await returnResponse.json();
          setReturnFlights(returnData);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching flights:", err);
        setError("Failed to load flights. Please try again later.");
        setLoading(false);
      }
    };

    fetchFlights();
  }, [origin, destination, departureDate, returnDate, cabinClass, tripType]);

  const formatTime = (dateString: string) => {
    try {
      if (!dateString) return "N/A";

      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date string for time formatting:", dateString);
        return "N/A";
      }

      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting time:", error, dateString);
      return "N/A";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Not specified";

      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date string:", dateString);
        return "Not specified";
      }

      return date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Not specified";
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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

  const handleFlightSelection = (
    flightId: string,
    type: "outbound" | "return"
  ) => {
    if (type === "outbound") {
      setSelectedOutboundFlight(flightId);
    } else {
      setSelectedReturnFlight(flightId);
    }
  };

  const handleContinue = () => {
    if (!selectedOutboundFlight) {
      alert("Please select an outbound flight");
      return;
    }

    if (tripType === "round-trip" && !selectedReturnFlight) {
      alert("Please select a return flight");
      return;
    }

    // Navigate to passenger details page with selected flights
    const bookingParams = new URLSearchParams();
    bookingParams.append("outbound_flight", selectedOutboundFlight);

    if (tripType === "round-trip" && selectedReturnFlight) {
      bookingParams.append("return_flight", selectedReturnFlight);
    }

    bookingParams.append("adults", passengers.toString());
    bookingParams.append("children", "0");
    bookingParams.append("infants", "0");
    bookingParams.append("cabin_class", cabinClass);

    navigate(`/booking/passengers?${bookingParams.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Flight Search Results</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Your Search
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <span className="font-semibold mr-2 text-gray-900 block mb-1">
              From:
            </span>
            <span className="text-gray-800 text-lg">
              {origin || "Not specified"}
            </span>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <span className="font-semibold mr-2 text-gray-900 block mb-1">
              To:
            </span>
            <span className="text-gray-800 text-lg">
              {destination || "Not specified"}
            </span>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <span className="font-semibold mr-2 text-gray-900 block mb-1">
              Departure:
            </span>
            <span className="text-gray-800 text-lg">
              {departureDate || "Not specified"}
            </span>
          </div>
          {tripType === "round-trip" && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <span className="font-semibold mr-2 text-gray-900 block mb-1">
                Return:
              </span>
              <span className="text-gray-800 text-lg">
                {returnDate || "Not specified"}
              </span>
            </div>
          )}
          <div className="bg-blue-50 p-3 rounded-lg">
            <span className="font-semibold mr-2 text-gray-900 block mb-1">
              Passengers:
            </span>
            <span className="text-gray-800 text-lg">{passengers}</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <span className="font-semibold mr-2 text-gray-900 block mb-1">
              Class:
            </span>
            <span className="text-gray-800 text-lg">
              {getCabinClassName(cabinClass)}
            </span>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold transition-colors"
          >
            Modify Search
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Outbound Flights */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {origin} to {destination} - {formatDate(departureDate)}
            </h2>

            {outboundFlights.length === 0 ? (
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
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  No Flights Found
                </h3>
                <p className="text-gray-700 mb-6">
                  We couldn't find any flights matching your search criteria.
                </p>
                <Link
                  to="/"
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Modify Search
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {outboundFlights.map((flight) => (
                  <div
                    key={flight.id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
                      selectedOutboundFlight === flight.id
                        ? "border-blue-500"
                        : "border-transparent"
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="w-24 flex-shrink-0">
                            <div className="text-lg font-semibold text-gray-900">
                              {flight.airline}
                            </div>
                            <div className="text-sm text-gray-600">
                              {flight.flight_number}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-900">
                                {formatTime(flight.departure_time)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatDate(flight.departure_time)}
                              </div>
                              <div className="text-sm font-medium text-gray-800">
                                {flight.departure_airport}
                              </div>
                            </div>

                            <div className="flex flex-col items-center">
                              <div className="text-xs text-gray-600">
                                {formatDuration(flight.duration)}
                              </div>
                              <div className="w-24 h-px bg-gray-300 my-2"></div>
                              <div className="text-xs text-gray-600">
                                Direct
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-900">
                                {formatTime(flight.arrival_time)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatDate(flight.arrival_time)}
                              </div>
                              <div className="text-sm font-medium text-gray-800">
                                {flight.arrival_airport}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 md:mt-0 flex flex-col items-end">
                          <div className="text-2xl font-bold text-gray-900">
                            ${flight.price ? flight.price.toFixed(2) : "0.00"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {getCabinClassName(cabinClass)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {flight.available_seats} seats left
                          </div>
                          <button
                            onClick={() =>
                              handleFlightSelection(flight.id, "outbound")
                            }
                            className={`mt-2 px-4 py-2 rounded-md ${
                              selectedOutboundFlight === flight.id
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                          >
                            {selectedOutboundFlight === flight.id
                              ? "Selected"
                              : "Select"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Return Flights */}
          {tripType === "round-trip" && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                {destination} to {origin} - {formatDate(returnDate)}
              </h2>

              {returnFlights.length === 0 ? (
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
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    No Return Flights Found
                  </h3>
                  <p className="text-gray-700 mb-6">
                    We couldn't find any return flights matching your search
                    criteria.
                  </p>
                  <Link
                    to="/"
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Modify Search
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {returnFlights.map((flight) => (
                    <div
                      key={flight.id}
                      className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
                        selectedReturnFlight === flight.id
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="w-24 flex-shrink-0">
                              <div className="text-lg font-semibold text-gray-900">
                                {flight.airline}
                              </div>
                              <div className="text-sm text-gray-600">
                                {flight.flight_number}
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-xl font-bold text-gray-900">
                                  {formatTime(flight.departure_time)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatDate(flight.departure_time)}
                                </div>
                                <div className="text-sm font-medium text-gray-800">
                                  {flight.departure_airport}
                                </div>
                              </div>

                              <div className="flex flex-col items-center">
                                <div className="text-xs text-gray-600">
                                  {formatDuration(flight.duration)}
                                </div>
                                <div className="w-24 h-px bg-gray-300 my-2"></div>
                                <div className="text-xs text-gray-600">
                                  Direct
                                </div>
                              </div>

                              <div className="text-center">
                                <div className="text-xl font-bold text-gray-900">
                                  {formatTime(flight.arrival_time)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatDate(flight.arrival_time)}
                                </div>
                                <div className="text-sm font-medium text-gray-800">
                                  {flight.arrival_airport}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 md:mt-0 flex flex-col items-end">
                            <div className="text-2xl font-bold text-gray-900">
                              ${flight.price ? flight.price.toFixed(2) : "0.00"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {getCabinClassName(cabinClass)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {flight.available_seats} seats left
                            </div>
                            <button
                              onClick={() =>
                                handleFlightSelection(flight.id, "return")
                              }
                              className={`mt-2 px-4 py-2 rounded-md ${
                                selectedReturnFlight === flight.id
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                              }`}
                            >
                              {selectedReturnFlight === flight.id
                                ? "Selected"
                                : "Select"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Continue Button */}
          {(outboundFlights.length > 0 || returnFlights.length > 0) && (
            <div className="flex justify-end mt-8">
              <button
                onClick={handleContinue}
                disabled={
                  !selectedOutboundFlight ||
                  (tripType === "round-trip" && !selectedReturnFlight)
                }
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Passenger Details
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
