import { describe, expect, it } from "vitest";
import { applyVerificationStatus, canSubmitOnboarding, createCaddieOnboardingDraft, createVerificationRequest, passwordMeetsRequirements, validateStep } from "./model";

describe("caddie onboarding model", () => {
  it("requires an account photo and a strong password", () => {
    const draft = createCaddieOnboardingDraft();
    expect(validateStep(draft, 1)).toMatchObject({ fullName: expect.any(String), email: expect.any(String), password: expect.any(String), profilePhoto: expect.any(String) });
    expect(passwordMeetsRequirements("Golf2026")).toBe(true);
    expect(passwordMeetsRequirements("golf")).toBe(false);
  });

  it("does not let Terms acceptance replace password validation", () => {
    const draft = { ...createCaddieOnboardingDraft(), fullName: "Rafa Dizon", email: "rafa@example.com", profilePhotoUri: "avatar://caddie-hat", termsAcceptedAt: "2026-08-15T00:00:00.000Z" };
    expect(validateStep(draft, 1)).toMatchObject({ password: expect.any(String) });
  });

  it("requires a directory course and experience selection", () => {
    const draft = createCaddieOnboardingDraft();
    expect(validateStep(draft, 2)).toMatchObject({ homeCourse: expect.any(String), yearsExperience: expect.any(String) });
    expect(validateStep({ ...draft, homeCourseId: "manila-golf-country-club", yearsExperience: "three_to_five" }, 2)).toEqual({});
  });

  it("enforces two languages and produces a versioned verification request", () => {
    const threeLanguages = ["English", "Filipino", "Japanese"] as unknown as ReturnType<typeof createCaddieOnboardingDraft>["languages"];
    const draft = { ...createCaddieOnboardingDraft(), fullName: "Rafa Dizon", email: "rafa@example.com", password: "Golf2026", profilePhotoUri: "file://photo", homeCourseId: "tagaytay-highlands", yearsExperience: "three_to_five" as const, tagline: "Course-smart caddie", languages: threeLanguages };
    expect(canSubmitOnboarding(draft)).toMatchObject({ languages: expect.any(String) });
    const request = createVerificationRequest({ ...draft, languages: ["English", "Filipino"] });
    expect(request.status).toBe("pending");
    expect(request.submissionVersion).toBe(1);
    expect(applyVerificationStatus({ ...draft, verificationRequest: request }, "verified").verificationStatus).toBe("verified");
  });
});
