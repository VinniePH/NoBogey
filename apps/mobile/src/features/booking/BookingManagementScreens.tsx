import type { Booking, Caddie, GolfCourse } from "@nobogey/contracts";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { formatMoney, formatTeeTime } from "@nobogey/utils";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { EmptyState } from "../../ui/EmptyState";
import { backToPreviousPage } from "../../ui/navigation";
import { Button } from "../../ui/primitives";
import { useMobileData } from "../data/useMobileData";
import { MobileBottomNavigation } from "../../ui/MobileBottomNavigation";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { cancelBooking } from '../../../backend/bookings/bookings.service';
import { CaddieContactCard } from "../contact/CaddieContactCard";
import { useNotificationAlerts } from "../notifications/NotificationAlertProvider";
import { getSupabaseClient } from "../../../backend/client";
import { flowColors } from "./components/FindGameUI";

export function MyBookingsScreen() {
  const { bookings, caddies, courses } = useMobileData();
  const { hasUnreadAlert, isAssignmentAccepted, markBookingOpened } = useNotificationAlerts();
  const upcomingBookings = bookings.filter((booking) => booking.status === "requested" || booking.status === "confirmed");
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <ResponsiveContent style={styles.frame}>
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.title}>My bookings</Text>
          <Text style={styles.subtitle}>{upcomingBookings.length ? `${upcomingBookings.length} upcoming ${upcomingBookings.length === 1 ? "round" : "rounds"}` : "Your upcoming rounds will appear here."}</Text>
        </View>
        {upcomingBookings.length
          ? upcomingBookings.map((booking) => <BookingCard booking={booking} caddie={caddies.find((item) => item.id === booking.caddieId)} course={courses.find((item) => item.id === booking.courseId)} isAccepted={isAssignmentAccepted(booking.id)} isUnread={hasUnreadAlert("golfer", booking.id, "booking_assignment_accepted")} key={booking.id} onOpen={() => markBookingOpened(booking.id, "golfer")} />)
          : <EmptyState description="Confirmed and requested rounds will appear after the booking service is connected." icon="calendar-blank-outline" minHeight={390} style={styles.emptyBookings} title="No upcoming bookings" />}
        </ResponsiveContent>
      </ScrollView>
      <MobileBottomNavigation active="bookings" />
    </SafeAreaView>
  );
}
export function BookingDetailsScreen() {
  const { bookings, caddies, courses, refresh } = useMobileData();
  const [actionError, setActionError] = useState<string>();
  const { isAssignmentAccepted, markBookingOpened } = useNotificationAlerts();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const booking = bookings.find((item) => item.id === bookingId);
  const caddie = caddies.find((item) => item.id === booking?.caddieId);
  const course = courses.find((item) => item.id === booking?.courseId);

  useEffect(() => {
    if (bookingId) markBookingOpened(bookingId, "golfer");
  }, [bookingId, markBookingOpened]);

  if (!booking || !caddie || !course) {
    return <UnavailableBooking title="Booking unavailable" />;
  }
  const assignmentAccepted = isAssignmentAccepted(booking.id);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.detailHero}><View style={styles.detailIcon}><MaterialCommunityIcons color={flowColors.forest} name="golf" size={25} /></View><View style={styles.detailHeroCopy}><Text accessibilityRole="header" style={styles.title}>{course.name}</Text><Text style={styles.subtitle}>{formatTeeTime(booking.teeTime)}</Text></View><StatusChip accepted={assignmentAccepted} status={booking.status} /></View>
        <View style={styles.detailCard}>
          <Detail label="Booking reference" value={booking.id} />
          <Detail label="Group size" value={`${booking.partySize} golfers`} />
        </View>
        <View style={styles.detailCard}><Text style={styles.sectionLabel}>Preferred caddie</Text><View style={styles.caddieRow}><View style={styles.caddieInitial}><Text style={styles.caddieInitialText}>{caddie.displayName.trim().slice(0, 1).toUpperCase()}</Text></View><View style={styles.caddieCopy}><Text style={styles.caddieName}>{caddie.displayName}</Text><Text style={styles.caddieMeta}>{assignmentAccepted ? "Assignment accepted" : "Awaiting response"}</Text></View><Text style={styles.rate}>{formatMoney(booking.quotedRate.amountInCentavos)}</Text></View></View>
        {booking.status === 'requested' || booking.status === 'confirmed' ? <Button onPress={() => void cancelBooking(booking.id).then(refresh).catch((error) => setActionError(error instanceof Error ? error.message : 'Unable to cancel booking.'))}>Cancel booking</Button> : null}
        {actionError ? <Text accessibilityLiveRegion="polite" style={styles.subtitle}>{actionError}</Text> : null}
        <CaddieContactCard isAccepted={assignmentAccepted} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function RateCaddieScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const { bookings } = useMobileData();
  const booking = bookings.find((item) => item.id === bookingId);
  const [score, setScore] = useState(5); const [comment, setComment] = useState(""); const [message, setMessage] = useState(""); const [saving, setSaving] = useState(false);
  if (!booking) return <UnavailableBooking title="Caddie rating unavailable" />;
  const submit = async () => { setSaving(true); setMessage(""); try { const { data: auth } = await getSupabaseClient().auth.getUser(); if (!auth.user) throw new Error("Sign in to submit a rating."); const { error } = await getSupabaseClient().from("ratings").insert({ booking_id: booking.id, rater_id: auth.user.id, ratee_id: booking.caddieId, score, comment: comment.trim() || null }); if (error) throw error; setMessage("Thank you. Your rating was saved."); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save rating."); } finally { setSaving(false); } };
  return <SafeAreaView edges={["bottom"]} style={styles.safeArea}><ScrollView contentContainerStyle={styles.page}><Text accessibilityRole="header" style={styles.title}>Rate your caddie</Text><View style={styles.ratingRow}>{[1,2,3,4,5].map((value) => <Pressable accessibilityLabel={`${value} stars`} accessibilityRole="button" key={value} onPress={() => setScore(value)}><Text style={styles.ratingStar}>{value <= score ? "★" : "☆"}</Text></Pressable>)}</View><TextInput accessibilityLabel="Rating comments" multiline onChangeText={setComment} placeholder="Share feedback about your round" style={styles.ratingInput} value={comment} />{message ? <Text style={styles.subtitle}>{message}</Text> : null}<Button disabled={saving} onPress={() => void submit()}>{saving ? "Saving…" : "Submit rating"}</Button></ScrollView></SafeAreaView>;
}

function UnavailableBooking({ title }: { title: string }) {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.unavailable}>
        <EmptyState description="Booking details will appear after the booking service is connected." icon="calendar-remove-outline" minHeight={500} title={title} />
        <Button onPress={() => backToPreviousPage("/golfer/bookings")}>Back to bookings</Button>
      </View>
    </SafeAreaView>
  );
}

