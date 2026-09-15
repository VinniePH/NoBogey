import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@nobogey/ui";
import NoBogeyLogo from "../../../../../assets/logo/NoBogey-Logo.png";
import SplashLogo from "../../../../../assets/logo/splash-logo-1024x1024.png";
import { Button } from "../../ui/primitives";
import { backToPreviousPage } from "../../ui/navigation";
import { TermsAcceptanceModal } from "../legal/TermsAcceptanceModal";
import { useAppSession, type AppRole } from "../session/AppSession";
import { ResponsiveContent } from "../../ui/ResponsiveContent";

type Mode = "login" | "register";

export function SplashScreen() {
  const [logoFailed, setLogoFailed] = useState(false);
  const [activeBall, setActiveBall] = useState(0);
  const { initialRole, isHydrated } = useAppSession();
  useEffect(() => {
    const interval = setInterval(() => setActiveBall((current) => (current + 1) % 4), 280);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!isHydrated) return;
    const timeout = setTimeout(() => {
      if (initialRole === "golfer") { router.replace("/golfer/home"); return; }
      if (initialRole === "caddie") { router.replace("/caddie/onboarding"); return; }
      router.replace("/onboarding");
    }, 1400);
    return () => clearTimeout(timeout);
  }, [initialRole, isHydrated]);

  return <SafeAreaView edges={["top", "bottom"]} style={styles.splash}><ResponsiveContent style={styles.splashContent}><View style={styles.splashBrand}><View style={styles.logoFrame}>{logoFailed ? <Text accessibilityRole="image" style={styles.logoFallback}>NB</Text> : <Image accessibilityLabel="NoBogey golfer and caddie logo" onError={() => setLogoFailed(true)} resizeMode="contain" source={SplashLogo} style={styles.logo} />}</View><Text accessibilityRole="header" style={styles.splashWordmark}>NoBogey</Text></View><GolfLoadingIndicator activeBall={activeBall} /></ResponsiveContent></SafeAreaView>;
}

function GolfLoadingIndicator({ activeBall }: { activeBall: number }) { return <View accessibilityLabel="Golf loading" accessibilityRole="progressbar" style={styles.loading}><Text style={styles.loadingLabel}>GOLF</Text><View style={styles.loadingTrack}>{[0, 1, 2, 3].map((ball) => <View key={ball} style={[styles.loadingBall, ball === activeBall && styles.loadingBallActive]}><View style={styles.loadingBallDimple} /></View>)}</View><Text style={styles.loadingLabel}>LOADING</Text></View>; }

export function OnboardingScreen() {
  const { selectInitialRole } = useAppSession();
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const choose = (role: AppRole) => {
    setSelectedRole(role);
  };
  const startRegistration = () => {
    if (selectedRole === "golfer") {
      router.replace({ pathname: "/sign-in", params: { mode: "register", role: "golfer" } });
      return;
    }
    selectInitialRole("caddie");
    router.replace("/caddie/onboarding");
  };
  const roleName = selectedRole === "caddie" ? "caddie" : "golfer";
  return <SafeAreaView edges={["top", "bottom"]} style={styles.authSafe}><ScrollView contentContainerStyle={[styles.authContent, styles.onboardingContent]} contentInsetAdjustmentBehavior="automatic"><Image accessibilityLabel="NoBogey logo" resizeMode="contain" source={NoBogeyLogo} style={[styles.authLogo, styles.onboardingLogo]} />{selectedRole ? <><View style={styles.authHeader}><Text accessibilityRole="header" style={styles.authTitle}>Continue as a {roleName}?</Text><Text style={styles.authSubtitle}>Are you new to NoBogey, or do you already have an account?</Text></View><Button accessibilityLabel={`I’m new to NoBogey as a ${roleName}`} onPress={startRegistration}>I’m new here</Button><Pressable accessibilityLabel={`I already have a ${roleName} account`} accessibilityRole="button" onPress={() => router.replace({ pathname: "/sign-in", params: { role: selectedRole } })} style={styles.existingAccountButton}><Text style={styles.existingAccountText}>I already have an account</Text></Pressable><Pressable accessibilityLabel="Choose a different role" accessibilityRole="button" onPress={() => setSelectedRole(null)}><Text style={styles.secondaryLink}>Choose a different role</Text></Pressable></> : <><View style={styles.authHeader}><Text accessibilityRole="header" style={styles.authTitle}>How do you play?</Text><Text style={styles.authSubtitle}>Choose the role you use most. It stays selected on this phone.</Text></View><RoleChoice description="Browse tee times and caddies before creating an account." icon="⛳" label="I’m a golfer" onPress={() => choose("golfer")} /><RoleChoice description="Create a professional profile for verification by your home club." icon="🏌️" label="I’m a caddie" onPress={() => choose("caddie")} /></>}<Text style={styles.placeholderNote}>Golfers can add a caddie identity later from Profile.</Text></ScrollView></SafeAreaView>;
}

