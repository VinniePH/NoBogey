import { describe, expect, it } from "vitest";

import { isAllowedMobileCaptchaCallback, shouldBypassMobileCaptcha } from "./captcha-validation";

describe("mobile captcha validation", () => {
  it("accepts both Expo and custom-scheme callback URLs", () => {
    expect(isAllowedMobileCaptchaCallback("nobogey://captcha?token=test")).toBe(true);
    expect(isAllowedMobileCaptchaCallback("exp+nobogey-mobile://captcha?token=test")).toBe(true);
    expect(isAllowedMobileCaptchaCallback("https://nobogeyofficial.com/mobile-captcha")).toBe(false);
    expect(isAllowedMobileCaptchaCallback("nobogey://captcha.attacker.example?token=test")).toBe(false);
    expect(isAllowedMobileCaptchaCallback("nobogey://captcha/extra?token=test")).toBe(false);
  });

  it("allows explicit bypasses for local QA and testing", () => {
    const previous = process.env.EXPO_PUBLIC_BYPASS_CAPTCHA;
    process.env.EXPO_PUBLIC_BYPASS_CAPTCHA = "true";
    try {
      expect(shouldBypassMobileCaptcha()).toBe(true);
    } finally {
      if (previous === undefined) delete process.env.EXPO_PUBLIC_BYPASS_CAPTCHA;
      else process.env.EXPO_PUBLIC_BYPASS_CAPTCHA = previous;
    }
  });

  it("never permits the local bypass in a production build", () => {
    const previousBypass = process.env.EXPO_PUBLIC_BYPASS_CAPTCHA;
    const previousNodeEnvironment = process.env.NODE_ENV;
    process.env.EXPO_PUBLIC_BYPASS_CAPTCHA = "true";
    process.env.NODE_ENV = "production";
    try {
      expect(shouldBypassMobileCaptcha()).toBe(false);
    } finally {
      if (previousBypass === undefined) delete process.env.EXPO_PUBLIC_BYPASS_CAPTCHA;
      else process.env.EXPO_PUBLIC_BYPASS_CAPTCHA = previousBypass;
      if (previousNodeEnvironment === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
      else process.env.NODE_ENV = previousNodeEnvironment;
    }
  });
});
