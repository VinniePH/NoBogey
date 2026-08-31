import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { LegalPage } from "./pages/LegalPage";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LegalPage
      intro="This draft Privacy Policy explains the categories of information NoBogey expects to use to provide its account, profile, course, caddie, and booking experience."
      sections={[
        { title: "Information we use", body: <p>NoBogey may use information you provide to create and manage an account, such as your name, email address, account role, profile details, and information connected to a booking or caddie profile. The final policy must identify every data type collected by the released app and its service providers.</p> },
        { title: "Why we use it", body: <p>We use this information to authenticate accounts, provide the requested service, show relevant booking and profile details, provide support, and protect the service from misuse. We do not use information for a purpose that is not disclosed in the final policy.</p> },
        { title: "Service providers and sharing", body: <p>NoBogey uses Supabase for account authentication. The final policy must name every provider that processes personal data for the released app, explain the purpose of each disclosure, and accurately match Google Play’s Data Safety declaration.</p> },
        { title: "Retention and deletion", body: <p>The final policy must state how long each category of personal data is retained and explain any legal, security, fraud-prevention, or financial-record exceptions. Before launch, NoBogey will provide a clear in-app account-deletion request and a public web path for people who no longer have the app installed.</p> },
        { title: "Contact and updates", body: <p>The final policy must name the responsible developer or business, include a privacy contact method, state an effective date, and explain how users will be notified of material changes.</p> }
      ]}
      title="Privacy Policy"
    />
  </StrictMode>
);
