import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing } from "@nobogey/ui";

type MobileNavigationTab = "bookings" | "caddies" | "home" | "profile";

export function MobileBottomNavigation({ active }: { active: MobileNavigationTab }) {
  return <View accessibilityRole="tablist" style={styles.navigation}>
    <NavigationTab active={active === "home"} icon="home" label="Home" onPress={() => router.replace("/golfer/home")} />
    <NavigationTab active={active === "bookings"} icon="calendar" label="Bookings" onPress={() => router.replace("/golfer/bookings")} />
    <Pressable accessibilityLabel="Find a Game" accessibilityRole="button" onPress={() => router.push("/golfer/find-game")} style={styles.primaryAction}><GolfBallIcon /></Pressable>
    <NavigationTab active={active === "caddies"} icon="people" label="Caddies" onPress={() => router.replace("/golfer/caddies")} />
    <NavigationTab active={active === "profile"} icon="person-circle-outline" label="Profile" onPress={() => router.replace("/golfer/profile")} />
  </View>;
}

function NavigationTab({ active, icon, label, onPress }: { active: boolean; icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return <Pressable accessibilityLabel={label} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={styles.item}><View style={[styles.icon, active && styles.iconActive]}><Ionicons color={active ? "#17432E" : "#64645E"} name={icon} size={22} /></View><Text style={[styles.label, active && styles.labelActive]}>{label}</Text></Pressable>;
}

function GolfBallIcon() { return <View style={styles.golfBall}><View style={[styles.golfDot, styles.golfDotOne]} /><View style={[styles.golfDot, styles.golfDotTwo]} /><View style={[styles.golfDot, styles.golfDotThree]} /><View style={[styles.golfDot, styles.golfDotFour]} /><View style={[styles.golfDot, styles.golfDotFive]} /></View>; }

const styles = StyleSheet.create({
  golfBall: { alignItems: "center", borderColor: "#D9B957", borderRadius: 16, borderWidth: 2, height: 32, justifyContent: "center", width: 32 },
  golfDot: { backgroundColor: "#D9B957", borderRadius: 2, height: 4, position: "absolute", width: 4 },
  golfDotFive: { bottom: 7, left: 13 }, golfDotFour: { bottom: 10, right: 6 }, golfDotOne: { left: 7, top: 8 }, golfDotThree: { right: 7, top: 8 }, golfDotTwo: { left: 14, top: 5 },
  icon: { alignItems: "center", borderRadius: 18, height: 36, justifyContent: "center", width: 36 }, iconActive: { backgroundColor: "#E6E8E5" },
  item: { alignItems: "center", flex: 1, gap: 1, justifyContent: "center", minHeight: 58 },
  label: { color: "#64645E", fontSize: 11, fontWeight: "500" }, labelActive: { color: "#17432E", fontWeight: "700" },
  navigation: { alignItems: "center", backgroundColor: "#FFFEFB", borderTopColor: "#D8D7D0", borderTopWidth: StyleSheet.hairlineWidth, bottom: 0, flexDirection: "row", justifyContent: "space-around", left: 0, minHeight: 72, paddingHorizontal: spacing.sm, paddingTop: spacing.xs, position: "absolute", right: 0 },
  primaryAction: { alignItems: "center", backgroundColor: "#FFFEFB", borderColor: "#17432E", borderRadius: 34, borderWidth: 3, height: 68, justifyContent: "center", marginTop: -30, width: 68 }
});
