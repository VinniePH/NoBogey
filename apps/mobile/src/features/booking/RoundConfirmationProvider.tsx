import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { AppState } from "react-native";
import { confirmBookingAcknowledgement, listBookingAcknowledgements } from "../../../backend/bookings/round-confirmations.service";
import { getSupabaseClient } from "../../../backend/client";
import { confirmationsFromAcknowledgements, emptyRoundConfirmation, mergeRoundAcknowledgements, type RoundConfirmations, type RoundStep } from "./round-confirmation-state";

type Value = {
  confirmations: RoundConfirmations;
  confirm: (bookingId: string, step: RoundStep) => Promise<void>;
  error: string | null;
  isLoading: boolean;
  pending: ReadonlySet<string>;
};
const Context = createContext<Value | null>(null);

function confirmationKey(bookingId: string, step: RoundStep) {
  return `${bookingId}:${step}`;
}

/** Supabase-backed acknowledgement state shared by both booking participants. */
export function RoundConfirmationProvider({ children }: PropsWithChildren) {
  const [confirmations, setConfirmations] = useState<RoundConfirmations>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const channelName = useRef(`round-confirmations-${Math.random().toString(36).slice(2)}`);

  const load = useCallback(async () => {
    try {
      const acknowledgements = await listBookingAcknowledgements();
      setConfirmations(confirmationsFromAcknowledgements(acknowledgements));
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load round confirmations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const client = getSupabaseClient();
    void load();
    const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setConfirmations({});
        setError(null);
        return;
      }
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        setTimeout(() => void load(), 0);
      }
    });
    const channel = client.channel(channelName.current)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "booking_acknowledgements" }, () => void load())
      .subscribe();
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") void load();
    });
    return () => {
      authListener.subscription.unsubscribe();
      appState.remove();
      void client.removeChannel(channel);
    };
  }, [load]);

  const confirm = useCallback(async (bookingId: string, step: RoundStep) => {
    const key = confirmationKey(bookingId, step);
    setPending((current) => new Set(current).add(key));
    setError(null);
    try {
      const acknowledgements = await confirmBookingAcknowledgement(bookingId, step);
      setConfirmations((current) => mergeRoundAcknowledgements(current, acknowledgements));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save the acknowledgement.");
    } finally {
      setPending((current) => {
        const next = new Set(current);
        next.delete(key);
        return next;
      });
    }
  }, []);

  const value = useMemo<Value>(() => ({ confirmations, confirm, error, isLoading, pending }), [confirm, confirmations, error, isLoading, pending]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRoundConfirmation(bookingId: string) {
  const value = useContext(Context);
  if (!value) throw new Error("useRoundConfirmation must be used within RoundConfirmationProvider");
  return {
    round: value.confirmations[bookingId] ?? emptyRoundConfirmation(),
    confirm: (step: RoundStep) => value.confirm(bookingId, step),
    error: value.error,
    isLoading: value.isLoading,
    isSubmitting: (step: RoundStep) => value.pending.has(confirmationKey(bookingId, step)),
  };
}
