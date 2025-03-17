import { useState, useEffect } from "react";
import {
  useSearchParams,
  Link,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import FlightSearch from "~/components/FlightSearch";

export const meta: MetaFunction = () => {
  return [
    { title: "Flight Search Results - Thena Flight Booking" },
    {
      name: "description",
      content: "View available flights based on your search criteria.",
    },
  ];
};

type Flight = {
  id: string;
  airline: string;
  flight_number: string;
  source: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: number;
  aircraft_type: string;
  status: string;
  cabinClasses: {
    id: string;
    class_type: string;
    price: string | number;
    total_seats: number;
    available_seats: number;
  }[];
};

type LoaderData = {
  searchParams: {
    origin: string | null;
    destination: string | null;
    departure_date: string | null;
    return_date: string | null;
    trip_type: string;
    cabin_class: string;
    adults: number;
    children: number;
    infants: number;
  };
  outboundFlights: Flight[];
  returnFlights: Flight[];
  error?: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const origin = url.searchParams.get("origin");
  const destination = url.searchParams.get("destination");
  const departure_date = url.searchParams.get("departure_date");
  const return_date = url.searchParams.get("return_date");
  const trip_type = url.searchParams.get("trip_type") || "one_way";
  const cabin_class = url.searchParams.get("cabin_class") || "economy";
  const adults = parseInt(url.searchParams.get("adults") || "1");
  const children = parseInt(url.searchParams.get("children") || "0");
  const infants = parseInt(url.searchParams.get("infants") || "0");

  // Get API URL from environment variable
  const apiUrl = process.env.API_URL || "http://localhost:3000";

  try {
    // Fetch outbound flights
    const outboundResponse = await fetch(
      `${apiUrl}/flights/search?origin=${origin}&destination=${destination}&date=${departure_date}&cabin_class=${cabin_class}`
    );

    if (!outboundResponse.ok) {
      throw new Error(
        `Error fetching outbound flights: ${outboundResponse.statusText}`
      );
    }

    const outboundFlights = await outboundResponse.json();

    // Fetch return flights if round trip
    let returnFlights = [];
    if (trip_type === "round_trip" && return_date) {
      const returnResponse = await fetch(
        `${apiUrl}/flights/search?origin=${destination}&destination=${origin}&date=${return_date}&cabin_class=${cabin_class}`
      );

      if (!returnResponse.ok) {
        throw new Error(
          `Error fetching return flights: ${returnResponse.statusText}`
        );
      }

      returnFlights = await returnResponse.json();
    }

    return json<LoaderData>({
      searchParams: {
        origin,
        destination,
        departure_date,
        return_date,
        trip_type,
        cabin_class,
        adults,
        children,
        infants,
      },
      outboundFlights,
      returnFlights,
    });
  } catch (error) {
    console.error("Error fetching flights:", error);
    return json<LoaderData>({
      searchParams: {
        origin,
        destination,
        departure_date,
        return_date,
        trip_type,
        cabin_class,
        adults,
        children,
        infants,
      },
      outboundFlights: [],
      returnFlights: [],
      error: "Failed to fetch flights. Please try again later.",
    });
  }
};

export default function FlightSearchResults() {
  const { searchParams, outboundFlights, returnFlights, error } =
    useLoaderData<typeof loader>();
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<
    string | null
  >(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<
    string | null
  >(null);
  const [searchParamsState, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const isRoundTrip = searchParams.trip_type === "round_trip";
  const totalPassengers =
    searchParams.adults + searchParams.children + searchParams.infants;

  // Format price based on cabin class
  const formatPrice = (flight: Flight, cabinClass: string) => {
    // Find the matching cabin class
    const cabinClassData = flight.cabinClasses?.find(
      (c) => c.class_type.toLowerCase() === cabinClass.toLowerCase()
    );

    if (!cabinClassData) return "0.00";

    // Convert price to number if it's a string
    const basePrice =
      typeof cabinClassData.price === "string"
        ? parseFloat(cabinClassData.price)
        : cabinClassData.price;

    return (basePrice * totalPassengers).toFixed(2);
  };

  // Helper function to get available seats for a flight and cabin class
  const getAvailableSeats = (flight: Flight, cabinClass: string) => {
    const cabinClassData = flight.cabinClasses?.find(
      (c) => c.class_type.toLowerCase() === cabinClass.toLowerCase()
    );

    return cabinClassData?.available_seats || 0;
  };

  // Format duration from minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format date and time
  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return {
        time: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          weekday: "short",
        }),
      };
    } catch (error) {
      console.error("Error formatting date time:", error);
      return {
        time: "Invalid time",
        date: "Invalid date",
      };
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";

    try {
      return new Date(dateString).toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    let total = 0;

    if (selectedOutboundFlight) {
      const outboundFlight = outboundFlights.find(
        (flight) => flight.id === selectedOutboundFlight
      );
      if (outboundFlight) {
        total += parseFloat(
          formatPrice(outboundFlight, searchParams.cabin_class)
        );
      }
    }

    if (isRoundTrip && selectedReturnFlight) {
      const returnFlight = returnFlights.find(
        (flight) => flight.id === selectedReturnFlight
      );
      if (returnFlight) {
        total += parseFloat(
          formatPrice(returnFlight, searchParams.cabin_class)
        );
      }
    }

    return total.toFixed(2);
  };

  // Check if booking can proceed
  const canProceed = () => {
    if (isRoundTrip) {
      return selectedOutboundFlight && selectedReturnFlight;
    }
    return selectedOutboundFlight;
  };

  // Cabin class display name
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

  const handleBooking = () => {
    if (!selectedOutboundFlight) return;

    const outboundFlight = outboundFlights.find(
      (flight) => flight.id === selectedOutboundFlight
    );

    let returnFlight = null;
    if (isRoundTrip && selectedReturnFlight) {
      returnFlight = returnFlights.find(
        (flight) => flight.id === selectedReturnFlight
      );
    }

    if (!outboundFlight) return;

    const bookingParams = new URLSearchParams();
    bookingParams.append("outbound_flight_id", outboundFlight.id);

    if (returnFlight) {
      bookingParams.append("return_flight_id", returnFlight.id);
    }

    bookingParams.append("cabin_class", searchParams.cabin_class);
    bookingParams.append("adults", searchParams.adults.toString());
    bookingParams.append("children", searchParams.children.toString());
    bookingParams.append("infants", searchParams.infants.toString());
    bookingParams.append("total_price", calculateTotalPrice());

    navigate(`/booking/passengers?${bookingParams.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-black">
        Flight Search Results
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <FlightSearch />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          {/* Outbound Flights */}
          <div className="mb-8">
            <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
              <h2 className="text-xl font-semibold">
                Outbound Flight: {searchParams.origin} to{" "}
                {searchParams.destination}
              </h2>
              <p>{formatDate(searchParams.departure_date)}</p>
            </div>

            {outboundFlights.length === 0 ? (
              <div className="bg-white p-6 rounded-b-lg border border-gray-200">
                <p className="text-black">
                  No flights found for this route and date. Please try different
                  search criteria.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-b-lg border border-gray-200 divide-y divide-gray-200">
                {outboundFlights.map((flight: Flight) => {
                  const departureInfo = formatDateTime(flight.departure_time);
                  const arrivalInfo = formatDateTime(flight.arrival_time);
                  const price = formatPrice(flight, searchParams.cabin_class);

                  return (
                    <div
                      key={flight.id}
                      className={`p-6 flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer hover:bg-blue-50 transition-colors ${
                        selectedOutboundFlight === flight.id
                          ? "bg-blue-50 border-l-4 border-blue-600"
                          : ""
                      }`}
                      onClick={() => setSelectedOutboundFlight(flight.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 md:mb-0">
                        <div className="w-24 flex-shrink-0">
                          <div className="text-lg font-semibold">
                            {flight.airline}
                          </div>
                          <div className="text-sm text-black">
                            {flight.flight_number}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-xl font-bold">
                              {departureInfo.time}
                            </div>
                            <div className="text-sm text-black">
                              {departureInfo.date}
                            </div>
                            <div className="text-sm font-medium">
                              {flight.source}
                            </div>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="text-xs">
                              {formatDuration(flight.duration)}
                            </div>
                            <div className="w-24 h-px bg-gray-300 my-2"></div>
                            <div className="text-xs">Direct</div>
                          </div>

                          <div className="text-center">
                            <div className="text-xl font-bold">
                              {arrivalInfo.time}
                            </div>
                            <div className="text-sm text-black">
                              {arrivalInfo.date}
                            </div>
                            <div className="text-sm font-medium">
                              {flight.destination}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          ${price}
                        </div>
                        <div className="text-sm text-black">
                          {getCabinClassName(searchParams.cabin_class)}
                        </div>
                        <div className="text-sm text-black">
                          {getAvailableSeats(flight, searchParams.cabin_class)}{" "}
                          seats left
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Return Flights (if round trip) */}
          {isRoundTrip && (
            <div>
              <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                <h2 className="text-xl font-semibold">
                  Return Flight: {searchParams.destination} to{" "}
                  {searchParams.origin}
                </h2>
                <p>{formatDate(searchParams.return_date)}</p>
              </div>

              {returnFlights.length === 0 ? (
                <div className="bg-white p-6 rounded-b-lg border border-gray-200">
                  <p className="text-black">
                    No flights found for this route and date. Please try
                    different search criteria.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-b-lg border border-gray-200 divide-y divide-gray-200">
                  {returnFlights.map((flight: Flight) => {
                    const departureInfo = formatDateTime(flight.departure_time);
                    const arrivalInfo = formatDateTime(flight.arrival_time);
                    const price = formatPrice(flight, searchParams.cabin_class);

                    return (
                      <div
                        key={flight.id}
                        className={`p-6 flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer hover:bg-blue-50 transition-colors ${
                          selectedReturnFlight === flight.id
                            ? "bg-blue-50 border-l-4 border-blue-600"
                            : ""
                        }`}
                        onClick={() => setSelectedReturnFlight(flight.id)}
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 md:mb-0">
                          <div className="w-24 flex-shrink-0">
                            <div className="text-lg font-semibold">
                              {flight.airline}
                            </div>
                            <div className="text-sm text-black">
                              {flight.flight_number}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-xl font-bold">
                                {departureInfo.time}
                              </div>
                              <div className="text-sm text-black">
                                {departureInfo.date}
                              </div>
                              <div className="text-sm font-medium">
                                {flight.source}
                              </div>
                            </div>

                            <div className="flex flex-col items-center">
                              <div className="text-xs">
                                {formatDuration(flight.duration)}
                              </div>
                              <div className="w-24 h-px bg-gray-300 my-2"></div>
                              <div className="text-xs">Direct</div>
                            </div>

                            <div className="text-center">
                              <div className="text-xl font-bold">
                                {arrivalInfo.time}
                              </div>
                              <div className="text-sm text-black">
                                {arrivalInfo.date}
                              </div>
                              <div className="text-sm font-medium">
                                {flight.destination}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            ${price}
                          </div>
                          <div className="text-sm text-black">
                            {getCabinClassName(searchParams.cabin_class)}
                          </div>
                          <div className="text-sm text-black">
                            {getAvailableSeats(
                              flight,
                              searchParams.cabin_class
                            )}{" "}
                            seats left
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Booking Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-black">
              Booking Summary
            </h2>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span>Passengers:</span>
                <span className="font-medium">
                  {searchParams.adults} Adult
                  {searchParams.adults !== 1 ? "s" : ""}
                  {searchParams.children > 0 &&
                    `, ${searchParams.children} Child${
                      searchParams.children !== 1 ? "ren" : ""
                    }`}
                  {searchParams.infants > 0 &&
                    `, ${searchParams.infants} Infant${
                      searchParams.infants !== 1 ? "s" : ""
                    }`}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span>Cabin Class:</span>
                <span className="font-medium">
                  {getCabinClassName(searchParams.cabin_class)}
                </span>
              </div>

              <div className="border-t border-gray-200 my-4"></div>

              {selectedOutboundFlight && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2 text-black">
                    Outbound Flight
                  </h3>
                  {outboundFlights.map((flight: Flight) => {
                    if (flight.id === selectedOutboundFlight) {
                      const departureInfo = formatDateTime(
                        flight.departure_time
                      );
                      const arrivalInfo = formatDateTime(flight.arrival_time);
                      return (
                        <div key={flight.id} className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span>
                              {flight.airline} {flight.flight_number}
                            </span>
                            <span className="font-medium">
                              ${formatPrice(flight, searchParams.cabin_class)}
                            </span>
                          </div>
                          <div>
                            {flight.source} ({departureInfo.time}) →{" "}
                            {flight.destination} ({arrivalInfo.time})
                          </div>
                          <div>{departureInfo.date}</div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}

              {isRoundTrip && selectedReturnFlight && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2 text-black">
                    Return Flight
                  </h3>
                  {returnFlights.map((flight: Flight) => {
                    if (flight.id === selectedReturnFlight) {
                      const departureInfo = formatDateTime(
                        flight.departure_time
                      );
                      const arrivalInfo = formatDateTime(flight.arrival_time);
                      return (
                        <div key={flight.id} className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span>
                              {flight.airline} {flight.flight_number}
                            </span>
                            <span className="font-medium">
                              ${formatPrice(flight, searchParams.cabin_class)}
                            </span>
                          </div>
                          <div>
                            {flight.source} ({departureInfo.time}) →{" "}
                            {flight.destination} ({arrivalInfo.time})
                          </div>
                          <div>{departureInfo.date}</div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}

              {(selectedOutboundFlight ||
                (isRoundTrip && selectedReturnFlight)) && (
                <>
                  <div className="border-t border-gray-200 my-4"></div>

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${calculateTotalPrice()}</span>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={!canProceed()}
                    className={`w-full mt-6 py-3 rounded-lg text-white font-semibold ${
                      canProceed()
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isRoundTrip
                      ? selectedOutboundFlight && selectedReturnFlight
                        ? "Continue to Booking"
                        : "Select Flights to Continue"
                      : selectedOutboundFlight
                      ? "Continue to Booking"
                      : "Select Flight to Continue"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
