import { createContext, useContext, useState, type PropsWithChildren } from "react";
import type { Booking } from "@nobogey/contracts";
import { confirmRoundStep, emptyRoundConfirmation, type RoundConfirmations, type RoundRole, type RoundStep } from "./round-confirmation-state";

type Value = {
  confirmations: RoundConfirmations;
  confirm: (booking: Booking, step: RoundStep, role: RoundRole) => void;
};
const Context = createContext<Value | null>(null);

/** Frontend preview only. No payment collection or remote confirmation writes. */
export function RoundConfirmationProvider({ children }: PropsWithChildren) {
  const [confirmations, setConfirmations] = useState<RoundConfirmations>({});
  const confirm: Value["confirm"] = (booking, step, role) => {
    if (booking.status !== "confirmed") return;
    setConfirmations((current) => confirmRoundStep(current, booking.id, step, role, new Date().toISOString()));
  };
  return <Context.Provider value={{ confirmations, confirm }}>{children}</Context.Provider>;
}

export function useRoundConfirmation(bookingId: string) {
  const value = useContext(Context);
  if (!value) throw new Error("useRoundConfirmation must be used within RoundConfirmationProvider");
  return { ...value, round: value.confirmations[bookingId] ?? emptyRoundConfirmation() };
}
