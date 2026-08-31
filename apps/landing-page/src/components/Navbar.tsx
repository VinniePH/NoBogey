import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "./Logo";

const links = [
  ["How It Works", "#how-it-works"],
  ["Courses", "#courses"],
  ["Caddies", "#caddies"],
  ["Features", "#features"],
  ["FAQ", "#faq"]
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-line/70 bg-ivory/90 shadow-[0_8px_40px_rgba(20,43,35,0.05)] backdrop-blur-xl" : "bg-transparent"}`}>
      <nav className="page-container flex h-[74px] items-center justify-between" aria-label="Primary navigation">
        <Logo />
        <div className="hidden items-center gap-7 lg:flex">
          {links.map(([label, href]) => (
            <a key={href} className="nav-link" href={href}>{label}</a>
          ))}
        </div>
        <a className="button-primary hidden min-w-32 md:inline-flex" href="/get-started/">Are you ready?</a>
        <button
          className="grid size-10 place-items-center rounded-full border border-line bg-warm-white text-forest md:hidden"
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu size={19} />
        </button>
      </nav>

      <div className={`fixed inset-0 z-50 md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
        <button className={`absolute inset-0 bg-ink/20 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} aria-label="Close menu" onClick={() => setOpen(false)} />
        <div className={`absolute right-0 top-0 flex h-full w-[min(88vw,390px)] flex-col bg-ivory p-6 shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between">
            <Logo />
            <button className="grid size-10 place-items-center rounded-full border border-line" aria-label="Close menu" onClick={() => setOpen(false)}><X size={18} /></button>
          </div>
          <div className="mt-14 flex flex-col">
            {links.map(([label, href]) => (
              <a key={href} className="border-b border-line py-5 text-2xl font-medium tracking-[-0.04em]" href={href} onClick={() => setOpen(false)}>{label}</a>
            ))}
          </div>
          <a className="button-primary mt-auto" href="/get-started/" onClick={() => setOpen(false)}>Are you ready?</a>
        </div>
      </div>
    </header>
  );
}
