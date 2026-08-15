import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppState, Platform } from "react-native";
import {
  getSession,
  signIn as signInWithSupabase,
  signOut as signOutWithSupabase,
  signUp as signUpWithSupabase,
  subscribeToAuthState
} from "../../../backend/auth/auth.service";
import type {
  AuthRole,
  AuthSession,
  SignInInput,
  SignUpResult
} from "../../../backend/auth/auth.types";
import { getSupabaseClient } from "../../../backend/client";

export type AppRole = AuthRole;
export type CaddieVerificationState = "pending" | "verified" | "rejected" | "retry";

type Session = {
  activeRole: AppRole | null;
  authSession: AuthSession | null;
  initialRole: AppRole | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  caddieVerification: CaddieVerificationState;
  golferSignedIn: boolean;
  selectInitialRole: (role: AppRole) => void;
  signIn: (input: SignInInput, role: AppRole) => Promise<void>;
  signUp: (input: Omit<Parameters<typeof signUpWithSupabase>[0], "preferredRole">, role: AppRole) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  switchRole: (role: AppRole) => void;
};

const SessionContext = createContext<Session | null>(null);
const roleStorageKey = "nobogey.initial-role";

export function AppSessionProvider({ children }: PropsWithChildren) {
  const [activeRole, setActiveRole] = useState<AppRole | null>(null);
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [initialRole, setInitialRole] = useState<AppRole | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [caddieVerification] = useState<CaddieVerificationState>("pending");

  useEffect(() => {
    let mounted = true;
    let unsubscribe: () => void = () => undefined;

    try {
      unsubscribe = subscribeToAuthState((nextSession) => {
        if (mounted) setAuthSession(nextSession);
      });

      void Promise.all([AsyncStorage.getItem(roleStorageKey), getSession()])
        .then(([storedRole, storedSession]) => {
          if (!mounted) return;
          if (storedRole === "golfer" || storedRole === "caddie") {
            setInitialRole(storedRole);
            setActiveRole(storedRole);
          }
          setAuthSession(storedSession);
        })
        .catch(() => {
          if (mounted) setAuthSession(null);
        })
        .finally(() => {
          if (mounted) setIsHydrated(true);
        });
    } catch {
      setIsHydrated(true);
    }

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;

    let client: ReturnType<typeof getSupabaseClient>;
    try {
      client = getSupabaseClient();
    } catch {
      return;
    }
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    });

    return () => subscription.remove();
  }, []);

  const value = useMemo<Session>(() => ({
    activeRole,
    authSession,
    initialRole,
    isAuthenticated: authSession !== null,
    isHydrated,
    caddieVerification,
    golferSignedIn: authSession !== null,
    selectInitialRole: (role) => {
      setInitialRole(role);
      setActiveRole(role);
      void AsyncStorage.setItem(roleStorageKey, role);
    },
    signIn: async (input, role) => {
      const nextSession = await signInWithSupabase(input);
      setActiveRole(role);
      setAuthSession(nextSession);
    },
    signUp: async (input, role) => {
      const result = await signUpWithSupabase({ ...input, preferredRole: role });
      setActiveRole(role);
      if (result.session) setAuthSession(result.session);
      return result;
    },
    signOut: async () => {
      await signOutWithSupabase();
      setAuthSession(null);
    },
    switchRole: setActiveRole
  }), [activeRole, authSession, caddieVerification, initialRole, isHydrated]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useAppSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useAppSession must be used within AppSessionProvider");
  return session;
}

// TODO(spec): persist caddie signup drafts keyed to phone/email and set the product-approved expiry TTL.
