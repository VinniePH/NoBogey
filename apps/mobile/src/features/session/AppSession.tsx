import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createCaddieOnboardingDraft, type CaddieOnboardingDraft, type CaddieVerificationStatus, type OnboardingStep } from "../caddie-onboarding/model";
import { getSession, signOut as signOutFromSupabase } from '../../../backend/auth/auth.service';
import { loadCaddieOnboardingDraft, loadPreferences, saveCaddieOnboardingDraft, savePreferences, submitCaddieOnboarding as submitRemoteCaddieOnboarding } from '../../../backend/users/users.service';

export type AppRole = "golfer" | "caddie";
export type CaddieVerificationState = CaddieVerificationStatus;

type Session = {
  activeRole: AppRole | null;
  initialRole: AppRole | null;
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
  const [isHydrated, setIsHydrated] = useState(false);
  const [golferSignedIn, setGolferSignedIn] = useState(false);
  const [caddieOnboarding, setCaddieOnboarding] = useState<CaddieOnboardingDraft>(createCaddieOnboardingDraft);

  useEffect(() => {
    void Promise.all([loadPreferences<{ activeRole?: AppRole }>().catch(() => null), getSession().catch(() => null), loadCaddieOnboardingDraft<CaddieOnboardingDraft>().catch(() => null)])
      .then(([preferences, authSession, remoteDraft]) => {
        const storedRole = preferences?.activeRole;
        if ((storedRole === "golfer" || storedRole === "caddie") && authSession?.roles.includes(storedRole)) {
          setInitialRole(storedRole);
          setActiveRole(storedRole);
          if (storedRole === 'golfer') setGolferSignedIn(true);
        }
        if (remoteDraft) setCaddieOnboarding({ ...createCaddieOnboardingDraft(), ...remoteDraft });
      })
      .finally(() => setIsHydrated(true));
  }, []);

  const value = useMemo<Session>(() => ({
    activeRole,
    initialRole,
    isHydrated,
    caddieVerification: caddieOnboarding.verificationStatus,
    caddieOnboarding,
    golferSignedIn,
    selectInitialRole: (role) => {
      setInitialRole(role);
      setActiveRole(role);
      void savePreferences({ activeRole: role }).catch(() => undefined);
    },
    signInAs: (role) => {
      setActiveRole(role);
      if (role === "golfer") setGolferSignedIn(true);
    },
    signOut: async () => {
      await signOutFromSupabase();
      setActiveRole(null);
      setInitialRole(null);
      setGolferSignedIn(false);
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
  }), [activeRole, caddieOnboarding, golferSignedIn, initialRole, isHydrated]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useAppSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useAppSession must be used within AppSessionProvider");
  return session;
}
