export const PASSWORD_REQUIREMENTS = 'Use at least 12 characters with uppercase, lowercase, a number, and a symbol.';

export function getPasswordPolicyError(password: string): string | null {
  const strongEnough = password.length >= 12
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password);
  return strongEnough ? null : PASSWORD_REQUIREMENTS;
}
