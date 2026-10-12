import type {
  CaddieVerificationDetail,
  CaddieVerificationDocumentKind,
  CaddieVerificationErrorShape,
  CaddieVerificationStatus,
  CaddieVerificationSummary,
  VerificationStatusFilter,
} from "@nobogey/contracts";
import { supabase } from "../src/lib/supabase";

export class CaddieVerificationAdapterError extends Error implements CaddieVerificationErrorShape {
  readonly code;
  readonly requestId;
  readonly fieldErrors?: Record<string, string>;

  constructor(error: CaddieVerificationErrorShape) {
    super(error.message);
    this.name = "CaddieVerificationAdapterError";
    this.code = error.code;
    this.requestId = error.requestId;
    if (error.fieldErrors) this.fieldErrors = error.fieldErrors;
  }
}

type ProfileRow = {
  user_id: string;
  verification_status: CaddieVerificationStatus;
  years_experience: number | null;
  onboarding_completed_at: string | null;
  created_at: string;
};

async function managedClubId(): Promise<string | null> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) return null;

  const { data: roles, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (roleError) throw roleError;
  if ((roles ?? []).some(({ role }) => role === "super_admin" || role === "admin")) return null;

  const { data: staff, error: staffError } = await supabase
    .from("club_staff")
    .select("club_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (staffError) throw staffError;
  if (!staff?.club_id) {
    throw new CaddieVerificationAdapterError({
      code: "FORBIDDEN",
      message: "No active club assignment is available for this administrator.",
      requestId: crypto.randomUUID(),
    });
  }
  return staff.club_id;
}

async function summaries(filter: VerificationStatusFilter) {
  const clubId = await managedClubId();
  let permittedIds: string[] | null = null;

  if (clubId) {
    const { data: assignments, error: assignmentError } = await supabase
      .from("caddie_club_assignments")
      .select("caddie_id")
      .eq("club_id", clubId)
      .limit(500);
    if (assignmentError) throw assignmentError;
    permittedIds = [...new Set((assignments ?? []).map(({ caddie_id }) => caddie_id))];
    if (!permittedIds.length) return [];
  }

  let query = supabase
    .from("caddie_profiles")
    .select("user_id,verification_status,years_experience,onboarding_completed_at,created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (filter !== "all") query = query.eq("verification_status", filter);
  if (permittedIds) query = query.in("user_id", permittedIds);

  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []) as ProfileRow[];
  const ids = rows.map((row) => row.user_id);
  if (!ids.length) return [];

  let assignmentQuery = supabase
    .from("caddie_club_assignments")
    .select("caddie_id,club_id")
    .in("caddie_id", ids)
    .limit(500);
  if (clubId) assignmentQuery = assignmentQuery.eq("club_id", clubId);

  const [{ data: names, error: nameError }, { data: assignments, error: assignmentError }] = await Promise.all([
    supabase.from("profiles").select("id,display_name").in("id", ids).limit(500),
    assignmentQuery,
  ]);
  if (nameError) throw nameError;
  if (assignmentError) throw assignmentError;

  return rows.map((row) => ({
    caddieId: row.user_id,
    courseId: (assignments ?? []).find((assignment) => assignment.caddie_id === row.user_id)?.club_id ?? "",
    displayName: (names ?? []).find((profile) => profile.id === row.user_id)?.display_name ?? "NoBogey Caddie",
    tier: "Registered",
    submittedAt: row.onboarding_completed_at ?? row.created_at,
    status: row.verification_status,
  } satisfies CaddieVerificationSummary));
}

export async function listCaddiesForVerification(filter: VerificationStatusFilter = "all") {
  return summaries(filter);
}

export async function getCaddieVerificationDetail(caddieId: string): Promise<CaddieVerificationDetail> {
  const list = await summaries("all");
  const summary = list.find((item) => item.caddieId === caddieId);
  if (!summary) {
    throw new CaddieVerificationAdapterError({
      code: "NOT_FOUND",
      message: "Caddie submission not found.",
      requestId: crypto.randomUUID(),
    });
  }

  const [
    { data: profile },
    { data: assignment },
    { data: documents },
    { data: history },
  ] = await Promise.all([
    supabase.from("caddie_profiles").select("years_experience").eq("user_id", caddieId).single(),
    supabase
      .from("caddie_club_assignments")
      .select("club_id,golf_clubs(name)")
      .eq("caddie_id", caddieId)
      .eq("club_id", summary.courseId)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("verification_documents")
      .select("id,document_type,storage_object_name,created_at")
      .eq("caddie_id", caddieId)
      .limit(100),
    supabase
      .from("caddie_verification_reviews")
      .select("id,status,reviewer_note,created_at")
      .eq("caddie_id", caddieId)
      .order("created_at")
      .limit(100),
  ]);

  return {
    ...summary,
    clubName: (assignment?.golf_clubs as unknown as { name?: string })?.name ?? "No club assigned",
    yearsExperience: profile?.years_experience ?? 0,
    languages: ["English", "Filipino"],
    documents: (documents ?? []).map((document) => ({
      id: document.id,
      kind: document.document_type as CaddieVerificationDocumentKind,
      label: document.document_type.replaceAll("_", " "),
      fileName: document.storage_object_name.split("/").pop() ?? document.storage_object_name,
      reference: document.storage_object_name,
      submittedAt: document.created_at,
    })),
    history: (history ?? []).map((entry) => ({
      id: entry.id,
      status: entry.status as CaddieVerificationStatus,
      occurredAt: entry.created_at,
      ...(entry.reviewer_note ? { reviewerNote: entry.reviewer_note } : {}),
    })),
  };
}

async function decide(caddieId: string, status: CaddieVerificationStatus, note?: string) {
  const { error } = await supabase.rpc("admin_review_caddie", {
    p_caddie_id: caddieId,
    p_status: status,
    p_note: note?.trim() || null,
  });
  if (error) throw error;
  return getCaddieVerificationDetail(caddieId);
}

export const approveCaddieVerification = (id: string, note?: string) => decide(id, "verified", note);
export const rejectCaddieVerification = (id: string, reason: string) => decide(id, "rejected", reason);
export const requestMoreInfo = (id: string, message: string) => decide(id, "changes_requested", message);
export function resetCaddieVerificationMock() {}
