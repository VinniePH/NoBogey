import type { Booking, Caddie, GolfCourse } from "@nobogey/contracts";
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
import { cancelBooking } from '../../../backend/bookings/bookings.service';
import { CaddieContactCard } from "../contact/CaddieContactCard";
import { useNotificationAlerts } from "../notifications/NotificationAlertProvider";
import { getSupabaseClient } from "../../../backend/client";

export function MyBookingsScreen() {
  const { bookings, caddies, courses } = useMobileData();
  const { hasUnreadAlert, isAssignmentAccepted, markBookingOpened } = useNotificationAlerts();
  const upcomingBookings = bookings.filter((booking) => booking.status === "requested" || booking.status === "confirmed");
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.title}>My bookings</Text>
          <Text style={styles.subtitle}>Your upcoming bookings are listed here.</Text>
        </View>
        {upcomingBookings.length
          ? upcomingBookings.map((booking) => <BookingCard booking={booking} caddie={caddies.find((item) => item.id === booking.caddieId)} course={courses.find((item) => item.id === booking.courseId)} isAccepted={isAssignmentAccepted(booking.id)} isUnread={hasUnreadAlert("golfer", booking.id, "booking_assignment_accepted")} key={booking.id} onOpen={() => markBookingOpened(booking.id, "golfer")} />)
          : <EmptyState description="Confirmed and requested rounds will appear after the booking service is connected." icon="calendar-blank-outline" minHeight={390} title="No upcoming bookings" />}
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
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.title}>{course.name}</Text>
          <Text style={styles.subtitle}>{formatTeeTime(booking.teeTime)}</Text>
        </View>
        <View style={styles.detailCard}>
          <Detail label="Booking reference" value={booking.id} />
          <Detail label="Caddie" value={caddie.displayName} />
          <Detail label="Group size" value={`${booking.partySize} golfers`} />
          <Detail label="Caddie rate" value={formatMoney(booking.quotedRate.amountInCentavos)} />
          <Detail label="Status" value={booking.status} />
          <Detail label="Caddie response" value={assignmentAccepted ? "Accepted" : "Awaiting response"} />
        </View>
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
      <View style={styles.cardTitleRow}><Text style={styles.cardTitle}>{course.name}</Text>{isUnread ? <Text style={styles.updateBadge}>New update</Text> : null}</View>
      <Text style={styles.cardMeta}>{formatTeeTime(booking.teeTime)}</Text>
      <Text style={styles.cardMeta}>{caddie.displayName}</Text>
      <Text style={[styles.assignmentStatus, isAccepted && styles.assignmentAccepted]}>{isAccepted ? "Caddie accepted" : "Awaiting caddie response"}</Text>
    </Pressable>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <View style={styles.detail}><Text style={styles.label}>{label}</Text><Text selectable style={styles.value}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  ratingInput: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: colors.text, minHeight: 130, padding: spacing.md, textAlignVertical: "top" },
  ratingRow: { flexDirection: "row", gap: spacing.sm },
  ratingStar: { color: colors.warning, fontSize: 34 },
  bookingCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg
  },
  bookingCardUnread: { backgroundColor: "#FBF7E8", borderColor: colors.warning, borderWidth: 2 },
  assignmentAccepted: { color: colors.fairwayDark },
  assignmentStatus: { color: colors.textMuted, fontSize: typography.small, fontWeight: "800", paddingTop: spacing.xs },
  cardMeta: { color: colors.textMuted, fontSize: typography.small },
  cardTitle: { color: colors.fairwayDark, fontSize: typography.title, fontWeight: "800" },
  cardTitleRow: { alignItems: "flex-start", flexDirection: "row", gap: spacing.sm, justifyContent: "space-between" },
  detail: { gap: spacing.xs },
  detailCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg
  },
  intro: { gap: spacing.sm },
  label: { color: colors.textMuted, fontSize: typography.small, fontWeight: "800", textTransform: "uppercase" },
  page: { gap: spacing.lg, padding: spacing.xl, paddingBottom: 112 },
  safeArea: { backgroundColor: colors.canvas, flex: 1 },
  subtitle: { color: colors.textMuted, fontSize: typography.body },
  title: { color: colors.text, fontSize: typography.heading, fontWeight: "900" },
  updateBadge: { backgroundColor: "#FFF0B8", borderRadius: 999, color: "#785E0A", fontSize: 9, fontWeight: "900", overflow: "hidden", paddingHorizontal: 7, paddingVertical: 4, textTransform: "uppercase" },
  unavailable: { flex: 1, gap: spacing.lg, justifyContent: "center", padding: spacing.xl },
  value: { color: colors.fairwayDark, fontSize: typography.body, fontWeight: "700" }
});
