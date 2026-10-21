export type RoundRole = "golfer" | "caddie";
export type RoundStep = "meetup" | "payment";
export type MutualConfirmation = Partial<Record<RoundRole, string>>;
export type RoundConfirmation = { meetup: MutualConfirmation; payment: MutualConfirmation };
export type RoundConfirmations = Record<string, RoundConfirmation>;

export function emptyRoundConfirmation(): RoundConfirmation {
  return { meetup: {}, payment: {} };
}

export function isMutual(confirmation: MutualConfirmation): boolean {
  return Boolean(confirmation.golfer && confirmation.caddie);
}

/** A participant can acknowledge only their own side; payment follows mutual meetup. */
export function confirmRoundStep(state: RoundConfirmations, bookingId: string, step: RoundStep, role: RoundRole, confirmedAt: string): RoundConfirmations {
  const round = state[bookingId] ?? emptyRoundConfirmation();
  if (round[step][role] || (step === "payment" && !isMutual(round.meetup))) return state;
  return { ...state, [bookingId]: { ...round, [step]: { ...round[step], [role]: confirmedAt } } };
}
