import { describe, expect, it } from "vitest";
import { resolveSessionRole, resolveStartupRoute } from "./session-state";

describe("resolveSessionRole", () => {
  it("restores the saved role when the account still owns it", () => {
    expect(resolveSessionRole("caddie", ["golfer", "caddie"])).toBe("caddie");
  });

  it("falls back to the authenticated account role when no preference was saved", () => {
    expect(resolveSessionRole(undefined, ["caddie"])).toBe("caddie");
    expect(resolveSessionRole(undefined, ["golfer"])).toBe("golfer");
  });

  it("does not treat administrative or missing roles as a mobile identity", () => {
    expect(resolveSessionRole(undefined, ["super_admin"])).toBeNull();
    expect(resolveSessionRole(undefined, [])).toBeNull();
  });
});

describe("resolveStartupRoute", () => {
  it("returns signed-out users to the role chooser", () => {
    expect(resolveStartupRoute(false, null)).toBe("/onboarding");
    expect(resolveStartupRoute(false, "caddie")).toBe("/onboarding");
  });

  it("returns restored sessions to their account instead of registration", () => {
    expect(resolveStartupRoute(true, "golfer")).toBe("/golfer/home");
    expect(resolveStartupRoute(true, "caddie")).toBe("/caddie/dashboard");
  });
});
