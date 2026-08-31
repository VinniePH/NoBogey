import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { LegalPage } from "./pages/LegalPage";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LegalPage
      intro="These draft Terms & Conditions describe the general rules for using NoBogey’s course, caddie, and booking experience."
      sections={[
        { title: "Using NoBogey", body: <p>NoBogey helps golfers discover courses, review caddie information, and arrange rounds. You must use the service lawfully, provide accurate information, and avoid activity that harms golfers, caddies, clubs, or the service.</p> },
        { title: "Accounts", body: <p>You are responsible for protecting your sign-in details and for activity performed through your account. We may require account verification or restrict access when necessary to protect users, clubs, and the service.</p> },
        { title: "Bookings and payments", body: <p>Availability, prices, cancellation rules, and payment requirements must be shown before a booking is confirmed. A caddie listing or request does not guarantee that a caddie is available or assigned to a round.</p> },
        { title: "Changes and support", body: <p>We may update these Terms as NoBogey develops. The effective version, notice method, support contact, and applicable legal terms must be added before this document is published as final.</p> }
      ]}
      title="Terms & Conditions"
    />
  </StrictMode>
);
