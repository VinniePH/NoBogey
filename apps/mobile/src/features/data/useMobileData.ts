import type { Booking, Caddie, GolfCourse, TeeTimeSlot } from "@nobogey/contracts";
import { useEffect, useState } from "react";
import { mobileDataService } from "../../../backend/mock.service";

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

  useEffect(() => {
    let active = true;
    void Promise.all([
      mobileDataService.listBookings(),
      mobileDataService.listCaddies(),
      mobileDataService.listCourses(),
    ]).then(([bookings, caddies, courses]) => {
      if (active) setData({ bookings, caddies, courses, teeTimes: [] });
    }).catch(() => {
      if (active) setData(emptyData);
    });
    return () => { active = false; };
  }, []);

  return data;
}
