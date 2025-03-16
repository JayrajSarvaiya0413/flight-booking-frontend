import { Link } from "@remix-run/react";

type CabinClass = {
  id: string;
  class_type: string;
  price: number;
  available_seats: number;
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
  status: string;
  cabinClasses: CabinClass[];
};

type FlightCardProps = {
  flight: Flight;
  selectedCabinClass?: string;
};

export default function FlightCard({
  flight,
  selectedCabinClass = "Economy",
}: FlightCardProps) {
  // Find the selected cabin class
  const cabinClass = flight.cabinClasses?.find(
    (c) => c.class_type === selectedCabinClass
  );

  // Format duration from minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format date and time
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return {
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  };

  const departure = formatDateTime(flight.departure_time);
  const arrival = formatDateTime(flight.arrival_time);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            {flight.airline} - {flight.flight_number}
          </h3>
          <p className="text-sm text-gray-500">
            {departure.date} • {formatDuration(flight.duration)}
          </p>
        </div>
        <div className="text-right">
          {cabinClass ? (
            <>
              <p className="text-xl font-bold">${cabinClass.price}</p>
              <p className="text-sm text-gray-500">{cabinClass.class_type}</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Price not available</p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-center">
          <p className="text-lg font-semibold">{departure.time}</p>
          <p className="text-sm font-medium">{flight.source}</p>
        </div>

        <div className="flex-1 mx-4">
          <div className="relative">
            <div className="border-t-2 border-gray-300 absolute w-full top-1/2"></div>
            <div className="flex justify-between relative">
              <div className="w-3 h-3 rounded-full bg-blue-500 -mt-1.5"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 -mt-1.5"></div>
            </div>
            <p className="text-xs text-center text-gray-500 mt-1">
              {formatDuration(flight.duration)}
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold">{arrival.time}</p>
          <p className="text-sm font-medium">{flight.destination}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              flight.status === "On Time"
                ? "bg-green-100 text-green-800"
                : flight.status === "Delayed"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {flight.status}
          </span>
          {cabinClass && (
            <span className="ml-2 text-sm text-gray-600">
              {cabinClass.available_seats} seats left
            </span>
          )}
        </div>

        <Link
          to={`/booking/new?flight_id=${flight.id}&cabin_class=${selectedCabinClass}`}
          className="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700 transition"
        >
          Select
        </Link>
      </div>
    </div>
  );
}
