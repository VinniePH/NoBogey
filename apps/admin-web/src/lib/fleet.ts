import { useSyncExternalStore } from "react";
import { getState, subscribe } from "../../backend/fleet";

/** Frontend adapter for the local mock backend. Replace this export with HTTP calls when an API exists. */
export * from "../../backend/fleet";

export function useFleet() {
  return useSyncExternalStore(subscribe, getState, getState);
}
