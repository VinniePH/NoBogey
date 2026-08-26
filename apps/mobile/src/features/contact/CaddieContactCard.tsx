import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { useCaddieContact } from "./CaddieContactProvider";

export function CaddieContactCard({ isAccepted }: { isAccepted: boolean }) {
  const { contact } = useCaddieContact();
  const hasSharedContact = contact.sharePhone || contact.shareEmail;

  if (!isAccepted) return <View style={styles.locked}><MaterialCommunityIcons color={colors.textMuted} name="lock-outline" size={22} /><Text style={styles.lockedText}>Contact information becomes available after the caddie accepts your booking.</Text></View>;
  if (!hasSharedContact) return <View style={styles.locked}><MaterialCommunityIcons color={colors.textMuted} name="account-lock-outline" size={22} /><Text style={styles.lockedText}>This caddie has not shared contact information for accepted bookings.</Text></View>;

  return <View style={styles.card}>
    <View style={styles.heading}><MaterialCommunityIcons color={colors.fairwayDark} name="card-account-phone-outline" size={24} /><View style={styles.headingCopy}><Text accessibilityRole="header" style={styles.title}>Contact caddie</Text><Text style={styles.note}>Available for this accepted booking · Local demo</Text></View></View>
    {contact.sharePhone ? <ContactRow icon="phone-outline" label="Phone number" value={contact.phoneNumber} action="Call" onPress={() => void Linking.openURL(`tel:${contact.phoneNumber.replace(/\s/g, "")}`)} /> : null}
    {contact.shareEmail ? <ContactRow icon="email-outline" label="Email address" value={contact.contactEmail} action="Email" onPress={() => void Linking.openURL(`mailto:${contact.contactEmail}`)} /> : null}
  </View>;
}

function ContactRow({ action, icon, label, onPress, value }: { action: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"]; label: string; onPress: () => void; value: string }) {
  return <View style={styles.row}><MaterialCommunityIcons color={colors.fairwayDark} name={icon} size={21} /><View style={styles.copy}><Text style={styles.label}>{label}</Text><Text selectable style={styles.value}>{value}</Text></View><Pressable accessibilityLabel={`${action} caddie`} accessibilityRole="button" onPress={onPress} style={styles.action}><Text style={styles.actionText}>{action}</Text></Pressable></View>;
}

const styles = StyleSheet.create({
  action: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radius.md, justifyContent: "center", minHeight: 40, minWidth: 62, paddingHorizontal: spacing.md },
  actionText: { color: colors.onPrimary, fontSize: typography.small, fontWeight: "900" },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderCurve: "continuous", borderRadius: radius.lg, borderWidth: 1, gap: spacing.md, padding: spacing.lg },
  copy: { flex: 1, gap: 2 },
  heading: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  headingCopy: { flex: 1, gap: 2 },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  locked: { alignItems: "flex-start", backgroundColor: "#E7EEE9", borderCurve: "continuous", borderRadius: radius.lg, flexDirection: "row", gap: spacing.sm, padding: spacing.lg },
  lockedText: { color: colors.textMuted, flex: 1, fontSize: typography.small, lineHeight: 19 },
  note: { color: colors.textMuted, fontSize: 11 },
  row: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: spacing.sm, paddingTop: spacing.md },
  title: { color: colors.fairwayDark, fontSize: typography.body, fontWeight: "900" },
  value: { color: colors.text, fontSize: typography.small, fontWeight: "700" }
});
