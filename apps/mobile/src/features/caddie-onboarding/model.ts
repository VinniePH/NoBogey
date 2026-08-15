import type { CaddieVerificationStatus } from "@nobogey/contracts";

export type { CaddieVerificationStatus };
export type OnboardingStep = 1 | 2 | 3 | 4 | 5;
export type ExperienceRange = "less_than_one" | "one_to_two" | "three_to_five" | "six_to_ten" | "ten_plus";
export type GolferSkillRange = "beginner" | "recreational" | "intermediate" | "advanced" | "competitive" | "professional";

export type CourseDirectoryEntry = {
  id: string;
  name: string;
  clubName: string;
  city: string;
  region: string;
  country: string;
  registryNumberRequired: boolean;
  employmentStatusRequired: boolean;
};

export const courseDirectory: CourseDirectoryEntry[] = [
  { id: "manila-golf-country-club", name: "Manila Golf & Country Club", clubName: "Manila Golf & Country Club", city: "Makati", region: "Metro Manila", country: "Philippines", registryNumberRequired: true, employmentStatusRequired: true },
  { id: "wack-wack-golf-country-club", name: "Wack Wack Golf & Country Club", clubName: "Wack Wack Golf & Country Club", city: "Mandaluyong", region: "Metro Manila", country: "Philippines", registryNumberRequired: true, employmentStatusRequired: false },
  { id: "tagaytay-highlands", name: "Tagaytay Highlands", clubName: "Tagaytay Highlands International Golf Club", city: "Tagaytay", region: "Cavite", country: "Philippines", registryNumberRequired: false, employmentStatusRequired: true }
];

export const skillOptions = [
  ["green_reading", "Green Reading", "Reading slopes, breaks, speed, and putting conditions."],
  ["yardage_wind", "Yardage & Wind Reading", "Evaluating distances, elevation, wind, and playing conditions."],
  ["club_selection", "Club Selection", "Helping golfers select appropriate clubs for the situation."],
  ["course_strategy", "Course Strategy", "Supporting shot planning, positioning, risk management, and course management."],
  ["pace_management", "Pace Management", "Helping maintain an efficient and comfortable pace of play."],
  ["tournament_experience", "Tournament Experience", "Experience supporting golfers in competitive environments."],
  ["beginner_support", "Beginner Support", "Experience assisting new or developing golfers."],
  ["languages", "Languages", "Clear communication with golfers who speak your supported languages."],
  ["course_knowledge", "Course-Specific Knowledge", "Deep knowledge of your selected home course and local conditions."]
] as const;

export type StandardSkillId = typeof skillOptions[number][0];
export const languageOptions = ["English", "Filipino", "Cebuano", "Japanese", "Korean", "Mandarin", "Spanish"] as const;
export type SupportedLanguage = typeof languageOptions[number];

export type Credential = { id: string; name: string; issuer: string; issueDate: string; expirationDate: string; credentialNumber: string; supportingFileUri: string; verificationStatus: "unverified" | "verified" };
export type PortfolioHighlight = { id: string; title: string; description: string; year: string };

export type VerificationRequest = {
  id: string;
  caddieId: string;
  courseId: string;
  registryNumber: string;
  submittedCredentials: Credential[];
  submittedAt: string;
  status: Exclude<CaddieVerificationStatus, "draft">;
  reviewedAt?: string;
  reviewedBy?: string;
  clubNotes?: string;
  reason?: string;
  submissionVersion: number;
};

export type CaddieOnboardingDraft = {
  caddieId: string;
  step: OnboardingStep;
  fullName: string;
  email: string;
  password: string;
  profilePhotoUri: string;
  homeCourseId: string;
  registryNumber: string;
  yearsExperience: ExperienceRange | "";
  employmentStatus: string;
  skills: StandardSkillId[];
  tagline: string;
  bio: string;
  credentials: Credential[];
  highlights: PortfolioHighlight[];
  preferredGolferSkillRange: GolferSkillRange[];
  languages: SupportedLanguage[];
  workSampleUris: string[];
  verificationStatus: CaddieVerificationStatus;
  termsAcceptedAt?: string;
  termsVersion?: string;
  submittedAt?: string;
  verificationRequest?: VerificationRequest;
  changeReason?: string;
  onboardingCompletedAt?: string;
};

