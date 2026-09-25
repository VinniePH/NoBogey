import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { Caddie, GolfCourse } from "@nobogey/contracts";
import { Stack } from "expo-router";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatTeeTime } from "@nobogey/utils";
import homeCourseHero from "../../../../assets/images/home-course-hero.jpg";
import { backToPreviousPage } from "../../../ui/navigation";

export const flowColors = {
  forest: "#173F35",
  cream: "#F7F5EF",
  sage: "#E9F1E9",
  ink: "#151515",
  muted: "#62645F",
  border: "#DEDCD4",
  gold: "#B89452"
} as const;

type Step = 1 | 2;
type FlowScreenProps = PropsWithChildren<{
  step: Step;
  title: string;
  description: string;
  actionLabel: string;
  actionDisabled?: boolean;
  onAction: () => void;
  onBack?: () => void;
}>;

export function FindGameScreen({ step, title, description, actionLabel, actionDisabled = false, onAction, onBack, children }: FlowScreenProps) {
  const { width } = useWindowDimensions();
  const gutter = Math.max(16, Math.min(24, width * 0.05));
  const titleSize = Math.max(27, Math.min(34, width * 0.08));
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
    <Stack.Screen options={{ headerShown: false, title: "Find a Game" }} />
    <ScrollView contentContainerStyle={styles.scrollContent} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <ImageBackground imageStyle={styles.heroImage} source={homeCourseHero} resizeMode="cover" style={styles.hero}>
          <View style={[styles.heroOverlay, { paddingHorizontal: gutter }]}>
            <View style={styles.heroTop}><Pressable accessibilityLabel="Go back" accessibilityRole="button" hitSlop={8} onPress={onBack ?? (() => backToPreviousPage("/golfer/home"))} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><MaterialCommunityIcons color={flowColors.forest} name="arrow-left" size={21} /></Pressable><Text style={styles.brand}>NoBogey</Text></View>
            <Text accessibilityRole="header" style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.12 }]}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        </ImageBackground>
        <View style={{ paddingHorizontal: gutter }}><BookingProgress step={step} /></View>
        <View style={[styles.main, { paddingHorizontal: gutter }]}>{children}</View>
      </View>
    </ScrollView>
    <View style={styles.sticky}><View style={styles.stickyInner}><Pressable accessibilityRole="button" accessibilityState={{ disabled: actionDisabled }} disabled={actionDisabled} onPress={onAction} style={({ pressed }) => [styles.action, actionDisabled && styles.actionDisabled, pressed && !actionDisabled && styles.actionPressed]}><Text style={styles.actionText}>{actionLabel}</Text><MaterialCommunityIcons color="#FFFFFF" name="arrow-right" size={19} /></Pressable></View></View>
  </SafeAreaView>;
}

export function BookingProgress({ step }: { step: Step }) {
  const labels = ["Game details", "Review"] as const;
  const phase = step;
  return <View accessibilityLabel={`Booking step ${phase} of 2: ${labels[phase - 1]}`} style={styles.progress}>
    {labels.map((label, index) => {
      const number = index + 1;
      const complete = number < phase;
      const current = number === phase;
      return <View key={label} style={styles.progressItem}><View style={styles.progressTop}>{index > 0 ? <View style={[styles.connector, number <= phase && styles.connectorActive]} /> : <View style={styles.connectorPlaceholder} />}<View style={[styles.progressCircle, (complete || current) && styles.progressCircleActive]}>{complete ? <MaterialCommunityIcons color="#FFFFFF" name="check" size={16} /> : <Text style={[styles.progressNumber, current && styles.progressNumberActive]}>{number}</Text>}</View>{index < labels.length - 1 ? <View style={[styles.connector, complete && styles.connectorActive]} /> : <View style={styles.connectorPlaceholder} />}</View><Text style={[styles.progressLabel, current && styles.progressLabelActive]}>{number}. {label}</Text></View>;
    })}
  </View>;
}

