import { describe, expect, it } from "vitest";
import { applyVerificationStatus, canSubmitOnboarding, createCaddieOnboardingDraft, createVerificationRequest, validateStep } from "./model";

describe("caddie onboarding model", () => {
  it("requires profile identity after account creation", () => {
    const draft = createCaddieOnboardingDraft();
    expect(validateStep(draft, 1)).toEqual({ fullName: expect.any(String), profilePhoto: expect.any(String) });
  });

  it("accepts a complete profile identity without collecting credentials again", () => {
    const draft = { ...createCaddieOnboardingDraft(), fullName: "Rafa Dizon", profilePhotoUri: "avatar://caddie-hat", termsAcceptedAt: "2026-08-15T00:00:00.000Z" };
    expect(validateStep(draft, 1)).toEqual({});
  });

  it("requires a directory course and experience selection", () => {
    const draft = createCaddieOnboardingDraft();
    expect(validateStep(draft, 2)).toMatchObject({ homeCourse: expect.any(String), yearsExperience: expect.any(String) });
    expect(validateStep({ ...draft, homeCourseId: "manila-golf-country-club", yearsExperience: "three_to_five" }, 2)).toEqual({});
  });

  it("enforces two languages and produces a versioned verification request", () => {
    const threeLanguages = ["English", "Filipino", "Japanese"] as unknown as ReturnType<typeof createCaddieOnboardingDraft>["languages"];
    const draft = { ...createCaddieOnboardingDraft(), fullName: "Rafa Dizon", profilePhotoUri: "file://photo", homeCourseId: "tagaytay-highlands", yearsExperience: "three_to_five" as const, tagline: "Course-smart caddie", languages: threeLanguages };
    expect(canSubmitOnboarding(draft)).toMatchObject({ languages: expect.any(String) });
    const request = createVerificationRequest({ ...draft, languages: ["English", "Filipino"] });
    expect(request.status).toBe("pending");
    expect(request.submissionVersion).toBe(1);
    expect(applyVerificationStatus({ ...draft, verificationRequest: request }, "verified").verificationStatus).toBe("verified");
  });
});
