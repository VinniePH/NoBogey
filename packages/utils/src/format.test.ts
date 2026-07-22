import { describe, expect, it } from "vitest";
import { formatMoney, formatTeeTime, isBookingTerminal } from "./format";

describe("formatMoney", () => {
  it("formats Philippine peso amounts without centavos by default", () => {
    expect(formatMoney(240000)).toBe("PHP 2,400");
  });
});

describe("formatTeeTime", () => {
  it("formats ISO tee times for compact mobile display", () => {
    expect(formatTeeTime("2026-07-08T06:30:00+08:00")).toBe("Jul 8, 6:30 AM");
  });
});

describe("isBookingTerminal", () => {
  it("returns true only for booking states that cannot continue", () => {
    expect(isBookingTerminal("completed")).toBe(true);
    expect(isBookingTerminal("canceled")).toBe(true);
    expect(isBookingTerminal("requested")).toBe(false);
  });
});
