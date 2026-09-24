import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@nobogey/ui";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { backToPreviousPage } from "../../ui/navigation";
import { TermsAcceptanceModal } from "../legal/TermsAcceptanceModal";
import { useAppSession } from "../session/AppSession";
import { CaddieContactSettings } from "../contact/CaddieContactSettings";
import { loadPreferences, savePreferences } from "../../../backend/users/users.service";
import { useGuidedTour } from "../guided-tour/GuidedTour";

type SettingsRole = "golfer" | "caddie";
type SettingsSheet = "contact" | "deletion" | "notifications" | "payment" | "preferences" | "support";
type SettingsItem = {
  detail: string;
  disabled?: boolean;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress?: () => void;
};

export function SettingsScreen({ role = "golfer" }: { role?: SettingsRole }) {
  const { signOut } = useAppSession();
  const { startTour } = useGuidedTour();
  const [activeSheet, setActiveSheet] = useState<SettingsSheet | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const sections = getSections(role, {
    openSheet: setActiveSheet,
    openTerms: () => setTermsVisible(true),
    restartTour: () => startTour(role)
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
      <TermsAcceptanceModal mode="viewer" onAccept={() => setTermsVisible(false)} onDecline={() => setTermsVisible(false)} visible={termsVisible} />
    </SafeAreaView>
  );
}

function getSections(role: SettingsRole, actions: { openSheet: (sheet: SettingsSheet) => void; openTerms: () => void; restartTour: () => void }): Array<{ title: string; items: SettingsItem[] }> {
  const profilePath = role === "golfer" ? "/golfer/profile" : "/caddie/profile";
  return [
    { title: "ACCOUNT", items: [
      { detail: "Manage your account details", icon: "account-circle-outline" as const, label: "Account Information", onPress: () => router.push(profilePath) },
      ...(role === "caddie" ? [{ detail: "Phone, email address, and sharing", icon: "card-account-phone-outline" as const, label: "Contact Information", onPress: () => actions.openSheet("contact") }] : []),
      { detail: role === "golfer" ? "Preferred courses, language, group size" : "Home course, languages, availability", icon: "calendar-check-outline" as const, label: role === "golfer" ? "Booking Preferences" : "Caddie Preferences", onPress: () => actions.openSheet("preferences") },
      { detail: "Learn how account-deletion requests will work", icon: "account-remove-outline" as const, label: "Delete Account", onPress: () => actions.openSheet("deletion") }
    ] },
    { title: "PAYMENT", items: [
      { detail: role === "golfer" ? "Review local payment setup" : "Review local payout setup", icon: (role === "golfer" ? "credit-card-outline" : "bank-outline") as SettingsItem['icon'], label: role === "golfer" ? "Payment Methods" : "Payout Method", onPress: () => actions.openSheet("payment") }
    ] },
    { title: "PREFERENCES", items: [
      { detail: role === "golfer" ? "Booking alerts and promotions" : "Match alerts and promotions", icon: "bell-outline" as const, label: "Notifications", onPress: () => actions.openSheet("notifications") },
      { detail: "Account controls are not available in this local demo", disabled: true, icon: "lock-outline" as const, label: "Privacy & Security" }
    ] },
    { title: "SUPPORT", items: [
      { detail: "See the main app controls again", icon: "map-marker-path" as const, label: "Replay App Tour", onPress: actions.restartTour },
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
  const [notifications, setNotifications] = useState({ alerts: true, promotions: false });
  useEffect(() => { void loadPreferences<{ notifications?: typeof notifications }>().then((value) => value?.notifications && setNotifications(value.notifications)).catch(() => undefined); }, []);
  const title = sheet === "contact" ? "Contact information" : sheet === "deletion" ? "Delete account" : sheet === "preferences" ? (role === "golfer" ? "Booking preferences" : "Caddie preferences") : sheet === "payment" ? (role === "golfer" ? "Payment methods" : "Payout method") : sheet === "notifications" ? "Notifications" : "Help & support";
  const icon = sheet === "contact" ? "card-account-phone-outline" : sheet === "deletion" ? "account-remove-outline" : sheet === "preferences" ? "tune-variant" : sheet === "payment" ? (role === "golfer" ? "credit-card-outline" : "bank-outline") : sheet === "notifications" ? "bell-outline" : "help-circle-outline";
  return <Modal animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet" transparent visible={sheet !== null}><View style={styles.backdrop}><Pressable accessibilityLabel={`Close ${title}`} accessibilityRole="button" onPress={onClose} style={StyleSheet.absoluteFill} /><View accessibilityViewIsModal style={styles.sheet}><View style={styles.sheetHandle} /><View style={styles.sheetHeader}><View style={styles.sheetTitleRow}><View style={styles.sheetIcon}><MaterialCommunityIcons color={colors.fairwayDark} name={icon} size={21} /></View><Text accessibilityRole="header" style={styles.sheetTitle}>{title}</Text></View><Pressable accessibilityLabel={`Close ${title}`} accessibilityRole="button" hitSlop={8} onPress={onClose} style={styles.closeButton}><MaterialCommunityIcons color={colors.fairwayDark} name="close" size={22} /></Pressable></View><ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator>{sheet === "contact" && role === "caddie" ? <CaddieContactSettings /> : null}{sheet === "deletion" ? <AccountDeletionContent /> : null}{sheet === "preferences" ? <PreferenceContent role={role} /> : null}{sheet === "payment" ? <PaymentContent role={role} /> : null}{sheet === "notifications" ? <NotificationContent notifications={notifications} setNotifications={setNotifications} /> : null}{sheet === "support" ? <SupportContent /> : null}</ScrollView><Pressable accessibilityLabel={`Close ${title}`} accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.sheetButton, pressed && styles.sheetButtonPressed]}><Text style={styles.sheetButtonText}>Done</Text></Pressable></View></View></Modal>;
}

function PreferenceContent({ role }: { role: SettingsRole }) { const entries = role === "golfer" ? [["Preferred courses", "Coming soon"], ["Language", "English"], ["Group size", "Coming soon"]] : [["Home course", "Set from profile"], ["Languages", "English"], ["Availability", "Coming soon"]]; return <><Text style={styles.sheetCopy}>These preferences will be available when account settings are connected.</Text><View style={styles.contentCard}>{entries.map(([label, value], index) => <View key={label} style={[styles.infoRow, index === 0 && styles.firstInfoRow]}><Text style={styles.infoLabel}>{label}</Text><Text selectable style={[styles.infoValue, value === "Coming soon" && styles.comingSoon]}>{value}</Text></View>)}</View></>; }
function PaymentContent({ role }: { role: SettingsRole }) { const noun = role === "golfer" ? "payment method" : "payout method"; return <View style={styles.emptySheet}><View style={styles.emptyIcon}><MaterialCommunityIcons color={colors.fairwayDark} name={role === "golfer" ? "credit-card-outline" : "bank-outline"} size={28} /></View><Text style={styles.emptyTitle}>No {noun} yet</Text><Text style={styles.emptyCopy}>{role === "golfer" ? "You will choose payment during a booking when payment methods are available." : "Payout setup will be available after account verification and club approval."}</Text><View style={styles.comingSoonPill}><Text style={styles.comingSoonText}>Coming soon</Text></View></View>; }
function NotificationContent({ notifications, setNotifications }: { notifications: { alerts: boolean; promotions: boolean }; setNotifications: Dispatch<SetStateAction<{ alerts: boolean; promotions: boolean }>> }) { const [saveState, setSaveState] = useState<"idle" | "saved">("idle"); const update = (key: "alerts"|"promotions", value: boolean) => setNotifications((current) => { const next={...current,[key]:value}; void savePreferences({ notifications: next }).then(() => { setSaveState("saved"); setTimeout(() => setSaveState("idle"), 1800); }).catch(() => undefined); return next; }); return <><Text style={styles.sheetCopy}>Choose which updates NoBogey sends to your account.</Text><View style={styles.contentCard}>{([['alerts', 'Booking or match alerts', 'Changes to your current bookings'], ['promotions', 'Promotions', 'News and offers from NoBogey']] as const).map(([key, label, detail], index) => <View key={key} style={[styles.toggleRow, index === 0 && styles.firstInfoRow]}><View style={styles.toggleCopy}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.toggleDetail}>{detail}</Text></View><Switch accessibilityLabel={label} accessibilityRole="switch" onValueChange={(value) => update(key,value)} trackColor={{ false: colors.border, true: colors.primary }} value={notifications[key]} /></View>)}</View>{saveState === "saved" ? <Text accessibilityLiveRegion="polite" style={styles.savedText}>Saved</Text> : null}</>; }
function SupportContent() { const [subject, setSubject] = useState(""); const [query, setQuery] = useState(""); const sendQuery = () => { const body = query.trim(); if (!body) return; void Linking.openURL(`mailto:nobogeyofficial@gmail.com?subject=${encodeURIComponent(subject.trim() || "NoBogey support enquiry")}&body=${encodeURIComponent(body)}`); }; return <><Text style={styles.sheetCopy}>Send a question about bookings, payments, privacy, or your account.</Text><View style={styles.supportForm}><View style={styles.field}><Text style={styles.infoLabel}>Subject</Text><TextInput accessibilityLabel="Support query subject" onChangeText={setSubject} placeholder="What can we help with?" placeholderTextColor={colors.textMuted} style={styles.input} value={subject} /></View><View style={styles.field}><Text style={styles.infoLabel}>Your message</Text><TextInput accessibilityLabel="Support query" multiline onChangeText={setQuery} placeholder="Tell us more about your question." placeholderTextColor={colors.textMuted} style={[styles.input, styles.messageInput]} value={query} /></View><Pressable accessibilityHint="Opens your email app with this query" accessibilityLabel="Email support" accessibilityRole="button" accessibilityState={{ disabled: !query.trim() }} disabled={!query.trim()} onPress={sendQuery} style={({ pressed }) => [styles.emailButton, !query.trim() && styles.emailButtonDisabled, pressed && query.trim() && styles.sheetButtonPressed]}><Text style={styles.sheetButtonText}>Email support</Text></Pressable></View><Pressable accessibilityHint="Opens your email app" accessibilityLabel="Email NoBogey support" accessibilityRole="link" onPress={() => void Linking.openURL("mailto:nobogeyofficial@gmail.com")} style={({ pressed }) => [styles.supportContact, pressed && styles.supportContactPressed]}><MaterialCommunityIcons color={colors.fairwayDark} name="email-outline" size={22} /><View style={styles.supportContactCopy}><Text style={styles.supportContactLabel}>NoBogey support</Text><Text selectable style={styles.supportContactEmail}>nobogeyofficial@gmail.com</Text></View></Pressable></>; }
function AccountDeletionContent() { const requestDeletion = () => void Linking.openURL("mailto:nobogeyofficial@gmail.com?subject=NoBogey%20account%20deletion%20request"); return <><View style={styles.deleteNotice}><MaterialCommunityIcons color="#A34646" name="alert-circle-outline" size={24} /><View style={styles.noticeCopy}><Text style={styles.deleteTitle}>Request account deletion</Text><Text style={styles.noticeText}>This does not delete your account immediately. We will confirm your request and explain any required verification or retention period.</Text></View></View><Pressable accessibilityHint="Opens your email app" accessibilityLabel="Email account deletion request" accessibilityRole="button" onPress={requestDeletion} style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonPressed]}><Text style={styles.deleteButtonText}>Email deletion request</Text><MaterialCommunityIcons color="#A34646" name="arrow-right" size={18} /></Pressable></>; }

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(8, 20, 12, 0.42)", flex: 1, justifyContent: "flex-end" }, backButton: { alignItems: "center", justifyContent: "center", minHeight: 44, minWidth: 44 }, closeButton: { alignItems: "center", backgroundColor: "#EAF3EB", borderRadius: 99, height: 40, justifyContent: "center", width: 40 }, comingSoon: { color: colors.fairwayDark, fontWeight: "800" }, comingSoonPill: { alignSelf: "center", backgroundColor: "#E2F0E4", borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 }, comingSoonText: { color: colors.fairwayDark, fontSize: 11, fontWeight: "800", textTransform: "uppercase" }, content: { gap: 19, padding: 19, paddingBottom: 29 }, contentCard: { backgroundColor: colors.surface, borderColor: "#E1E5DE", borderCurve: "continuous", borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" }, deleteButton: { alignItems: "center", backgroundColor: "#FFF5F4", borderColor: "#E4B9B5", borderRadius: 10, borderWidth: 1, flexDirection: "row", justifyContent: "center", gap: spacing.sm, minHeight: 50, paddingHorizontal: spacing.md }, deleteButtonPressed: { backgroundColor: "#FDE9E7" }, deleteButtonText: { color: "#A34646", fontSize: 15, fontWeight: "800" }, deleteNotice: { alignItems: "flex-start", backgroundColor: "#FFF7F5", borderRadius: 12, flexDirection: "row", gap: spacing.sm, padding: spacing.md }, deleteTitle: { color: "#8F3737", fontSize: 15, fontWeight: "800" }, emailButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, justifyContent: "center", minHeight: 50, paddingHorizontal: spacing.md }, emailButtonDisabled: { backgroundColor: colors.textMuted }, emptyCopy: { color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: "center" }, emptyIcon: { alignItems: "center", backgroundColor: "#E2F0E4", borderRadius: 99, height: 60, justifyContent: "center", width: 60 }, emptySheet: { alignItems: "center", backgroundColor: "#F4F8F4", borderRadius: 14, gap: spacing.sm, padding: spacing.xl }, emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "800" }, field: { gap: 6 }, firstInfoRow: { borderTopWidth: 0 }, frame: { gap: 19 }, header: { alignItems: "center", flexDirection: "row", minHeight: 44 }, headerCopy: { alignItems: "center", flex: 1, gap: 1 }, headerSpacer: { minWidth: 44 }, infoLabel: { color: colors.text, fontSize: 14, fontWeight: "800" }, infoRow: { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, gap: 4, padding: spacing.md }, infoValue: { color: colors.textMuted, fontSize: 13, lineHeight: 18 }, input: { backgroundColor: colors.surface, borderColor: colors.border, borderCurve: "continuous", borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, color: colors.text, fontSize: 14, minHeight: 50, paddingHorizontal: spacing.md }, logoutCard: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderCurve: "continuous", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 13, marginTop: 10, minHeight: 67, paddingHorizontal: 14 }, logoutDisabled: { opacity: 0.65 }, logoutPressed: { backgroundColor: "#FFF2F2" }, logoutText: { color: colors.accent, flex: 1, fontSize: 15, fontWeight: "700" }, messageInput: { minHeight: 124, paddingTop: spacing.md, textAlignVertical: "top" }, notice: { alignItems: "flex-start", backgroundColor: "#E7EEE9", borderRadius: radius.md, flexDirection: "row", gap: spacing.sm, padding: spacing.md }, noticeCopy: { flex: 1, gap: 5 }, noticeText: { color: colors.text, flex: 1, fontSize: 13, lineHeight: 19 }, row: { alignItems: "center", flexDirection: "row", gap: 13, minHeight: 70, paddingHorizontal: 13, paddingVertical: 12 }, rowCopy: { flex: 1, gap: 5 }, rowDetail: { color: colors.textMuted, fontSize: 12, lineHeight: 15 }, rowDisabled: { backgroundColor: "#F5F5F1" }, rowDivider: { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }, rowLabel: { color: colors.text, fontSize: 14, fontWeight: "700" }, rowPressed: { backgroundColor: "#F2F5F0" }, safeArea: { backgroundColor: colors.canvas, flex: 1 }, savedText: { color: colors.fairwayDark, fontSize: 13, fontWeight: "800", textAlign: "center" }, section: { gap: 5 }, sectionCard: { backgroundColor: colors.surface, borderColor: "#E3E2DD", borderCurve: "continuous", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, boxShadow: "0 2px 2px rgba(23, 32, 27, 0.16)", overflow: "hidden" }, sectionTitle: { color: colors.fairwayDark, fontSize: 12, fontWeight: "800", letterSpacing: 0.3 }, sheet: { backgroundColor: colors.canvas, borderTopLeftRadius: 22, borderTopRightRadius: 22, gap: spacing.md, maxHeight: "92%", padding: spacing.lg, paddingBottom: spacing.xl }, sheetButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, justifyContent: "center", minHeight: 50, paddingHorizontal: spacing.md }, sheetButtonPressed: { backgroundColor: colors.primaryPressed }, sheetButtonText: { color: colors.onPrimary, fontSize: 15, fontWeight: "800" }, sheetContent: { gap: spacing.md, paddingBottom: spacing.sm }, sheetCopy: { color: colors.textMuted, fontSize: 14, lineHeight: 20 }, sheetHandle: { alignSelf: "center", backgroundColor: "#C9CDCA", borderRadius: 99, height: 4, marginTop: -spacing.xs, width: 46 }, sheetHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, sheetIcon: { alignItems: "center", backgroundColor: "#E2F0E4", borderRadius: 10, height: 40, justifyContent: "center", width: 40 }, sheetTitle: { color: colors.text, fontSize: 21, fontWeight: "800", letterSpacing: -0.3 }, sheetTitleRow: { alignItems: "center", flex: 1, flexDirection: "row", gap: spacing.sm }, subtitle: { color: colors.textMuted, fontSize: 9 }, supportContact: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderCurve: "continuous", borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: spacing.sm, minHeight: 70, padding: spacing.md }, supportContactCopy: { flex: 1, gap: 3 }, supportContactEmail: { color: colors.primary, fontSize: 14, fontWeight: "800" }, supportContactLabel: { color: colors.text, fontSize: 13, fontWeight: "800" }, supportContactPressed: { opacity: 0.72 }, supportForm: { gap: spacing.md }, textDisabled: { color: colors.textMuted }, title: { color: colors.ink, fontSize: 20, fontWeight: "800", letterSpacing: -0.3 }, toggleCopy: { flex: 1, gap: 3, paddingRight: spacing.md }, toggleDetail: { color: colors.textMuted, fontSize: 12, lineHeight: 17 }, toggleRow: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", justifyContent: "space-between", minHeight: 70, padding: spacing.md }
});
