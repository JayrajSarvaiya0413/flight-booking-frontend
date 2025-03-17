import { MetaFunction } from "@remix-run/node";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-4xl">
        {/* Flight Search Section */}
        <section>
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              Find Your Perfect Flight
            </h1>
            <p className="text-black text-lg">
              Search for flights to any destination worldwide
            </p>
          </div>
          <FlightSearch className="shadow-xl" />
        </section>
      </div>
    </div>
  );
}