function _LegacyAuthScreen() {
  const params = useLocalSearchParams<{ mode?: Mode; role?: AppRole; returnTo?: string; caddieId?: string; courseId?: string; teeTimeId?: string; time?: string }>();
  const [mode, setMode] = useState<Mode>(params.mode === "register" ? "register" : "login");
  const [role] = useState<AppRole>(params.role === "caddie" ? "caddie" : "golfer");
  const [termsVisible, setTermsVisible] = useState(false);
  const { selectInitialRole, signInAs } = useAppSession();
  const completeSignIn = () => {
    selectInitialRole(role);
    signInAs(role);
    if (role === "caddie") {
      // This device-local role choice is not authentication or authorization.
      router.replace("/caddie/dashboard");
      return;
    }
    if (params.returnTo === "/golfer/caddies") {
      router.replace({ pathname: "/golfer/caddies", params: { caddieId: params.caddieId, courseId: params.courseId, teeTimeId: params.teeTimeId, time: params.time } });
      return;
    }
    router.replace("/golfer/home");
  };
  const submit = () => {
    if (role === "golfer" && mode === "register") {
      setTermsVisible(true);
      return;
    }
    completeSignIn();
  };
  const submitLabel = mode === "login" ? "Log in" : `Create ${role} account`;
  const caddieRegistration = role === "caddie" && mode === "register";
  return <SafeAreaView edges={["top", "bottom"]} style={styles.authSafe}><ScrollView contentContainerStyle={styles.authContent} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled"><View style={styles.authHeader}><Image accessibilityLabel="NoBogey logo" resizeMode="contain" source={NoBogeyLogo} style={styles.authLogo} /><Text accessibilityRole="header" style={styles.authTitle}>{mode === "login" ? "Welcome back." : "Join the fairway."}</Text><Text style={styles.authSubtitle}>{role === "caddie" ? "Create your professional profile, then submit it to your home club for verification." : "Create an account only when you’re ready to pay."}</Text></View><View style={styles.modeTabs}><Tab active={mode === "login"} label="Log in" onPress={() => setMode("login")} /><Tab active={mode === "register"} label="Create account" onPress={() => { if (role === "caddie") { selectInitialRole("caddie"); router.replace("/caddie/onboarding"); return; } setMode("register"); }} /></View>{caddieRegistration ? <View style={styles.roleGroup}><Text style={styles.fieldLabel}>Caddie registration is part of your professional profile</Text><Text style={styles.placeholderNote}>Continue to enter your account details, select your home club, and submit your profile for verification.</Text><Button accessibilityLabel="Start caddie onboarding" onPress={() => { selectInitialRole("caddie"); router.replace("/caddie/onboarding"); }}>Start caddie onboarding</Button></View> : <View style={styles.form}>{mode === "register" && <Field label="Full name" placeholder="Enter your full name" />}<Field autoCapitalize="none" keyboardType="email-address" label="Email address" placeholder="Enter your email address" /><Field label="Password" placeholder="Enter your password" secureTextEntry /><Button accessibilityLabel={submitLabel} onPress={submit}>{submitLabel}</Button></View>}<Pressable accessibilityLabel="Return to role selection" accessibilityRole="button" onPress={() => backToPreviousPage("/onboarding")}><Text style={styles.secondaryLink}>Back to role selection</Text></Pressable></ScrollView><TermsAcceptanceModal onAccept={() => { setTermsVisible(false); completeSignIn(); }} onDecline={() => setTermsVisible(false)} visible={termsVisible} /></SafeAreaView>;
}

