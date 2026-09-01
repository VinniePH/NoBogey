import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "../components/Logo";

type LegalSection = {
  body: ReactNode;
  title: string;
};

type LegalPageProps = {
  effectiveDate: string;
  intro: string;
  sections: LegalSection[];
  title: string;
  version: string;
};

export function LegalPage({ effectiveDate, intro, sections, title, version }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-ivory text-ink">
      <header className="border-b border-line bg-warm-white">
        <div className="page-container flex min-h-20 items-center justify-between gap-4">
          <a aria-label="Return to NoBogey home" href="/"><Logo /></a>
          <a className="inline-flex items-center gap-2 text-sm font-semibold text-forest transition-colors hover:text-forest-dark" href="/"><ArrowLeft size={16} /> Back to home</a>
        </div>
      </header>
      <main className="page-container py-16 sm:py-24">
        <article className="mx-auto max-w-3xl">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] text-forest sm:text-6xl">{title}</h1>
          <p className="mt-5 text-sm font-medium text-muted">Effective date: {effectiveDate} · Last updated: {effectiveDate} · Version: {version}</p>
          <p className="mt-7 text-lg leading-8 text-muted">{intro}</p>
          <section aria-label="Contact NoBogey" className="mt-10 rounded-2xl border border-line bg-warm-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Contact NoBogey</p>
            <p className="mt-3 text-base leading-7 text-[#4d4c47]">For questions, privacy inquiries, support, or account-deletion requests, email <a className="font-semibold text-forest underline underline-offset-4" href="mailto:nobogeyofficial@gmail.com">nobogeyofficial@gmail.com</a>.</p>
          </section>
          <div className="mt-14 space-y-12">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-forest">{section.title}</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-[#4d4c47]">{section.body}</div>
              </section>
            ))}
          </div>
        </article>
      </main>
      <footer className="border-t border-line bg-warm-white py-8">
        <div className="page-container flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© NoBogey. All rights reserved.</p>
          <div className="flex gap-5"><a className="hover:text-forest" href="/terms/">Terms &amp; Conditions</a><a className="hover:text-forest" href="/privacy/">Privacy Policy</a></div>
        </div>
      </footer>
    </div>
  );
}
