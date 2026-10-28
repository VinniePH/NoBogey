import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { createCaddieOnboardingDraft, type CaddieOnboardingDraft, type CaddieVerificationStatus, type OnboardingStep } from "../caddie-onboarding/model";
import { getSession, signOut as signOutFromSupabase } from '../../../backend/auth/auth.service';
import { getSupabaseClient } from "../../../backend/client";
import { loadCaddieOnboardingDraft, loadPreferences, saveCaddieOnboardingDraft, savePreferences, submitCaddieOnboarding as submitRemoteCaddieOnboarding } from '../../../backend/users/users.service';
import { resolveSessionRole, type AppRole } from "./session-state";

export type { AppRole } from "./session-state";
export type CaddieVerificationState = CaddieVerificationStatus;

type Session = {
  activeRole: AppRole | null;
  initialRole: AppRole | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  caddieVerification: CaddieVerificationState;
  caddieOnboarding: CaddieOnboardingDraft;
  golferSignedIn: boolean;
  selectInitialRole: (role: AppRole) => void;
  signInAs: (role: AppRole) => void;
  signOut: () => Promise<void>;
  switchRole: (role: AppRole) => void;
  updateCaddieOnboarding: (update: Partial<CaddieOnboardingDraft>) => void;
  setCaddieOnboardingStep: (step: OnboardingStep) => void;
  submitCaddieOnboarding: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);
export function AppSessionProvider({ children }: PropsWithChildren) {
  const [activeRole, setActiveRole] = useState<AppRole | null>(null);
  const [initialRole, setInitialRole] = useState<AppRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [caddieOnboarding, setCaddieOnboarding] = useState<CaddieOnboardingDraft>(createCaddieOnboardingDraft);
  const hydrationRequest = useRef(0);

  const clearAuthenticatedSession = useCallback(() => {
    hydrationRequest.current += 1;
    setActiveRole(null);
    setInitialRole(null);
    setIsAuthenticated(false);
    setIsHydrated(true);
  }, []);

  const hydrateAuthenticatedSession = useCallback(async () => {
    const request = ++hydrationRequest.current;
    try {
      const authSession = await getSession();
      if (request !== hydrationRequest.current) return;
      if (!authSession) {
        clearAuthenticatedSession();
        return;
      }

      const [preferences, remoteDraft] = await Promise.all([
        loadPreferences<{ activeRole?: AppRole }>().catch(() => null),
        loadCaddieOnboardingDraft<CaddieOnboardingDraft>().catch(() => null),
      ]);
      if (request !== hydrationRequest.current) return;

      const storedRole = preferences?.activeRole;
      const role = resolveSessionRole(
        storedRole === "golfer" || storedRole === "caddie" ? storedRole : undefined,
        authSession.roles,
      );
      setInitialRole(role);
      setActiveRole(role);
      setIsAuthenticated(true);
      if (remoteDraft) setCaddieOnboarding({ ...createCaddieOnboardingDraft(), ...remoteDraft });
    } catch {
      if (request === hydrationRequest.current) clearAuthenticatedSession();
    } finally {
      if (request === hydrationRequest.current) setIsHydrated(true);
    }
  }, [clearAuthenticatedSession]);

  useEffect(() => {
    const client = getSupabaseClient();
    void hydrateAuthenticatedSession();

    const { data: { subscription } } = client.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        clearAuthenticatedSession();
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        setTimeout(() => void hydrateAuthenticatedSession(), 0);
      }
    });

    const syncRefreshWithAppState = (state: string) => {
      if (state === "active") {
        client.auth.startAutoRefresh();
        void hydrateAuthenticatedSession();
      } else {
        client.auth.stopAutoRefresh();
      }
    };
    syncRefreshWithAppState(AppState.currentState);
    const appStateSubscription = AppState.addEventListener("change", syncRefreshWithAppState);

    return () => {
      subscription.unsubscribe();
      appStateSubscription.remove();
      client.auth.stopAutoRefresh();
    };
  }, [clearAuthenticatedSession, hydrateAuthenticatedSession]);

  const value = useMemo<Session>(() => ({
    activeRole,
    initialRole,
    isAuthenticated,
    isHydrated,
    caddieVerification: caddieOnboarding.verificationStatus,
    caddieOnboarding,
    golferSignedIn: isAuthenticated && activeRole === "golfer",
    selectInitialRole: (role) => {
      setInitialRole(role);
      setActiveRole(role);
      void savePreferences({ activeRole: role }).catch(() => undefined);
    },
    signInAs: (role) => {
      setActiveRole(role);
      setInitialRole(role);
      setIsAuthenticated(true);
    },
    signOut: async () => {
      await signOutFromSupabase();
      clearAuthenticatedSession();
    },
    switchRole: setActiveRole,
    updateCaddieOnboarding: (update) => {
      setCaddieOnboarding((current) => {
        const next = { ...current, ...update };
        void saveCaddieOnboardingDraft(next).catch(() => undefined);
        return next;
      });
    },
    setCaddieOnboardingStep: (step) => {
      setCaddieOnboarding((current) => {
        const next = { ...current, step };
        void saveCaddieOnboardingDraft(next).catch(() => undefined);
        return next;
      });
    },
    submitCaddieOnboarding: async () => {
      const next = { ...caddieOnboarding, step: 5 as OnboardingStep, verificationStatus: "pending" as const, submittedAt: new Date().toISOString() };
      await submitRemoteCaddieOnboarding(next);
      setCaddieOnboarding(next);
    }
  }), [activeRole, caddieOnboarding, clearAuthenticatedSession, initialRole, isAuthenticated, isHydrated]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useAppSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useAppSession must be used within AppSessionProvider");
  return session;
}