function Field({ label, ...inputProps }: { label: string } & React.ComponentProps<typeof TextInput>) { return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor="#788179" style={styles.input} {...inputProps} /></View>; }
function Tab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) { return <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.modeTab, active && styles.modeTabActive]}><Text style={[styles.modeTabText, active && styles.modeTabTextActive]}>{label}</Text></Pressable>; }
function RoleChoice({ description, icon, label, onPress }: { description: string; icon: string; label: string; onPress: () => void }) { return <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={styles.roleTab}><Text style={styles.roleIcon}>{icon}</Text><View style={styles.roleCopy}><Text style={styles.roleTitle}>{label}</Text><Text style={styles.roleDescription}>{description}</Text></View><Text style={styles.arrow}>›</Text></Pressable>; }

const styles = StyleSheet.create({
  existingAccountButton: { alignItems: "center", borderColor: colors.primary, borderCurve: "continuous", borderRadius: 12, borderWidth: 1, justifyContent: "center", minHeight: 52, paddingHorizontal: 18 },
  existingAccountText: { color: colors.primary, fontSize: 16, fontWeight: "800" },
  onboardingContent: { flexGrow: 1, justifyContent: "center" },
  onboardingLogo: { height: 100, width: 100 },
  arrow: { color: colors.primary, fontSize: 30 }, authContent: { gap: spacing.xl, padding: spacing.xl, paddingTop: 48 }, authHeader: { gap: spacing.sm }, authLogo: { height: 48, width: 48 }, authSafe: { backgroundColor: "#FAF9F6", flex: 1 }, authSubtitle: { color: "#617067", fontSize: 16, lineHeight: 23 }, authTitle: { color: "#143B2A", fontSize: 34, fontWeight: "900", letterSpacing: -1 }, field: { gap: 7 }, fieldLabel: { color: "#416052", fontSize: 13, fontWeight: "800" }, form: { gap: spacing.lg }, input: { backgroundColor: "#FFFFFF", borderColor: "#CBD4CC", borderCurve: "continuous", borderRadius: 12, borderWidth: 1, color: "#16231C", fontSize: 16, minHeight: 52, paddingHorizontal: 14 }, loading: { alignItems: "center", gap: 8 }, loadingBall: { alignItems: "center", backgroundColor: "#174B32", borderColor: "#F6E9C9", borderRadius: 12, borderWidth: 2, height: 24, justifyContent: "center", width: 24 }, loadingBallActive: { backgroundColor: "#F6E9C9", transform: [{ scale: 1.12 }] }, loadingBallDimple: { borderColor: "#F6E9C9", borderRadius: 4, borderWidth: 1, height: 7, width: 7 }, loadingLabel: { color: "#F6E9C9", fontSize: 10, fontWeight: "900", letterSpacing: 2 }, loadingTrack: { alignItems: "center", borderColor: "#F6E9C9", borderCurve: "continuous", borderRadius: 20, borderWidth: 2, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 44, paddingHorizontal: 12 }, logo: { height: "100%", width: "100%" }, logoFallback: { color: "#F6E9C9", fontSize: 28, fontWeight: "900" }, logoFrame: { alignItems: "center", height: 196, justifyContent: "center", width: 196 }, modeTab: { alignItems: "center", borderRadius: 10, flex: 1, justifyContent: "center", minHeight: 44 }, modeTabActive: { backgroundColor: "#FFFFFF" }, modeTabText: { color: "#68756C", fontSize: 15, fontWeight: "700" }, modeTabTextActive: { color: "#174B32" }, modeTabs: { backgroundColor: "#E4EAE4", borderRadius: 12, flexDirection: "row", padding: 4 }, placeholderNote: { color: "#6A706B", fontSize: 12, lineHeight: 18, textAlign: "center" }, roleCopy: { flex: 1, gap: 3 }, roleDescription: { color: "#647067", fontSize: 13, lineHeight: 18 }, roleGroup: { gap: spacing.sm }, roleIcon: { fontSize: 25 }, roleTab: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#CBD4CC", borderCurve: "continuous", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 12, padding: 16 }, roleTitle: { color: "#173D2C", fontSize: 17, fontWeight: "800" }, secondaryLink: { color: "#1C5E3E", fontSize: 15, fontWeight: "800", textAlign: "center" }, splash: { backgroundColor: "#174B32", flex: 1 }, splashBrand: { alignItems: "center", gap: 10 }, splashContent: { alignItems: "center", flex: 1, gap: 18, justifyContent: "center", padding: spacing.xl }, splashWordmark: { color: "#F6E9C9", fontSize: 25, fontWeight: "900", letterSpacing: -0.6 }
});

export { AuthScreen } from './AuthScreen';
