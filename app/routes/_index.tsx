import { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import FlightSearch from "~/components/FlightSearch";

export const meta: MetaFunction = () => {
  return [
    { title: "Thena Flight Booking - Book Your Flights with Ease" },
    {
      name: "description",
      content:
        "Book your flights with ease and convenience. Search, compare, and book flights to destinations worldwide.",
    },
  ];
};

export default function Index() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90 rounded-xl"></div>
        <div className="relative py-12 sm:py-16 px-4 sm:px-8 rounded-xl overflow-hidden">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Travel the World with Confidence
            </h1>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8">
              Book your flights with ease and convenience. Search, compare, and
              book flights to destinations worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/flights"
                className="bg-white text-blue-600 px-5 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Search Flights
              </Link>
              <Link
                to="/about"
                className="bg-transparent border-2 border-white text-white px-5 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Flight Search Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Find Your Perfect Flight
          </h2>
          <p className="text-gray-600">
            Search for flights to any destination worldwide
          </p>
        </div>
        <FlightSearch />
      </section>

      {/* Features Section */}
      <section className="py-10 sm:py-12 px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Why Choose Us</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We offer the best flight booking experience with exclusive features
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Best Price Guarantee</h3>
            <p className="text-gray-600">
              We offer competitive prices on flights with no hidden fees
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
            <p className="text-gray-600">
              Get instant notifications about flight status changes
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center sm:col-span-2 lg:col-span-1 sm:max-w-md sm:mx-auto lg:max-w-none">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
            <p className="text-gray-600">
              Book with confidence using our secure payment system
            </p>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-10 sm:py-12 px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Popular Destinations
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our most popular flight destinations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              city: "New York",
              code: "JFK",
              image:
                "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bmV3JTIweW9ya3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            },
            {
              city: "London",
              code: "LHR",
              image:
                "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bG9uZG9ufGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            },
            {
              city: "Tokyo",
              code: "HND",
              image:
                "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dG9reW98ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            },
            {
              city: "Paris",
              code: "CDG",
              image:
                "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cGFyaXN8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            },
          ].map((destination, index) => (
            <div
              key={index}
              className="relative rounded-lg overflow-hidden group h-48 sm:h-64"
            >
              <img
                src={destination.image}
                alt={destination.city}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <h3 className="text-xl font-bold">{destination.city}</h3>
                <p className="text-sm">{destination.code}</p>
              </div>
              <Link
                to={`/flights?destination=${destination.code}`}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                  Find Flights
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-12 sm:py-16 px-4 rounded-xl">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8">
            Sign up now and get exclusive deals on your first booking
          </p>
          <Link
            to="/auth"
            className="inline-block bg-white text-blue-600 px-6 py-2 sm:px-8 sm:py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
}
