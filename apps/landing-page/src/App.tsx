import {
  ArrowRight,
  CalendarCheck2,
  Check,
  ClipboardCheck,
  Flag,
  Languages,
  Map,
  MapPin,
  Star,
  UserRound,
  UsersRound,
  type LucideIcon
} from "lucide-react";
import type { ReactNode } from "react";

import { FaqAccordion } from "./components/Faq";
import { Logo } from "./components/Logo";
import { Navbar } from "./components/Navbar";
import {
  CaddieProfileScreen,
  CourseDetailScreen,
  DiscoveryScreen,
  PhoneShell
} from "./components/PhoneMockup";
import { Reveal } from "./components/Reveal";
import { RoleExperienceTabs } from "./components/RoleExperience";

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

function ArrowLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a className="arrow-link group" href={href}>
      {children}
      <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" size={17} />
    </a>
  );
}

const courses = [
  {
    name: "Valley Golf & Country Club",
    location: "Antipolo, Rizal",
    meta: "18 holes · Championship",
    image: "/images/course-valley.jpg"
  },
  {
    name: "Manila Southwoods Golf & Country Club",
    location: "Carmona, Cavite",
    meta: "36 holes · Parkland",
    image: "/images/course-southwoods.jpg"
  },
  {
    name: "Wack Wack Golf & Country Club",
    location: "Mandaluyong, Metro Manila",
    meta: "36 holes · Heritage",
    image: "/images/course-wackwack.jpg"
  }
];

type IconItem = readonly [LucideIcon, string, string?];

const trustBenefits: IconItem[] = [
  [Map, "Discover Courses"],
  [UsersRound, "Find Caddies"],
  [CalendarCheck2, "Book Your Game"],
  [ClipboardCheck, "Manage Bookings"]
];

const caddieBenefits: IconItem[] = [
  [UserRound, "Know who you’re booking", "Review caddie profiles before choosing."],
  [Star, "See what they’re great at", "Compare experience, languages, and specialties."],
  [CalendarCheck2, "Book with clarity", "See rates and availability upfront."]
];

const featureCards: IconItem[] = [
  [Map, "Discover Courses", "Explore courses and see the details you need before deciding where to play."],
  [UsersRound, "Find Available Caddies", "Browse caddies and find someone suited to your game."],
  [CalendarCheck2, "Book With Confidence", "Choose a date, time, and caddie through a clear booking experience."],
  [ClipboardCheck, "Manage Your Games", "Keep upcoming and previous bookings organized in one place."]
];

const povFeatures = [
  {
    role: "Golfer",
    title: "Plan the whole round",
    copy: "Move from course discovery to a confirmed booking with every decision in one calm flow.",
    items: ["Course and tee-time discovery", "Caddie matching", "Payment and receipt"]
  },
  {
    role: "Caddie",
    title: "Stay ready for every game",
    copy: "Keep your roster, requests, and upcoming schedule clear so you can focus on the course.",
    items: ["Roster and notifications", "Accept or decline requests", "Updated booking receipt"]
  },
  {
    role: "Admin",
    title: "Keep the club moving",
    copy: "Give club teams the visibility to manage caddies, tee-time availability, and game-day details.",
    items: ["Verify and add caddies", "Edit availability", "Warnings and oversight"]
  }
] as const;

