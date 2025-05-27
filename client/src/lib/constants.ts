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
      "Future value prediction",
      "Competitor price comparison",
      "Market demand forecast"
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
    notIncluded: [
      "Competitor price comparison",
      "Market demand forecast"
    ]
  },
  BUSINESS: {
    name: "Business Plan",
    price: 49.99,
    currency: "EUR",
    features: [
      "Current market value analysis",
      "Based on Bulgarian market data",
      "Valid for 1 month",
      "3-month historical trend analysis",
      "3-month future value prediction",
      "Competitor price comparison",
      "Market demand forecast",
      "Export to PDF option",
      "Priority support"
    ],
    notIncluded: []
  }
};

// Payment methods
export const PAYMENT_METHODS = {
  PAYPAL: "paypal",
  STRIPE: "stripe",
  REVOLUT: "revolut",
  BANK_TRANSFER: "bank_transfer",
  CRYPTO: "crypto",
  APPLE_PAY: "apple_pay",
  GOOGLE_PAY: "google_pay"
};

export const PAYMENT_METHOD_DETAILS = {
  paypal: {
    name: "PayPal",
    description: "Pay securely with your PayPal account",
    icon: "paypal",
    processingTime: "Instant",
    fees: "Free",
    supported: true
  },
  stripe: {
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, American Express",
    icon: "credit-card",
    processingTime: "Instant",
    fees: "Free",
    supported: true
  },
  revolut: {
    name: "Revolut",
    description: "Pay with Revolut app",
    icon: "smartphone",
    processingTime: "Instant",
    fees: "Free",
    supported: true
  },
  bank_transfer: {
    name: "Bank Transfer",
    description: "Direct bank transfer (SEPA)",
    icon: "building",
    processingTime: "1-2 business days",
    fees: "Free",
    supported: true
  },

  apple_pay: {
    name: "Apple Pay",
    description: "Pay with Touch ID or Face ID",
    icon: "apple",
    processingTime: "Instant",
    fees: "Free",
    supported: true
  },
  google_pay: {
    name: "Google Pay",
    description: "Pay with your Google account",
    icon: "google",
    processingTime: "Instant",
    fees: "Free",
    supported: true
  }
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
