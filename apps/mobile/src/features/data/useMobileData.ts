import type { Booking, Caddie, GolfCourse, TeeTimeSlot } from "@nobogey/contracts";
import { useEffect, useState } from "react";
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
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    void Promise.allSettled([
      mobileDataService.listBookings(),
      mobileDataService.listCaddies(),
      mobileDataService.listCourses(),
    ]).then(([bookings, caddies, courses]) => {
      if (active) setData({
        bookings: bookings.status === "fulfilled" ? bookings.value : [],
        caddies: caddies.status === "fulfilled" ? caddies.value : [],
        courses: courses.status === "fulfilled" ? courses.value : [],
        teeTimes: []
      });
    });
    const { data: listener } = getSupabaseClient().auth.onAuthStateChange((event) => { if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") setReloadToken(value => value + 1); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [reloadToken]);

  return { ...data, refresh: () => setReloadToken((value) => value + 1) };
}
