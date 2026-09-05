import { ArrowLeft, Mail, Send } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import { Logo } from "../components/Logo";
import { FaqAccordion } from "../components/Faq";

const contactEmail = "nobogeyofficial@gmail.com";

export function ContactPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = message.trim();
    if (!body) return;

    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject.trim() || "NoBogey enquiry")}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <header className="border-b border-line bg-warm-white">
        <div className="page-container flex min-h-20 items-center justify-between gap-4">
          <a aria-label="Return to NoBogey home" href="/"><Logo /></a>
          <a className="inline-flex items-center gap-2 text-sm font-semibold text-forest transition-colors hover:text-forest-dark" href="/"><ArrowLeft size={16} /> Back to home</a>
        </div>
      </header>
      <main className="page-container py-16 sm:py-24">
        <section className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <div>
            <p className="eyebrow">Contact</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] text-forest sm:text-6xl">We’re here to help.</h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-muted">Send NoBogey a message for support, privacy questions, account-deletion requests, or general enquiries.</p>
            <div className="mt-10 rounded-2xl border border-line bg-warm-white p-6">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e2eee6] text-forest"><Mail size={18} /></span>
                <div>
                  <p className="text-sm font-semibold text-ink">NoBogey primary email</p>
                  <a className="mt-1 inline-block font-semibold text-forest underline underline-offset-4" href={`mailto:${contactEmail}`}>{contactEmail}</a>
                </div>
              </div>
            </div>
          </div>
          <form className="rounded-3xl border border-line bg-warm-white p-6 shadow-[0_18px_50px_rgba(23,63,53,0.08)] sm:p-8" onSubmit={sendMessage}>
            <label className="block text-sm font-semibold text-ink" htmlFor="contact-subject">Subject</label>
            <input
              className="mt-3 w-full rounded-2xl border border-line bg-ivory px-4 py-3 text-base leading-7 text-ink outline-none transition-colors placeholder:text-muted focus:border-forest"
              id="contact-subject"
              name="subject"
              onChange={(event) => setSubject(event.target.value)}
              placeholder="What can we help with?"
              value={subject}
            />
            <label className="mt-6 block text-sm font-semibold text-ink" htmlFor="contact-message">Your query</label>
            <textarea
              className="mt-3 min-h-52 w-full resize-y rounded-2xl border border-line bg-ivory px-4 py-3 text-base leading-7 text-ink outline-none transition-colors placeholder:text-muted focus:border-forest"
              id="contact-message"
              name="message"
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell us more about your question."
              required
              value={message}
            />
            <p className="mt-3 text-sm leading-6 text-muted">Send opens your email app with your message addressed to NoBogey.</p>
            <button className="button-primary mt-6" disabled={!message.trim()} type="submit">Send message <Send size={16} /></button>
          </form>
        </section>
        <section className="mx-auto mt-20 max-w-5xl scroll-mt-12" id="faq">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <div>
              <p className="eyebrow">FAQ</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] text-forest sm:text-5xl">A few things you might be wondering.</h2>
              <p className="mt-6 max-w-md text-lg leading-8 text-muted">If your question is not answered here, use the enquiry box above and we will receive it at the NoBogey email address.</p>
            </div>
            <FaqAccordion />
          </div>
        </section>
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
