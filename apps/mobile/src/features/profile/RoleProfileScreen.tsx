import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@nobogey/ui";
import { caddies, courses, golfer } from "../../data/mock";
import { useAppSession } from "../session/AppSession";
import { ResponsiveContent } from "../../ui/ResponsiveContent";

type ProfileRole = "golfer" | "caddie";
type Portfolio = {
  bio: string;
  homeCourseId: string;
  specialties: string[];
  yearsExperience: number;
};

const portfolioStorageKey = "nobogey.caddie-portfolio";
const specialtyOptions = ["Green reading", "Pace management", "Tournament loops", "Reads greens well", "Good with beginners", "Fast pace", "Course strategy"];

const golferRounds = [
  { id: "golfer-round-1", otherParty: "Elena S.", date: "May 15, 2026", score: "82" },
  { id: "golfer-round-2", otherParty: "Joey S.", date: "May 8, 2026", score: "72" },
  { id: "golfer-round-3", otherParty: "Daniel S.", date: "May 1, 2026", score: "89" },
  { id: "golfer-round-4", otherParty: "Frank S.", date: "April 26, 2026", score: "84" }
];

const caddieMatches = [
  { id: "match-1024", otherParty: "Mia Santos", date: "May 15, 2026", score: "82" },
  { id: "match-1017", otherParty: "Robert Tan", date: "May 8, 2026", score: "76" },
  { id: "match-1011", otherParty: "Maria Reyes", date: "May 1, 2026", score: "84" },
  { id: "match-1006", otherParty: "Daniel Lim", date: "April 26, 2026", score: "79" }
];

export function RoleProfileScreen({ role }: { role: ProfileRole }) {
  const caddie = caddies[0]!;
  const initialPortfolio = useMemo<Portfolio>(() => ({
    bio: caddie.bio,
    homeCourseId: caddie.homeCourseId,
    specialties: caddie.specialties,
    yearsExperience: caddie.yearsExperience
  }), [caddie]);
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [portfolioEditorVisible, setPortfolioEditorVisible] = useState(false);

  useEffect(() => {
    if (role !== "caddie") return;
    void AsyncStorage.getItem(portfolioStorageKey).then((storedPortfolio) => {
      if (!storedPortfolio) return;
      try {
        const parsed = JSON.parse(storedPortfolio) as Portfolio;
        if (parsed.bio && parsed.homeCourseId && Array.isArray(parsed.specialties) && Number.isFinite(parsed.yearsExperience)) setPortfolio(parsed);
      } catch {
        // Ignore malformed device-local prototype data and use the bundled caddie profile.
      }
    });
  }, [role]);

  const data = role === "golfer"
    ? {
        bio: "Weekend golfer chasing a single-digit handicap. Loves early tee times and a good green read.",
        history: golferRounds,
        historyTitle: "Round History",
        homeCourseId: golfer.homeCourseId,
        identityMeta: `Handicap Mid (${golfer.handicap ?? "—"})`,
        name: golfer.displayName,
        roleLabel: "GOLFER",
        statTiles: [{ label: "ROUNDS", value: "8" }, { label: "AVERAGE SCORE", value: "85" }],
        summary: { eyebrow: "FAVORITE CADDIE", detail: "Your most-requested loop.", name: caddies.find((item) => golfer.preferredCaddieIds.includes(item.id))?.displayName ?? "No favorite yet" }
      }
    : {
        bio: portfolio.bio,
        history: caddieMatches,
        historyTitle: "Match History",
        homeCourseId: portfolio.homeCourseId,
        identityMeta: `${portfolio.yearsExperience} years caddying · ${caddie.ratingAverage.toFixed(1)}★ rating`,
        name: caddie.displayName,
        roleLabel: "CADDIE",
        statTiles: [{ label: "ROUNDS CADDIED", value: String(caddie.completedRounds) }, { label: "AVERAGE RATING", value: `${caddie.ratingAverage.toFixed(1)}★` }],
        summary: { eyebrow: "RECENT GOLFER", detail: "Last round together · May 15, 2026", name: "Mia Santos" }
      };
  const homeCourse = courses.find((course) => course.id === data.homeCourseId);

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
      <ResponsiveContent style={styles.frame}>
        <ProfileHeader role={role} />
        <IdentityCard bio={data.bio} homeCourseName={homeCourse?.name ?? "Not set"} meta={data.identityMeta} name={data.name} role={role} roleLabel={data.roleLabel} onEditPortfolio={role === "caddie" ? () => setPortfolioEditorVisible(true) : undefined} />
        <AccountRoleCard role={role} />
        <View style={styles.statRow}>{data.statTiles.map((stat) => <StatTile key={stat.label} {...stat} />)}</View>
        <SummaryCard {...data.summary} />
        <HistoryList history={data.history} role={role} title={data.historyTitle} />
      </ResponsiveContent>
    </ScrollView>
    {role === "caddie" ? <EditPortfolioModal initialPortfolio={portfolio} onClose={() => setPortfolioEditorVisible(false)} onSave={(nextPortfolio) => setPortfolio(nextPortfolio)} visible={portfolioEditorVisible} /> : null}
  </SafeAreaView>;
}

