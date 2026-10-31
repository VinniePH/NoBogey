import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { LegalPage } from "./pages/LegalPage";
import "./styles.css";

const deletionEmail = "mailto:nobogeyofficial@gmail.com?subject=NoBogey%20account%20deletion%20request&body=Please%20delete%20my%20NoBogey%20account%20and%20associated%20personal%20data.%0A%0AAccount%20email%3A%20%0AAccount%20type%20(golfer%20or%20caddie)%3A%20%0A%0AI%20understand%20that%20account%20deletion%20is%20permanent.";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LegalPage
      effectiveDate="November 1, 2026"
      intro="This page explains how golfers and caddies can request permanent deletion of a NoBogey account and the personal data associated with it. You can submit a request even if you no longer have the NoBogey app installed."
      sections={[
        {
          title: "1. Submit your deletion request",
          body: <>
            <ol className="list-decimal space-y-3 pl-6">
              <li><strong>From the NoBogey app:</strong> open Profile, choose Account Settings, select Delete Account, then choose Email deletion request.</li>
              <li><strong>From this website:</strong> use the button below. Send the request from the email address linked to your NoBogey account and include whether the account is a golfer or caddie account.</li>
              <li>NoBogey will reply to the account email to verify that the request came from the account owner. Never include your password, one-time code, or payment PIN.</li>
            </ol>
            <a className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-6 py-3 font-semibold text-white transition-colors hover:bg-forest-dark" href={deletionEmail}>Email a deletion request</a>
            <p className="text-sm text-muted">If the button does not open your email app, send your request to <a className="font-semibold text-forest underline underline-offset-4" href="mailto:nobogeyofficial@gmail.com">nobogeyofficial@gmail.com</a> with the subject “NoBogey account deletion request.”</p>
          </>,
        },
        {
          title: "2. Verification and processing time",
          body: <>
            <p>We verify ownership using the email address attached to the account. We may ask for limited account information when necessary to distinguish the correct account, but we will never ask for your password.</p>
            <p>After ownership is confirmed and any active booking issue is resolved, NoBogey aims to complete the request within 30 calendar days. We will send a confirmation when deletion is complete or explain if a legal obligation requires limited information to be retained.</p>
          </>,
        },
        {
          title: "3. Data deleted with your account",
          body: <>
            <p>Account deletion permanently removes or irreversibly de-identifies personal data that is no longer required, including:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>your NoBogey authentication account, credentials, and active sessions;</li>
              <li>profile details, contact information, settings, and preferences;</li>
              <li>golfer or caddie profile information, onboarding submissions, verification materials, and availability;</li>
              <li>notifications and other account-specific application data; and</li>
              <li>booking history, ratings, reviews, and support information, unless a limited record must be retained for a reason described below.</li>
            </ul>
          </>,
        },
        {
          title: "4. Limited data that may be retained",
          body: <>
            <p>NoBogey does not use retained records for marketing or to keep the deleted account active. Limited booking, payment, invoice, or accounting records may be retained for up to 10 years when required by Philippine tax or accounting law.</p>
            <p>Information needed for an unresolved payment dispute, fraud or security investigation, legal claim, or lawful government request may be retained only until the matter and any required retention period are complete. Access to retained information is restricted, and it is deleted or de-identified when retention is no longer necessary.</p>
          </>,
        },
        {
          title: "5. What happens after deletion",
          body: <>
            <p>Deletion is permanent. You will be signed out and will no longer be able to access the account, its profile, or its booking history. If you later return to NoBogey, you will need to create a new account.</p>
            <p>Deleting NoBogey does not delete accounts you may hold directly with a golf course, payment provider, or another independent service.</p>
          </>,
        },
      ]}
      title="Delete your NoBogey account"
      version="1.0"
    />
  </StrictMode>,
);
