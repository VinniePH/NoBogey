import { useEffect, useRef } from "react";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAAEo3LAO-QM64eTuN";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    let widgetId: string | undefined;
    const render = () => {
      if (cancelled || widgetId || !container.current || !window.turnstile) return;
      widgetId = window.turnstile.render(container.current, {
        sitekey: SITE_KEY,
        theme: "light",
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken("")
      });
    };
    const timer = window.setInterval(render, 100);
    render();
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onToken]);
  return <div className="turnstile-container" ref={container} />;
}

export async function verifyTurnstile(token: string) {
  if (!token) throw new Error("Complete the security check first.");
  const response = await fetch("/api/turnstile/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token })
  });
  if (!response.ok) throw new Error("Security check failed. Please try again.");
}