export function ProfileHeader({ role }: { role: ProfileRole }) {
  return <View style={styles.header}>
    <Pressable accessibilityLabel="Go back" accessibilityRole="button" hitSlop={10} onPress={() => router.back()} style={styles.headerButton}><MaterialCommunityIcons color={colors.fairwayDark} name="arrow-left" size={25} /></Pressable>
    <Text accessibilityRole="header" style={styles.headerTitle}>My Profile</Text>
    <Pressable accessibilityLabel="Open settings" accessibilityRole="button" hitSlop={10} onPress={() => router.push(role === "golfer" ? "/golfer/settings" : "/caddie/settings")} style={styles.headerButton}><MaterialCommunityIcons color={colors.fairwayDark} name="cog-outline" size={24} /></Pressable>
  </View>;
}

export function IdentityCard({ bio, homeCourseName, meta, name, onEditPortfolio, role, roleLabel }: { bio: string; homeCourseName: string; meta: string; name: string; onEditPortfolio?: () => void; role: ProfileRole; roleLabel: string }) {
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <View style={styles.profileCard}>
    <View accessibilityLabel={`${name} initials avatar`} accessibilityRole="image" style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
    <View style={styles.profileCopy}>
      <Text style={styles.eyebrow}>{roleLabel}</Text>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.profileMeta}>{meta} · Home: {homeCourseName}</Text>
      <Text style={styles.profileBio}>{bio}</Text>
      {role === "caddie" && onEditPortfolio ? <Pressable accessibilityLabel="Edit portfolio" accessibilityRole="button" onPress={onEditPortfolio} style={styles.editLink}><MaterialCommunityIcons color={colors.fairwayDark} name="pencil-outline" size={14} /><Text style={styles.editLinkText}>Edit portfolio</Text></Pressable> : null}
    </View>
  </View>;
}

export function AccountRoleCard({ role }: { role: ProfileRole }) {
  const { initialRole, switchRole } = useAppSession();
  const otherRole = role === "golfer" ? "caddie" : "golfer";
  const otherRoleHasBeenAdded = initialRole === otherRole;
  const switchToOtherRole = () => {
    switchRole(otherRole);
    router.replace(otherRole === "golfer" ? "/golfer/profile" : "/caddie/profile");
  };
  return <View style={styles.switchCard}>
    <Text style={styles.switchTitle}>Account role</Text>
    <Text style={styles.profileMeta}>{otherRoleHasBeenAdded ? `Your ${otherRole} identity is ready to use on this device.` : `Add a ${otherRole} identity only if you also ${otherRole === "caddie" ? "caddie" : "play"}.`}</Text>
    <Pressable accessibilityLabel={otherRoleHasBeenAdded ? `Switch to ${otherRole}` : `Become a ${otherRole}`} accessibilityRole="button" onPress={otherRoleHasBeenAdded ? switchToOtherRole : () => router.push({ pathname: "/sign-in", params: { mode: "register", role: otherRole } })} style={styles.switchButton}><Text style={styles.switchText}>{otherRoleHasBeenAdded ? `Switch to ${otherRole}` : `Become a ${otherRole}`}</Text></Pressable>
  </View>;
}

