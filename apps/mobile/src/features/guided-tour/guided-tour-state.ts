type AutomaticTourState = {
  accountId: string | null;
  completed: boolean;
  isReady: boolean;
  role: string;
  startedFor: string | null;
};

export function getAutomaticTourKey(accountId: string | null, role: string): string | null {
  return accountId ? `${accountId}:${role}` : null;
}

export function shouldStartAutomaticTour({ accountId, completed, isReady, role, startedFor }: AutomaticTourState): boolean {
  const key = getAutomaticTourKey(accountId, role);
  return Boolean(key && isReady && !completed && startedFor !== key);
}
