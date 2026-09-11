import { describe, expect, it } from "vitest";

import { isAllowedMobileCaptchaCallback, shouldBypassMobileCaptcha } from "./captcha";

describe("mobile captcha validation", () => {
  it("accepts both Expo and custom-scheme callback URLs", () => {
    expect(isAllowedMobileCaptchaCallback("nobogey://captcha?token=test")).toBe(true);
    expect(isAllowedMobileCaptchaCallback("exp+nobogey-mobile://captcha?token=test")).toBe(true);
    expect(isAllowedMobileCaptchaCallback("https://nobogeyofficial.com/mobile-captcha")).toBe(false);
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
});
