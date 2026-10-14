import * as Linking from "expo-linking";
import { isAllowedMobileCaptchaCallback, MOBILE_CAPTCHA_CALLBACKS, shouldBypassMobileCaptcha } from "./captcha-validation";

const CAPTCHA_URL = "https://nobogeyofficial.com/mobile-captcha";

export async function completeMobileCaptcha(): Promise<string> {
  if (shouldBypassMobileCaptcha()) return "development-bypass";

  const callbackUrl = MOBILE_CAPTCHA_CALLBACKS[0];
  const token = await new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      subscription.remove();
      reject(new Error("Security check timed out. Please try again."));
    }, 120_000);
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (!isAllowedMobileCaptchaCallback(url)) return;
      clearTimeout(timeout);
      subscription.remove();
      const parsed = Linking.parse(url);
      const value = parsed.queryParams?.token;
      if (typeof value === "string" && value) resolve(value);
      else reject(new Error("Security check was not completed."));
    });
    void Linking.openURL(`${CAPTCHA_URL}?return_to=${encodeURIComponent(callbackUrl)}`).catch((error) => {
      clearTimeout(timeout);
      subscription.remove();
      reject(error);
    });
  });

  // Turnstile tokens are single-use. Supabase Auth verifies this token server-side,
  // so the mobile client must not pre-consume it at the Worker verification endpoint.
  return token;
}
