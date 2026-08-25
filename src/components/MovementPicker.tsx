"use client";

import { useMemo, useState } from "react";
import { CROSSFIT_MOVEMENTS, filterMovements } from "@/lib/movements";

type Props = {
  name?: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
};

/**
 * Sökbar väljare för CrossFit-rörelser (officiella namn).
 */
export function MovementPicker({
  name = "name",
  defaultValue = "",
  required = true,
  className = "",
}: Props) {
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => filterMovements(query).slice(0, 40), [query]);

  const q = query.trim();
  const canAddCustom =
    q.length > 0 &&
    !CROSSFIT_MOVEMENTS.some((m) => m.toLowerCase() === q.toLowerCase());

  function pick(item: string) {
    setQuery(item);
    setOpen(false);
  }

  return (
    <div className={`relative min-w-[12rem] flex-1 ${className}`}>
      <input
        name={name}
        type="search"
        value={query}
        required={required}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (suggestions[0]) pick(suggestions[0]);
            else if (canAddCustom) pick(q);
          }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Sök rörelse (t.ex. Clean and Jerk)…"
        autoComplete="off"
        aria-label="Rörelse"
        className="w-full rounded border border-stone-700 bg-stone-950 px-2 py-1.5 text-sm outline-none focus:border-teal-500/50"
      />
      {open && (suggestions.length > 0 || canAddCustom) ? (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-stone-700 bg-stone-950 py-1 shadow-xl shadow-black/50">
          {suggestions.map((item) => (
            <li key={item}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(item)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-stone-800"
              >
                {item}
              </button>
            </li>
          ))}
          {canAddCustom ? (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(q)}
                className="w-full px-3 py-2 text-left text-sm text-teal-300 hover:bg-stone-800"
              >
                Använd «{q}»
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
