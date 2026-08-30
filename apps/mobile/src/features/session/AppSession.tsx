import type { PropsWithChildren } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createCaddieOnboardingDraft, type CaddieOnboardingDraft, type CaddieVerificationStatus, type OnboardingStep } from "../caddie-onboarding/model";
import { getSession, signOut as signOutFromSupabase } from '../../../backend/auth/auth.service';
import { loadCaddieOnboardingDraft, saveCaddieOnboardingDraft } from '../../../backend/users/users.service';

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
  submitCaddieOnboarding: () => void;
};

const SessionContext = createContext<Session | null>(null);
const roleStorageKey = "nobogey.initial-role";
const caddieOnboardingStorageKey = "nobogey.caddie-onboarding";

function persistCaddieOnboarding(draft: CaddieOnboardingDraft) {
  const { password: _password, ...persistedDraft } = draft;
  void AsyncStorage.setItem(caddieOnboardingStorageKey, JSON.stringify(persistedDraft));
}

export function AppSessionProvider({ children }: PropsWithChildren) {
  const [activeRole, setActiveRole] = useState<AppRole | null>(null);
  const [initialRole, setInitialRole] = useState<AppRole | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [golferSignedIn, setGolferSignedIn] = useState(false);
  const [caddieOnboarding, setCaddieOnboarding] = useState<CaddieOnboardingDraft>(createCaddieOnboardingDraft);

  useEffect(() => {
    void Promise.all([AsyncStorage.getItem(roleStorageKey), AsyncStorage.getItem(caddieOnboardingStorageKey), getSession().catch(() => null), loadCaddieOnboardingDraft<CaddieOnboardingDraft>().catch(() => null)])
      .then(([storedRole, storedDraft, authSession, remoteDraft]) => {
        if ((storedRole === "golfer" || storedRole === "caddie") && authSession?.roles.includes(storedRole)) {
          setInitialRole(storedRole);
          setActiveRole(storedRole);
          if (storedRole === 'golfer') setGolferSignedIn(true);
        }
        if (remoteDraft) setCaddieOnboarding({ ...createCaddieOnboardingDraft(), ...remoteDraft });
        else if (storedDraft) {
          try {
            setCaddieOnboarding({ ...createCaddieOnboardingDraft(), ...JSON.parse(storedDraft) } as CaddieOnboardingDraft);
          } catch {
            void AsyncStorage.removeItem(caddieOnboardingStorageKey);
          }
        }
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
      void AsyncStorage.setItem(roleStorageKey, role);
    },
    signInAs: (role) => {
      setActiveRole(role);
      if (role === "golfer") setGolferSignedIn(true);
    },
    signOut: async () => {
      await signOutFromSupabase();
      await AsyncStorage.removeItem(roleStorageKey);
      setActiveRole(null);
      setInitialRole(null);
      setGolferSignedIn(false);
    },
    switchRole: setActiveRole,
    updateCaddieOnboarding: (update) => {
      setCaddieOnboarding((current) => {
        const next = { ...current, ...update };
        persistCaddieOnboarding(next);
        void saveCaddieOnboardingDraft(next).catch(() => undefined);
        return next;
      });
    },
    setCaddieOnboardingStep: (step) => {
      setCaddieOnboarding((current) => {
        const next = { ...current, step };
        persistCaddieOnboarding(next);
        void saveCaddieOnboardingDraft(next).catch(() => undefined);
        return next;
      });
    },
    submitCaddieOnboarding: () => {
      setCaddieOnboarding((current) => {
        const next = { ...current, step: 5 as OnboardingStep };
        persistCaddieOnboarding(next);
        void saveCaddieOnboardingDraft(next, true).catch(() => undefined);
        return next;
      });
    }
  }), [activeRole, caddieOnboarding, golferSignedIn, initialRole, isHydrated]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useAppSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useAppSession must be used within AppSessionProvider");
  return session;
}
