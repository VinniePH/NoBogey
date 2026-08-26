import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { colors, radius, spacing } from "@nobogey/ui";
import { useCaddieContact } from "./CaddieContactProvider";

export function CaddieContactSettings() {
  const { contact, updateContact } = useCaddieContact();
  return <View style={styles.content}>
    <Text style={styles.copy}>These contact details and sharing choices remain on this device until the account service is connected. They are separate from sign-in information.</Text>
    <ContactField keyboardType="phone-pad" label="Phone number" onChangeText={(phoneNumber) => updateContact({ phoneNumber })} value={contact.phoneNumber} />
    <ShareRow label="Share phone after acceptance" onValueChange={(sharePhone) => updateContact({ sharePhone })} value={contact.sharePhone} />
    <ContactField autoCapitalize="none" keyboardType="email-address" label="Contact email address" onChangeText={(contactEmail) => updateContact({ contactEmail })} value={contact.contactEmail} />
    <ShareRow label="Share email after acceptance" onValueChange={(shareEmail) => updateContact({ shareEmail })} value={contact.shareEmail} />
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
  field: { gap: spacing.xs },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: colors.text, fontSize: 15, minHeight: 48, paddingHorizontal: spacing.md },
  label: { color: colors.text, fontSize: 13, fontWeight: "800" },
  shareLabel: { color: colors.text, flex: 1, fontSize: 14, fontWeight: "700" },
  shareRow: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", justifyContent: "space-between", minHeight: 56, paddingTop: spacing.sm }
});
