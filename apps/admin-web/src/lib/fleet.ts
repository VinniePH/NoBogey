import { useSyncExternalStore } from "react";
import { getState, subscribe } from "../../backend/fleet";

/** Reactive adapter for the Supabase-backed administrator fleet state. */
export * from "../../backend/fleet";

export function useFleet() {
  return useSyncExternalStore(subscribe, getState, getState);
}
