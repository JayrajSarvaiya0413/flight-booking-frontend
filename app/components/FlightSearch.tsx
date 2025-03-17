import { useState } from "react";
import { Form, useNavigate } from "@remix-run/react";

type FlightSearchProps = {
  className?: string;
};

export default function FlightSearch({ className = "" }: FlightSearchProps) {
  const navigate = useNavigate();

  const [tripType, setTripType] = useState<"one-way" | "round-trip">(
    "round-trip"
  );
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState<
    "economy" | "premium_economy" | "business" | "first"
  >("economy");

  // Popular airports for quick selection
  const popularAirports = [
    { code: "JFK", name: "New York John F. Kennedy" },
    { code: "LAX", name: "Los Angeles International" },
    { code: "LHR", name: "London Heathrow" },
    { code: "CDG", name: "Paris Charles de Gaulle" },
    { code: "DXB", name: "Dubai International" },
    { code: "SIN", name: "Singapore Changi" },
    { code: "HND", name: "Tokyo Haneda" },
    { code: "SYD", name: "Sydney Kingsford Smith" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build query parameters
    const params = new URLSearchParams();
    params.append("origin", origin);
    params.append("destination", destination);
    params.append("departureDate", departureDate);

    if (tripType === "round-trip" && returnDate) {
      params.append("returnDate", returnDate);
    }

    params.append("passengers", passengers.toString());
    params.append("cabinClass", cabinClass);
    params.append("tripType", tripType);

    // Navigate to flights page with search parameters
    navigate(`/flights?${params.toString()}`);
  };

  // Calculate minimum dates for departure and return
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const minDepartureDate = formatDateForInput(today);
  const minReturnDate = departureDate || formatDateForInput(tomorrow);

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${className}`}>
      <div className="flex flex-wrap gap-4 mb-4">
        <label className="inline-flex items-center">
          <input
            type="radio"
            className="form-radio h-5 w-5 text-blue-600 bg-white"
            checked={tripType === "round-trip"}
            onChange={() => setTripType("round-trip")}
          />
          <span className="ml-2 text-black">Round Trip</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            className="form-radio h-5 w-5 text-blue-600 bg-white"
            checked={tripType === "one-way"}
            onChange={() => setTripType("one-way")}
          />
          <span className="ml-2 text-black">One Way</span>
        </label>
      </div>

      <Form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Origin */}
          <div>
            <label
              htmlFor="origin"
              className="block text-sm font-medium text-black mb-1"
            >
              From
            </label>
            <select
              id="origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="">Select Origin Airport</option>
              {popularAirports.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {airport.code} - {airport.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label
              htmlFor="destination"
              className="block text-sm font-medium text-black mb-1"
            >
              To
            </label>
            <select
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="">Select Destination Airport</option>
              {popularAirports.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {airport.code} - {airport.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Departure Date */}
          <div>
            <label
              htmlFor="departureDate"
              className="block text-sm font-medium text-black mb-1"
            >
              Departure Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="departureDate"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={minDepartureDate}
                required
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [color-scheme:light]"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-black"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Return Date */}
          {tripType === "round-trip" && (
            <div>
              <label
                htmlFor="returnDate"
                className="block text-sm font-medium text-black mb-1"
              >
                Return Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="returnDate"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={minReturnDate}
                  required={tripType === "round-trip"}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [color-scheme:light]"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-black"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Passengers */}
          <div>
            <label
              htmlFor="passengers"
              className="block text-sm font-medium text-black mb-1"
            >
              Passengers
            </label>
            <select
              id="passengers"
              value={passengers}
              onChange={(e) => setPassengers(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "Passenger" : "Passengers"}
                </option>
              ))}
            </select>
          </div>

          {/* Cabin Class */}
          <div>
            <label
              htmlFor="cabinClass"
              className="block text-sm font-medium text-black mb-1"
            >
              Cabin Class
            </label>
            <select
              id="cabinClass"
              value={cabinClass}
              onChange={(e) =>
                setCabinClass(
                  e.target.value as
                    | "economy"
                    | "premium_economy"
                    | "business"
                    | "first"
                )
              }
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="economy">Economy</option>
              <option value="premium_economy">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First Class</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Search Flights
        </button>
      </Form>
    </div>
  );
}
