import {
  AlertTriangle,
  Bell,
  CalendarCheck2,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Flag,
  Pencil,
  ReceiptText,
  ShieldCheck,
  UserPlus,
  UsersRound,
  X
} from "lucide-react";
import { useState, type ReactNode } from "react";

export type Role = "golfer" | "caddie" | "admin";

type RoleFlow = {
  eyebrow: string;
  title: string;
  description: string;
  steps: string[];
};

const roleFlows: Record<Role, RoleFlow> = {
  golfer: {
    eyebrow: "Plan your round",
    title: "From choosing a course to confirming your round.",
    description: "Open a confirmed round in My bookings, confirm your meetup together, then acknowledge payment on both sides.",
    steps: [
      "Choose a course",
      "Choose a tee time",
      "Choose from available caddies",
      "Confirm your details",
      "Open a confirmed round in My bookings",
      "Confirm meetup with your caddie",
      "Confirm payment together"
    ]
  },
  caddie: {
    eyebrow: "Manage your roster",
    title: "Know what’s ahead and respond with clarity.",
    description: "Open a confirmed booking in your roster. Both you and your golfer confirm the meetup, then acknowledge payment and receipt.",
    steps: [
      "Open your roster",
      "Check upcoming games and notifications",
      "Accept or decline golfer requests",
      "Open a confirmed booking",
      "Confirm meetup with your golfer",
      "Confirm payment received"
    ]
  },
  admin: {
    eyebrow: "Run your club",
    title: "Keep the club’s caddie operation moving.",
    description: "Club teams can review caddies, manage availability, and act on the roster from one operations view.",
    steps: [
      "Verify caddies registered at your club",
      "Edit tee-time availability",
      "Check available caddies",
      "Warn caddies",
      "Add caddies"
    ]
  }
};

