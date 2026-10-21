import { Feather } from "@expo/vector-icons";
import type { Booking } from "@nobogey/contracts";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { mobilePalette as palette } from "../../ui/mobile-palette";
import { useRoundConfirmation } from "./RoundConfirmationProvider";
import { isMutual, type MutualConfirmation, type RoundRole, type RoundStep } from "./round-confirmation-state";

export function openRoundConfirmation(role: RoundRole, bookingId: string, step: RoundStep) {
  if (role === "golfer") router.push({ pathname: "/golfer/bookings/[bookingId]/[confirmation]", params: { bookingId, confirmation: step } });
  else router.push({ pathname: "/caddie/matches/[bookingId]/[confirmation]", params: { bookingId, confirmation: step } });
}

export function RoundConfirmationSummary({ bookingId }: { bookingId: string }) {
  const { round } = useRoundConfirmation(bookingId);
  return <Text style={styles.copy}>Meetup: {isMutual(round.meetup) ? "confirmed" : "pending"} · Payment: {isMutual(round.payment) ? "confirmed" : "pending"}</Text>;
}

export function RoundConfirmationActions({ booking, role }: { booking: Booking; role: RoundRole }) {
  const { round } = useRoundConfirmation(booking.id);
  if (booking.status !== "confirmed") return null;
  const completedSteps = Number(isMutual(round.meetup)) + Number(isMutual(round.payment));
  return <View style={styles.stack}>
    <View style={styles.sectionHeader}><Text accessibilityRole="header" style={styles.heading}>Round confirmations</Text><Text accessibilityLabel={`${completedSteps} of 2 steps complete`} style={styles.progressPill}>{completedSteps}/2 done</Text></View>
    <Text style={styles.sectionCopy}>Both you and your {role === "golfer" ? "caddie" : "golfer"} confirm each step.</Text>
    <StepCard bookingId={booking.id} role={role} step="meetup" state={round.meetup} />
    <StepCard bookingId={booking.id} role={role} step="payment" state={round.payment} locked={!isMutual(round.meetup)} />
    <Text style={styles.copy}>Confirmations stay in this app session.</Text>
  </View>;
}

function StepCard({ bookingId, role, step, state, locked = false }: { bookingId: string; role: RoundRole; step: RoundStep; state: MutualConfirmation; locked?: boolean }) {
  const complete = isMutual(state);
  const status = complete ? "Both confirmed" : state[role] ? `Waiting for ${role === "golfer" ? "caddie" : "golfer"}` : locked ? "Available after meetup" : "Needs your confirmation";
  return <Pressable accessibilityRole="button" accessibilityLabel={`${step === "meetup" ? "Meetup" : "Payment"} confirmation: ${status}`} onPress={() => openRoundConfirmation(role, bookingId, step)} style={({ pressed }) => [styles.step, complete && styles.stepComplete, pressed && { opacity: 0.75 }]}>
    <View style={styles.icon}><Feather color={locked ? "#858D7F" : palette.forest} name={complete ? "check-circle" : step === "meetup" ? "users" : "credit-card"} size={18} /></View>
    <View style={styles.stepCopy}><Text style={styles.stepTitle}>{step === "meetup" ? "Meetup confirmation" : "Payment confirmation"}</Text><Text style={[styles.stepStatus, complete && styles.complete]}>{status}</Text></View>
    <Feather color="#7A8475" name={locked ? "lock" : "chevron-right"} size={16} />
  </Pressable>;
}

export function ParticipantConfirmations({ state, role }: { state: MutualConfirmation; role: RoundRole }) {
  return <View accessibilityLabel="Participant confirmations" style={styles.participants}>
    {(["golfer", "caddie"] as const).map((participant, index) => <View key={participant} style={[styles.participant, index > 0 && styles.participantDivider]}>
      <View style={styles.stepCopy}>
        <Text style={styles.participantTitle}>{participant === "golfer" ? "Golfer" : "Caddie"}{participant === role ? " (you)" : ""}</Text>
        <Text style={styles.participantStatus}>{state[participant] ? "Confirmed" : "Waiting for confirmation"}</Text>
      </View>
      <Feather color={palette.forest} name={state[participant] ? "check-circle" : "clock"} size={18} />
    </View>)}
  </View>;
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  sectionHeader: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 },
  heading: { color: palette.ink, fontFamily: "Inter", fontSize: 18, fontWeight: "600", letterSpacing: -0.4, lineHeight: 24 },
  sectionCopy: { color: "#687267", fontFamily: "Inter", fontSize: 12, lineHeight: 18 },
  progressPill: { color: "#687267", fontFamily: "Inter", fontSize: 10, fontWeight: "600", lineHeight: 16 },
  copy: { color: "#656C63", fontSize: 13, lineHeight: 19 },
  complete: { color: palette.forest, fontWeight: "600" },
  step: { backgroundColor: palette.white, borderColor: palette.line, borderWidth: 1, borderCurve: "continuous", borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, minHeight: 78 },
  stepComplete: { backgroundColor: "#F0F5ED", borderColor: "#D0DDC9" },
  icon: { backgroundColor: "#F0F1E9", borderRadius: 11, width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  stepCopy: { flex: 1, gap: 5, minWidth: 0 },
  stepTitle: { color: palette.forest, fontFamily: "Inter", fontSize: 14, fontWeight: "600", lineHeight: 20 },
  stepStatus: { color: "#687267", fontFamily: "Inter", fontSize: 11, lineHeight: 17 },
  participants: { backgroundColor: palette.white, borderColor: palette.line, borderWidth: 1, borderCurve: "continuous", borderRadius: 16, paddingHorizontal: 16 },
  participant: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, paddingVertical: 16 },
  participantDivider: { borderTopColor: palette.line, borderTopWidth: 1 },
  participantTitle: { color: palette.forest, fontFamily: "Inter", fontSize: 13, fontWeight: "700", lineHeight: 18 },
  participantStatus: { color: "#62685F", fontFamily: "Inter", fontSize: 11, lineHeight: 17 },
});
