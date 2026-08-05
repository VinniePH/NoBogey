import { router, Stack } from "expo-router";
import { Pressable, Text } from "react-native";
import { colors } from "@nobogey/ui";

export default function GolferLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.canvas },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.canvas },
        headerTintColor: colors.ink
      }}
    >
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="find-game" options={{ title: "Find a game" }} />
      <Stack.Screen name="courses/all" options={{ title: "All courses" }} />
      <Stack.Screen name="courses/index" options={{ title: "Choose a course" }} />
      <Stack.Screen name="courses/[courseId]" options={{ title: "Course profile" }} />
      <Stack.Screen name="caddies/all" options={{ title: "All caddies" }} />
      <Stack.Screen name="caddies/index" options={{ title: "Available caddies" }} />
      <Stack.Screen name="caddies/[caddieId]" options={{ title: "Caddie profile" }} />
      <Stack.Screen name="bookings/index" options={{ title: "My bookings" }} />
      <Stack.Screen name="bookings/[bookingId]/index" options={{ title: "Booking details" }} />
      <Stack.Screen name="bookings/[bookingId]/rate-caddie" options={{ title: "Rate your caddie" }} />
      <Stack.Screen name="bookings/new/index" options={{ title: "Booking" }} />
      <Stack.Screen name="bookings/new/tee-times" options={{ title: "Choose a tee time" }} />
      <Stack.Screen name="bookings/new/tee-time-confirmation" options={{ title: "Confirm tee time" }} />
      <Stack.Screen name="bookings/new/payment" options={{ title: "Payment" }} />
      <Stack.Screen name="bookings/receipt" options={{ headerShown: false }} />
      <Stack.Screen name="bookings/confirmation" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile"
        options={{
          title: "My Profile",
          headerRight: () => (
            <Pressable
              accessibilityLabel="Open settings"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.push("/golfer/settings")}
              style={{ alignItems: "center", justifyContent: "center", minHeight: 44, minWidth: 44 }}
            >
              <Text style={{ color: colors.fairwayDark, fontSize: 22 }}>⚙</Text>
            </Pressable>
          )
        }}
      />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}
