import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type Dispatch, type SetStateAction, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@nobogey/ui";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { backToPreviousPage } from "../../ui/navigation";
import { TermsAcceptanceModal } from "../legal/TermsAcceptanceModal";
import { useAppSession } from "../session/AppSession";

type SettingsRole = "golfer" | "caddie";
type SettingsSheet = "notifications" | "payment" | "preferences" | "support";
type SettingsItem = {
  detail: string;
  disabled?: boolean;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress?: () => void;
};

export function SettingsScreen({ role = "golfer" }: { role?: SettingsRole }) {
  const { signOut } = useAppSession();
  const [activeSheet, setActiveSheet] = useState<SettingsSheet | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const sections = getSections(role, {
    openSheet: setActiveSheet,
    openTerms: () => setTermsVisible(true)
  });

  const logOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.replace("/sign-in");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
        <ResponsiveContent style={styles.frame}>
          <View style={styles.header}>
            <Pressable accessibilityLabel="Go back" accessibilityRole="button" hitSlop={10} onPress={() => backToPreviousPage(role === "golfer" ? "/golfer/profile" : "/caddie/profile")} style={styles.backButton}>
              <MaterialCommunityIcons color={colors.fairwayDark} name="arrow-left" size={25} />
            </Pressable>
            <View style={styles.headerCopy}>
              <Text accessibilityRole="header" style={styles.title}>Settings</Text>
              <Text style={styles.subtitle}>Manage your NoBogey account and preferences.</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          {sections.map((section) => <SettingsSection items={section.items} key={section.title} title={section.title} />)}

          <Pressable accessibilityLabel="Log out" accessibilityRole="button" accessibilityState={{ busy: isLoggingOut, disabled: isLoggingOut }} disabled={isLoggingOut} onPress={() => void logOut()} style={({ pressed }) => [styles.logoutCard, pressed && styles.logoutPressed, isLoggingOut && styles.logoutDisabled]}>
            <MaterialCommunityIcons color={colors.accent} name="logout-variant" size={25} />
            <Text style={styles.logoutText}>{isLoggingOut ? "Logging out…" : "Log out"}</Text>
            <MaterialCommunityIcons color={colors.accent} name="chevron-right" size={24} />
          </Pressable>
        </ResponsiveContent>
      </ScrollView>
      <SettingsActionSheet onClose={() => setActiveSheet(null)} role={role} sheet={activeSheet} />
      <TermsAcceptanceModal acceptanceStorageNote="Viewing current local-demo terms only; this does not change account acceptance." mode="viewer" onAccept={() => setTermsVisible(false)} onDecline={() => setTermsVisible(false)} visible={termsVisible} />
    </SafeAreaView>
  );
}

function getSections(role: SettingsRole, actions: { openSheet: (sheet: SettingsSheet) => void; openTerms: () => void }): Array<{ title: string; items: SettingsItem[] }> {
  const profilePath = role === "golfer" ? "/golfer/profile" : "/caddie/profile";
  return [
    { title: "ACCOUNT", items: [
      { detail: "Manage your account details", icon: "account-circle-outline" as const, label: "Account Information", onPress: () => router.push(profilePath) },
      { detail: role === "golfer" ? "Preferred courses, language, group size" : "Home course, languages, availability", icon: "calendar-check-outline" as const, label: role === "golfer" ? "Booking Preferences" : "Caddie Preferences", onPress: () => actions.openSheet("preferences") }
    ] },
    { title: "PAYMENT", items: [
      { detail: role === "golfer" ? "Review local payment setup" : "Review local payout setup", icon: (role === "golfer" ? "credit-card-outline" : "bank-outline") as SettingsItem['icon'], label: role === "golfer" ? "Payment Methods" : "Payout Method", onPress: () => actions.openSheet("payment") }
    ] },
    { title: "PREFERENCES", items: [
      { detail: role === "golfer" ? "Tee-time alerts, messages, promotions" : "Match alerts, messages, promotions", icon: "bell-outline" as const, label: "Notifications", onPress: () => actions.openSheet("notifications") },
      { detail: "Account controls are not available in this local demo", disabled: true, icon: "lock-outline" as const, label: "Privacy & Security" }
    ] },
    { title: "SUPPORT", items: [
      { detail: "View local support options", icon: "help-circle-outline" as const, label: "Help & Support", onPress: () => actions.openSheet("support") },
      { detail: "Terms of Service · Privacy Policy", icon: "file-document-outline" as const, label: "Terms & Conditions", onPress: actions.openTerms }
    ] }
  ];
}

