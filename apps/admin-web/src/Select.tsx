import { Children, isValidElement, useId, useRef, useState, type ReactNode } from "react";

type Option = { value?: string | number; children?: ReactNode; disabled?: boolean };

/** Shared dropdown with native form semantics and keyboard navigation. */
export function Select({ value, onChange, children, "aria-label": label }: {
  value: string | number;
  onChange: (event: { target: { value: string } }) => void;
  children: ReactNode;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const options = Children.toArray(children).filter(isValidElement<Option>).map(option => ({
    value: String(option.props.value ?? option.props.children),
    label: option.props.children,
    disabled: option.props.disabled,
  }));
  const selected = options.find(option => option.value === String(value));
  function choose(next: string) {
    onChange({ target: { value: next } });
    setOpen(false);
    trigger.current?.focus();
  }
  return <span className="crm-select" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={event => {
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault(); setOpen(true);
      const root = event.currentTarget;
      const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="option"]:not(:disabled)'));
      const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const index = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : current < 0 ? Math.max(0, options.findIndex(option => option.value === String(value))) : (current + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
      requestAnimationFrame(() => {
        const items = root.querySelectorAll<HTMLButtonElement>('[role="option"]:not(:disabled)');
        items?.[index]?.focus();
      });
      buttons[index]?.focus();
    }
  }}>
    <button ref={trigger} type="button" className="crm-select-trigger" aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{selected?.label}<span aria-hidden="true">⌄</span></button>
    {open && <span id={id} className="crm-select-menu" role="listbox" aria-label={label}>{options.map(option => <button type="button" role="option" aria-selected={option.value === String(value)} disabled={option.disabled} key={option.value} onClick={() => choose(option.value)}>{option.label}<span aria-hidden="true">{option.value === String(value) ? "✓" : ""}</span></button>)}</span>}
  </span>;
}