export function App() {
  return (
    <div id="top" className="overflow-clip bg-ivory text-ink">
      <Navbar />

      <main>
        <section className="relative min-h-[940px] overflow-hidden pb-20 pt-32 lg:flex lg:min-h-[850px] lg:items-center lg:pb-24 lg:pt-28">
          <div className="hero-glow" />
          <div className="page-container relative grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
            <div className="relative z-10 max-w-2xl">
              <Reveal>
                <Eyebrow>Golf, made easier.</Eyebrow>
                <h1 className="mt-6 text-[clamp(3.4rem,6.6vw,6.4rem)] font-medium leading-[0.91] tracking-[-0.068em]">
                  The perfect walk,
                  <br />
                  <span className="text-forest">arranged on-demand.</span>
                </h1>
              </Reveal>
              <Reveal delay={100}>
                <p className="mt-7 max-w-xl text-lg leading-8 text-muted md:text-xl">
                  Discover golf courses, find the right caddie, and arrange your next round in one simple experience.
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <a className="button-primary" href="/get-started/">Are you ready? <ArrowRight size={16} /></a>
                  <a className="button-secondary" href="#how-it-works">See How It Works</a>
                </div>
                <p className="mt-6 flex items-center gap-3 text-sm text-muted">
                  <span className="h-px w-8 bg-forest/35" /> Courses. Caddies. Bookings. All in one place.
                </p>
              </Reveal>
            </div>

            <Reveal className="relative h-[520px] sm:h-[620px] lg:h-[690px]" delay={130}>
              <div className="phone-orbit" aria-hidden="true" />
              <PhoneShell className="hero-phone hero-phone-left" screenLabel="NoBogey course details app screen">
                <CourseDetailScreen />
              </PhoneShell>
              <PhoneShell className="hero-phone hero-phone-main" screenLabel="NoBogey course discovery app screen">
                <DiscoveryScreen />
              </PhoneShell>
              <PhoneShell className="hero-phone hero-phone-right" screenLabel="NoBogey caddie profile app screen">
                <CaddieProfileScreen compact />
              </PhoneShell>
              <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_18px_50px_rgba(23,63,53,0.14)] backdrop-blur sm:flex">
                <span className="grid size-9 place-items-center rounded-xl bg-forest text-white"><Check size={15} /></span>
                <span><span className="block text-xs font-semibold">Round confirmed</span><span className="block text-[10px] text-muted">Sunday · 7:20 AM</span></span>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="border-y border-line bg-warm-white py-11">
          <div className="page-container">
            <p className="text-center text-sm font-medium tracking-[-0.01em] text-muted">Everything you need for your next round.</p>
            <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-4">
              {trustBenefits.map(([Icon, label]) => (
                <div className="flex items-center justify-center gap-2.5 text-sm font-medium" key={String(label)}>
                  <span className="grid size-9 place-items-center rounded-full border border-line text-forest"><Icon size={16} strokeWidth={1.7} /></span>
                  <span>{String(label)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section-space scroll-mt-20">
          <div className="page-container">
            <Reveal className="max-w-3xl">
              <Eyebrow>How it works</Eyebrow>
              <h2 className="section-title mt-5">From tee time to first tee,<br />without the back-and-forth.</h2>
              <p className="section-copy mt-6">NoBogey brings the details of your round into one straightforward booking flow.</p>
            </Reveal>

            <div className="mt-20 space-y-20 lg:mt-28 lg:space-y-28">
              <Reveal className="step-grid">
                <div className="step-copy">
                  <span className="step-number">01</span>
                  <h3 className="step-title">Choose your course</h3>
                  <p className="step-description">Explore nearby and popular golf courses, review course details, and choose where you want to play.</p>
                </div>
                <div className="browser-card">
                  <div className="browser-bar"><span /><span /><span /><p>Explore courses</p></div>
                  <div className="grid gap-4 p-4 sm:grid-cols-[1.35fr_0.65fr] sm:p-6">
                    <div className="relative min-h-64 overflow-hidden rounded-2xl">
                      <img className="absolute inset-0 size-full object-cover transition-transform duration-700 hover:scale-105" src="/images/course-valley.jpg" alt="Valley Golf and Country Club fairway" />
                      <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 p-5 text-white"><p className="text-lg font-medium">Valley Golf &amp; Country Club</p><p className="mt-1 flex items-center gap-1.5 text-xs text-white/75"><MapPin size={12} /> Antipolo, Rizal</p></div>
                    </div>
                    <div className="flex flex-col gap-3">
                      {courses.slice(1).map((course) => (
                        <div className="flex flex-1 gap-3 rounded-2xl border border-line bg-warm-white p-3" key={course.name}>
                          <img className="w-20 rounded-xl object-cover sm:w-24" src={course.image} alt="" />
                          <div className="self-center"><p className="text-sm font-semibold leading-snug">{course.name}</p><p className="mt-1 text-[11px] text-muted">{course.location}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal className="step-grid step-grid-reverse">
                <div className="step-copy">
                  <span className="step-number">02</span>
                  <h3 className="step-title">Choose your caddie</h3>
                  <p className="step-description">Browse available caddies and compare experience, languages, specialties, ratings, and rates.</p>
                </div>
                <div className="caddie-web-card">
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="size-20 shrink-0 overflow-hidden rounded-2xl bg-forest/10 sm:size-28"><img className="size-full scale-[1.9] object-cover object-[76%_center]" src="/images/golf-lifestyle.jpg" alt="Caddie profile placeholder" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2"><div><h4 className="text-xl font-semibold tracking-[-0.04em]">Miguel Santos</h4><p className="mt-1 flex items-center gap-1 text-sm"><Star size={13} fill="#c79b43" color="#c79b43" /> 4.9 <span className="text-muted">· 8 years</span></p></div><span className="rounded-full bg-[#e2eee6] px-3 py-1.5 text-xs font-semibold text-forest">Available</span></div>
                      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><p className="flex items-center gap-2 text-muted"><Languages size={15} /> English, Filipino</p><p className="font-semibold sm:text-right">₱1,500 / round</p></div>
                    </div>
                  </div>
                  <div className="mt-6 border-t border-line pt-5"><p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Specialties</p><div className="mt-3 flex flex-wrap gap-2">{["Course strategy", "Green reading", "Club selection"].map((item) => <span className="rounded-lg bg-ivory px-3 py-2 text-xs font-medium" key={item}>{item}</span>)}</div></div>
                </div>
              </Reveal>

              <Reveal className="step-grid">
                <div className="step-copy">
                  <span className="step-number">03</span>
                  <h3 className="step-title">Book your game</h3>
                  <p className="step-description">Select your preferred date and time, review the details, and confirm your round.</p>
                </div>
                <div className="booking-web-card">
                  <div className="flex items-center gap-4 border-b border-line pb-5"><span className="grid size-11 place-items-center rounded-full bg-forest text-white"><Check size={18} /></span><div><p className="font-semibold">Your round is ready to review</p><p className="text-sm text-muted">Everything in one clear place.</p></div></div>
                  <div className="grid gap-5 pt-5 sm:grid-cols-3"><div><p className="detail-label">Course</p><p className="detail-value">Valley Golf &amp; Country Club</p></div><div><p className="detail-label">Date &amp; time</p><p className="detail-value">Sun, Sep 13 · 7:20 AM</p></div><div><p className="detail-label">Caddie</p><p className="detail-value">Miguel Santos</p></div></div>
                  <button className="button-primary mt-6 w-full">Confirm your round</button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="courses" className="section-space scroll-mt-16 bg-[#eeece4]">
          <div className="page-container">
            <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl"><Eyebrow>Discover courses</Eyebrow><h2 className="section-title mt-5">Find somewhere worth playing.</h2><p className="section-copy mt-5">Explore golf courses and get the details you need before choosing your next round.</p></div>
              <ArrowLink href="#product">Explore Courses</ArrowLink>
            </Reveal>
            <div className="course-scroller mt-12">
              {courses.map((course, index) => (
                <Reveal className="course-card group" delay={index * 80} key={course.name}>
                  <div className="aspect-[4/3] overflow-hidden"><img className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.045]" src={course.image} alt={`${course.name} course landscape`} /></div>
                  <div className="flex items-end justify-between gap-4 p-6"><div><p className="text-lg font-semibold leading-snug tracking-[-0.035em]">{course.name}</p><p className="mt-2 flex items-center gap-1.5 text-sm text-muted"><MapPin size={13} /> {course.location}</p><p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-muted">{course.meta}</p></div><button className="grid size-11 shrink-0 place-items-center rounded-full border border-line transition-all duration-300 group-hover:border-forest group-hover:bg-forest group-hover:text-white" aria-label={`View ${course.name}`}><ArrowRight size={17} /></button></div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="caddies" className="section-space scroll-mt-16">
          <div className="page-container grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <Reveal className="relative mx-auto h-[660px] w-full max-w-[530px]">
              <div className="absolute inset-10 rounded-[50%] bg-[#dfe8df] blur-3xl" />
              <div className="absolute left-0 top-20 h-[430px] w-[75%] overflow-hidden rounded-[2rem]"><img className="size-full object-cover" src="/images/course-southwoods.jpg" alt="Golf course fairway" /></div>
              <PhoneShell className="absolute bottom-0 right-1 w-[245px] sm:right-8 sm:w-[280px]" screenLabel="Miguel Santos caddie profile app screen"><CaddieProfileScreen /></PhoneShell>
            </Reveal>
            <Reveal>
              <Eyebrow>Your caddie</Eyebrow>
              <h2 className="section-title mt-5">Find the right person<br />for your round.</h2>
              <p className="section-copy mt-6">See who’s available, understand their experience, and choose the caddie that fits the way you play.</p>
              <div className="mt-10 space-y-7">
                {caddieBenefits.map(([Icon, title, copy]) => (
                  <div className="feature-row" key={String(title)}><span className="feature-row-icon"><Icon size={19} strokeWidth={1.7} /></span><div><h3 className="font-semibold tracking-[-0.025em]">{String(title)}</h3><p className="mt-1 text-sm leading-6 text-muted">{String(copy)}</p></div></div>
                ))}
              </div>
              <a className="button-primary mt-10" href="#features">View Caddies <ArrowRight size={16} /></a>
            </Reveal>
          </div>
        </section>

        <section id="product" className="dark-section section-space bg-forest text-white">
          <div className="page-container">
            <Reveal className="max-w-3xl"><Eyebrow>Explore NoBogey</Eyebrow><h2 className="section-title mt-5 text-white">One platform.<br />Three points of view.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">Move through the exact flow for golfers, caddies, and club administrators.</p></Reveal>
            <Reveal className="mt-14 lg:mt-20" delay={80}><RoleExperienceTabs /></Reveal>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {povFeatures.map((feature, index) => (
                <Reveal className="rounded-[1.75rem] border border-white/12 bg-white/[0.06] p-6 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.1]" delay={140 + index * 70} key={feature.role}>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c9d8ca]">{feature.role} view</p>
                  <h3 className="mt-8 text-2xl font-medium tracking-[-0.045em]">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/62">{feature.copy}</p>
                  <ul className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm text-white/78">
                    {feature.items.map((item) => <li className="flex items-center gap-2.5" key={item}><Check className="shrink-0 text-[#c9d8ca]" size={15} />{item}</li>)}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="section-space scroll-mt-16">
          <div className="page-container">
            <Reveal className="max-w-3xl"><Eyebrow>Built for the round</Eyebrow><h2 className="section-title mt-5">Everything important.<br />Nothing in the way.</h2></Reveal>
            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {featureCards.map(([Icon, title, copy], index) => (
                <Reveal className="feature-card group" delay={index * 60} key={String(title)}><span className="grid size-12 place-items-center rounded-2xl border border-line bg-ivory text-forest transition-colors group-hover:border-forest/20 group-hover:bg-forest group-hover:text-white"><Icon size={21} strokeWidth={1.6} /></span><h3 className="mt-12 text-2xl font-semibold tracking-[-0.045em]">{String(title)}</h3><p className="mt-4 max-w-md text-base leading-7 text-muted">{String(copy)}</p></Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative min-h-[620px] overflow-hidden md:min-h-[720px]">
          <img className="absolute inset-0 size-full object-cover" src="/images/golf-lifestyle.jpg" alt="Golfer and caddie walking together down a fairway at golden hour" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e2a22]/75 via-[#0e2a22]/20 to-transparent" />
          <div className="page-container relative flex min-h-[620px] items-end pb-14 md:min-h-[720px] md:pb-20">
            <Reveal className="max-w-2xl"><Flag className="text-[#d8b66a]" size={29} strokeWidth={1.6} /><blockquote className="mt-7 text-[clamp(2.25rem,5vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.055em] text-white">“Because a great round starts long before the first swing.”</blockquote></Reveal>
          </div>
        </section>

        <section id="faq" className="section-space scroll-mt-16">
          <div className="page-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <Reveal><Eyebrow>FAQ</Eyebrow><h2 className="section-title mt-5">A few things you might be wondering.</h2></Reveal>
            <Reveal delay={80}><FaqAccordion /></Reveal>
          </div>
        </section>

        <section className="pb-5 sm:pb-8">
          <div className="page-container">
            <Reveal className="final-cta">
              <div className="relative z-10 max-w-2xl"><Eyebrow>Your next round</Eyebrow><h2 className="mt-5 text-[clamp(3.2rem,6vw,6.3rem)] font-medium leading-[0.91] tracking-[-0.065em] text-ivory">Your next round<br />starts here.</h2><p className="mt-7 max-w-xl text-lg leading-8 text-white/65">Spend less time arranging the details and more time enjoying the game.</p><div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center"><a className="button-light" href="/get-started/">Are you ready? <ArrowRight size={16} /></a><a className="group inline-flex items-center gap-2 text-sm font-semibold text-white" href="#product">Explore NoBogey <ArrowRight className="transition-transform group-hover:translate-x-1" size={15} /></a></div></div>
              <div className="cta-visual" aria-hidden="true"><span className="golf-ball" /><span className="flag-stick"><i /></span><span className="green-line" /></div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="bg-[#0d2922] pb-8 pt-16 text-white sm:pt-20">
        <div className="page-container">
          <div className="grid gap-14 border-b border-white/10 pb-14 md:grid-cols-[1.5fr_2fr]">
            <div><Logo inverse /><p className="mt-5 max-w-xs text-base leading-7 text-white/55">The perfect walk, arranged on-demand.</p></div>
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              {[
                ["Product", [["How It Works", "#how-it-works"], ["Courses", "#courses"], ["Caddies", "#caddies"], ["Features", "#features"]]],
                ["Company", [["About", "#top"], ["Contact", "/contact/"]]],
                ["Legal", [["Privacy Policy", "/privacy/"], ["Terms & Conditions", "/terms/"]]]
              ].map(([heading, items]) => (
                <div key={String(heading)}><p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">{String(heading)}</p><div className="mt-5 flex flex-col gap-3">{(items as string[][]).map(([label, href]) => <a className="w-fit text-sm text-white/70 transition-colors hover:text-white" href={href} key={label}>{label}</a>)}</div></div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between"><p>© NoBogey. All rights reserved.</p><p>Play well. Walk easy.</p></div>
        </div>
      </footer>
    </div>
  );
}
