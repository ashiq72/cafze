import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number, currency = "BDT") {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatEventDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date to be announced";

  return new Intl.DateTimeFormat("en-BD", {
    timeZone: "Asia/Dhaka",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response &&
    "data" in error.response
  ) {
    const data = error.response.data as {
      message?: string;
      error?: string;
      errorSources?: Array<{ message?: string }>;
    };
    const validationMessage = data.errorSources
      ?.map((item) => item.message)
      .filter(Boolean)
      .join(". ");
    return (
      validationMessage ||
      data.message ||
      data.error ||
      "The server could not complete this request."
    );
  }

  if (
    typeof error === "object" &&
    error &&
    "code" in error &&
    error.code === "ECONNABORTED"
  ) {
    return "The server took too long to respond. Please try again.";
  }

  if (
    typeof error === "object" &&
    error &&
    "request" in error &&
    (!("response" in error) || !error.response)
  ) {
    return "Cannot reach the server. Check your connection and API URL.";
  }

  return error instanceof Error ? error.message : "Something went wrong";
}