export function SectionHeading({ title, description }: { title: string; description?: string }) {
  return <View style={styles.sectionHeading}><Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>{description ? <Text style={styles.sectionDescription}>{description}</Text> : null}</View>;
}

function CoursePhoto({ course, size }: { course: GolfCourse; size: number }) {
  const [failed, setFailed] = useState(false);
  return <View accessibilityLabel={course.imageUrl && !failed ? `${course.name} course photo` : `${course.name} course preview`} accessibilityRole="image" style={[styles.coursePhoto, { width: size, height: size }]}>{course.imageUrl && !failed ? <Image onError={() => setFailed(true)} resizeMode="cover" source={{ uri: course.imageUrl }} style={styles.fill} /> : <MaterialCommunityIcons color={flowColors.forest} name="golf" size={28} />}</View>;
}

export function CourseOptionCard({ course, selected, onPress }: { course: GolfCourse; selected: boolean; onPress: () => void }) {
  const { width } = useWindowDimensions();
  const photoSize = width < 360 ? 76 : 92;
  const location = [course.city, course.province].filter(Boolean).join(", ");
  return <Pressable accessibilityLabel={`Select ${course.name}`} accessibilityRole="radio" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}><CoursePhoto course={course} size={photoSize} /><View style={styles.optionCopy}><Text style={styles.optionName}>{course.name}</Text>{location ? <Text style={styles.meta}>{location}</Text> : null}<Text style={styles.meta}>PAR {course.par}{course.caddieCount > 0 ? ` · ${course.caddieCount} ${course.caddieCount === 1 ? "caddie" : "caddies"}` : ""}</Text></View><SelectionMark selected={selected} /></Pressable>;
}

export function SelectedCourseSummary({ course, flat = false }: { course: GolfCourse; flat?: boolean }) {
  const location = [course.city, course.province].filter(Boolean).join(", ");
  return <View style={[styles.summaryStrip, flat && styles.summaryStripFlat]}><CoursePhoto course={course} size={60} /><View style={styles.optionCopy}>{flat ? null : <Text style={styles.summaryEyebrow}>SELECTED COURSE</Text>}<Text style={styles.summaryName}>{course.name}</Text><Text style={styles.meta}>{location ? `${location} · ` : ""}PAR {course.par}</Text></View></View>;
}

export function BookingSummaryStrip({ course, time }: { course: GolfCourse; time: string }) {
  return <View style={styles.summaryStrip}><MaterialCommunityIcons color={flowColors.forest} name="golf" size={23} /><View style={styles.optionCopy}><Text style={styles.summaryName}>{course.name}</Text><Text style={styles.meta}>{formatTeeTime(time)}</Text></View></View>;
}

export function CaddiePortrait({ caddie }: { caddie: Caddie }) {
  const [failed, setFailed] = useState(false);
  return <View accessibilityLabel={caddie.avatarUrl && !failed ? `${caddie.displayName} profile photo` : `${caddie.displayName} initials avatar`} accessibilityRole="image" style={styles.caddiePortrait}>{caddie.avatarUrl && !failed ? <Image onError={() => setFailed(true)} resizeMode="cover" source={{ uri: caddie.avatarUrl }} style={styles.fill} /> : <Text style={styles.initials}>{caddie.displayName.trim().slice(0, 1).toUpperCase()}</Text>}</View>;
}

export function SelectedCaddieSummary({ caddie, flat = false }: { caddie: Caddie; flat?: boolean }) {
  return <View style={[styles.summaryStrip, flat && styles.summaryStripFlat]}><CaddiePortrait caddie={caddie} /><View style={styles.optionCopy}><Text style={styles.summaryName}>{caddie.displayName}</Text>{caddie.specialties[0] ? <Text style={styles.meta}>{caddie.specialties[0]}</Text> : null}<CaddieReviewText caddie={caddie} /></View></View>;
}

