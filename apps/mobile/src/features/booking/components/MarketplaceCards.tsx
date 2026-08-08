import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Caddie, GolfCourse } from "@nobogey/contracts";
import { colors, spacing, typography } from "@nobogey/ui";

export function CourseCard({ course, selected, onPress, compact = false }: { course: GolfCourse; selected?: boolean; onPress?: () => void; compact?: boolean }) {
  const body = (
    <View style={[styles.courseCard, compact && styles.courseCardCompact, selected && styles.selectedCard]}>
      <CoursePreview course={course} compact={compact} />
      <View style={styles.courseCopy}>
        <View style={styles.courseTitleRow}>
          <Text numberOfLines={2} style={styles.courseName}>{course.name}</Text>
          <Text style={styles.coursePar}>PAR {course.par}</Text>
        </View>
        <Text style={styles.courseLocation}>{course.city}, {course.province}</Text>
        <Text style={styles.courseMeta}>{course.yardage.toLocaleString()} yards</Text>
        <Text style={styles.available}>{course.caddieCount} caddies available today</Text>
      </View>
    </View>
  );
  return onPress ? <Pressable accessibilityRole="radio" accessibilityState={{ selected }} onPress={onPress}>{body}</Pressable> : body;
}

function CoursePreview({ course, compact }: { course: GolfCourse; compact: boolean }) {
  return (
    <View accessibilityLabel={`${course.name} course`} accessibilityRole="image" style={[styles.coursePreview, compact ? styles.coursePreviewCompact : styles.coursePreviewStandard]}>
      <MaterialCommunityIcons color={colors.fairwayDark} name="golf" size={compact ? 34 : 42} />
    </View>
  );
}

export function CaddieCard({ caddie, compact = false, onPress, selected }: { caddie: Caddie; compact?: boolean; onPress?: () => void; selected?: boolean }) {
  const isSelectable = selected !== undefined;
  const body = (
    <View style={[styles.caddieCard, compact && styles.caddieCardCompact, selected && styles.selectedCard]}>
      <CaddiePortrait compact={compact} name={caddie.displayName} />
      <View style={styles.caddieTitleRow}>
        <View><Text style={[styles.caddieName, compact && styles.caddieNameCompact]}>{caddie.displayName}</Text><Text style={[styles.caddieDetail, compact && styles.caddieDetailCompact]}>{caddie.yearsExperience} Years Pro · {caddie.languages.join(", ")}</Text></View>
        <View style={styles.caddieMeta}><View style={styles.rating}><Text style={[styles.ratingNumber, compact && styles.ratingNumberCompact]}>{caddie.ratingAverage.toFixed(1)}</Text><Text style={[styles.stars, compact && styles.starsCompact]}>★★★★★</Text></View></View>
      </View>
      <View style={styles.skillRow}>
        <Skill compact={compact} label="SPECIALTY" value={caddie.specialties[0] ?? "Not provided"} />
        <Skill compact={compact} label="REVIEWS" value={String(caddie.reviewCount)} />
      </View>
      <View style={styles.caddieFooter}><Text style={[styles.rounds, compact && styles.roundsCompact]}>{caddie.completedRounds} rounds completed</Text><Text style={[styles.price, compact && styles.priceCompact]}>{Math.round(caddie.rate.amountInCentavos / 100).toLocaleString("en-PH")}</Text></View>
      <View style={[styles.bookLabel, compact && styles.bookLabelCompact, selected && styles.bookLabelSelected]}><Text style={[styles.bookLabelText, compact && styles.bookLabelTextCompact]}>{selected ? "Selected" : isSelectable ? `Select ${caddie.displayName.split(" ")[0]}` : `Book ${caddie.displayName.split(" ")[0]}`}</Text></View>
    </View>
  );
  return onPress ? <Pressable accessibilityRole={isSelectable ? "radio" : "button"} accessibilityLabel={isSelectable ? `Select ${caddie.displayName}` : `View ${caddie.displayName}'s profile`} accessibilityState={isSelectable ? { selected } : undefined} onPress={onPress} style={compact ? undefined : styles.caddiePressable}>{body}</Pressable> : body;
}

function Skill({ compact, label, value }: { compact: boolean; label: string; value: string }) { return <View style={[styles.skill, compact && styles.skillCompact]}><Text style={[styles.skillLabel, compact && styles.skillLabelCompact]}>{label}</Text><Text numberOfLines={1} style={[styles.skillValue, compact && styles.skillValueCompact]}>{value}</Text></View>; }

function CaddiePortrait({ compact, name }: { compact: boolean; name: string }) {
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <View accessibilityLabel={`${name} initials avatar`} accessibilityRole="image" style={[styles.caddieAvatar, compact && styles.caddieAvatarCompact]}><Text style={styles.caddieAvatarInitials}>{initials}</Text><Text style={styles.caddieAvatarLabel}>Caddie</Text></View>;
}

