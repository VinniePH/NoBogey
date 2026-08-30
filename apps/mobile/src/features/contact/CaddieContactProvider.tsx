import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { CaddieContactDetails } from "./caddie-contact.types";

type CaddieContactContextValue = {
  contact: CaddieContactDetails;
  updateContact: (update: Partial<CaddieContactDetails>) => void;
};

const CaddieContactContext = createContext<CaddieContactContextValue | null>(null);

const initialContact: CaddieContactDetails = {
  contactEmail: "",
  phoneNumber: "",
  shareEmail: false,
  sharePhone: false
};

export function CaddieContactProvider({ children }: PropsWithChildren) {
  const [contact, setContact] = useState(initialContact);
  const value = useMemo<CaddieContactContextValue>(() => ({
    contact,
    updateContact: (update) => setContact((current) => ({ ...current, ...update }))
  }), [contact]);
  return <CaddieContactContext.Provider value={value}>{children}</CaddieContactContext.Provider>;
}

export function useCaddieContact() {
  const value = useContext(CaddieContactContext);
  if (!value) throw new Error("useCaddieContact must be used within CaddieContactProvider");
  return value;
}
