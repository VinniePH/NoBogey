export function adminSignInCredentials(email: string, password: string, captchaToken: string) {
  if (!captchaToken) throw new Error("Complete the security check first.");
  return {
    email: email.trim().toLowerCase(),
    password,
    options: { captchaToken }
  };
}

export function adminPasswordResetOptions(origin: string, captchaToken: string) {
  if (!captchaToken) throw new Error("Complete the security check first.");
  return {
    redirectTo: `${origin}/reset-password`,
    captchaToken
  };
}
