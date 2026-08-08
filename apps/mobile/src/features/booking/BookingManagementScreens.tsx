import type { Booking } from "@nobogey/contracts";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatMoney, formatTeeTime } from "@nobogey/utils";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { bookings, caddies, courses } from "../../data/catalog";
import { EmptyState } from "../../ui/EmptyState";
import { Button } from "../../ui/primitives";

export function MyBookingsScreen() {
  const upcomingBookings = bookings.filter((booking) => booking.status === "requested" || booking.status === "confirmed");
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.title}>My bookings</Text>
          <Text style={styles.subtitle}>Your upcoming bookings are listed here.</Text>
        </View>
        {upcomingBookings.length
          ? upcomingBookings.map((booking) => <BookingCard booking={booking} key={booking.id} />)
          : <EmptyState description="Confirmed and requested rounds will appear after the booking service is connected." icon="calendar-blank-outline" title="No upcoming bookings" />}
      </ScrollView>
    </SafeAreaView>
  );
}
export function BookingDetailsScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const booking = bookings.find((item) => item.id === bookingId);
  const caddie = caddies.find((item) => item.id === booking?.caddieId);
  const course = courses.find((item) => item.id === booking?.courseId);

  if (!booking || !caddie || !course) {
    return <UnavailableBooking title="Booking unavailable" />;
  }

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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function RateCaddieScreen() {
  // TODO: load the completed booking and submit feedback through the real review service.
  return <UnavailableBooking title="Caddie rating unavailable" />;
}

function UnavailableBooking({ title }: { title: string }) {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.unavailable}>
        <EmptyState description="Booking details will appear after the booking service is connected." icon="calendar-remove-outline" title={title} />
        <Button onPress={() => router.replace("/golfer/bookings")}>Back to bookings</Button>
      </View>
    </SafeAreaView>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const caddie = caddies.find((item) => item.id === booking.caddieId);
  const course = courses.find((item) => item.id === booking.courseId);
  if (!caddie || !course) return null;

  return (
    <Pressable
      accessibilityLabel={`View booking at ${course.name}`}
      accessibilityRole="button"
      onPress={() => router.push({ pathname: "/golfer/bookings/[bookingId]", params: { bookingId: booking.id } })}
      style={styles.bookingCard}
    >
      <Text style={styles.cardTitle}>{course.name}</Text>
      <Text style={styles.cardMeta}>{formatTeeTime(booking.teeTime)}</Text>
      <Text style={styles.cardMeta}>{caddie.displayName}</Text>
    </Pressable>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <View style={styles.detail}><Text style={styles.label}>{label}</Text><Text selectable style={styles.value}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  bookingCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg
  },
  cardMeta: { color: colors.textMuted, fontSize: typography.small },
  cardTitle: { color: colors.fairwayDark, fontSize: typography.title, fontWeight: "800" },
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
  page: { gap: spacing.lg, padding: spacing.xl },
  safeArea: { backgroundColor: colors.canvas, flex: 1 },
  subtitle: { color: colors.textMuted, fontSize: typography.body },
  title: { color: colors.text, fontSize: typography.heading, fontWeight: "900" },
  unavailable: { flex: 1, gap: spacing.lg, justifyContent: "center", padding: spacing.xl },
  value: { color: colors.fairwayDark, fontSize: typography.body, fontWeight: "700" }
});