export function CaddieOptionCard({ caddie, selected, onPress }: { caddie: Caddie; selected: boolean; onPress: () => void }) {
  const detail = [caddie.yearsExperience > 0 ? `${caddie.yearsExperience} years pro` : "", caddie.languages.join(", ")].filter(Boolean).join(" · ");
  return <Pressable accessibilityLabel={`Select ${caddie.displayName}`} accessibilityRole="radio" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}><CaddiePortrait caddie={caddie} /><View style={styles.optionCopy}><Text style={styles.optionName}>{caddie.displayName}</Text>{detail ? <Text style={styles.meta}>{detail}</Text> : null}{caddie.specialties[0] ? <Text style={styles.meta}>{caddie.specialties[0]}</Text> : null}<CaddieReviewText caddie={caddie} /></View><SelectionMark selected={selected} /></Pressable>;
}

function CaddieReviewText({ caddie }: { caddie: Caddie }) {
  return caddie.reviewCount > 0 ? <Text style={styles.rating}><MaterialCommunityIcons color={flowColors.gold} name="star" size={14} /> {caddie.ratingAverage.toFixed(1)} · {caddie.reviewCount} {caddie.reviewCount === 1 ? "review" : "reviews"}</Text> : <Text style={styles.meta}>No reviews yet</Text>;
}

export function SelectionMark({ selected }: { selected: boolean }) {
  return <View style={[styles.selectionMark, selected && styles.selectionMarkSelected]}>{selected ? <MaterialCommunityIcons color="#FFFFFF" name="check" size={16} /> : null}</View>;
}

export function Notice({ children }: PropsWithChildren) {
  return <View style={styles.notice}><MaterialCommunityIcons color={flowColors.forest} name="information-outline" size={19} /><Text style={styles.noticeText}>{children}</Text></View>;
}