export function StatTile({ label, value }: { label: string; value: string }) {
  return <View style={styles.statCard}><Text style={styles.eyebrow}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>;
}

export function SummaryCard({ detail, eyebrow, name }: { detail: string; eyebrow: string; name: string }) {
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <View style={styles.summaryCard}><View style={styles.summaryAvatar}><Text style={styles.summaryAvatarText}>{initials}</Text></View><View style={styles.summaryCopy}><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.summaryName}>{name}</Text><Text style={styles.profileMeta}>{detail}</Text></View></View>;
}

export function HistoryList({ history, role, title }: { history: { date: string; id: string; otherParty: string; score: string }[]; role: ProfileRole; title: string }) {
  const homeCourse = courses.find((course) => course.id === (role === "golfer" ? golfer.homeCourseId : caddies[0]?.homeCourseId));
  const otherPartyLabel = role === "golfer" ? "Caddie" : "Golfer";
  return <View style={styles.historySection}><Text accessibilityRole="header" style={styles.historyTitle}>{title}</Text><View style={styles.historyCard}>{history.map((round, index) => <Pressable accessibilityLabel={`View ${title.toLowerCase()} with ${round.otherParty}`} accessibilityRole="button" key={round.id} onPress={role === "caddie" ? () => router.push({ pathname: "/caddie/matches/[bookingId]", params: { bookingId: round.id } }) : undefined} style={({ pressed }) => [styles.roundRow, index < history.length - 1 && styles.roundDivider, pressed && role === "caddie" && styles.rowPressed]}><View style={styles.roundCopy}><Text style={styles.roundCourse}>{homeCourse?.name ?? "Home course"}</Text><Text style={styles.roundMeta}>{round.date} · {otherPartyLabel}: {round.otherParty}</Text></View><View style={styles.score}><Text style={styles.eyebrow}>SCORE</Text><Text style={styles.scoreValue}>{round.score}</Text></View>{role === "caddie" ? <MaterialCommunityIcons color={colors.fairwayDark} name="chevron-right" size={20} /> : null}</Pressable>)}</View></View>;
}

