import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { LegalPage } from "./pages/LegalPage";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LegalPage
      effectiveDate="August 17, 2026"
      intro="This Privacy Policy explains how NoBogey collects, uses, discloses, and protects your personal information when you use the NoBogey mobile application. NoBogey complies with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173), its Implementing Rules and Regulations, and applicable National Privacy Commission and Google Play Developer Policies."
      sections={[
        { title: "I. Information we collect", body: <><p><strong>Personal information you provide.</strong> This includes account credentials such as your name, email address, phone number, profile picture, and user type; golfer information such as handicap range, playstyle preferences, booking history, and ratings or reviews; and caddie-profile information such as experience, handicap knowledge, language skills, availability schedules, and performance metrics.</p><p><strong>Payment and financial data.</strong> We collect mobile-number and e-wallet details needed for payouts and transaction verification, plus transaction details such as amount, booking ID, and timestamp. Cashless transactions are processed through third-party APIs, including GCash (operated by G-Xchange, Inc.). We do not collect or store GCash PINs, MPINs, or banking passwords.</p><p><strong>Location data.</strong> With your permission, we collect precise or approximate device location to support Find a Game, nearby golf-course discovery, and matching available caddies in your area. It is collected while using core booking features according to your device settings.</p></> },
        { title: "II. How we use your data", body: <p>We use your data to administer, schedule, and confirm caddie bookings; facilitate cashless GCash payments and caddie earnings; build public caddie portfolios and display golfer history; maintain platform safety; prevent fraudulent bookings; and provide customer support.</p> },
        { title: "III. Data sharing and third parties", body: <><p>We do not sell your personal information. We share booking-relevant details, such as a name, photo, and meeting point, between confirmed golfers and caddies.</p><p>We may also share data with trusted hosting, payment-processing, and analytics providers operating under confidentiality obligations, and with legal authorities when required by law, subpoena, or a valid order from a competent Philippine authority.</p></> },
        { title: "IV. Account and data deletion rights", body: <><p>You can request deletion of your account and associated personal data in the App under Profile &gt; Account Settings &gt; Delete Account, or by contacting the acting Data Protection Officer below.</p><p>You retain rights to be informed, access, object to processing, erase or block, rectify, and port your personal data. You may also lodge a complaint with the National Privacy Commission at <a className="font-medium text-forest underline underline-offset-4" href="https://privacy.gov.ph">privacy.gov.ph</a>.</p></> },
        { title: "V. Children’s privacy", body: <p>NoBogey is intended for general adult audiences and is not directed at children under 13, or under 18 without parental consent. We do not knowingly collect children’s personal information. If we discover that a child under 13 has provided personal data, we will promptly delete it.</p> },
        { title: "VI. Security and data retention", body: <p>We use standard administrative and technical safeguards, including encrypted data transmission via HTTPS/TLS and restricted database access. Personal data is retained only while your account remains active or as required to meet legal and accounting obligations.</p> },
        { title: "VII. Contact us and privacy matters", body: <p>For privacy questions, inquiries, or data-deletion requests, contact NoBogey at <a className="font-medium text-forest underline underline-offset-4" href="mailto:nobogeyofficial@gmail.com">nobogeyofficial@gmail.com</a>. Location: Metro Manila, Philippines.</p> }
      ]}
      title="Privacy Policy"
      version="1.0"
    />
  </StrictMode>
);
