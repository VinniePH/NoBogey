import { describe, expect, it } from "vitest";
import { adminPasswordResetOptions, adminSignInCredentials } from "./admin-auth";

describe("admin Supabase Auth CAPTCHA payloads", () => {
  it("passes the Turnstile token directly with password sign-in", () => {
    expect(adminSignInCredentials(" Admin@Example.com ", "password", "turnstile-token")).toEqual({
      email: "admin@example.com",
      password: "password",
      options: { captchaToken: "turnstile-token" }
    });
  });

  it("passes the Turnstile token directly with password recovery", () => {
    expect(adminPasswordResetOptions("https://nobogeyofficial.com", "turnstile-token")).toEqual({
      redirectTo: "https://nobogeyofficial.com/reset-password",
      captchaToken: "turnstile-token"
    });
  });

  it("rejects an Auth request without a CAPTCHA token", () => {
    expect(() => adminSignInCredentials("admin@example.com", "password", "")).toThrow("Complete the security check first.");
    expect(() => adminPasswordResetOptions("https://nobogeyofficial.com", "")).toThrow("Complete the security check first.");
  });
});
