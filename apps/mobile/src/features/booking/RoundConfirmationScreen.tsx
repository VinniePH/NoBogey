import { Feather } from "@expo/vector-icons";
import { formatMoney, formatTeeTime } from "@nobogey/utils";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../ui/EmptyState";
import { mobilePalette as palette } from "../../ui/mobile-palette";
import { backToPreviousPage } from "../../ui/navigation";
import { Button } from "../../ui/primitives";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { useMobileData } from "../data/useMobileData";
import { useRoundConfirmation } from "./RoundConfirmationProvider";
import { isMutual, type RoundRole } from "./round-confirmation-state";
import { openRoundConfirmation, ParticipantConfirmations } from "./round-confirmation-ui";

export function RoundConfirmationScreen({ role }: { role: RoundRole }) {
  const { bookingId = "", confirmation } = useLocalSearchParams<{ bookingId?: string; confirmation?: string }>();
  const { bookings, courses, caddies, isLoading } = useMobileData();
  const { round, confirm } = useRoundConfirmation(bookingId);
  const booking = bookings.find((item) => item.id === bookingId);
  const step = confirmation === "meetup" || confirmation === "payment" ? confirmation : undefined;
  const goBack = () => {
    if (!bookingId) { backToPreviousPage(role === "golfer" ? "/golfer/bookings" : "/caddie/roster"); return; }
    if (role === "golfer") router.dismissTo({ pathname: "/golfer/bookings/[bookingId]", params: { bookingId } });
    else router.dismissTo({ pathname: "/caddie/matches/[bookingId]", params: { bookingId } });
  };

  if (!booking || booking.status !== "confirmed" || !step) return <SafeAreaView edges={["bottom"]} style={styles.safe}><ScrollView contentContainerStyle={styles.page}><EmptyState title={isLoading && !booking ? "Loading booking…" : "Confirmation unavailable"} description="Meetup and payment confirmations are available for confirmed bookings." icon="calendar-check-outline" /><Button onPress={goBack}>Back to bookings</Button></ScrollView></SafeAreaView>;

  const state = round[step];
  const complete = isMutual(state);
  const mine = Boolean(state[role]);
  const locked = step === "payment" && !isMutual(round.meetup);
  const other = role === "golfer" ? "caddie" : "golfer";
  const course = courses.find((item) => item.id === booking.courseId);
  const caddie = caddies.find((item) => item.id === booking.caddieId);
  const title = step === "meetup" ? "Meetup confirmation" : "Payment confirmation";
  const description = step === "meetup"
    ? `Confirm once you’ve met your ${other} at the course. Both sides must confirm.`
    : role === "golfer" ? "Acknowledge paying your caddie. The caddie also needs to confirm receipt." : "Acknowledge receiving the caddie fee. Your golfer also needs to confirm payment.";
  const actionLabel = complete ? "Both sides confirmed" : mine ? "Your confirmation is recorded" : step === "meetup" ? `I’ve met my ${other}` : role === "golfer" ? "I’ve paid the caddie" : "I’ve received payment";
  const golferName = role === "golfer" ? "You" : "Assigned golfer";
  const caddieName = caddie?.displayName ?? (role === "caddie" ? "You" : "Assigned caddie");
  const notice = complete ? "Both sides have confirmed."
    : locked ? "Both participants must confirm meetup before payment."
    : mine ? `Your side is confirmed. Waiting for your ${other}.`
    : state[other] ? `Your ${other} has confirmed. Your confirmation is still needed.`
    : "One confirmation does not complete this step.";

  return <SafeAreaView edges={["bottom"]} style={styles.safe}>
    <Stack.Screen options={{
      title,
      headerLeft: () => <Pressable accessibilityLabel="Back to booking details" accessibilityRole="button" hitSlop={8} onPress={goBack} style={styles.backButton}><Feather color={palette.forest} name="arrow-left" size={22} /></Pressable>
    }} />
    <ScrollView contentContainerStyle={styles.page} contentInsetAdjustmentBehavior="automatic">
      <ResponsiveContent style={styles.frame}>
        <View style={styles.intro}>
          <Text selectable style={styles.eyebrow}>CONFIRMED ROUND · {formatTeeTime(booking.teeTime)}</Text>
          <Text accessibilityRole="header" style={styles.title}>{complete ? step === "meetup" ? "Meetup confirmed" : "Payment confirmed" : title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.summary}>
          <Text selectable style={styles.course}>{course?.name ?? "Course details unavailable"}</Text>
          <Text selectable style={styles.parties}>{golferName} · {caddieName}</Text>
          {step === "payment"
            ? <Text selectable style={styles.amount}>{formatMoney(booking.quotedRate.amountInCentavos, booking.quotedRate.currency)}</Text>
            : <Text style={styles.meetingPoint}>{booking.notes.trim() || "Follow your club’s meeting-point instructions."}</Text>}
        </View>

        <ParticipantConfirmations role={role} state={state} />
        <View accessibilityLiveRegion="polite" style={styles.notice}><Text style={styles.noticeCopy}>{notice}</Text></View>

        <View style={styles.actions}>
          <ConfirmationButton disabled={locked || mine} icon="check" label={actionLabel} onPress={() => confirm(booking, step, role)} primary />
          {step === "meetup" && complete ? <ConfirmationButton label="Continue to payment confirmation" onPress={() => openRoundConfirmation(role, booking.id, "payment")} /> : null}
          {locked ? <ConfirmationButton label="Open meetup confirmation" onPress={() => openRoundConfirmation(role, booking.id, "meetup")} /> : null}
        </View>
        <Text style={styles.caption}>Confirmations stay in this app session. No payment is collected.</Text>
      </ResponsiveContent>
    </ScrollView>
  </SafeAreaView>;
}

