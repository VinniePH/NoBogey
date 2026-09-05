import * as Linking from "expo-linking";

const CAPTCHA_URL = "https://nobogeyofficial.com/mobile-captcha";
const CALLBACK_URL = "nobogey://captcha";

export async function completeMobileCaptcha(): Promise<void> {
  const token = await new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      subscription.remove();
      reject(new Error("Security check timed out. Please try again."));
    }, 120_000);
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (!url.startsWith(CALLBACK_URL)) return;
      clearTimeout(timeout);
      subscription.remove();
      const parsed = Linking.parse(url);
      const value = parsed.queryParams?.token;
      if (typeof value === "string" && value) resolve(value);
      else reject(new Error("Security check was not completed."));
    });
    void Linking.openURL(`${CAPTCHA_URL}?return_to=${encodeURIComponent(CALLBACK_URL)}`).catch((error) => {
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
