import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { formatMoney, formatTeeTime, isBookingTerminal } from "@nobogey/utils";
import { bookings, caddies, courses, paymentIntents } from "../../data/mock";
import { Screen } from "../../ui/Screen";

export function BookingPlaceholderScreen() {
  const booking = bookings[0];
  if (!booking) {
    return (
      <Screen
        title="No booking selected"
        subtitle="Once a golfer holds a caddie, the booking request summary will appear here."
      >
        <View style={styles.card}>
          <Text style={styles.label}>Empty state</Text>
          <Text style={styles.value}>No active request</Text>
          <Text style={styles.detail}>
            Backend persistence is out of scope for this foundation phase.
          </Text>
        </View>
      </Screen>
    );
  }

  const caddie = caddies.find((item) => item.id === booking.caddieId);
  const course = courses.find((item) => item.id === booking.courseId);
  const payment = paymentIntents.find((item) => item.bookingId === booking.id);

  return (
    <Screen
      title="Booking request"
      subtitle="This placeholder names the states the future backend must enforce before payment and confirmation."
    >
      <View style={styles.card}>
        <Text style={styles.label}>Requested caddie</Text>
        <Text style={styles.value}>{caddie?.displayName}</Text>
        <Text style={styles.detail}>{course?.name}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Tee time</Text>
        <Text style={styles.value}>{formatTeeTime(booking.teeTime)}</Text>
        <Text style={styles.detail}>{booking.notes}</Text>
      </View>

      <View style={styles.statusGrid}>
        <StatusTile label="Booking" value={booking.status} />
        <StatusTile
          label="Payment"
          value={payment?.status ?? "not_required"}
          accent={colors.flag}
        />
        <StatusTile
          label="Terminal"
          value={isBookingTerminal(booking.status) ? "yes" : "no"}
        />
      </View>

      <View style={styles.paymentCard}>
        <Text style={styles.label}>Future GCash handoff</Text>
        <Text style={styles.value}>
          {payment ? formatMoney(payment.amount.amountInCentavos) : "No payment"}
        </Text>
        <Text style={styles.detail}>
          Backend will own payment intent creation, status callbacks, and abandoned
          payment recovery.
        </Text>
      </View>
    </Screen>
  );
}

function StatusTile({
  accent = colors.fairway,
  label,
  value
}: {
  accent?: string;
  label: string;
  value: string;
}) {
  return (
    <View style={[styles.statusTile, { borderTopColor: accent }]}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.lg
  },
  detail: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 23
  },
  label: {
    color: colors.fairway,
    fontSize: typography.small,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  paymentCard: {
    backgroundColor: colors.sky,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.lg
  },
  statusGrid: {
    gap: spacing.md
  },
  statusLabel: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "700"
  },
  statusTile: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderTopWidth: 4,
    gap: spacing.xs,
    padding: spacing.md
  },
  statusValue: {
    color: colors.ink,
    fontSize: typography.title,
    fontWeight: "800",
    textTransform: "capitalize"
  },
  value: {
    color: colors.ink,
    fontSize: typography.title,
    fontWeight: "800"
  }
});
