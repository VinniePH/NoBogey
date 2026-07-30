import type { BookingStatus, CurrencyCode } from "@nobogey/contracts";

const TERMINAL_BOOKING_STATES = new Set<BookingStatus>([
  "completed",
  "canceled",
  "declined"
]);

export function formatMoney(
  amountInCentavos: number,
  currency: CurrencyCode = "PHP"
): string {
  return new Intl.NumberFormat("en-PH", {
    currency,
    currencyDisplay: "code",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: "currency"
  })
    .format(amountInCentavos / 100)
    .replace(/\s+/g, " ");
}

export function formatTeeTime(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    month: "short",
    timeZone: "Asia/Manila"
  }).format(new Date(isoDate));
}

export function isBookingTerminal(status: BookingStatus): boolean {
  return TERMINAL_BOOKING_STATES.has(status);
}