export const experienceLabels: Record<ExperienceRange, string> = { less_than_one: "Less than 1 year", one_to_two: "1–2 years", three_to_five: "3–5 years", six_to_ten: "6–10 years", ten_plus: "10+ years" };
export const experienceYears: Record<ExperienceRange, number> = { less_than_one: 0, one_to_two: 1, three_to_five: 3, six_to_ten: 6, ten_plus: 10 };
export const golferSkillLabels: Record<GolferSkillRange, string> = { beginner: "Beginner", recreational: "Recreational", intermediate: "Intermediate", advanced: "Advanced", competitive: "Competitive", professional: "Professional" };

export function createCaddieOnboardingDraft(): CaddieOnboardingDraft {
  return { caddieId: "local-caddie", step: 1, fullName: "", email: "", password: "", profilePhotoUri: "", homeCourseId: "", registryNumber: "", yearsExperience: "", employmentStatus: "", skills: [], tagline: "", bio: "", credentials: [], highlights: [], preferredGolferSkillRange: [], languages: [], workSampleUris: [], verificationStatus: "draft" };
}

export function passwordMeetsRequirements(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

export function selectedCourse(draft: CaddieOnboardingDraft) {
  return courseDirectory.find((course) => course.id === draft.homeCourseId);
}

export function validateStep(draft: CaddieOnboardingDraft, step: OnboardingStep): Record<string, string> {
  const course = selectedCourse(draft);
  if (step === 1) return { ...(draft.fullName.trim() ? {} : { fullName: "Enter your full name." }), ...(/^\S+@\S+\.\S+$/.test(draft.email) ? {} : { email: "Enter a valid email address." }), ...(passwordMeetsRequirements(draft.password) ? {} : { password: "Use 8+ characters with an uppercase letter and a number." }), ...(draft.profilePhotoUri ? {} : { profilePhoto: "Choose an avatar icon to continue." }) };
  if (step === 2) return { ...(course ? {} : { homeCourse: "Select a course from the directory." }), ...(draft.yearsExperience ? {} : { yearsExperience: "Choose your years of experience." }) };
  if (step === 4) return { ...(draft.tagline.trim() ? {} : { tagline: "Add a professional tagline." }), ...(draft.languages.length > 2 ? { languages: "Choose no more than two languages." } : {}), ...draft.credentials.reduce<Record<string, string>>((errors, credential) => ({ ...errors, ...(credential.name.trim() && credential.issuer.trim() && credential.issueDate ? {} : { [`credential-${credential.id}`]: "Each credential needs a name, issuer, and issue date." }) }), {}) };
  return {};
}

export function canSubmitOnboarding(draft: CaddieOnboardingDraft) {
  return [1, 2, 4].reduce<Record<string, string>>((errors, step) => ({ ...errors, ...validateStep(draft, step as OnboardingStep) }), {});
}

export function createVerificationRequest(draft: CaddieOnboardingDraft, now = new Date().toISOString()): VerificationRequest {
  return { id: `verification-${Date.now()}`, caddieId: draft.caddieId, courseId: draft.homeCourseId, registryNumber: draft.registryNumber, submittedCredentials: draft.credentials, submittedAt: now, status: "pending", submissionVersion: (draft.verificationRequest?.submissionVersion ?? 0) + 1 };
}

export function applyVerificationStatus(draft: CaddieOnboardingDraft, status: Exclude<CaddieVerificationStatus, "draft" | "pending">, details: { reason?: string; reviewedBy?: string; notes?: string } = {}): CaddieOnboardingDraft {
  if (!draft.verificationRequest) return draft;
  return { ...draft, verificationStatus: status, ...(details.reason ? { changeReason: details.reason } : {}), verificationRequest: { ...draft.verificationRequest, status, ...(details.reason ? { reason: details.reason } : {}), ...(details.reviewedBy ? { reviewedBy: details.reviewedBy } : {}), ...(details.notes ? { clubNotes: details.notes } : {}), reviewedAt: new Date().toISOString() } };
}
