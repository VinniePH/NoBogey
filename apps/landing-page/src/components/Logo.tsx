import logo from "../../../../assets/logo/NoBogey-Logo.png";

type LogoProps = {
  inverse?: boolean;
};

export function Logo({ inverse = false }: LogoProps) {
  return (
    <a className="group inline-flex items-center gap-2.5" href="/" aria-label="NoBogey home">
      <span
        className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full transition-transform duration-300 group-hover:-rotate-6"
      >
        <img src={logo} alt="" aria-hidden="true" className="size-8 scale-[1.55] object-contain" />
      </span>
      <span className={`text-[1.16rem] font-semibold tracking-[-0.045em] ${inverse ? "text-ivory" : "text-ink"}`}>
        NoBogey
      </span>
    </a>
  );
}