function SettingsSection({ items, title }: { items: SettingsItem[]; title: string }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.sectionCard}>{items.map((item, index) => <SettingsRow isLast={index === items.length - 1} item={item} key={item.label} />)}</View></View>;
}

function SettingsRow({ isLast, item }: { isLast: boolean; item: SettingsItem }) {
  return <Pressable accessibilityHint={item.disabled ? item.detail : undefined} accessibilityLabel={item.label} accessibilityRole="button" accessibilityState={{ disabled: item.disabled }} disabled={item.disabled} onPress={item.onPress} style={({ pressed }) => [styles.row, !isLast && styles.rowDivider, pressed && !item.disabled && styles.rowPressed, item.disabled && styles.rowDisabled]}>
    <MaterialCommunityIcons color={item.disabled ? colors.textMuted : colors.fairwayDark} name={item.icon} size={31} />
    <View style={styles.rowCopy}><Text style={[styles.rowLabel, item.disabled && styles.textDisabled]}>{item.label}</Text><Text style={styles.rowDetail}>{item.detail}</Text></View>
    <MaterialCommunityIcons color={item.disabled ? colors.textMuted : colors.fairwayDark} name={item.disabled ? "information-outline" : "chevron-right"} size={26} />
  </Pressable>;
}

function SettingsActionSheet({ onClose, role, sheet }: { onClose: () => void; role: SettingsRole; sheet: SettingsSheet | null }) {
  const [notifications, setNotifications] = useState({ alerts: true, messages: true, promotions: false });
  const title = sheet === "preferences" ? (role === "golfer" ? "Booking preferences" : "Caddie preferences") : sheet === "payment" ? (role === "golfer" ? "Payment methods" : "Payout method") : sheet === "notifications" ? "Notifications" : "Help & support";
  return <Modal animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet" transparent visible={sheet !== null}><View style={styles.backdrop}><View accessibilityViewIsModal style={styles.sheet}><View style={styles.sheetHeader}><Text accessibilityRole="header" style={styles.sheetTitle}>{title}</Text><Pressable accessibilityLabel={`Close ${title}`} accessibilityRole="button" hitSlop={8} onPress={onClose} style={styles.closeButton}><MaterialCommunityIcons color={colors.fairwayDark} name="close" size={24} /></Pressable></View><ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator>{sheet === "preferences" ? <PreferenceContent role={role} /> : null}{sheet === "payment" ? <PaymentContent role={role} /> : null}{sheet === "notifications" ? <NotificationContent notifications={notifications} setNotifications={setNotifications} /> : null}{sheet === "support" ? <SupportContent /> : null}</ScrollView><Pressable accessibilityLabel={`Close ${title}`} accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.sheetButton, pressed && styles.sheetButtonPressed]}><Text style={styles.sheetButtonText}>Done</Text></Pressable></View></View></Modal>;
}

