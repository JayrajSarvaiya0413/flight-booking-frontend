import { useState, useEffect } from "react";
import { Form, useNavigate, Link, useActionData } from "@remix-run/react";
import {
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
  ActionFunctionArgs,
} from "@remix-run/node";
import { useUser } from "~/utils/userContext";

export const meta: MetaFunction = () => {
  return [
    { title: "Payment - Thena Flight Booking" },
    {
      name: "description",
      content: "Complete your payment for flight booking.",
    },
  ];
};

type BookingData = {
  outboundFlightId: string;
  returnFlightId?: string;
  cabinClass: string;
  passengers: any[];
  contactEmail: string;
  contactPhone: string;
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
};

// Add a type definition for passenger data
type PassengerData = {
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  type?: string;
  dateOfBirth?: string;
  date_of_birth?: string;
  nationality?: string;
  passportNumber?: string;
  passport_number?: string;
  passportExpiry?: string;
  passport_expiry?: string;
  specialRequests?: string;
  special_requests?: string;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  // Get form data
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const cardNumber = formData.get("cardNumber") as string;
  const cardName = formData.get("cardName") as string;
  const expiryDate = formData.get("expiryDate") as string;
  const cvv = formData.get("cvv") as string;
  const userId = formData.get("userId") as string;
  const totalAmount = formData.get("totalAmount") as string;
  const outboundFlightDetailsStr = formData.get(
    "outboundFlightDetails"
  ) as string;
  const returnFlightDetailsStr = formData.get("returnFlightDetails") as string;
  const passengersStr = formData.get("passengers") as string;

  console.log("Form data received:", {
    firstName,
    lastName,
    email,
    phone,
    userId,
    totalAmount,
    hasOutboundDetails: !!outboundFlightDetailsStr,
    hasReturnDetails: !!returnFlightDetailsStr,
    hasPassengers: !!passengersStr,
  });

  // Validate form data
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !cardNumber ||
    !cardName ||
    !expiryDate ||
    !cvv
  ) {
    return json({ error: "All fields are required" });
  }

  try {
    // Parse flight details
    let outbound_flight_details = null;
    let return_flight_details = null;
    let passengers = [];

    if (outboundFlightDetailsStr) {
      try {
        outbound_flight_details = JSON.parse(outboundFlightDetailsStr);
        console.log("Parsed outbound flight details:", outbound_flight_details);
      } catch (e) {
        console.error("Error parsing outbound flight details:", e);
      }
    } else {
      console.warn("No outbound flight details provided");
    }

    if (returnFlightDetailsStr) {
      try {
        return_flight_details = JSON.parse(returnFlightDetailsStr);
        console.log("Parsed return flight details:", return_flight_details);
      } catch (e) {
        console.error("Error parsing return flight details:", e);
      }
    }

    if (passengersStr) {
      try {
        passengers = JSON.parse(passengersStr);
        console.log("Parsed passengers data:", passengers);

        // Normalize passenger data to match backend expectations
        passengers = passengers.map((passenger: PassengerData) => {
          return {
            first_name:
              passenger.firstName || passenger.first_name || firstName,
            last_name: passenger.lastName || passenger.last_name || lastName,
            email: passenger.email || email,
            phone: passenger.phone || phone,
            type: passenger.type || "adult",
            date_of_birth: passenger.dateOfBirth || passenger.date_of_birth,
            nationality: passenger.nationality,
            passport_number:
              passenger.passportNumber || passenger.passport_number,
            passport_expiry:
              passenger.passportExpiry || passenger.passport_expiry,
            special_requests:
              passenger.specialRequests || passenger.special_requests || "",
          };
        });
        console.log("Normalized passengers data:", passengers);
      } catch (e) {
        console.error("Error parsing passengers data:", e);
      }
    } else {
      console.warn("No passengers data provided");
      // Provide default passenger if none exists
      passengers = [
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          type: "adult",
        },
      ];
      console.log("Using default passenger data:", passengers);
    }

    // Ensure we have a valid total amount
    let parsedTotalAmount = parseFloat(totalAmount);
    if (isNaN(parsedTotalAmount) || parsedTotalAmount <= 0) {
      console.warn("Invalid total amount, defaulting to 100:", totalAmount);
      parsedTotalAmount = 100; // Default value if parsing fails or is zero/negative
    }

    // Ensure we have a valid cabin class
    const cabinClass = outbound_flight_details?.cabin_class || "economy";
    // Normalize cabin class to match backend expectations (lowercase, underscores)
    const normalizedCabinClass = cabinClass.toLowerCase().replace(/\s+/g, "_");

    // Create booking request body
    const bookingData = {
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      contact_email: email, // Required by backend
      contact_phone: phone, // Required by backend
      payment_method: "credit_card",
      card_details: {
        card_number: cardNumber,
        card_holder_name: cardName,
        expiry_date: expiryDate,
        cvv: cvv,
      },
      total_amount: parsedTotalAmount,
      outbound_flight_id: outbound_flight_details?.id,
      return_flight_id: return_flight_details?.id,
      cabin_class: normalizedCabinClass,
      outbound_flight_details,
      return_flight_details,
      is_guest: userId.startsWith("guest-"),
      passengers: passengers,
    };

    console.log("Booking data:", JSON.stringify(bookingData, null, 2));

    // Send booking data to API
    const apiUrl = "http://localhost:3000";
    let response;

    try {
      console.log("Sending booking request to API:", `${apiUrl}/bookings`);
      console.log("Request body:", JSON.stringify(bookingData, null, 2));
      response = await fetch(`${apiUrl}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });
      console.log("API response status:", response.status);
    } catch (fetchError) {
      console.error("Network error when connecting to API:", fetchError);

      // For demo purposes, simulate a successful booking if the API is down
      console.log(
        "API is unavailable. Simulating successful booking for demo purposes."
      );

      // Generate a random booking reference
      const mockBookingReference =
        "DEMO-" + Math.random().toString(36).substring(2, 10).toUpperCase();

      // Redirect to confirmation page with the mock booking reference and email
      return redirect(
        `/booking/confirmation?reference=${mockBookingReference}&email=${encodeURIComponent(
          email
        )}&demo=true`
      );
    }

    let responseData;
    try {
      responseData = await response.json();
      console.log("API response data:", responseData);
    } catch (jsonError) {
      console.error("Error parsing API response:", jsonError);
      // If we can't parse the response, create a generic error
      responseData = { message: "Failed to parse server response" };
    }

    if (!response.ok) {
      console.error("API error:", responseData);

      // If there's a specific error message, show it to the user
      if (responseData && responseData.message) {
        throw new Error(responseData.message);
      } else {
        throw new Error("Failed to create booking. Please try again.");
      }
    }

    // Redirect to confirmation page with booking reference and email
    const bookingReference = responseData.booking_reference;

    if (!bookingReference) {
      console.warn(
        "Booking was successful but no booking reference was returned"
      );
      // Generate a fallback reference
      const fallbackReference =
        "FB-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      return redirect(
        `/booking/confirmation?reference=${fallbackReference}&email=${encodeURIComponent(
          email
        )}&fallback=true`
      );
    }

    return redirect(
      `/booking/confirmation?reference=${bookingReference}&email=${encodeURIComponent(
        email
      )}`
    );
  } catch (error) {
    console.error("Error creating booking:", error);

    // If there's an error, show it to the user
    return json({
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

export default function BookingPayment() {
  const navigate = useNavigate();
  const { user } = useUser();

  // Function to generate a random user ID if needed
  const generateRandomUserId = () => {
    return "guest-" + Math.random().toString(36).substring(2, 15);
  };

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [outboundFlight, setOutboundFlight] = useState<Flight | null>(null);
  const [returnFlight, setReturnFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestUserId] = useState(generateRandomUserId());

  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "paypal">(
    "credit_card"
  );
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Add state for email and phone
  const [emailValue, setEmailValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");

  // Add state for server errors
  const [serverError, setServerError] = useState<string | null>(null);

  // Get any errors from the action
  const actionData = useActionData<{ error?: string }>();

  // Set server error from action data
  useEffect(() => {
    if (actionData?.error) {
      setServerError(actionData.error);
      // Scroll to the top to show the error
      window.scrollTo(0, 0);
    }
  }, [actionData]);

  useEffect(() => {
    // Retrieve booking data from session storage
    const storedBookingData = sessionStorage.getItem("bookingData");

    if (!storedBookingData) {
      setError(
        "No booking data found. Please start the booking process again."
      );
      setLoading(false);
      return;
    }

    try {
      const parsedBookingData = JSON.parse(storedBookingData) as BookingData;
      setBookingData(parsedBookingData);

      // Pre-fill email and phone if available
      if (parsedBookingData.contactEmail) {
        setEmailValue(parsedBookingData.contactEmail);
      }

      if (parsedBookingData.contactPhone) {
        setPhoneValue(parsedBookingData.contactPhone);
      }

      // Fetch flight details
      const fetchFlightDetails = async () => {
        try {
          // Get API URL from environment or use default
          const apiUrl = process.env.API_URL || "http://localhost:3000";

          // Fetch outbound flight
          const outboundResponse = await fetch(
            `${apiUrl}/flights/${parsedBookingData.outboundFlightId}`
          );
          if (!outboundResponse.ok) {
            throw new Error(
              `Error fetching outbound flight: ${outboundResponse.statusText}`
            );
          }
          const outboundFlightData = await outboundResponse.json();
          setOutboundFlight(outboundFlightData);

          // Fetch return flight if exists
          if (parsedBookingData.returnFlightId) {
            const returnResponse = await fetch(
              `${apiUrl}/flights/${parsedBookingData.returnFlightId}`
            );
            if (!returnResponse.ok) {
              throw new Error(
                `Error fetching return flight: ${returnResponse.statusText}`
              );
            }
            const returnFlightData = await returnResponse.json();
            setReturnFlight(returnFlightData);
          }

          setLoading(false);
        } catch (err) {
          console.error("Error fetching flight details:", err);
          setError("Failed to load flight details. Please try again.");
          setLoading(false);
        }
      };

      fetchFlightDetails();
    } catch (err) {
      console.error("Error parsing booking data:", err);
      setError("Invalid booking data. Please start the booking process again.");
      setLoading(false);
    }
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (paymentMethod === "credit_card") {
      if (!cardNumber.trim()) {
        errors.cardNumber = "Card number is required";
      } else if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
        errors.cardNumber = "Card number must be 16 digits";
      }

      if (!cardName.trim()) {
        errors.cardName = "Cardholder name is required";
      }

      if (!expiryDate.trim()) {
        errors.expiryDate = "Expiry date is required";
      } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        errors.expiryDate = "Expiry date must be in MM/YY format";
      } else {
        const [month, year] = expiryDate
          .split("/")
          .map((part) => parseInt(part, 10));
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        if (month < 1 || month > 12) {
          errors.expiryDate = "Invalid month";
        } else if (
          year < currentYear ||
          (year === currentYear && month < currentMonth)
        ) {
          errors.expiryDate = "Card has expired";
        }
      }

      if (!cvv.trim()) {
        errors.cvv = "CVV is required";
      } else if (!/^\d{3,4}$/.test(cvv)) {
        errors.cvv = "CVV must be 3 or 4 digits";
      }
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started");

    if (!bookingData) {
      console.error("Booking data is missing");
      setError(
        "Booking data is missing. Please start the booking process again."
      );
      return;
    }

    const validationErrors = validateForm();
    console.log("Validation errors:", validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      console.log("Form has validation errors, stopping submission");
      return;
    }

    // Form is valid, continue with submission
    setFormErrors({});
    console.log("Form is valid, continuing with submission");
    console.log("Booking data:", bookingData);

    // The form will be submitted to the action function
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }

    setExpiryDate(value);
  };

  const formatPrice = (price: number, cabinClass: string): number => {
    let multiplier = 1;
    switch (cabinClass) {
      case "premium_economy":
        multiplier = 1.5;
        break;
      case "business":
        multiplier = 2.5;
        break;
      case "first":
        multiplier = 4;
        break;
      default:
        multiplier = 1;
    }

    return price * multiplier;
  };

  const calculateTotalFare = (): number => {
    if (!bookingData || !outboundFlight) {
      return 100; // Default minimum value
    }

    try {
      let total = 0;
      const passengerCount = bookingData.passengers.length || 1;

      // Add outbound flight price
      const outboundPrice = outboundFlight.price || 100;
      total +=
        formatPrice(outboundPrice, bookingData.cabinClass) * passengerCount;

      // Add return flight price if exists
      if (returnFlight) {
        const returnPrice = returnFlight.price || 100;
        total +=
          formatPrice(returnPrice, bookingData.cabinClass) * passengerCount;
      }

      // Ensure we have a minimum value
      return Math.max(isNaN(total) ? 0 : total, 100);
    } catch (error) {
      console.error("Error calculating total fare:", error);
      return 100; // Default minimum value
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        weekday: "short",
      }),
    };
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
        <div className="text-center">
          <Link to="/flights" className="text-blue-600 hover:underline">
            Return to Flight Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Complete Your Booking</h1>

      {/* Show server errors */}
      {serverError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{serverError}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Add note about login not being required */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">
              <strong>No account needed!</strong> You can complete your booking
              without logging in. A confirmation email will be sent to the email
              address you provide.
            </p>
          </div>
        </div>
      </div>

      {/* Add debug info for demo mode */}
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">
              <strong>Demo Mode:</strong> This is a demonstration. Your booking
              will be processed without connecting to a real payment system.
            </p>
          </div>
        </div>
      </div>

      <Form method="post" className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Passenger Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-gray-700 font-medium mb-2"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                defaultValue="John"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                required
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-gray-700 font-medium mb-2"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                defaultValue="Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={emailValue || "user@example.com"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                required
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-gray-700 font-medium mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                defaultValue={phoneValue || "1234567890"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                required
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Payment Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label
                htmlFor="cardNumber"
                className="block text-gray-700 font-medium mb-2"
              >
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                defaultValue="4242 4242 4242 4242"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="cardName"
                className="block text-gray-700 font-medium mb-2"
              >
                Cardholder Name
              </label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                defaultValue="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                required
              />
            </div>
            <div>
              <label
                htmlFor="expiryDate"
                className="block text-gray-700 font-medium mb-2"
              >
                Expiry Date
              </label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                defaultValue="12/25"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                placeholder="MM/YY"
                required
              />
            </div>
            <div>
              <label
                htmlFor="cvv"
                className="block text-gray-700 font-medium mb-2"
              >
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                defaultValue="123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                placeholder="123"
                required
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Booking Summary
          </h2>
          {bookingData ? (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Subtotal:</span>
                <span className="text-gray-900">
                  ${calculateTotalFare().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Taxes & Fees:</span>
                <span className="text-gray-900">$0.00</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-700">Total:</span>
                <span className="text-gray-900">
                  ${calculateTotalFare().toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-red-600">
              No booking data found. Please restart the booking process.
            </p>
          )}
        </div>

        {/* Hidden fields for booking data */}
        <input type="hidden" name="userId" value={user?.id || guestUserId} />
        <input
          type="hidden"
          name="totalAmount"
          value={calculateTotalFare().toString()}
        />
        <input
          type="hidden"
          name="outboundFlightDetails"
          value={
            bookingData && outboundFlight ? JSON.stringify(outboundFlight) : ""
          }
        />
        <input
          type="hidden"
          name="returnFlightDetails"
          value={
            bookingData && returnFlight ? JSON.stringify(returnFlight) : ""
          }
        />
        <input
          type="hidden"
          name="passengers"
          value={bookingData ? JSON.stringify(bookingData.passengers) : "[]"}
        />

        <div className="flex justify-between items-center">
          <Link
            to="/booking/passengers"
            className="px-4 py-2 text-blue-600 hover:text-blue-800"
          >
            Back to Passenger Details
          </Link>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Complete Booking
          </button>
        </div>
      </Form>
    </div>
  );
}
