import type { PropsWithChildren } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppRole = "golfer" | "caddie";
export type CaddieVerificationState = "pending" | "verified" | "rejected" | "retry";

type Session = {
  activeRole: AppRole | null;
  initialRole: AppRole | null;
  isHydrated: boolean;
  caddieVerification: CaddieVerificationState;
  golferSignedIn: boolean;
  selectInitialRole: (role: AppRole) => void;
  signInAs: (role: AppRole) => void;
  signOut: () => Promise<void>;
  switchRole: (role: AppRole) => void;
};

const SessionContext = createContext<Session | null>(null);
const roleStorageKey = "nobogey.initial-role";

export function AppSessionProvider({ children }: PropsWithChildren) {
  const [activeRole, setActiveRole] = useState<AppRole | null>(null);
  const [initialRole, setInitialRole] = useState<AppRole | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [golferSignedIn, setGolferSignedIn] = useState(false);
  const [caddieVerification] = useState<CaddieVerificationState>("pending");

  useEffect(() => {
    void AsyncStorage.getItem(roleStorageKey)
      .then((storedRole) => {
        if (storedRole === "golfer" || storedRole === "caddie") {
          setInitialRole(storedRole);
          setActiveRole(storedRole);
        }
      })
      .finally(() => setIsHydrated(true));
  }, []);

  const value = useMemo<Session>(() => ({
    activeRole,
    initialRole,
    isHydrated,
    caddieVerification,
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
      await AsyncStorage.removeItem(roleStorageKey);
      setActiveRole(null);
      setInitialRole(null);
      setGolferSignedIn(false);
    },
    switchRole: setActiveRole
  }), [activeRole, caddieVerification, golferSignedIn, initialRole, isHydrated]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useAppSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useAppSession must be used within AppSessionProvider");
  return session;
}

// TODO(spec): persist caddie signup drafts keyed to phone/email and set the product-approved expiry TTL.
