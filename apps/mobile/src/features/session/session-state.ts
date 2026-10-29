import type { AuthSession } from "../../../backend/auth/auth.types";

export type AppRole = "golfer" | "caddie";

export function resolveSessionRole(
  storedRole: AppRole | undefined,
  roles: AuthSession["roles"],
): AppRole | null {
  if (storedRole && roles.includes(storedRole)) return storedRole;
  if (roles.includes("golfer")) return "golfer";
  if (roles.includes("caddie")) return "caddie";
  return null;
}

export function resolveStartupRoute(
  isAuthenticated: boolean,
  role: AppRole | null,
): "/onboarding" | "/golfer/home" | "/caddie/dashboard" {
  if (!isAuthenticated || !role) return "/onboarding";
  return role === "caddie" ? "/caddie/dashboard" : "/golfer/home";
}
