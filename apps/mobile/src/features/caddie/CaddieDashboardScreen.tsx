import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { availabilitySlots, bookings, caddies, courses } from "../../data/mock";
import { Screen } from "../../ui/Screen";
import { Button } from "../../ui/primitives";
import { useAppSession } from "../session/AppSession";

type OfferState = "pending" | "accepted" | "declined" | "expired";

export function CaddieDashboardScreen() {
  const { caddieVerification } = useAppSession();
  const [offerState, setOfferState] = useState<OfferState>("pending");
  const caddie = caddies[0]!;
  const course = courses.find((item) => item.id === caddie.homeCourseId)!;
  const slots = availabilitySlots.filter((slot) => slot.caddieId === caddie.id);
  const roster = bookings.filter((booking) => booking.caddieId === caddie.id);
  const pending = caddieVerification !== "verified";

  return <Screen title="Caddie dashboard" subtitle={pending ? "Your account is pending Manila Golf and Country Club’s confirmation. You cannot receive player offers yet." : "Manage incoming player offers and your personal schedule."} action={<Pressable accessibilityLabel="Open caddie profile" accessibilityRole="button" onPress={() => router.push("/profile")}><Text style={styles.profileLink}>Caddie Profile</Text></Pressable>}>
    {pending ? <View style={styles.pending}><Text style={styles.pendingTitle}>Verification pending</Text><Text style={styles.pendingText}>The club will either verify your registry details or ask you to correct and resubmit them. There is no automatic approval.</Text></View> : <OfferCard state={offerState} onAccept={() => setOfferState("accepted")} onDecline={() => setOfferState("declined")} />}
    <View style={styles.section}><Text style={styles.sectionTitle}>Upcoming bookings</Text>{roster.map((booking) => <View key={booking.id} style={styles.row}><Text style={styles.rowTitle}>{course.name}</Text><Text style={styles.rowMeta}>{booking.teeTime} · {booking.status}</Text></View>)}</View>
    <View style={styles.section}><Text style={styles.sectionTitle}>Past bookings</Text><View style={styles.row}><Text style={styles.rowTitle}>No completed bookings yet</Text><Text style={styles.rowMeta}>Your completed rounds will appear here.</Text></View></View>
    <View style={styles.section}><Text style={styles.sectionTitle}>Availability</Text>{slots.map((slot) => <View key={slot.id} style={styles.row}><Text style={styles.rowTitle}>{slot.startsAt}</Text><Text style={styles.rowMeta}>{slot.status}</Text></View>)}<Button accessibilityLabel="Edit availability" onPress={() => router.push("/profile")}>Edit availability</Button></View>
  </Screen>;
}

function OfferCard({ onAccept, onDecline, state }: { onAccept: () => void; onDecline: () => void; state: OfferState }) {
  const label = state === "pending" ? "1h 43m remaining" : state === "accepted" ? "Accepted" : state === "declined" ? "Declined" : "Expired / auto-declined";
  return <View style={styles.offer}><Text style={styles.sectionTitle}>Player offers</Text><Text style={styles.rowTitle}>Mia Santos · Manila Golf and Country Club</Text><Text style={styles.rowMeta}>Tee time: Saturday, 7:10 AM</Text><Text style={[styles.countdown, state !== "pending" && styles.resolved]}>{label}</Text>{state === "pending" ? <View style={styles.offerActions}><Button accessibilityLabel="Accept player offer" onPress={onAccept}>Accept</Button><Button accessibilityLabel="Decline player offer" onPress={onDecline} variant="secondary">Decline</Button></View> : null}</View>;
}

const styles = StyleSheet.create({ countdown: { color: "#8A531D", fontSize: typography.small, fontWeight: "800" }, offer: { backgroundColor: "#FFF7E0", borderColor: colors.warning, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm, padding: spacing.lg }, offerActions: { flexDirection: "row", gap: spacing.sm }, pending: { backgroundColor: "#E7EEE9", borderColor: colors.primary, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm, padding: spacing.lg }, pendingText: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19 }, pendingTitle: { color: colors.fairwayDark, fontSize: typography.title, fontWeight: "800" }, profileLink: { color: colors.primary, fontSize: typography.small, fontWeight: "800" }, resolved: { color: colors.textMuted }, row: { backgroundColor: colors.surface, borderRadius: radius.md, gap: spacing.xs, padding: spacing.md }, rowMeta: { color: colors.textMuted, fontSize: typography.small, textTransform: "capitalize" }, rowTitle: { color: colors.text, fontSize: typography.body, fontWeight: "800" }, section: { gap: spacing.sm }, sectionTitle: { color: colors.text, fontSize: typography.title, fontWeight: "800" } });
