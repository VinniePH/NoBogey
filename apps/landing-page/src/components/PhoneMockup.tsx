import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Heart,
  MapPin,
  Search,
  Star
} from "lucide-react";
import type { PropsWithChildren, ReactNode } from "react";

type PhoneShellProps = PropsWithChildren<{
  className?: string;
  screenLabel: string;
}>;

export function PhoneShell({ children, className = "", screenLabel }: PhoneShellProps) {
  return (
    <div className={`phone-shell ${className}`} aria-label={screenLabel} role="img">
      <div className="phone-speaker" />
      <div className="phone-screen">{children}</div>
    </div>
  );
}

function PhoneTop({ title, back = false, action }: { title: string; back?: boolean; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 pt-4">
      <span className="grid size-7 place-items-center">
        {back ? <ArrowLeft size={14} /> : <span className="size-6 rounded-full bg-forest/10" />}
      </span>
      <span className="text-[10px] font-semibold tracking-[-0.02em]">{title}</span>
      <span className="grid size-7 place-items-center">{action}</span>
    </div>
  );
}

export function DiscoveryScreen() {
  return (
    <div className="min-h-full bg-[#f8f6f0] text-[#17201b]">
      <div className="px-4 pb-3 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[7px] font-medium uppercase tracking-[0.14em] text-[#77766f]">Good morning</p>
            <p className="mt-0.5 text-[14px] font-semibold tracking-[-0.04em]">Ready for a round?</p>
          </div>
          <div className="grid size-8 place-items-center rounded-full bg-[#173f35] text-[8px] font-semibold text-white">AG</div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#e5e1d8] bg-white px-3 py-2 text-[8px] text-[#77766f] shadow-sm">
          <Search size={10} /> Search courses or locations
        </div>
      </div>
      <div className="px-4">
        <div className="relative h-28 overflow-hidden rounded-2xl">
          <img className="size-full object-cover" src="/images/course-valley.jpg" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10261f]/75 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3 text-white">
            <p className="text-[7px] uppercase tracking-[0.14em] text-white/75">Featured course</p>
            <p className="mt-0.5 text-[10px] font-semibold">Valley Golf &amp; Country Club</p>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold">Courses near you</p>
            <p className="text-[7px] text-[#77766f]">Worth the early start</p>
          </div>
          <ChevronRight size={13} className="text-[#173f35]" />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {["/images/course-southwoods.jpg", "/images/course-wackwack.jpg"].map((image, index) => (
            <div key={image} className="overflow-hidden rounded-xl bg-white shadow-sm">
              <img className="h-16 w-full object-cover" src={image} alt="" />
              <div className="p-2">
                <p className="line-clamp-1 text-[7px] font-semibold">{index === 0 ? "Manila Southwoods" : "Wack Wack Golf Club"}</p>
                <p className="mt-0.5 text-[6px] text-[#77766f]">18 holes · Championship</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] font-semibold">Caddies to know</p>
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-white p-2 shadow-sm">
          <div className="size-8 overflow-hidden rounded-full bg-[#d7dfd8]">
            <img className="size-full object-cover object-[72%_center]" src="/images/golf-lifestyle.jpg" alt="" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] font-semibold">Miguel Santos</p>
            <p className="text-[6px] text-[#77766f]">Course strategy · Green reading</p>
          </div>
          <div className="flex items-center gap-0.5 text-[7px] font-semibold"><Star size={7} fill="#173f35" /> 4.9</div>
        </div>
      </div>
    </div>
  );
}

