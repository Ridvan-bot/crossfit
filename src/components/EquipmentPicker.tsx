"use client";

import { useMemo, useState } from "react";
import {
  EQUIPMENT_CATALOG,
  filterEquipmentCatalog,
  formatEquipmentNotes,
  parseEquipmentNotes,
} from "@/lib/equipment";

type Props = {
  name?: string;
  defaultValue?: string | null;
  className?: string;
  label?: string;
  hint?: string;
};

export function EquipmentPicker({
  name = "equipment_notes",
  defaultValue = "",
  className = "",
  label = "Utrustning",
  hint = "Välj från listan eller skriv eget och tryck Enter.",
}: Props) {
  const [selected, setSelected] = useState(() =>
    parseEquipmentNotes(defaultValue)
  );
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(
    () => filterEquipmentCatalog(query, selected),
    [query, selected]
  );

  const q = query.trim();
  const canAddCustom =
    q.length > 0 &&
    !selected.some((s) => s.toLowerCase() === q.toLowerCase()) &&
    !EQUIPMENT_CATALOG.some((s) => s.toLowerCase() === q.toLowerCase());

  function add(item: string) {
    const trimmed = item.trim();
    if (!trimmed) return;
    setSelected((prev) =>
      prev.some((s) => s.toLowerCase() === trimmed.toLowerCase())
        ? prev
        : [...prev, trimmed]
    );
    setQuery("");
    setOpen(false);
  }

  function remove(item: string) {
    setSelected((prev) => prev.filter((s) => s !== item));
  }

  return (
    <div className={`md:col-span-2 ${className}`}>
      <input type="hidden" name={name} value={formatEquipmentNotes(selected)} />
      <label className="mb-1.5 block text-sm text-stone-400">{label}</label>

      {selected.length > 0 ? (
        <ul className="mb-2 flex flex-wrap gap-2">
          {selected.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => remove(item)}
                className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/40 bg-teal-500/10 px-3 py-1 text-sm text-teal-100 hover:bg-teal-500/20"
                title="Ta bort"
              >
                {item}
                <span aria-hidden className="text-teal-400/80">
                  ×
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-2 text-sm text-stone-500">Inget valt ännu.</p>
      )}

      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay so list item click registers
            window.setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (suggestions[0]) add(suggestions[0]);
              else if (canAddCustom) add(q);
            }
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Sök eller lägg till utrustning…"
          autoComplete="off"
          className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 outline-none focus:border-teal-500/50"
        />

        {open && (suggestions.length > 0 || canAddCustom) ? (
          <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-stone-700 bg-stone-950 py-1 shadow-xl shadow-black/40">
            {suggestions.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => add(item)}
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
                  onClick={() => add(q)}
                  className="w-full px-3 py-2 text-left text-sm text-teal-300 hover:bg-stone-800"
                >
                  Lägg till «{q}»
                </button>
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
      <p className="mt-1.5 text-xs text-stone-500">{hint}</p>
    </div>
  );
}