const styles = StyleSheet.create({
  available: { color: colors.fairway, fontSize: typography.small, fontWeight: "700" },
  bookLabel: { alignItems: "center", backgroundColor: "#3F7655", borderCurve: "continuous", borderRadius: 16, justifyContent: "center", minHeight: 62, marginTop: 8 },
  bookLabelCompact: { borderRadius: 10, minHeight: 40, marginTop: 4 },
  bookLabelSelected: { backgroundColor: colors.fairwayDark },
  bookLabelText: { color: colors.surface, fontSize: 20, fontWeight: "800" },
  bookLabelTextCompact: { fontSize: 14 },
  caddieAvatar: { alignItems: "center", backgroundColor: "#E7EEE9", borderCurve: "continuous", borderRadius: 16, gap: spacing.xs, height: 370, justifyContent: "center", width: "100%" },
  caddieAvatarCompact: { height: 210 },
  caddieAvatarInitials: { color: colors.fairwayDark, fontSize: 40, fontWeight: "800", letterSpacing: -1 },
  caddieAvatarLabel: { color: colors.muted, fontSize: typography.small, fontWeight: "700" },
  caddieCard: { backgroundColor: colors.surface, borderColor: "#6D6E67", borderCurve: "continuous", borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, boxShadow: "0 1px 2px rgba(23, 32, 27, 0.04)", gap: 24, overflow: "hidden", padding: 28, width: "100%" },
  caddieCardCompact: { gap: 15, padding: 18, width: 300 },
  caddieDetail: { color: "#61736A", fontSize: 18, lineHeight: 24 },
  caddieDetailCompact: { fontSize: 12, lineHeight: 16 },
  caddieFooter: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  caddieName: { color: "#060806", fontSize: 31, fontWeight: "800", letterSpacing: -0.8, lineHeight: 36 },
  caddieNameCompact: { fontSize: 20, letterSpacing: -0.45, lineHeight: 24 },
  caddieMeta: { alignItems: "flex-end" },
  caddiePressable: { maxWidth: 520, width: "100%" },
  caddieTitleRow: { alignItems: "flex-start", flexDirection: "row", gap: spacing.sm, justifyContent: "space-between" },
  courseCard: { backgroundColor: colors.surface, borderColor: "#6D6E67", borderCurve: "continuous", borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, boxShadow: "0 1px 2px rgba(23, 32, 27, 0.04)", overflow: "hidden" },
  courseCardCompact: { width: 310 },
  courseCopy: { gap: 14, paddingHorizontal: 20, paddingVertical: 24 },
  coursePreview: { alignItems: "center", backgroundColor: "#E7EEE9", justifyContent: "center" },
  coursePreviewCompact: { height: 176, width: "100%" },
  coursePreviewStandard: { height: 210, width: "100%" },
  courseLocation: { color: "#61736A", fontSize: 20, lineHeight: 26 },
  courseMeta: { color: "#61736A", fontSize: typography.small, letterSpacing: 0.4 },
  courseName: { color: "#123427", flex: 1, fontSize: 22, fontWeight: "800", letterSpacing: -0.45, lineHeight: 28 },
  coursePar: { color: "#61736A", fontFamily: "JetBrainsMono", fontSize: 14, letterSpacing: 0.5, paddingTop: 3 },
  courseTitleRow: { alignItems: "flex-start", flexDirection: "row", gap: spacing.sm },
  price: { color: "#17442F", fontFamily: "JetBrainsMono", fontSize: 20, fontWeight: "800" },
  priceCompact: { fontSize: 13 },
  radio: { alignItems: "center", borderColor: "#8F8F88", borderRadius: 999, borderWidth: 1, height: 28, justifyContent: "center", width: 28 },
  radioDot: { backgroundColor: colors.fairwayDark, borderRadius: 999, height: 14, width: 14 },
  radioSelected: { borderColor: colors.fairwayDark },
  rating: { alignItems: "flex-end" },
  ratingNumber: { color: "#17442F", fontFamily: "JetBrainsMono", fontSize: 20, fontWeight: "800" },
  ratingNumberCompact: { fontSize: 13 },
  rounds: { color: "#61736A", fontSize: 18, lineHeight: 24 },
  roundsCompact: { fontSize: 12, lineHeight: 16 },
  selectedCard: { borderColor: colors.fairwayDark, borderWidth: 2 },
  skill: { backgroundColor: "#E7E4DD", borderCurve: "continuous", borderRadius: 14, flex: 1, gap: 4, padding: 14 },
  skillCompact: { borderRadius: 9, gap: 2, padding: 9 },
  skillLabel: { color: "#61736A", fontSize: 12, fontWeight: "800" },
  skillLabelCompact: { fontSize: 8 },
  skillRow: { flexDirection: "row", gap: 16 },
  skillValue: { color: "#060806", fontSize: 16, fontWeight: "700" },
  skillValueCompact: { fontSize: 10 },
  stars: { color: "#17442F", fontSize: 19, letterSpacing: -1 },
  starsCompact: { fontSize: 12 }
});
