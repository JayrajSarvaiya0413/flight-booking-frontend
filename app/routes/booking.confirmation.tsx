import { useEffect, useState } from "react";
import { useSearchParams, Link } from "@remix-run/react";
import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Booking Confirmation - Thena Flight Booking" },
    {
      name: "description",
      content: "Your flight booking has been confirmed.",
    },
  ];
};

export default function BookingConfirmation() {
  const [searchParams] = useSearchParams();
  const bookingReference = searchParams.get("reference");
  const email = searchParams.get("email");
  const isDemo = searchParams.get("demo") === "true";
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, you would fetch the booking details from the API
    // For demo purposes, we'll just simulate a successful booking
    const timer = setTimeout(() => {
      setIsLoading(false);
      setBookingDetails({
        reference: bookingReference || "ABC123",
        status: "confirmed",
        date: new Date().toLocaleDateString(),
        email: email || "user@example.com",
        isDemo: isDemo,
        outboundFlight: {
          airline: "Thena Airways",
          flightNumber: "TA123",
          departureAirport: "JFK",
          arrivalAirport: "LAX",
          departureTime: new Date().toISOString(),
          arrivalTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        },
        passengers: [{ firstName: "John", lastName: "Doe" }],
        totalAmount: 499.99,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [bookingReference, email, isDemo]);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-blue-600 text-white">
            <h1 className="text-2xl font-bold">Booking Confirmation</h1>
            <p className="mt-1 text-sm">
              Thank you for booking with Thena Flight Booking!
            </p>
          </div>

          {isLoading ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : error ? (
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center text-red-600">
                <p className="text-lg font-semibold">Error</p>
                <p>{error}</p>
                <Link
                  to="/"
                  className="mt-4 inline-block text-blue-600 hover:underline"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center mb-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="mt-3 text-lg font-medium text-black">
                    Payment successful!
                  </h2>
                  <p className="mt-1 text-sm text-black">
                    Your booking has been confirmed and a confirmation email has
                    been sent to your email address.
                  </p>
                </div>

                {bookingDetails.isDemo && (
                  <div className="mb-8 bg-yellow-50 p-4 rounded-md border border-yellow-100">
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-yellow-500 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-yellow-800 font-medium">
                        Demo Mode
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-black">
                      This is a demonstration booking. In a real application,
                      this booking would be saved to a database and a real email
                      would be sent.
                    </p>
                  </div>
                )}

                <div className="mb-8 bg-blue-50 p-4 rounded-md border border-blue-100">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-blue-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-blue-800 font-medium">
                      Email Confirmation Sent
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-black">
                    A detailed confirmation has been sent to{" "}
                    <strong>{bookingDetails.email}</strong> with all your
                    booking information. Please check your inbox (and spam
                    folder if necessary).
                  </p>
                </div>

                <div className="border-t border-gray-200 py-5">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-black">
                        Booking Reference
                      </dt>
                      <dd className="mt-1 text-sm text-black">
                        {bookingDetails.reference}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-black">Status</dt>
                      <dd className="mt-1 text-sm text-black">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {bookingDetails.status}
                        </span>
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-black">
                        Booking Date
                      </dt>
                      <dd className="mt-1 text-sm text-black">
                        {bookingDetails.date}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-black">
                        Total Amount
                      </dt>
                      <dd className="mt-1 text-sm text-black">
                        ${bookingDetails.totalAmount.toFixed(2)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="border-t border-gray-200 py-5">
                  <h3 className="text-lg font-medium text-black">
                    Flight Details
                  </h3>
                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-black">
                          Outbound Flight
                        </p>
                        <p className="text-lg font-bold text-black">
                          {bookingDetails.outboundFlight.airline}{" "}
                          {bookingDetails.outboundFlight.flightNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-black">Date</p>
                        <p className="text-sm text-black">
                          {
                            formatDateTime(
                              bookingDetails.outboundFlight.departureTime
                            ).split(",")[0]
                          }
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-black">From</p>
                        <p className="text-lg font-bold text-black">
                          {bookingDetails.outboundFlight.departureAirport}
                        </p>
                        <p className="text-sm text-black">
                          {
                            formatDateTime(
                              bookingDetails.outboundFlight.departureTime
                            ).split(",")[1]
                          }
                        </p>
                      </div>
                      <div className="flex-1 px-4">
                        <div className="relative">
                          <div
                            className="absolute inset-0 flex items-center"
                            aria-hidden="true"
                          >
                            <div className="w-full border-t border-gray-300"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-gray-50 px-2 text-sm text-black">
                              <svg
                                className="h-5 w-5 text-black"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-black">To</p>
                        <p className="text-lg font-bold text-black">
                          {bookingDetails.outboundFlight.arrivalAirport}
                        </p>
                        <p className="text-sm text-black">
                          {
                            formatDateTime(
                              bookingDetails.outboundFlight.arrivalTime
                            ).split(",")[1]
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 py-5">
                  <h3 className="text-lg font-medium text-black">
                    Passenger Information
                  </h3>
                  <ul className="mt-4 divide-y divide-gray-200">
                    {bookingDetails.passengers.map(
                      (passenger: any, index: number) => (
                        <li key={index} className="py-4 flex">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-black">
                              {passenger.firstName} {passenger.lastName}
                            </p>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between">
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Return to Home
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Print Confirmation
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
