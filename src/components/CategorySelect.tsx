import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type CategorySelectProps = {
  readonly value: string;
  readonly options: readonly string[];
  readonly onChange: (value: string) => void;
  readonly label?: string;
};

/**
 * Select-only combobox styled to match the site's menus. The focus stays on
 * the trigger and aria-activedescendant points at the highlighted option, so
 * it behaves like a native select for keyboard and screen-reader users.
 */
export default function CategorySelect({
  value,
  options,
  onChange,
  label = "Search in category",
}: CategorySelectProps) {
  const uid = useId();
  const listId = `${uid}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedIndex = Math.max(0, options.indexOf(value));

  const openList = () => {
    setActive(selectedIndex);
    setOpen(true);
  };

  const choose = (index: number) => {
    onChange(options[index]);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Keep the highlighted option visible while arrowing through a long list
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openList();
        else setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openList();
        else setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) choose(active);
        else openList();
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative hidden md:block">
      <button
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${uid}-opt-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className="flex h-full max-w-44 cursor-pointer items-center gap-2 rounded-l-full border-r-2 border-accent/60 bg-cream-deep/60 pr-3 pl-4 text-base font-normal text-ink transition-colors hover:bg-brand-light/60 focus-visible:bg-brand-light/60 focus-visible:outline-none"
      >
        <span className="truncate capitalize">{value}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-soft transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute top-full left-0 z-50 mt-2 max-h-72 w-60 overflow-y-auto rounded-2xl border border-line bg-white p-2 shadow-(--shadow-lift)"
        >
          {options.map((option, i) => {
            const selected = option === value;
            return (
              <li
                key={option}
                id={`${uid}-opt-${i}`}
                data-index={i}
                role="option"
                aria-selected={selected}
                // mousedown keeps focus on the trigger instead of blurring it
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-bold capitalize transition-colors ${
                  i === active
                    ? "bg-brand-light text-brand-dark"
                    : "text-ink-soft"
                }`}
              >
                <span className="truncate">{option}</span>
                {selected && (
                  <Check
                    className="h-4 w-4 shrink-0 text-brand"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
