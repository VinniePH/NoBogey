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
    title: "From course discovery to booking receipt.",
    description: "A clear booking flow keeps every decision in the right order and every detail visible before payment.",
    steps: [
      "Choose a course",
      "Choose a tee time",
      "Choose from available caddies",
      "Confirm your details",
      "Choose your payment",
      "View your booking receipt"
    ]
  },
  caddie: {
    eyebrow: "Manage your roster",
    title: "Know what’s ahead and respond with clarity.",
    description: "Upcoming games and golfer requests stay together, so caddies can respond and see the updated booking receipt.",
    steps: [
      "Open your roster",
      "Check upcoming games and notifications",
      "Accept or decline golfer requests",
      "View the updated booking receipt"
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

function GolferMock({ step, teeTime, caddie, payment, receipt, onTeeTime, onCaddie, onPayment, onReceipt }: { step: number; teeTime: string; caddie: string; payment: string; receipt: boolean; onTeeTime: (value: string) => void; onCaddie: (value: string) => void; onPayment: (value: string) => void; onReceipt: () => void }) {
  const stages = [
    ["Find a course", "Explore Valley Golf and nearby clubs.", "Choose this course"],
    ["Pick your tee time", "Sunday morning · 7:20 AM", "Choose this tee time"],
    ["Choose your caddie", "Miguel Santos · 4.9 · Available", "Choose this caddie"],
    ["Confirm your details", "Alex Garcia · 4 players", "Confirm your details"],
    ["Choose your payment", "Secure checkout · Review next", "Continue to payment"],
    ["Booking receipt", "Valley Golf · Sunday · 7:20 AM", "View booking receipt"]
  ] as const;
  const [stageTitle, stageCopy, action] = stages[step] ?? stages[0];
  return (
    <div className="experience-mock">
      <MockHeader icon={<Flag size={15} />} label="Golfer" />
      <div className="experience-progress">{stages.map((_, index) => <span className={index <= step ? "active" : ""} key={index} />)}</div>
      <div className="experience-mock-body">
        <p className="mock-eyebrow">{stageTitle}</p>
        <h4>{stageCopy}</h4>
        <div className="golfer-course-summary">
          <img src="/images/course-valley.jpg" alt="" />
          <div><p>Valley Golf &amp; Country Club</p><span>Antipolo, Rizal</span></div>
          <ChevronRight size={17} />
        </div>
        <div className="mock-detail-grid">
          <div><Clock3 size={16} /><span>Tee time</span><strong>{teeTime}</strong></div>
          <div><UsersRound size={16} /><span>Caddie</span><strong>{caddie}</strong></div>
          <div><CreditCard size={16} /><span>Payment</span><strong>{payment}</strong></div>
          <div><ReceiptText size={16} /><span>Receipt</span><strong>{receipt ? "Confirmed" : "After payment"}</strong></div>
        </div>
        {step === 1 ? <div className="mock-choice-grid">{["7:20 AM", "8:40 AM"].map((value) => <button className={teeTime === value ? "selected" : ""} key={value} onClick={() => onTeeTime(value)} type="button"><Clock3 size={14} />{value}</button>)}</div> : null}
        {step === 2 ? <div className="mock-choice-grid">{["Miguel Santos", "Paolo Reyes"].map((value) => <button className={caddie === value ? "selected" : ""} key={value} onClick={() => onCaddie(value)} type="button"><UsersRound size={14} />{value}</button>)}</div> : null}
        {step === 4 ? <div className="mock-choice-grid">{["Card ending 4242", "GCash"].map((value) => <button className={payment === value ? "selected" : ""} key={value} onClick={() => onPayment(value)} type="button"><CreditCard size={14} />{value}</button>)}</div> : null}
        <button className="mock-primary" onClick={step === 5 ? onReceipt : undefined}>{receipt && step === 5 ? "Booking confirmed" : action} <ChevronRight size={15} /></button>
      </div>
    </div>
  );
}

function CaddieMock({ step, availability, editing, requestStatus, onAvailability, onEditProfile, onRequest }: { step: number; availability: boolean; editing: boolean; requestStatus: string; onAvailability: () => void; onEditProfile: () => void; onRequest: (status: string) => void }) {
  const [selectedTime, setSelectedTime] = useState("7:20 AM");
  return (
    <div className="experience-mock">
      <MockHeader icon={<UsersRound size={15} />} label="Caddie" />
      <div className="mock-tabs"><span>Schedule</span><span className="active">Roster</span><span>Profile</span></div>
      <div className="experience-mock-body">
        <div className="flex items-end justify-between gap-4"><div><p className="mock-eyebrow">{step === 0 ? "Upcoming roster" : step === 1 ? "Schedule & notifications" : step === 2 ? "Request decision" : "Booking updated"}</p><h4>{step === 2 ? "Accept or decline requests" : step === 3 ? "Receipt updated" : "Requests that need you"}</h4></div><span className="notification-pill">{step < 2 ? "2 new" : "Ready"}</span></div>
        <div className="request-card request-card-active">
          <div className="request-time"><strong>7:20</strong><span>AM</span></div>
          <div className="min-w-0 flex-1"><p>Valley Golf &amp; Country Club</p><span>Alex Garcia · Sunday</span></div>
          <Bell size={16} />
        </div>
        <div className="request-actions"><button onClick={() => onRequest("Declined")} type="button"><X size={15} /> Decline</button><button onClick={() => onRequest("Accepted")} type="button"><Check size={15} /> Accept</button></div>
        <div className="request-card">
          <div className="request-time"><strong>1:40</strong><span>PM</span></div>
          <div className="min-w-0 flex-1"><p>Manila Southwoods</p><span>Upcoming game · Confirmed</span></div>
          <ReceiptText size={16} />
        </div>
        <div className="mock-inline-actions"><button onClick={onAvailability} type="button"><Clock3 size={14} /> {availability ? "Available for tee times" : "Set available tee times"}</button><button onClick={onEditProfile} type="button"><Pencil size={14} /> {editing ? "Save profile" : "Edit profile"}</button><span className="text-xs text-muted">Request: {requestStatus}</span></div>
        {availability ? <div className="mock-edit-panel"><span>Available tee times</span><div>{["7:20 AM", "8:40 AM", "1:40 PM"].map((time) => <button className={selectedTime === time ? "selected" : ""} key={time} onClick={() => setSelectedTime(time)} type="button">{time}</button>)}</div></div> : null}
        {editing ? <label className="mock-profile-edit">Profile name<input aria-label="Caddie profile name" defaultValue="Miguel Santos" /></label> : null}
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
  const [caddie, setCaddie] = useState("Miguel Santos");
  const [payment, setPayment] = useState("Review next");
  const [receipt, setReceipt] = useState(false);
  const [availability, setAvailability] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [requestStatus, setRequestStatus] = useState("Pending");
  const active = roleFlows[role];
  const selectRole = (nextRole: Role) => { onRoleChange(nextRole); setActiveStep(0); };
  const visual = role === "golfer" ? <GolferMock caddie={caddie} onCaddie={setCaddie} onPayment={setPayment} onReceipt={() => setReceipt(true)} onTeeTime={setTeeTime} payment={payment} receipt={receipt} step={activeStep} teeTime={teeTime} /> : role === "caddie" ? <CaddieMock availability={availability} editing={editingProfile} onAvailability={() => setAvailability((value) => !value)} onEditProfile={() => setEditingProfile((value) => !value)} onRequest={setRequestStatus} requestStatus={requestStatus} step={activeStep} /> : <AdminMock step={activeStep} />;

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