function EditPortfolioModal({ initialPortfolio, onClose, onSave, visible }: { initialPortfolio: Portfolio; onClose: () => void; onSave: (portfolio: Portfolio) => void; visible: boolean }) {
  const [draft, setDraft] = useState(initialPortfolio);
  const [bioError, setBioError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraft(initialPortfolio);
      setBioError(null);
    }
  }, [initialPortfolio, visible]);

  const save = async () => {
    const bio = draft.bio.trim();
    if (!bio) {
      setBioError("Add a short bio so golfers know what to expect.");
      return;
    }
    setSaving(true);
    const nextPortfolio = { ...draft, bio };
    try {
      await AsyncStorage.setItem(portfolioStorageKey, JSON.stringify(nextPortfolio));
      onSave(nextPortfolio);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return <Modal animationType="slide" onRequestClose={onClose} presentationStyle="overFullScreen" transparent visible={visible}><Pressable accessibilityLabel="Dismiss edit portfolio" onPress={onClose} style={styles.modalBackdrop}><Pressable accessibilityViewIsModal onPress={(event) => event.stopPropagation()} style={styles.modalCard}><View style={styles.modalHeader}><Text accessibilityRole="header" style={styles.modalTitle}>Edit Portfolio</Text><Pressable accessibilityLabel="Close edit portfolio" accessibilityRole="button" onPress={onClose}><MaterialCommunityIcons color={colors.fairwayDark} name="close" size={24} /></Pressable></View><ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}><Field label="Bio / tagline"><TextInput accessibilityLabel="Bio / tagline" maxLength={150} multiline onChangeText={(bio) => { setDraft((value) => ({ ...value, bio })); setBioError(null); }} placeholder="Tell golfers how you caddie." placeholderTextColor="#6B766F" style={[styles.textArea, bioError && styles.inputError]} textAlignVertical="top" value={draft.bio} /><Text style={styles.characterCount}>{draft.bio.length}/150</Text>{bioError ? <Text style={styles.errorText}>{bioError}</Text> : null}</Field><Field label="Years caddying"><TextInput accessibilityLabel="Years caddying" inputMode="numeric" keyboardType="number-pad" onChangeText={(value) => setDraft((current) => ({ ...current, yearsExperience: Number(value.replace(/[^0-9]/g, "")) || 0 }))} style={styles.input} value={String(draft.yearsExperience)} /></Field><Field label="Home course"><View style={styles.courseList}>{courses.map((course) => <Pressable accessibilityRole="radio" accessibilityState={{ selected: draft.homeCourseId === course.id }} key={course.id} onPress={() => setDraft((current) => ({ ...current, homeCourseId: course.id }))} style={[styles.courseOption, draft.homeCourseId === course.id && styles.courseOptionSelected]}><Text style={[styles.courseOptionText, draft.homeCourseId === course.id && styles.courseOptionTextSelected]}>{course.name}</Text></Pressable>)}</View></Field><Field label="Specialties"><View style={styles.tags}>{specialtyOptions.map((specialty) => { const selected = draft.specialties.includes(specialty); return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} key={specialty} onPress={() => setDraft((current) => ({ ...current, specialties: selected ? current.specialties.filter((item) => item !== specialty) : [...current.specialties, specialty] }))} style={[styles.tag, selected && styles.tagSelected]}><Text style={[styles.tagText, selected && styles.tagTextSelected]}>{specialty}</Text></Pressable>; })}</View></Field></ScrollView><View style={styles.modalActions}><Pressable accessibilityLabel="Cancel portfolio changes" accessibilityRole="button" disabled={saving} onPress={onClose} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable accessibilityLabel="Save portfolio" accessibilityRole="button" accessibilityState={{ busy: saving }} disabled={saving} onPress={() => void save()} style={[styles.saveButton, saving && styles.saveButtonDisabled]}><Text style={styles.saveText}>{saving ? "Saving…" : "Save"}</Text></Pressable></View></Pressable></Pressable></Modal>;
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  avatar: { alignItems: "center", backgroundColor: colors.fairwayDark, borderCurve: "continuous", borderRadius: 17, height: 74, justifyContent: "center", width: 74 },
  avatarText: { color: colors.surface, fontSize: 28, fontWeight: "800" },
  cancelButton: { alignItems: "center", borderColor: colors.border, borderRadius: 10, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 44 },
  cancelText: { color: colors.fairwayDark, fontSize: 14, fontWeight: "800" },
  characterCount: { alignSelf: "flex-end", color: colors.textMuted, fontSize: 11 },
  content: { gap: 20, padding: 18, paddingBottom: 32 },
  courseList: { gap: 8 },
  courseOption: { borderColor: colors.border, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  courseOptionSelected: { backgroundColor: "#E2F0E6", borderColor: colors.primary },
  courseOptionText: { color: colors.text, fontSize: 13, fontWeight: "600" },
  courseOptionTextSelected: { color: colors.fairwayDark, fontWeight: "800" },
  editLink: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", gap: 4, marginTop: 2, minHeight: 26 },
  editLinkText: { color: colors.fairwayDark, fontSize: 12, fontWeight: "800" },
  errorText: { color: "#B42318", fontSize: 11, lineHeight: 15 },
  eyebrow: { color: "#60736A", fontSize: 10, fontWeight: "800", letterSpacing: 0.15 },
  field: { gap: 6 },
  fieldLabel: { color: colors.fairwayDark, fontSize: 12, fontWeight: "800" },
  form: { gap: 18, paddingBottom: 18 },
  frame: { gap: 20 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 44 },
  headerButton: { alignItems: "center", justifyContent: "center", minHeight: 44, minWidth: 44 },
  headerTitle: { color: colors.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  historyCard: { backgroundColor: colors.surface, borderColor: "#A9AAA2", borderCurve: "continuous", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  historySection: { gap: 12 },
  historyTitle: { color: colors.fairwayDark, fontSize: 20, fontWeight: "800" },
  input: { borderColor: colors.border, borderCurve: "continuous", borderRadius: 10, borderWidth: 1, color: colors.text, fontSize: 15, minHeight: 44, paddingHorizontal: 12 },
  inputError: { borderColor: "#B42318" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  modalBackdrop: { backgroundColor: "rgba(0, 0, 0, 0.42)", flex: 1, justifyContent: "flex-end", padding: 14 },
  modalCard: { backgroundColor: colors.surface, borderCurve: "continuous", borderRadius: 20, gap: 16, maxHeight: "88%", padding: 18 },
  modalHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  modalTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
  name: { color: colors.fairwayDark, fontSize: 20, fontWeight: "800", letterSpacing: -0.35, lineHeight: 23 },
  profileBio: { color: "#60736A", fontSize: 11, lineHeight: 15 },
  profileCard: { alignItems: "center", backgroundColor: colors.surface, borderColor: "#A9AAA2", borderCurve: "continuous", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 13, minHeight: 120, padding: 16 },
  profileCopy: { flex: 1, gap: 2 },
  profileMeta: { color: "#60736A", fontSize: 11, lineHeight: 15 },
  roundCopy: { flex: 1, gap: 7 },
  roundCourse: { color: colors.fairwayDark, fontSize: 13, fontWeight: "800" },
  roundDivider: { borderBottomColor: "#A9AAA2", borderBottomWidth: StyleSheet.hairlineWidth },
  roundMeta: { color: "#52665C", fontSize: 11 },
  roundRow: { alignItems: "center", flexDirection: "row", gap: spacing.md, minHeight: 79, paddingHorizontal: 14, paddingVertical: 15 },
  rowPressed: { backgroundColor: "#F2F5F0" },
  safeArea: { backgroundColor: "#FAF9F6", flex: 1 },
  saveButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, flex: 1, justifyContent: "center", minHeight: 44 },
  saveButtonDisabled: { opacity: 0.65 },
  saveText: { color: colors.onPrimary, fontSize: 14, fontWeight: "800" },
  score: { alignItems: "flex-end", gap: 2 },
  scoreValue: { color: colors.fairwayDark, fontFamily: "JetBrainsMono", fontSize: 20, fontWeight: "800" },
  statCard: { backgroundColor: colors.surface, borderColor: "#A9AAA2", borderCurve: "continuous", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flex: 1, gap: 3, minHeight: 70, paddingHorizontal: 16, paddingVertical: 14 },
  statRow: { flexDirection: "row", gap: 11 },
  statValue: { color: colors.fairwayDark, fontFamily: "JetBrainsMono", fontSize: 17, fontWeight: "800" },
  summaryAvatar: { alignItems: "center", backgroundColor: "#E2F0E6", borderRadius: 18, height: 44, justifyContent: "center", width: 44 },
  summaryAvatarText: { color: colors.fairwayDark, fontSize: 14, fontWeight: "800" },
  summaryCard: { alignItems: "center", backgroundColor: colors.surface, borderColor: "#A9AAA2", borderCurve: "continuous", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingVertical: 15 },
  summaryCopy: { flex: 1, gap: 2 },
  summaryName: { color: colors.fairwayDark, fontSize: 17, fontWeight: "800" },
  switchButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, justifyContent: "center", minHeight: 44, paddingHorizontal: 14 },
  switchCard: { backgroundColor: colors.surface, borderColor: "#A9AAA2", borderCurve: "continuous", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, gap: 8, padding: 16 },
  switchText: { color: colors.onPrimary, fontSize: 14, fontWeight: "800" },
  switchTitle: { color: colors.fairwayDark, fontSize: 16, fontWeight: "800" },
  tag: { backgroundColor: "#EEF1EC", borderColor: colors.border, borderRadius: 999, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7 },
  tagSelected: { backgroundColor: "#E2F0E6", borderColor: colors.primary },
  tagText: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  tagTextSelected: { color: colors.fairwayDark },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  textArea: { borderColor: colors.border, borderCurve: "continuous", borderRadius: 10, borderWidth: 1, color: colors.text, fontSize: 15, minHeight: 100, padding: 12 }
});