function FlowSteps({ steps, activeStep, onSelect }: { steps: string[]; activeStep: number; onSelect: (index: number) => void }) {
  const previousStep = () => onSelect(Math.max(0, activeStep - 1));
  const nextStep = () => onSelect(Math.min(steps.length - 1, activeStep + 1));

  return (
    <div className="role-flow">
      <ol className="role-flow-list" aria-label="Role journey steps">
        {steps.map((step, index) => (
          <li className={index === activeStep ? "active" : ""} key={step}>
            <button type="button" onClick={() => onSelect(index)} aria-label={`Show step ${index + 1}: ${step}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </button>
            {index < steps.length - 1 ? <i /> : null}
          </li>
        ))}
      </ol>
      <div className="role-flow-carousel" aria-live="polite">
        <p className="role-flow-count">Step {activeStep + 1} of {steps.length}</p>
        <p className="role-flow-current" key={`${activeStep}-${steps[activeStep]}`}>{steps[activeStep]}</p>
        <div className="role-flow-controls">
          <button aria-label="Show previous step" disabled={activeStep === 0} onClick={previousStep} type="button"><ChevronLeft size={16} /> Previous</button>
          <button aria-label="Show next step" disabled={activeStep === steps.length - 1} onClick={nextStep} type="button">Next <ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}

function MockHeader({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="experience-mock-header">
      <span className="experience-mock-mark">{icon}</span>
      <div><p>NoBogey</p><span>{label}</span></div>
      <button aria-label="Open notifications"><Bell size={16} /></button>
    </div>
  );
}

type Participant = "golfer" | "caddie";
type ConfirmationStep = "meetup" | "payment";
type MutualState = Record<Participant, boolean>;
type RoundState = Record<ConfirmationStep, MutualState>;
const emptyRoundState = (): RoundState => ({ meetup: { golfer: false, caddie: false }, payment: { golfer: false, caddie: false } });
const bothConfirmed = (state: MutualState) => state.golfer && state.caddie;

type RoundPreviewProps = {
  role: Participant;
  teeTime: string;
  caddie: string;
  round: RoundState;
  onContinue: () => void;
};

function ConfirmedRoundCard({ teeTime, caddie, round, onContinue }: Omit<RoundPreviewProps, "role">) {
  return <button aria-label="Open confirmed booking at Valley Golf" className="confirmed-round-card" onClick={onContinue} type="button">
    <span className="notification-pill">Confirmed booking</span>
    <strong>Valley Golf &amp; Country Club</strong>
    <span>Sunday · {teeTime} · Alex Garcia · 4 golfers</span>
    <span>Caddie: {caddie} · PHP 1,500</span>
    <span className="round-preview-status">Meetup: {bothConfirmed(round.meetup) ? "confirmed" : "pending"} · Payment: {bothConfirmed(round.payment) ? "confirmed" : "pending"}</span>
    <span className="round-preview-open">View round confirmations <ChevronRight size={15} /></span>
  </button>;
}

function ConfirmationMock({ role, step, teeTime, caddie, round, onContinue, onConfirm, onMeetup }: RoundPreviewProps & { step: ConfirmationStep; onConfirm: () => void; onMeetup: () => void }) {
  const state = round[step];
  const complete = bothConfirmed(state);
  const locked = step === "payment" && !bothConfirmed(round.meetup);
  const other = role === "golfer" ? "caddie" : "golfer";
  const label = step === "meetup" ? "Meetup confirmation" : "Payment confirmation";
  return <div className="experience-mock">
    <MockHeader icon={step === "meetup" ? <UsersRound size={15} /> : <CreditCard size={15} />} label={role === "golfer" ? "Golfer · My bookings" : "Caddie · Roster"} />
    <div className="experience-mock-body">
      <p className="mock-eyebrow">Confirmed round · {teeTime}</p>
      <h4>{complete ? step === "meetup" ? "Meetup confirmed" : "Payment confirmed" : label}</h4>
      <p className="round-preview-description">{step === "meetup" ? `Confirm once you’ve met your ${other} at the course. Both sides must confirm.` : role === "golfer" ? "Acknowledge paying your caddie. The caddie also needs to confirm receipt." : "Acknowledge receiving the caddie fee. Your golfer also needs to confirm payment."}</p>
      <div className="round-preview-details"><strong>Valley Golf &amp; Country Club</strong><span>Alex Garcia · {caddie}</span>{step === "payment" ? <strong className="round-preview-amount">PHP 1,500</strong> : <span>Meet at the clubhouse caddie desk.</span>}</div>
      <div aria-label="Participant confirmations" className="round-preview-participants">{(["golfer", "caddie"] as const).map((participant) => <div key={participant}><div><strong>{participant === "golfer" ? "Golfer" : "Caddie"}{participant === role ? " (you)" : ""}</strong><span>{state[participant] ? "Confirmed" : "Waiting for confirmation"}</span></div>{state[participant] ? <Check aria-label="Confirmed" size={19} /> : <Clock3 aria-label="Pending" size={19} />}</div>)}</div>
      <p aria-live="polite" className="round-preview-notice">{complete ? "Both sides have confirmed." : locked ? "Both participants must confirm meetup before payment." : state[role] ? `Your side is confirmed. Waiting for your ${other}.` : state[other] ? `Your ${other} has confirmed. Your confirmation is still needed.` : "One confirmation does not complete this step."}</p>
      <button className="mock-primary" disabled={locked || state[role]} onClick={onConfirm} type="button">{complete ? "Both sides confirmed" : state[role] ? "Your confirmation is recorded" : step === "meetup" ? `I’ve met my ${other}` : role === "golfer" ? "I’ve paid the caddie" : "I’ve received payment"}<Check size={15} /></button>
      {step === "meetup" && complete ? <button className="round-preview-link" onClick={onContinue} type="button">Continue to payment confirmation <ChevronRight size={15} /></button> : null}
      {locked ? <button className="round-preview-link" onClick={onMeetup} type="button">Open meetup confirmation <ChevronRight size={15} /></button> : null}
      <p className="round-preview-caption">Interactive preview. No payment is collected.</p>
    </div>
  </div>;
}

function GolferMock({ step, teeTime, caddie, round, onTeeTime, onCaddie, onContinue }: Omit<RoundPreviewProps, "role"> & { step: number; onTeeTime: (value: string) => void; onCaddie: (value: string) => void }) {
  const stages = [
    ["Find a course", "Explore Valley Golf and nearby clubs.", "Choose this course"],
    ["Pick your tee time", "Choose a time for your next round.", "Choose this tee time"],
    ["Choose your caddie", "Compare available caddies.", "Choose this caddie"],
    ["Confirm your details", "Alex Garcia · 4 players", "Send booking request"],
    ["My bookings", "Open a confirmed round", "Open meetup confirmation"]
  ] as const;
  const [stageTitle, stageCopy, action] = stages[step] ?? stages[0];
  return (
    <div className="experience-mock">
      <MockHeader icon={<Flag size={15} />} label="Golfer" />
      <div className="experience-progress">{roleFlows.golfer.steps.map((_, index) => <span className={index <= step ? "active" : ""} key={index} />)}</div>
      <div className="experience-mock-body">
        <p className="mock-eyebrow">{stageTitle}</p>
        <h4>{stageCopy}</h4>
        {step === 4 ? <ConfirmedRoundCard caddie={caddie} onContinue={onContinue} round={round} teeTime={teeTime} /> : <>
          <div className="golfer-course-summary"><img src="/images/course-valley.jpg" alt="" /><div><p>Valley Golf &amp; Country Club</p><span>Antipolo, Rizal</span></div><ChevronRight size={17} /></div>
          <div className="mock-detail-grid">
            <div><Clock3 size={16} /><span>Tee time</span><strong>{teeTime}</strong></div>
            <div><UsersRound size={16} /><span>Preferred caddie</span><strong>{caddie}</strong></div>
            <div><CreditCard size={16} /><span>Caddie fee</span><strong>PHP 1,500</strong></div>
            <div><ReceiptText size={16} /><span>Group size</span><strong>4 golfers</strong></div>
          </div>
        </>}
        {step === 1 ? <div className="mock-choice-grid">{["7:20 AM", "8:40 AM"].map((value) => <button className={teeTime === value ? "selected" : ""} key={value} onClick={() => onTeeTime(value)} type="button"><Clock3 size={14} />{value}</button>)}</div> : null}
        {step === 2 ? <div className="mock-choice-grid">{["Jun Mercado", "Paolo Reyes"].map((value) => <button className={caddie === value ? "selected" : ""} key={value} onClick={() => onCaddie(value)} type="button"><UsersRound size={14} />{value}</button>)}</div> : null}
        {step === 3 ? <p className="round-preview-description">The club owns final caddie assignment. The next step shows an example of an accepted booking.</p> : null}
        {step !== 4 ? <button className="mock-primary" onClick={onContinue} type="button">{action} <ChevronRight size={15} /></button> : null}
      </div>
    </div>
  );
}

function CaddieMock({ step, availability, editing, requestStatus, onAvailability, onEditProfile, onRequest, teeTime, caddie, round, onContinue }: Omit<RoundPreviewProps, "role"> & { step: number; availability: boolean; editing: boolean; requestStatus: string; onAvailability: () => void; onEditProfile: () => void; onRequest: (status: string) => void }) {
  const [selectedTime, setSelectedTime] = useState("7:20 AM");
  return (
    <div className="experience-mock">
      <MockHeader icon={<UsersRound size={15} />} label="Caddie" />
      <div className="mock-tabs"><span>Schedule</span><span className="active">Roster</span><span>Profile</span></div>
      <div className="experience-mock-body">
        <div className="flex items-end justify-between gap-4"><div><p className="mock-eyebrow">{step === 0 ? "Upcoming roster" : step === 1 ? "Schedule & notifications" : step === 2 ? "Request decision" : "Booking updated"}</p><h4>{step === 2 ? "Accept or decline requests" : step === 3 ? "Your confirmed booking" : "Requests that need you"}</h4></div><span className="notification-pill">{step < 2 ? "1 new" : "Ready"}</span></div>
        {step < 3 ? <><div className="request-card request-card-active">
          <div className="request-time"><strong>1:40</strong><span>PM</span></div>
          <div className="min-w-0 flex-1"><p>Manila Southwoods</p><span>Miguel Ramos · Sunday</span></div>
          <Bell size={16} />
        </div>
        <div className="request-actions"><button onClick={() => onRequest("Declined")} type="button"><X size={15} /> Decline</button><button onClick={() => onRequest("Accepted")} type="button"><Check size={15} /> Accept</button></div>
        <p aria-live="polite" className="round-preview-description">Request: {requestStatus}</p></> : null}
        <ConfirmedRoundCard caddie={caddie} onContinue={onContinue} round={round} teeTime={teeTime} />
        <div className="mock-inline-actions"><button onClick={onAvailability} type="button"><Clock3 size={14} /> {availability ? "Available for tee times" : "Set available tee times"}</button><button onClick={onEditProfile} type="button"><Pencil size={14} /> {editing ? "Save profile" : "Edit profile"}</button><span className="text-xs text-muted">Request: {requestStatus}</span></div>
        {availability ? <div className="mock-edit-panel"><span>Available tee times</span><div>{["7:20 AM", "8:40 AM", "1:40 PM"].map((time) => <button className={selectedTime === time ? "selected" : ""} key={time} onClick={() => setSelectedTime(time)} type="button">{time}</button>)}</div></div> : null}
        {editing ? <label className="mock-profile-edit">Profile name<input aria-label="Caddie profile name" defaultValue="Jun Mercado" /></label> : null}
      </div>
    </div>
  );
}

function AdminMock({ step }: { step: number }) {
  return (
    <div className="experience-mock experience-mock-admin">
      <MockHeader icon={<ShieldCheck size={15} />} label="Club admin" />
      <div className="mock-tabs"><span className="active">Overview</span><span>Tee times</span><span>Caddies</span></div>
      <div className="experience-mock-body">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mock-eyebrow">Club operations</p><h4>{["Verify registered caddies", "Edit tee-time availability", "Check available caddies", "Review caddie warnings", "Add a caddie"][step] ?? "Sunday, August 31"}</h4></div><button className="mock-add"><UserPlus size={15} /> Add caddie</button></div>
        <div className="admin-metrics"><div><span>Pending verification</span><strong>3</strong></div><div><span>Available caddies</span><strong>14</strong></div><div><span>Open tee times</span><strong>8</strong></div></div>
        <div className="admin-list">
          <div><span className="admin-list-icon"><ShieldCheck size={16} /></span><p><strong>Verify registered caddies</strong><small>3 profiles need review</small></p><ChevronRight size={16} /></div>
          <div><span className="admin-list-icon"><CalendarCheck2 size={16} /></span><p><strong>Edit tee-time availability</strong><small>Manage the club schedule</small></p><ChevronRight size={16} /></div>
          <div><span className="admin-list-icon admin-list-warn"><AlertTriangle size={16} /></span><p><strong>Caddie warnings</strong><small>Review and send a warning</small></p><ChevronRight size={16} /></div>
        </div>
      </div>
    </div>
  );
}

export function RoleExperienceTabs({ role, onRoleChange }: { role: Role; onRoleChange: (role: Role) => void }) {
  const [activeStep, setActiveStep] = useState(0);
  const [teeTime, setTeeTime] = useState("7:20 AM");
  const [caddie, setCaddie] = useState("Jun Mercado");
  const [round, setRound] = useState<RoundState>(emptyRoundState);
  const [availability, setAvailability] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [requestStatus, setRequestStatus] = useState("Pending");
  const active = roleFlows[role];
  const selectRole = (nextRole: Role) => { onRoleChange(nextRole); setActiveStep(0); };
  const confirmationStep: ConfirmationStep | undefined = role === "golfer" ? activeStep === 5 ? "meetup" : activeStep === 6 ? "payment" : undefined : role === "caddie" ? activeStep === 4 ? "meetup" : activeStep === 5 ? "payment" : undefined : undefined;
  const openConfirmation = (participant: Participant, step: ConfirmationStep) => {
    onRoleChange(participant);
    setActiveStep((participant === "golfer" ? 5 : 4) + (step === "payment" ? 1 : 0));
  };
  const confirm = (participant: Participant, step: ConfirmationStep) => setRound((current) => {
    if (current[step][participant] || (step === "payment" && !bothConfirmed(current.meetup))) return current;
    return { ...current, [step]: { ...current[step], [participant]: true } };
  });
  const visual = role !== "admin" && confirmationStep
    ? <ConfirmationMock caddie={caddie} onConfirm={() => confirm(role, confirmationStep)} onContinue={() => openConfirmation(role, "payment")} onMeetup={() => openConfirmation(role, "meetup")} role={role} round={round} step={confirmationStep} teeTime={teeTime} />
    : role === "golfer" ? <GolferMock caddie={caddie} onCaddie={(value) => { setCaddie(value); setRound(emptyRoundState()); }} onContinue={() => setActiveStep((value) => value + 1)} onTeeTime={(value) => { setTeeTime(value); setRound(emptyRoundState()); }} round={round} step={activeStep} teeTime={teeTime} />
    : role === "caddie" ? <CaddieMock availability={availability} caddie={caddie} editing={editingProfile} onAvailability={() => setAvailability((value) => !value)} onContinue={() => openConfirmation("caddie", "meetup")} onEditProfile={() => setEditingProfile((value) => !value)} onRequest={setRequestStatus} requestStatus={requestStatus} round={round} step={activeStep} teeTime={teeTime} />
    : <AdminMock step={activeStep} />;

  return (
    <div className="role-experience">
      <div className="role-tabs" role="tablist" aria-label="Explore NoBogey by role">
        {(["golfer", "caddie", "admin"] as const).map((item) => (
          <button
            aria-controls={`role-panel-${item}`}
            aria-selected={role === item}
            className={role === item ? "active" : ""}
            id={`role-tab-${item}`}
            key={item}
            onClick={() => selectRole(item)}
            role="tab"
            type="button"
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`role-tab-${role}`}
        className="role-panel"
        id={`role-panel-${role}`}
        key={role}
        role="tabpanel"
      >
        <div className="role-panel-copy">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d8b66a]">{active.eyebrow}</p>
          <h3>{active.title}</h3>
          <p className="role-panel-description">{active.description}</p>
          <FlowSteps activeStep={activeStep} onSelect={setActiveStep} steps={active.steps} />
        </div>
        <div className="role-panel-visual">{visual}</div>
      </div>
    </div>
  );
}
