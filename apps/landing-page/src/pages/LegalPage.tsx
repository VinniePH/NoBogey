import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "../components/Logo";

type LegalSection = {
  body: ReactNode;
  title: string;
};

type LegalPageProps = {
  intro: string;
  sections: LegalSection[];
  title: string;
};

export function LegalPage({ intro, sections, title }: LegalPageProps) {
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
          <p className="mt-7 text-lg leading-8 text-muted">{intro}</p>
          <div className="mt-12 rounded-2xl border border-[#d8b66a]/50 bg-[#fff8e5] p-5 text-sm leading-6 text-[#594719]">
            <strong>Draft for review.</strong> This page is a general product draft and must be approved by NoBogey’s legal/business owner before it is presented as the effective policy or submitted to Google Play.
          </div>
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