export function CourseDetailScreen() {
  return (
    <div className="min-h-full bg-[#f8f6f0] text-[#17201b]">
      <div className="relative h-40 overflow-hidden">
        <img className="size-full object-cover" src="/images/course-southwoods.jpg" alt="" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-white">
          <span className="grid size-7 place-items-center rounded-full bg-black/20 backdrop-blur"><ArrowLeft size={13} /></span>
          <span className="grid size-7 place-items-center rounded-full bg-black/20 backdrop-blur"><Heart size={12} /></span>
        </div>
      </div>
      <div className="-mt-4 min-h-72 rounded-t-[22px] bg-[#f8f6f0] px-4 pt-5">
        <p className="text-[13px] font-semibold leading-tight tracking-[-0.03em]">Manila Southwoods Golf &amp; Country Club</p>
        <p className="mt-1 flex items-center gap-1 text-[7px] text-[#77766f]"><MapPin size={8} /> Carmona, Cavite</p>
        <div className="mt-4 grid grid-cols-3 rounded-xl border border-[#e5e1d8] bg-white py-3 text-center">
          <div><p className="text-[9px] font-semibold">18</p><p className="text-[6px] text-[#77766f]">Holes</p></div>
          <div className="border-x border-[#e5e1d8]"><p className="text-[9px] font-semibold">72</p><p className="text-[6px] text-[#77766f]">Par</p></div>
          <div><p className="text-[9px] font-semibold">7,105</p><p className="text-[6px] text-[#77766f]">Yards</p></div>
        </div>
        <p className="mt-4 text-[9px] font-semibold">About the course</p>
        <p className="mt-1 text-[7px] leading-relaxed text-[#77766f]">A thoughtful championship layout with generous fairways, strategic water, and greens that reward a good read.</p>
        <button className="mt-5 w-full rounded-xl bg-[#173f35] py-2.5 text-[8px] font-semibold text-white">Choose this course</button>
      </div>
    </div>
  );
}

export function CaddieProfileScreen({ compact = false }: { compact?: boolean }) {
  return (
    <div className="min-h-full bg-[#f8f6f0] text-[#17201b]">
      <PhoneTop title="Caddie profile" back action={<Heart size={12} />} />
      <div className={`px-4 ${compact ? "pt-2" : "pt-4"}`}>
        <div className="flex flex-col items-center text-center">
          <div className={`${compact ? "size-16" : "size-20"} overflow-hidden rounded-[1.5rem] bg-[#d7dfd8] shadow-sm`}>
            <img className="size-full object-cover object-[76%_center] scale-[2]" src="/images/golf-lifestyle.jpg" alt="" />
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <h3 className="text-[13px] font-semibold tracking-[-0.03em]">Miguel Santos</h3>
            <span className="rounded-full bg-[#e3eee7] px-2 py-0.5 text-[6px] font-semibold text-[#173f35]">Available</span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-[7px] font-semibold"><Star size={8} fill="#c79b43" color="#c79b43" /> 4.9 <span className="font-normal text-[#77766f]">· 8 years experience</span></p>
        </div>
        <div className="mt-4 rounded-2xl border border-[#e5e1d8] bg-white p-3 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-[6px] uppercase tracking-[0.12em] text-[#77766f]">Languages</p><p className="mt-1 text-[8px] font-medium">English, Filipino</p></div>
            <div><p className="text-[6px] uppercase tracking-[0.12em] text-[#77766f]">Rate</p><p className="mt-1 text-[8px] font-semibold">₱1,500 / round</p></div>
          </div>
          <div className="mt-3 border-t border-[#e5e1d8] pt-3">
            <p className="text-[6px] uppercase tracking-[0.12em] text-[#77766f]">Specialties</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {["Course strategy", "Green reading", "Club selection"].map((item) => <span key={item} className="rounded-md bg-[#f1f2ec] px-2 py-1 text-[6px] font-medium">{item}</span>)}
            </div>
          </div>
        </div>
        <button className="mt-4 w-full rounded-xl bg-[#173f35] py-2.5 text-[8px] font-semibold text-white">Choose Miguel</button>
      </div>
    </div>
  );
}

