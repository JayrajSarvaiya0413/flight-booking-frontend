import { Form, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/node";

// Define Flight Type
type Flight = {
  id: number;
  airline: string;
  flight_number: string;
  source: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
};

// Loader Function for Fetching Flights
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const source = url.searchParams.get("source") || "";
  const destination = url.searchParams.get("destination") || "";
  const date = url.searchParams.get("date") || "";

  if (!source || !destination || !date) return json([]);
  console.log(source, destination, date);

  const response = await fetch(
    `http://localhost:3000/flights/search?source=${source}&destination=${destination}&date=${date}`
  );
  const flights: Flight[] = await response.json();
  return json(flights);
};

export default function Flights() {
  const flights = useLoaderData<Flight[]>();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Search Flights</h2>
      <Form method="get" className="flex gap-2 mb-4">
        <input
          className="border p-2"
          name="source"
          placeholder="Source"
          required
        />
        <input
          className="border p-2"
          name="destination"
          placeholder="Destination"
          required
        />
        <input className="border p-2" type="date" name="date" required />
        <button className="bg-blue-500 text-white p-2">Search</button>
      </Form>

      <h2 className="text-xl font-bold">Available Flights</h2>
      <ul>
        {flights.length > 0 ? (
          flights.map((flight) => (
            <li key={flight.id} className="border p-2 my-2">
              <strong>
                {flight.airline} - {flight.flight_number}
              </strong>{" "}
              <br />✈ {flight.source} → {flight.destination} <br />
              🕒 {flight.departure_time} | 💲 {flight.price}
            </li>
          ))
        ) : (
          <p>No flights found.</p>
        )}
      </ul>
    </div>
  );
}
