import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { colors, spacing } from "@nobogey/ui";
import { useCaddieContact } from "./CaddieContactProvider";

export function CaddieContactSettings() {
  const { contact, updateContact } = useCaddieContact();
  return <View style={styles.content}>
    <Text style={styles.copy}>These details stay on this device until caddie contact settings are connected to your account.</Text>
    <View style={styles.section}><Text style={styles.sectionTitle}>Contact details</Text><View style={styles.card}><ContactField keyboardType="phone-pad" label="Phone number" onChangeText={(phoneNumber) => updateContact({ phoneNumber })} value={contact.phoneNumber} /><ContactField autoCapitalize="none" keyboardType="email-address" label="Contact email address" onChangeText={(contactEmail) => updateContact({ contactEmail })} value={contact.contactEmail} /></View></View>
    <View style={styles.section}><Text style={styles.sectionTitle}>Share after booking acceptance</Text><View style={styles.card}><ShareRow label="Share phone number" onValueChange={(sharePhone) => updateContact({ sharePhone })} value={contact.sharePhone} /><ShareRow label="Share email address" onValueChange={(shareEmail) => updateContact({ shareEmail })} value={contact.shareEmail} /></View></View>
  </View>;
}

function ContactField({ autoCapitalize, keyboardType, label, onChangeText, value }: { autoCapitalize?: "none"; keyboardType: "email-address" | "phone-pad"; label: string; onChangeText: (value: string) => void; value: string }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} autoCapitalize={autoCapitalize} keyboardType={keyboardType} onChangeText={onChangeText} placeholder={label} placeholderTextColor={colors.textMuted} style={styles.input} value={value} /></View>;
}

function ShareRow({ label, onValueChange, value }: { label: string; onValueChange: (value: boolean) => void; value: boolean }) {
  return <View style={styles.shareRow}><Text style={styles.shareLabel}>{label}</Text><Switch accessibilityLabel={label} accessibilityRole="switch" onValueChange={onValueChange} trackColor={{ false: colors.border, true: colors.primary }} value={value} /></View>;
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  copy: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderCurve: "continuous", borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, gap: spacing.md, padding: spacing.md },
  field: { gap: spacing.xs },
  input: { backgroundColor: "#FBFCF9", borderColor: colors.border, borderCurve: "continuous", borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, color: colors.text, fontSize: 15, minHeight: 50, paddingHorizontal: spacing.md },
  label: { color: colors.text, fontSize: 13, fontWeight: "800" },
  shareLabel: { color: colors.text, flex: 1, fontSize: 14, fontWeight: "700" },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.fairwayDark, fontSize: 11, fontWeight: "800", letterSpacing: 0.9, textTransform: "uppercase" },
  shareRow: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", justifyContent: "space-between", minHeight: 56, paddingTop: spacing.sm }
});
