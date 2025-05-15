// Pricing
export const PRICING = {
  REGULAR: {
    name: "Regular Plan",
    price: 15.99,
    currency: "EUR",
    features: [
      "Current market value analysis",
      "Based on Bulgarian market data",
      "Valid for 1 week"
    ],
    notIncluded: [
      "Historical trend analysis",
      "Future value prediction"
    ]
  },
  PREMIUM: {
    name: "Premium Plan",
    price: 29.99,
    currency: "EUR",
    features: [
      "Current market value analysis",
      "Based on Bulgarian market data",
      "Valid for 1 week",
      "3-month historical trend analysis",
      "1-month future value prediction"
    ],
    notIncluded: []
  }
};

// Payment methods
export const PAYMENT_METHODS = {
  PAYPAL: "paypal",
  REVOLUT: "revolut"
};

// Form steps
export const FORM_STEPS = ["Car Details", "Plan Selection", "Payment", "Results"];

// Fuel types
export const FUEL_TYPES = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
  { value: "lpg", label: "LPG" }
];

// Transmission types
export const TRANSMISSION_TYPES = [
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automatic" },
  { value: "semi-automatic", label: "Semi-Automatic" }
];

// Car inquiry status
export const INQUIRY_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
};
