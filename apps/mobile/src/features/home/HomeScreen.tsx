import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { UserRole } from "@nobogey/contracts";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { formatMoney, formatTeeTime } from "@nobogey/utils";
import {
  availabilitySlots,
  bookings,
  caddies,
  courses,
  golfer
} from "../../data/mock";
import { Screen } from "../../ui/Screen";

export function HomeScreen() {
  const [role, setRole] = useState<UserRole>("golfer");
  const preferredCaddies = useMemo(
    () => caddies.filter((caddie) => golfer.preferredCaddieIds.includes(caddie.id)),
    []
  );
  const nextBooking = bookings[0];
  const nextCaddie = caddies.find((caddie) => caddie.id === nextBooking?.caddieId);

  return (
    <Screen
      title="Book the right caddie before you arrive."
      subtitle="Browse trusted loops, check availability, and hold a tee-time ready caddie from your phone."
      action={
        <View style={styles.roleSwitch}>
          {(["golfer", "caddie"] as const).map((nextRole) => (
            <Pressable
              key={nextRole}
              accessibilityRole="button"
              onPress={() => setRole(nextRole)}
              style={[
                styles.roleButton,
                role === nextRole ? styles.roleButtonActive : null
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  role === nextRole ? styles.roleTextActive : null
                ]}
              >
                {nextRole}
              </Text>
            </Pressable>
          ))}
        </View>
      }
    >
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Next round</Text>
        <Text style={styles.heroTitle}>
          {nextCaddie?.displayName ?? "Select a caddie"} at{" "}
          {courses.find((course) => course.id === nextBooking?.courseId)?.name}
        </Text>
        <Text style={styles.heroMeta}>
          {nextBooking ? formatTeeTime(nextBooking.teeTime) : "Choose a tee time"} -{" "}
          {nextBooking ? formatMoney(nextBooking.quotedRate.amountInCentavos) : "No quote"}
        </Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push("/booking")}>
          <Text style={styles.primaryButtonText}>Review booking</Text>
        </Pressable>
      </View>

      <View style={styles.quickGrid}>
        <QuickAction label="Find course" onPress={() => router.push("/courses")} />
        <QuickAction label="Browse caddies" onPress={() => router.push("/caddies")} />
        <QuickAction label="Golfer profile" onPress={() => router.push("/profile")} />
        <QuickAction
          label="Caddie dashboard"
          onPress={() => router.push("/caddie-dashboard")}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred caddies</Text>
        {preferredCaddies.map((caddie) => (
          <Pressable
            key={caddie.id}
            style={styles.listCard}
            onPress={() =>
              router.push({ pathname: "/caddies/[id]", params: { id: caddie.id } })
            }
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{caddie.displayName.slice(0, 1)}</Text>
            </View>
            <View style={styles.listBody}>
              <Text style={styles.listTitle}>{caddie.displayName}</Text>
              <Text style={styles.listMeta}>
                {caddie.ratingAverage.toFixed(1)} rating -{" "}
                {formatMoney(caddie.rate.amountInCentavos)}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Open slots</Text>
        {availabilitySlots
          .filter((slot) => slot.status === "open")
          .map((slot) => {
            const caddie = caddies.find((item) => item.id === slot.caddieId);
            return (
              <View key={slot.id} style={styles.slotCard}>
                <Text style={styles.slotTime}>{formatTeeTime(slot.startsAt)}</Text>
                <Text style={styles.slotName}>{caddie?.displayName}</Text>
              </View>
            );
          })}
      </View>
    </Screen>
  );
}

function QuickAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.quickAction}>
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: colors.sky,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  avatarText: {
    color: colors.fairwayDark,
    fontSize: typography.body,
    fontWeight: "800"
  },
  chevron: {
    color: colors.muted,
    fontSize: 28
  },
  heroCard: {
    backgroundColor: colors.fairway,
    borderRadius: radius.md,
    gap: spacing.md,
    padding: spacing.lg
  },
  heroMeta: {
    color: colors.sky,
    fontSize: typography.body
  },
  heroTitle: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30
  },
  kicker: {
    color: colors.sand,
    fontSize: typography.small,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  listBody: {
    flex: 1,
    gap: spacing.xs
  },
  listCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md
  },
  listMeta: {
    color: colors.muted,
    fontSize: typography.small
  },
  listTitle: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: "700"
  },
  primaryButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  primaryButtonText: {
    color: colors.fairwayDark,
    fontSize: typography.body,
    fontWeight: "800"
  },
  quickAction: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 58,
    justifyContent: "center",
    padding: spacing.md
  },
  quickActionText: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: "700"
  },
  quickGrid: {
    gap: spacing.md
  },
  roleButton: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  roleButtonActive: {
    backgroundColor: colors.ink
  },
  roleSwitch: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    padding: spacing.xs
  },
  roleText: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "800",
    textTransform: "capitalize"
  },
  roleTextActive: {
    color: colors.surface
  },
  section: {
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: typography.title,
    fontWeight: "800"
  },
  slotCard: {
    backgroundColor: colors.surface,
    borderLeftColor: colors.flag,
    borderLeftWidth: 4,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.md
  },
  slotName: {
    color: colors.muted,
    fontSize: typography.body
  },
  slotTime: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: "800"
  }
});