function ConfirmationButton({ label, onPress, disabled = false, primary = false, icon = "chevron-right" }: { label: string; onPress: () => void; disabled?: boolean; primary?: boolean; icon?: "check" | "chevron-right" }) {
  return <Pressable
    accessibilityRole="button"
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [styles.action, primary && styles.primaryAction, disabled && styles.disabledAction, pressed && !disabled && styles.pressedAction]}
  >
    <Text style={[styles.actionText, primary && styles.primaryActionText]}>{label}</Text>
    <Feather color={primary ? palette.white : palette.forest} name={icon} size={15} />
  </Pressable>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: "#F7F5EF", flex: 1 },
  page: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 24, flexGrow: 1 },
  frame: { gap: 14, maxWidth: 560 },
  backButton: { alignItems: "center", justifyContent: "center", minHeight: 44, minWidth: 44 },
  intro: { gap: 12, paddingBottom: 2 },
  eyebrow: { color: palette.muted, fontFamily: "Inter", fontSize: 10, fontWeight: "700", letterSpacing: 1.2, lineHeight: 15, textTransform: "uppercase" },
  title: { color: palette.ink, fontFamily: "Inter", fontSize: 28, fontWeight: "600", letterSpacing: -1.2, lineHeight: 34 },
  description: { color: "#62685F", fontFamily: "Inter", fontSize: 13, lineHeight: 21, paddingTop: 4 },
  summary: { backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, borderCurve: "continuous", borderRadius: 16, padding: 16, gap: 10 },
  course: { color: palette.forest, fontFamily: "Inter", fontSize: 14, fontWeight: "700", lineHeight: 20 },
  parties: { color: "#62685F", fontFamily: "Inter", fontSize: 12, lineHeight: 18 },
  meetingPoint: { color: "#62685F", fontFamily: "Inter", fontSize: 13, lineHeight: 20 },
  amount: { color: palette.forest, fontFamily: "Inter", fontSize: 28, fontWeight: "700", lineHeight: 36, paddingTop: 4 },
  notice: { backgroundColor: palette.goldSoft, borderCurve: "continuous", borderRadius: 14, padding: 14 },
  noticeCopy: { color: "#665531", fontFamily: "Inter", fontSize: 12, lineHeight: 19 },
  actions: { gap: 8 },
  action: { alignItems: "center", backgroundColor: palette.white, borderColor: "#D8DDD3", borderCurve: "continuous", borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 44, paddingHorizontal: 14, paddingVertical: 12 },
  primaryAction: { backgroundColor: palette.forest, borderColor: palette.forest },
  actionText: { color: palette.forest, flexShrink: 1, fontFamily: "Inter", fontSize: 12, fontWeight: "700", lineHeight: 18, textAlign: "center" },
  primaryActionText: { color: palette.white },
  disabledAction: { opacity: 0.5 },
  pressedAction: { opacity: 0.8 },
  caption: { color: "#62685F", fontFamily: "Inter", fontSize: 11, lineHeight: 17, textAlign: "center" }
});
