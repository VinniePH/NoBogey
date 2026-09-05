const LANDING_ORIGIN = "https://vinnieph.github.io";
const REPOSITORY_BASE = "/NoBogey";
const ADMIN_ASSET_BASE = `${REPOSITORY_BASE}/admin-assets`;

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

    if (incoming.pathname === "/api/turnstile/verify") {
      if (request.method !== "POST") {
        return Response.json({ success: false, error: "Method not allowed." }, { status: 405 });
      }
      const body = await request.json().catch(() => ({}));
      if (!body.token || typeof body.token !== "string") {
        return Response.json({ success: false, error: "Complete the security check." }, { status: 400 });
      }
      const form = new FormData();
      form.set("secret", env.TURNSTILE_SECRET_KEY);
      form.set("response", body.token);
      form.set("remoteip", request.headers.get("CF-Connecting-IP") || "");
      const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
      const result = await verification.json();
      return Response.json({ success: result.success === true }, {
        status: result.success === true ? 200 : 400,
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
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
