import type { BookingStatus } from "@nobogey/contracts";
import { colors } from "@nobogey/ui";

const operations = [
  "Caddie approval and verification",
  "Booking review and support",
  "Golf course management",
  "Payment and dispute support"
];

const visibleBookingStates: BookingStatus[] = [
  "requested",
  "confirmed",
  "conflicted",
  "canceled"
];

export function App() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">NoBogey operations</p>
        <h1>Admin web is reserved for future support workflows.</h1>
        <p>
          The active product work starts in the Expo mobile app. This placeholder keeps
          operations boundaries visible without pulling scope away from mobile.
        </p>
      </section>

      <section className="grid" aria-label="Reserved operations areas">
        {operations.map((operation) => (
          <article key={operation} className="card">
            <span className="dot" />
            <h2>{operation}</h2>
            <p>Backend contracts will define ownership, permissions, and audit needs.</p>
          </article>
        ))}
      </section>

      <section className="statusBand">
        <h2>Booking states to watch</h2>
        <div className="stateRow">
          {visibleBookingStates.map((state) => (
            <span key={state} className="statePill">
              {state}
            </span>
          ))}
        </div>
      </section>

      <style>{`:root { --fairway: ${colors.fairway}; }`}</style>
    </main>
  );
}