export function ReviewSection({ title, onEdit, children }: PropsWithChildren<{ title: string; onEdit: () => void }>) {
  return <View style={styles.reviewSection}><View style={styles.reviewHeader}><Text style={styles.reviewTitle}>{title}</Text><Pressable accessibilityLabel={`Edit ${title.toLowerCase()}`} accessibilityRole="button" hitSlop={8} onPress={onEdit} style={styles.editButton}><Text style={styles.editText}>Edit</Text></Pressable></View>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: flowColors.cream, flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  container: { alignSelf: "center", gap: 20, maxWidth: 680, width: "100%" },
  hero: { backgroundColor: flowColors.sage, overflow: "hidden" },
  heroImage: { width: "100%" },
  heroOverlay: { backgroundColor: "rgba(247,245,239,0.84)", gap: 8, paddingBottom: 25, paddingTop: 14 },
  heroTop: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 8 },
  back: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 8, height: 44, justifyContent: "center", width: 44 },
  brand: { color: flowColors.forest, fontSize: 23, fontStyle: "italic", fontWeight: "900" },
  title: { color: flowColors.ink, fontWeight: "800", letterSpacing: -0.8 },
  description: { color: "#454D47", fontSize: 15, lineHeight: 21, maxWidth: 490 },
  progress: { flexDirection: "row", paddingVertical: 3 },
  progressItem: { alignItems: "center", flex: 1, minWidth: 0 },
  progressTop: { alignItems: "center", flexDirection: "row", width: "100%" },
  progressCircle: { alignItems: "center", backgroundColor: flowColors.cream, borderColor: "#A8ADA6", borderRadius: 99, borderWidth: 1, height: 30, justifyContent: "center", width: 30 },
  progressCircleActive: { backgroundColor: flowColors.forest, borderColor: flowColors.forest },
  progressNumber: { color: flowColors.muted, fontSize: 13, fontWeight: "800" },
  progressNumberActive: { color: "#FFFFFF" },
  progressLabel: { color: flowColors.muted, fontSize: 12, fontWeight: "600", marginTop: 6, textAlign: "center" },
  progressLabelActive: { color: flowColors.forest, fontWeight: "800" },
  connector: { backgroundColor: flowColors.border, flex: 1, height: 1 },
  connectorActive: { backgroundColor: flowColors.forest },
  connectorPlaceholder: { flex: 1 },
  main: { gap: 18, paddingBottom: 10 },
  sectionHeading: { gap: 5 },
  sectionTitle: { color: flowColors.ink, fontSize: 21, fontWeight: "800", letterSpacing: -0.4 },
  sectionDescription: { color: flowColors.muted, fontSize: 14, lineHeight: 20 },
  option: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: flowColors.border, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, minHeight: 112, padding: 10 },
  optionSelected: { backgroundColor: "#F1F7F1", borderColor: flowColors.forest, borderWidth: 2 },
  optionCopy: { flex: 1, gap: 3, minWidth: 0 },
  optionName: { color: flowColors.ink, fontSize: 16, fontWeight: "800", lineHeight: 21 },
  meta: { color: flowColors.muted, fontSize: 13, lineHeight: 18 },
  rating: { color: flowColors.forest, fontSize: 13, fontWeight: "700", marginTop: 2 },
  coursePhoto: { alignItems: "center", backgroundColor: flowColors.sage, borderRadius: 11, justifyContent: "center", overflow: "hidden" },
  fill: { height: "100%", width: "100%" },
  selectionMark: { alignItems: "center", borderColor: flowColors.forest, borderRadius: 99, borderWidth: 1.5, height: 25, justifyContent: "center", width: 25 },
  selectionMarkSelected: { backgroundColor: flowColors.forest },
  summaryStrip: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: flowColors.border, borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 12, padding: 11 },
  summaryStripFlat: { borderWidth: 0, padding: 0 },
  summaryEyebrow: { color: flowColors.forest, fontSize: 10, fontWeight: "800", letterSpacing: 0.9 },
  summaryName: { color: flowColors.ink, fontSize: 16, fontWeight: "800", lineHeight: 21 },
  caddiePortrait: { alignItems: "center", backgroundColor: flowColors.sage, borderRadius: 99, height: 58, justifyContent: "center", overflow: "hidden", width: 58 },
  initials: { color: flowColors.forest, fontSize: 27, fontWeight: "800" },
  notice: { alignItems: "flex-start", backgroundColor: flowColors.sage, borderRadius: 10, flexDirection: "row", gap: 9, padding: 12 },
  noticeText: { color: flowColors.forest, flex: 1, fontSize: 13, lineHeight: 19 },
  reviewSection: { backgroundColor: "#FFFFFF", borderColor: flowColors.border, borderRadius: 16, borderWidth: 1, gap: 10, paddingHorizontal: 15, paddingBottom: 15, paddingTop: 3 },
  reviewHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  reviewTitle: { color: flowColors.forest, fontSize: 13, fontWeight: "800", letterSpacing: 0.4, textTransform: "uppercase" },
  editButton: { justifyContent: "center", minHeight: 44, paddingHorizontal: 5 },
  editText: { color: flowColors.forest, fontSize: 14, fontWeight: "800" },
  sticky: { backgroundColor: "rgba(247,245,239,0.98)", borderTopColor: flowColors.border, borderTopWidth: 1, boxShadow: "0 -3px 12px rgba(23,63,53,0.06)", paddingHorizontal: 16, paddingVertical: 12 },
  stickyInner: { alignSelf: "center", maxWidth: 648, width: "100%" },
  action: { alignItems: "center", backgroundColor: flowColors.forest, borderRadius: 11, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 50, paddingHorizontal: 16 },
  actionDisabled: { backgroundColor: "#8DA297" },
  actionPressed: { backgroundColor: "#10332B" },
  actionText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  pressed: { opacity: 0.75 }
});
