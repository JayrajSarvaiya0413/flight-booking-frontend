import { useState } from "react";
import { Form, useSearchParams, useNavigate, Link } from "@remix-run/react";
import {
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Passenger Information - Thena Flight Booking" },
    {
      name: "description",
      content: "Enter passenger details for your flight booking.",
    },
  ];
};

type PassengerType = "adult" | "child" | "infant";

type Passenger = {
  type: PassengerType;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  specialRequests: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const outboundFlightId = url.searchParams.get("outbound_flight");
  const returnFlightId = url.searchParams.get("return_flight");
  const adults = parseInt(url.searchParams.get("adults") || "1");
  const children = parseInt(url.searchParams.get("children") || "0");
  const infants = parseInt(url.searchParams.get("infants") || "0");
  const cabinClass = url.searchParams.get("cabin_class") || "economy";

  // Validate required parameters
  if (!outboundFlightId) {
    return redirect("/flights/search");
  }

  return json({
    outboundFlightId,
    returnFlightId,
    adults,
    children,
    infants,
    cabinClass,
  });
};

export default function PassengerInformation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const outboundFlightId = searchParams.get("outbound_flight") || "";
  const returnFlightId = searchParams.get("return_flight") || "";
  const adults = parseInt(searchParams.get("adults") || "1");
  const children = parseInt(searchParams.get("children") || "0");
  const infants = parseInt(searchParams.get("infants") || "0");
  const cabinClass = searchParams.get("cabin_class") || "economy";

  const [passengers, setPassengers] = useState<Passenger[]>(() => {
    const initialPassengers: Passenger[] = [];

    // Add adult passengers
    for (let i = 0; i < adults; i++) {
      initialPassengers.push({
        type: "adult",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nationality: "",
        passportNumber: "",
        passportExpiry: "",
        specialRequests: "",
      });
    }

    // Add child passengers
    for (let i = 0; i < children; i++) {
      initialPassengers.push({
        type: "child",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nationality: "",
        passportNumber: "",
        passportExpiry: "",
        specialRequests: "",
      });
    }

    // Add infant passengers
    for (let i = 0; i < infants; i++) {
      initialPassengers.push({
        type: "infant",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nationality: "",
        passportNumber: "",
        passportExpiry: "",
        specialRequests: "",
      });
    }

    return initialPassengers;
  });

  const [activePassengerIndex, setActivePassengerIndex] = useState(0);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePassengerChange = (
    index: number,
    field: keyof Passenger,
    value: string
  ) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value,
    };
    setPassengers(updatedPassengers);
  };

  const validatePassenger = (passenger: Passenger, index: number) => {
    const newErrors: Record<string, string> = {};

    if (!passenger.firstName.trim()) {
      newErrors[`passenger-${index}-firstName`] = "First name is required";
    }

    if (!passenger.lastName.trim()) {
      newErrors[`passenger-${index}-lastName`] = "Last name is required";
    }

    if (!passenger.dateOfBirth) {
      newErrors[`passenger-${index}-dateOfBirth`] = "Date of birth is required";
    } else {
      const dob = new Date(passenger.dateOfBirth);
      const now = new Date();

      if (passenger.type === "adult") {
        // Check if at least 12 years old
        const twelveYearsAgo = new Date();
        twelveYearsAgo.setFullYear(now.getFullYear() - 12);

        if (dob > twelveYearsAgo) {
          newErrors[`passenger-${index}-dateOfBirth`] =
            "Adult must be at least 12 years old";
        }
      } else if (passenger.type === "child") {
        // Check if between 2 and 11 years old
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(now.getFullYear() - 2);

        const twelveYearsAgo = new Date();
        twelveYearsAgo.setFullYear(now.getFullYear() - 12);

        if (dob <= twelveYearsAgo || dob > twoYearsAgo) {
          newErrors[`passenger-${index}-dateOfBirth`] =
            "Child must be between 2 and 11 years old";
        }
      } else if (passenger.type === "infant") {
        // Check if under 2 years old
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(now.getFullYear() - 2);

        if (dob <= twoYearsAgo) {
          newErrors[`passenger-${index}-dateOfBirth`] =
            "Infant must be under 2 years old";
        }
      }
    }

    if (!passenger.nationality.trim()) {
      newErrors[`passenger-${index}-nationality`] = "Nationality is required";
    }

    if (!passenger.passportNumber.trim()) {
      newErrors[`passenger-${index}-passportNumber`] =
        "Passport number is required";
    }

    if (!passenger.passportExpiry) {
      newErrors[`passenger-${index}-passportExpiry`] =
        "Passport expiry date is required";
    } else {
      const expiry = new Date(passenger.passportExpiry);
      const now = new Date();

      if (expiry <= now) {
        newErrors[`passenger-${index}-passportExpiry`] =
          "Passport must not be expired";
      }
    }

    return newErrors;
  };

  const validateContactInfo = () => {
    const newErrors: Record<string, string> = {};

    if (!contactEmail.trim()) {
      newErrors.contactEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(contactEmail)) {
      newErrors.contactEmail = "Email is invalid";
    }

    if (!contactPhone.trim()) {
      newErrors.contactPhone = "Phone number is required";
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all passengers
    let allErrors: Record<string, string> = {};

    passengers.forEach((passenger, index) => {
      const passengerErrors = validatePassenger(passenger, index);
      allErrors = { ...allErrors, ...passengerErrors };
    });

    // Validate contact information
    const contactErrors = validateContactInfo();
    allErrors = { ...allErrors, ...contactErrors };

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    // If validation passes, proceed to payment
    const bookingData = {
      outboundFlightId,
      returnFlightId,
      cabinClass,
      passengers,
      contactEmail,
      contactPhone,
    };

    // Store booking data in session storage for the next step
    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

    // Navigate to payment page
    navigate("/booking/payment");
  };

  const getPassengerTypeLabel = (type: PassengerType) => {
    switch (type) {
      case "adult":
        return "Adult";
      case "child":
        return "Child";
      case "infant":
        return "Infant";
    }
  };

  // Calculate today's date for min/max date inputs
  const today = new Date().toISOString().split("T")[0];

  // Calculate min/max dates for passport expiry (must be future date)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Passenger Information</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap mb-6">
          {passengers.map((passenger, index) => (
            <button
              key={index}
              type="button"
              className={`mr-2 mb-2 px-4 py-2 rounded-md ${
                activePassengerIndex === index
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActivePassengerIndex(index)}
            >
              {getPassengerTypeLabel(passenger.type)} {index + 1}
            </button>
          ))}
        </div>

        <Form method="post" onSubmit={handleSubmit}>
          {passengers.map((passenger, index) => (
            <div
              key={index}
              className={`${
                activePassengerIndex === index ? "block" : "hidden"
              }`}
            >
              <h2 className="text-xl font-semibold mb-4">
                {getPassengerTypeLabel(passenger.type)} {index + 1} Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    htmlFor={`passenger-${index}-firstName`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name*
                  </label>
                  <input
                    id={`passenger-${index}-firstName`}
                    type="text"
                    value={passenger.firstName}
                    onChange={(e) =>
                      handlePassengerChange(index, "firstName", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                      errors[`passenger-${index}-firstName`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`passenger-${index}-firstName`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`passenger-${index}-firstName`]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`passenger-${index}-lastName`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name*
                  </label>
                  <input
                    id={`passenger-${index}-lastName`}
                    type="text"
                    value={passenger.lastName}
                    onChange={(e) =>
                      handlePassengerChange(index, "lastName", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                      errors[`passenger-${index}-lastName`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`passenger-${index}-lastName`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`passenger-${index}-lastName`]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`passenger-${index}-dateOfBirth`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date of Birth*
                  </label>
                  <input
                    id={`passenger-${index}-dateOfBirth`}
                    type="date"
                    max={today}
                    value={passenger.dateOfBirth}
                    onChange={(e) =>
                      handlePassengerChange(
                        index,
                        "dateOfBirth",
                        e.target.value
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                      errors[`passenger-${index}-dateOfBirth`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`passenger-${index}-dateOfBirth`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`passenger-${index}-dateOfBirth`]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`passenger-${index}-nationality`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nationality*
                  </label>
                  <input
                    id={`passenger-${index}-nationality`}
                    type="text"
                    value={passenger.nationality}
                    onChange={(e) =>
                      handlePassengerChange(
                        index,
                        "nationality",
                        e.target.value
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                      errors[`passenger-${index}-nationality`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`passenger-${index}-nationality`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`passenger-${index}-nationality`]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`passenger-${index}-passportNumber`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Passport Number*
                  </label>
                  <input
                    id={`passenger-${index}-passportNumber`}
                    type="text"
                    value={passenger.passportNumber}
                    onChange={(e) =>
                      handlePassengerChange(
                        index,
                        "passportNumber",
                        e.target.value
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                      errors[`passenger-${index}-passportNumber`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`passenger-${index}-passportNumber`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`passenger-${index}-passportNumber`]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`passenger-${index}-passportExpiry`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Passport Expiry Date*
                  </label>
                  <input
                    id={`passenger-${index}-passportExpiry`}
                    type="date"
                    min={tomorrowStr}
                    value={passenger.passportExpiry}
                    onChange={(e) =>
                      handlePassengerChange(
                        index,
                        "passportExpiry",
                        e.target.value
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                      errors[`passenger-${index}-passportExpiry`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors[`passenger-${index}-passportExpiry`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`passenger-${index}-passportExpiry`]}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor={`passenger-${index}-specialRequests`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Special Requests (Optional)
                  </label>
                  <textarea
                    id={`passenger-${index}-specialRequests`}
                    value={passenger.specialRequests}
                    onChange={(e) =>
                      handlePassengerChange(
                        index,
                        "specialRequests",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    rows={3}
                    placeholder="Meal preferences, wheelchair assistance, etc."
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-between">
                {index > 0 && (
                  <button
                    type="button"
                    className="px-4 py-2 text-blue-600 hover:text-blue-800"
                    onClick={() => setActivePassengerIndex(index - 1)}
                  >
                    Previous Passenger
                  </button>
                )}

                {index < passengers.length - 1 && (
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => setActivePassengerIndex(index + 1)}
                  >
                    Next Passenger
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Contact Information Section - shown when all passengers are filled */}
          <div
            className={
              activePassengerIndex === passengers.length - 1 ? "mt-8" : "hidden"
            }
          >
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <p className="text-gray-600 mb-4">
              Please provide contact details for booking confirmation and
              updates.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label
                  htmlFor="contactEmail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address*
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                    errors.contactEmail ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.contactEmail}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contactPhone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number*
                </label>
                <input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                    errors.contactPhone ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.contactPhone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.contactPhone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-8">
              <Link
                to={`/flights/search?${searchParams.toString()}`}
                className="px-4 py-2 text-blue-600 hover:text-blue-800"
              >
                Back to Flight Selection
              </Link>

              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
