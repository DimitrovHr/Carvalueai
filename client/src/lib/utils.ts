import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "EUR", locale: string = "de-DE") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric"
}) {
  return new Date(dateString).toLocaleDateString("en-US", options);
}

export function truncateText(text: string, maxLength: number = 100) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function generateRandomString(length: number = 10) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function calculateValidity(days: number = 7) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
