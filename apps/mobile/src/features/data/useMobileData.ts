import type { Booking, Caddie, GolfCourse, TeeTimeSlot } from "@nobogey/contracts";
import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { mobileDataService } from "../../../backend/mock.service";
import { getSupabaseClient } from "../../../backend/client";

type MobileData = {
  bookings: Booking[];
  caddies: Caddie[];
  courses: GolfCourse[];
  teeTimes: TeeTimeSlot[];
};

const emptyData: MobileData = { bookings: [], caddies: [], courses: [], teeTimes: [] };

/** Reads the app's data seam without allowing feature UI to reach into fixtures. */
export function useMobileData() {
  const [data, setData] = useState<MobileData>(emptyData);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const channelName = useRef(`mobile-data-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void Promise.allSettled([
      mobileDataService.listBookings(),
      mobileDataService.listCaddies(),
      mobileDataService.listCourses(),
    ]).then(([bookings, caddies, courses]) => {
      if (active) {
        setData({
          bookings: bookings.status === "fulfilled" ? bookings.value : [],
          caddies: caddies.status === "fulfilled" ? caddies.value : [],
          courses: courses.status === "fulfilled" ? courses.value : [],
          teeTimes: []
        });
        setIsLoading(false);
      }
    });
    return () => { active = false; };
  }, [reloadToken]);

  useEffect(() => {
    const client = getSupabaseClient();
    const refresh = () => setReloadToken((value) => value + 1);
    const { data: listener } = client.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") refresh();
    });
    const channel = client.channel(channelName.current)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "tee_times" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "caddie_tee_time_availability" }, refresh)
      .subscribe();
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });

    return () => {
      listener.subscription.unsubscribe();
      appState.remove();
      void client.removeChannel(channel);
    };
  }, []);

  return { ...data, isLoading, refresh: () => setReloadToken((value) => value + 1) };
}
