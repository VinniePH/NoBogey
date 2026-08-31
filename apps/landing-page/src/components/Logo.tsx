import { Flag } from "lucide-react";

type LogoProps = {
  inverse?: boolean;
};

export function Logo({ inverse = false }: LogoProps) {
  return (
    <a className="group inline-flex items-center gap-2.5" href="#top" aria-label="NoBogey home">
      <span
        className={`grid size-8 place-items-center rounded-full transition-transform duration-300 group-hover:-rotate-6 ${
          inverse ? "bg-ivory text-forest" : "bg-forest text-ivory"
        }`}
      >
        <Flag aria-hidden="true" size={15} strokeWidth={2.2} />
      </span>
      <span className={`text-[1.16rem] font-semibold tracking-[-0.045em] ${inverse ? "text-ivory" : "text-ink"}`}>
        NoBogey
      </span>
    </a>
  );
}
