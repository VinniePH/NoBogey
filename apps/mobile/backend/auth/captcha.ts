import * as Linking from "expo-linking";

const CAPTCHA_URL = "https://nobogeyofficial.com/mobile-captcha";
const ALLOWED_CALLBACKS = ["nobogey://captcha", "exp+nobogey-mobile://captcha"] as const;

export function isAllowedMobileCaptchaCallback(url: string): boolean {
  if (!url) return false;
  return ALLOWED_CALLBACKS.some((allowed) => url.startsWith(allowed));
}

export function shouldBypassMobileCaptcha(): boolean {
  return process.env.EXPO_PUBLIC_BYPASS_CAPTCHA === "true";
}

export async function completeMobileCaptcha(): Promise<void> {
  if (shouldBypassMobileCaptcha()) return;

  const callbackUrl = ALLOWED_CALLBACKS[0];
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

  const response = await fetch("https://nobogeyofficial.com/api/turnstile/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, action: "mobile-auth" })
  });
  if (!response.ok) throw new Error("Security check failed. Please try again.");
}