function PreferenceContent({ role }: { role: SettingsRole }) { const entries = role === "golfer" ? [["Preferred courses", "Not configured in local demo"], ["Language", "English"], ["Group size", "Not configured in local demo"]] : [["Home course", "Set in profile fixture"], ["Languages", "English"], ["Availability", "Not connected in local demo"]]; return <><Text style={styles.sheetCopy}>These preferences are displayed locally for this prototype and are not synchronized to an account.</Text>{entries.map(([label, value]) => <View key={label} style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text selectable style={styles.infoValue}>{value}</Text></View>)}</>; }
function PaymentContent({ role }: { role: SettingsRole }) { const noun = role === "golfer" ? "payment method" : "payout method"; return <><Text style={styles.sheetCopy}>No {noun} is connected in this local demo.</Text><View style={styles.notice}><MaterialCommunityIcons color={colors.fairwayDark} name="information-outline" size={22} /><Text style={styles.noticeText}>{role === "golfer" ? "Payment collection is selected during the booking flow." : "Earnings payout setup will require a verified account and club-approved workflow."}</Text></View></>; }
function NotificationContent({ notifications, setNotifications }: { notifications: { alerts: boolean; messages: boolean; promotions: boolean }; setNotifications: Dispatch<SetStateAction<{ alerts: boolean; messages: boolean; promotions: boolean }>> }) { return <><Text style={styles.sheetCopy}>These local switches affect this device session only.</Text>{([['alerts', 'Booking or match alerts'], ['messages', 'Messages'], ['promotions', 'Promotions']] as const).map(([key, label]) => <View key={key} style={styles.toggleRow}><Text style={styles.infoLabel}>{label}</Text><Switch accessibilityLabel={label} accessibilityRole="switch" onValueChange={(value) => setNotifications((current) => ({ ...current, [key]: value }))} trackColor={{ false: colors.border, true: colors.primary }} value={notifications[key]} /></View>)}</>; }
function SupportContent() { return <><Text style={styles.sheetCopy}>Support contact, FAQs, and issue reporting are not configured in this local demo.</Text><View style={styles.notice}><MaterialCommunityIcons color={colors.textMuted} name="email-outline" size={22} /><Text style={styles.noticeText}>There is no support channel to open yet, so this screen does not attempt to send a message or navigate away.</Text></View></>; }

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(8, 20, 12, 0.42)", flex: 1, justifyContent: "flex-end" }, backButton: { alignItems: "center", justifyContent: "center", minHeight: 44, minWidth: 44 }, closeButton: { alignItems: "center", justifyContent: "center", minHeight: 44, minWidth: 44 }, content: { gap: 19, padding: 19, paddingBottom: 29 }, frame: { gap: 19 }, header: { alignItems: "center", flexDirection: "row", minHeight: 44 }, headerCopy: { alignItems: "center", flex: 1, gap: 1 }, headerSpacer: { minWidth: 44 }, infoLabel: { color: colors.text, fontSize: 14, fontWeight: "800" }, infoRow: { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, gap: 4, paddingVertical: spacing.md }, infoValue: { color: colors.textMuted, fontSize: 13, lineHeight: 18 }, logoutCard: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderCurve: "continuous", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 13, marginTop: 10, minHeight: 67, paddingHorizontal: 14 }, logoutDisabled: { opacity: 0.65 }, logoutPressed: { backgroundColor: "#FFF2F2" }, logoutText: { color: colors.accent, flex: 1, fontSize: 15, fontWeight: "700" }, notice: { alignItems: "flex-start", backgroundColor: "#E7EEE9", borderRadius: radius.md, flexDirection: "row", gap: spacing.sm, padding: spacing.md }, noticeText: { color: colors.text, flex: 1, fontSize: 13, lineHeight: 19 }, row: { alignItems: "center", flexDirection: "row", gap: 13, minHeight: 70, paddingHorizontal: 13, paddingVertical: 12 }, rowCopy: { flex: 1, gap: 5 }, rowDetail: { color: colors.textMuted, fontSize: 12, lineHeight: 15 }, rowDisabled: { backgroundColor: "#F5F5F1" }, rowDivider: { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }, rowLabel: { color: colors.text, fontSize: 14, fontWeight: "700" }, rowPressed: { backgroundColor: "#F2F5F0" }, safeArea: { backgroundColor: colors.canvas, flex: 1 }, section: { gap: 5 }, sectionCard: { backgroundColor: colors.surface, borderColor: "#E3E2DD", borderCurve: "continuous", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, boxShadow: "0 2px 2px rgba(23, 32, 27, 0.16)", overflow: "hidden" }, sectionTitle: { color: colors.fairwayDark, fontSize: 12, fontWeight: "800", letterSpacing: 0.3 }, sheet: { backgroundColor: colors.canvas, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, gap: spacing.md, maxHeight: "92%", padding: spacing.lg, paddingBottom: spacing.xl }, sheetButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radius.md, justifyContent: "center", minHeight: 48, paddingHorizontal: spacing.md }, sheetButtonPressed: { backgroundColor: colors.primaryPressed }, sheetButtonText: { color: colors.onPrimary, fontSize: 15, fontWeight: "800" }, sheetContent: { gap: spacing.md, paddingBottom: spacing.sm }, sheetCopy: { color: colors.textMuted, fontSize: 14, lineHeight: 20 }, sheetHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, sheetTitle: { color: colors.text, flex: 1, fontSize: 22, fontWeight: "900", letterSpacing: -0.3 }, subtitle: { color: colors.textMuted, fontSize: 9 }, textDisabled: { color: colors.textMuted }, title: { color: colors.ink, fontSize: 20, fontWeight: "800", letterSpacing: -0.3 }, toggleRow: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", justifyContent: "space-between", minHeight: 56, paddingVertical: spacing.sm }
});
