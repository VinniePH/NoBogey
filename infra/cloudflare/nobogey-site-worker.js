/* global URL, Response, fetch, Request, Headers */
const REPOSITORY_BASE = "/NoBogey";
const ADMIN_ASSET_BASE = `${REPOSITORY_BASE}/admin-assets`;
const TURNSTILE_SITE_KEY = "0x4AAAAAAEo3LAO-QM64eTuN";
const ALLOWED_MOBILE_CAPTCHA_CALLBACKS = new Set([
  "nobogey://captcha",
  "exp+nobogey-mobile://captcha"
]);

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