function BookingCard({ booking, caddie, course, isAccepted, isUnread, onOpen }: { booking: Booking; caddie: Caddie | undefined; course: GolfCourse | undefined; isAccepted: boolean; isUnread: boolean; onOpen: () => void }) {
  if (!caddie || !course) return null;

  return (
    <Pressable
      accessibilityLabel={`View booking at ${course.name}`}
      accessibilityRole="button"
      onPress={() => { onOpen(); router.push({ pathname: "/golfer/bookings/[bookingId]", params: { bookingId: booking.id } }); }}
      style={[styles.bookingCard, isUnread && styles.bookingCardUnread]}
    >
      <View style={styles.bookingMain}><View style={styles.dateBlock}><Text style={styles.dateDay}>{formatDatePart(booking.teeTime, "weekday")}</Text><Text style={styles.dateNumber}>{formatDatePart(booking.teeTime, "day")}</Text><Text style={styles.dateMonth}>{formatDatePart(booking.teeTime, "month")}</Text></View><View style={styles.bookingCopy}><View style={styles.cardTitleRow}><Text numberOfLines={1} style={styles.cardTitle}>{course.name}</Text>{isUnread ? <Text style={styles.updateBadge}>Updated</Text> : null}</View><Text style={styles.cardMeta}>{formatTeeTime(booking.teeTime)}</Text><Text style={styles.cardMeta}>{caddie.displayName}</Text></View><MaterialCommunityIcons color={flowColors.forest} name="chevron-right" size={22} /></View>
      <View style={styles.bookingFooter}><StatusChip accepted={isAccepted} status={booking.status} /><Text style={styles.caddieStatus}>{isAccepted ? "Caddie accepted" : "Awaiting caddie response"}</Text></View>
    </Pressable>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <View style={styles.detail}><Text style={styles.label}>{label}</Text><Text selectable style={styles.value}>{value}</Text></View>;
}
function StatusChip({ accepted, status }: { accepted: boolean; status: Booking["status"] }) { const label = status === "confirmed" || accepted ? "Confirmed" : status === "requested" ? "Requested" : status; return <View style={[styles.statusChip, label === "Confirmed" && styles.statusChipConfirmed]}><Text style={[styles.statusChipText, label === "Confirmed" && styles.statusChipTextConfirmed]}>{label}</Text></View>; }
function formatDatePart(value: string, part: "weekday" | "day" | "month") { return new Intl.DateTimeFormat("en-US", { [part]: part === "day" ? "numeric" : "short", timeZone: "Asia/Manila" }).format(new Date(value)); }

const styles = StyleSheet.create({
  frame: { gap: spacing.lg },
  ratingInput: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: colors.text, minHeight: 130, padding: spacing.md, textAlignVertical: "top" },
  ratingRow: { flexDirection: "row", gap: spacing.sm },
  ratingStar: { color: colors.warning, fontSize: 34 },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DEDCD4",
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md
  },
  bookingCardUnread: { backgroundColor: "#F7FBF6", borderColor: flowColors.forest, borderWidth: 2 },
  bookingMain: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  bookingCopy: { flex: 1, gap: 3, minWidth: 0 },
  bookingFooter: { alignItems: "center", borderTopColor: "#EEECE6", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingTop: spacing.sm },
  caddieStatus: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  dateBlock: { alignItems: "center", backgroundColor: "#E9F1E9", borderRadius: 9, justifyContent: "center", minHeight: 62, width: 54 },
  dateDay: { color: flowColors.forest, fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  dateNumber: { color: flowColors.ink, fontSize: 22, fontWeight: "900", lineHeight: 25 },
  dateMonth: { color: colors.textMuted, fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  cardMeta: { color: colors.textMuted, fontSize: typography.small },
  cardTitle: { color: flowColors.ink, fontSize: 17, fontWeight: "800" },
  cardTitleRow: { alignItems: "flex-start", flexDirection: "row", gap: spacing.sm, justifyContent: "space-between" },
  detail: { gap: spacing.xs },
  emptyBookings: { backgroundColor: "#FAF9F6", borderWidth: 0 },
  detailCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderCurve: "continuous",
    borderRadius: 14,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg
  },
  intro: { gap: spacing.sm },
  detailHero: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  detailHeroCopy: { flex: 1, gap: 3, minWidth: 0 },
  detailIcon: { alignItems: "center", backgroundColor: "#E9F1E9", borderRadius: 12, height: 54, justifyContent: "center", width: 54 },
  sectionLabel: { color: flowColors.forest, fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  caddieRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  caddieInitial: { alignItems: "center", backgroundColor: "#E9F1E9", borderRadius: 999, height: 42, justifyContent: "center", width: 42 },
  caddieInitialText: { color: flowColors.forest, fontSize: 18, fontWeight: "800" },
  caddieCopy: { flex: 1, gap: 2 },
  caddieName: { color: flowColors.ink, fontSize: 16, fontWeight: "800" },
  caddieMeta: { color: colors.textMuted, fontSize: 13 },
  rate: { color: flowColors.forest, fontSize: 15, fontWeight: "800" },
  label: { color: colors.textMuted, fontSize: typography.small, fontWeight: "800", textTransform: "uppercase" },
  page: { gap: spacing.lg, padding: spacing.xl, paddingBottom: 112 },
  safeArea: { backgroundColor: "#FAF9F6", flex: 1 },
  subtitle: { color: colors.textMuted, fontSize: typography.body },
  title: { color: colors.text, fontSize: typography.heading, fontWeight: "900" },
  updateBadge: { backgroundColor: "#FFF0B8", borderRadius: 999, color: "#785E0A", fontSize: 9, fontWeight: "900", overflow: "hidden", paddingHorizontal: 7, paddingVertical: 4, textTransform: "uppercase" },
  statusChip: { backgroundColor: "#FFF2CE", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  statusChipConfirmed: { backgroundColor: "#E2F0E4" },
  statusChipText: { color: "#826316", fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  statusChipTextConfirmed: { color: flowColors.forest },
  unavailable: { flex: 1, gap: spacing.lg, justifyContent: "center", padding: spacing.xl },
  value: { color: colors.fairwayDark, fontSize: typography.body, fontWeight: "700" }
});
