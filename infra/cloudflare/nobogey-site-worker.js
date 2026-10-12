/* global URL, Response, FormData, fetch, AbortSignal, Request, Headers */
const REPOSITORY_BASE = "/NoBogey";
const ADMIN_ASSET_BASE = `${REPOSITORY_BASE}/admin-assets`;
const TURNSTILE_SITE_KEY = "0x4AAAAAAEo3LAO-QM64eTuN";
const ALLOWED_MOBILE_CAPTCHA_CALLBACKS = new Set([
  "nobogey://captcha",
  "exp+nobogey-mobile://captcha"
]);
const ALLOWED_TURNSTILE_ACTIONS = new Set(["admin-auth", "mobile-auth"]);

function isAdminRoute(pathname) {
  return pathname === "/login"
    || pathname === "/auth/callback"
    || pathname === "/reset-password"
    || pathname === "/admin"
    || pathname.startsWith("/admin/");
}

export default {
  async fetch(request, env) {
    const incoming = new URL(request.url);

    if (incoming.pathname === "/mobile-captcha") {
      const returnTo = incoming.searchParams.get("return_to") || "nobogey://captcha";
      if (!ALLOWED_MOBILE_CAPTCHA_CALLBACKS.has(returnTo)) return new Response("Invalid callback.", { status: 400, headers: { "Cache-Control": "no-store" } });
      const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>NoBogey security check</title><script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script><style>body{margin:0;background:#eef3ed;color:#12382c;font-family:system-ui;display:grid;min-height:100vh;place-items:center}.card{background:#fff;border-radius:20px;box-shadow:0 16px 50px #12382c22;max-width:360px;padding:32px;text-align:center}h1{margin-top:0}.cf-turnstile{display:flex;justify-content:center}</style></head><body><main class="card"><h1>NoBogey</h1><p>Complete the security check to continue in the app.</p><div class="cf-turnstile" data-sitekey="${TURNSTILE_SITE_KEY}" data-action="mobile-auth" data-callback="done"></div></main><script>function done(token){location.href=${JSON.stringify(returnTo)}+'?token='+encodeURIComponent(token)}</script></body></html>`;
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; style-src 'unsafe-inline'" } });
    }

    if (incoming.pathname === "/api/turnstile/verify") {
      if (request.method !== "POST") {
        return Response.json({ success: false, error: "Method not allowed." }, { status: 405, headers: { "Cache-Control": "no-store" } });
      }
      if (!env.TURNSTILE_SECRET_KEY) {
        return Response.json({ success: false, error: "Security check is unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
      }
      const contentLength = Number(request.headers.get("content-length") || "0");
      if (contentLength > 10_000) {
        return Response.json({ success: false, error: "Request is too large." }, { status: 413, headers: { "Cache-Control": "no-store" } });
      }
      const rawBody = await request.text();
      if (rawBody.length > 10_000) {
        return Response.json({ success: false, error: "Request is too large." }, { status: 413, headers: { "Cache-Control": "no-store" } });
      }
      const body = (() => { try { return JSON.parse(rawBody); } catch { return {}; } })();
      if (!body.token || typeof body.token !== "string" || body.token.length > 2048 || !ALLOWED_TURNSTILE_ACTIONS.has(body.action)) {
        return Response.json({ success: false, error: "Complete the security check." }, { status: 400, headers: { "Cache-Control": "no-store" } });
      }
      const form = new FormData();
      form.set("secret", env.TURNSTILE_SECRET_KEY);
      form.set("response", body.token);
      form.set("remoteip", request.headers.get("CF-Connecting-IP") || "");
      let result;
      try {
        const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form, signal: AbortSignal.timeout(10_000) });
        result = await verification.json().catch(() => ({}));
      } catch {
        return Response.json({ success: false, error: "Security check is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
      }
      const success = result.success === true
        && result.hostname === "nobogeyofficial.com"
        && result.action === body.action;
      return Response.json({ success }, {
        status: success ? 200 : 400,
        headers: { "Cache-Control": "no-store" }
      });
    }

    const target = new URL(request.url);
    const adminRoute = isAdminRoute(incoming.pathname);

    target.protocol = "https:";
    target.hostname = "vinnieph.github.io";

    if (adminRoute) {
      target.pathname = `${ADMIN_ASSET_BASE}/index.html`;
    } else if (incoming.pathname === "/landing" || incoming.pathname === "/landing/") {
      target.pathname = `${REPOSITORY_BASE}/`;
    } else if (incoming.pathname === "/support" || incoming.pathname === "/support/") {
      target.pathname = `${REPOSITORY_BASE}/contact/`;
    } else if (incoming.pathname.startsWith("/admin-assets/")) {
      target.pathname = REPOSITORY_BASE + incoming.pathname;
    } else if (!incoming.pathname.startsWith(`${REPOSITORY_BASE}/`)) {
      target.pathname = REPOSITORY_BASE + (incoming.pathname === "/" ? "/" : incoming.pathname);
    }

    const response = await fetch(new Request(target, request));
    const headers = new Headers(response.headers);
    const location = headers.get("location");
    if (location) {
      const redirected = new URL(location, target);
      if (redirected.hostname === "vinnieph.github.io") {
        redirected.hostname = incoming.hostname;
        redirected.protocol = incoming.protocol;
        redirected.pathname = redirected.pathname.replace(/^\/NoBogey/, "") || "/";
        headers.set("location", redirected.toString());
      }
    }

    headers.set("x-nobogey-surface", adminRoute || incoming.pathname.startsWith("/admin-assets/") ? "admin" : "landing");
    headers.set("x-content-type-options", "nosniff");
    headers.set("referrer-policy", "strict-origin-when-cross-origin");
    headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
    if (incoming.protocol === "https:") headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