export function BookingScreen({ confirmation = false }: { confirmation?: boolean }) {
  if (confirmation) {
    return (
      <div className="flex min-h-full flex-col bg-[#f8f6f0] px-4 text-[#17201b]">
        <PhoneTop title="Booking confirmed" />
        <div className="flex flex-1 flex-col items-center justify-center pb-8 text-center">
          <div className="grid size-14 place-items-center rounded-full bg-[#173f35] text-white"><Check size={22} /></div>
          <p className="mt-4 text-[14px] font-semibold tracking-[-0.03em]">You’re all set.</p>
          <p className="mt-1 max-w-40 text-[7px] leading-relaxed text-[#77766f]">Your round at Valley Golf &amp; Country Club is confirmed.</p>
          <div className="mt-5 w-full rounded-2xl border border-[#e5e1d8] bg-white p-3 text-left shadow-sm">
            <p className="text-[9px] font-semibold">Sunday, 7:20 AM</p>
            <p className="mt-1 text-[7px] text-[#77766f]">Valley Golf &amp; Country Club</p>
            <div className="mt-3 flex items-center gap-2 border-t border-[#e5e1d8] pt-3">
              <div className="size-7 overflow-hidden rounded-full"><img className="size-full object-cover object-[75%_center]" src="/images/golf-lifestyle.jpg" alt="" /></div>
              <div><p className="text-[7px] font-semibold">Miguel Santos</p><p className="text-[6px] text-[#77766f]">Your caddie</p></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f8f6f0] text-[#17201b]">
      <PhoneTop title="Book your game" back />
      <div className="px-4 pt-3">
        <p className="text-[13px] font-semibold tracking-[-0.03em]">Choose a tee time</p>
        <p className="mt-1 text-[7px] text-[#77766f]">Valley Golf &amp; Country Club</p>
        <div className="mt-4 flex gap-1.5">
          {["SAT\n12", "SUN\n13", "MON\n14", "TUE\n15"].map((day, index) => (
            <button key={day} className={`whitespace-pre-line rounded-xl px-3 py-2 text-[7px] leading-relaxed ${index === 1 ? "bg-[#173f35] text-white" : "border border-[#e5e1d8] bg-white"}`}>{day}</button>
          ))}
        </div>
        <p className="mt-4 text-[8px] font-semibold">Morning</p>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {["6:40", "7:20", "8:00", "8:40", "9:20", "10:00"].map((time) => <button key={time} className={`rounded-lg border py-2 text-[7px] ${time === "7:20" ? "border-[#173f35] bg-[#e6eee9] font-semibold text-[#173f35]" : "border-[#e5e1d8] bg-white"}`}>{time}</button>)}
        </div>
        <div className="mt-5 rounded-2xl bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2"><CalendarDays size={12} /><div><p className="text-[7px] font-semibold">Sunday, September 13</p><p className="text-[6px] text-[#77766f]">Valley Golf &amp; Country Club</p></div></div>
          <div className="mt-3 flex items-center gap-2 border-t border-[#e5e1d8] pt-3"><Clock3 size={12} /><div><p className="text-[7px] font-semibold">7:20 AM</p><p className="text-[6px] text-[#77766f]">Miguel Santos · ₱1,500</p></div></div>
        </div>
        <button className="mt-5 w-full rounded-xl bg-[#173f35] py-2.5 text-[8px] font-semibold text-white">Review booking</button>
      </div>
    </div>
  );
}

export function BookingsScreen() {
  return (
    <div className="min-h-full bg-[#f8f6f0] px-4 pt-6 text-[#17201b]">
      <p className="text-[7px] uppercase tracking-[0.14em] text-[#77766f]">Your rounds</p>
      <h3 className="mt-1 text-[15px] font-semibold tracking-[-0.04em]">My bookings</h3>
      <div className="mt-4 flex rounded-lg bg-[#ebe9e2] p-1 text-[7px]">
        <span className="flex-1 rounded-md bg-white py-1.5 text-center font-semibold shadow-sm">Upcoming</span>
        <span className="flex-1 py-1.5 text-center text-[#77766f]">Previous</span>
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
        <img className="h-24 w-full object-cover" src="/images/course-valley.jpg" alt="" />
        <div className="p-3">
          <span className="rounded-full bg-[#e3eee7] px-2 py-1 text-[6px] font-semibold text-[#173f35]">Confirmed</span>
          <p className="mt-2 text-[9px] font-semibold">Valley Golf &amp; Country Club</p>
          <p className="mt-1 text-[7px] text-[#77766f]">Sunday · 7:20 AM</p>
          <div className="mt-3 flex items-center gap-2 border-t border-[#e5e1d8] pt-3">
            <div className="size-7 overflow-hidden rounded-full"><img className="size-full object-cover object-[75%_center]" src="/images/golf-lifestyle.jpg" alt="" /></div>
            <div className="flex-1"><p className="text-[7px] font-semibold">Miguel Santos</p><p className="text-[6px] text-[#77766f]">Caddie</p></div>
            <ChevronRight size={11} />
          </div>
        </div>
      </div>
    </div>
  );
}
