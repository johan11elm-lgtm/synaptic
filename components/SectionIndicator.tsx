"use client";

import { useMemo } from "react";
import { useActiveSection } from "@/lib/use-active-section";

const SECTIONS = [
  { id: "hero", label: "INDEX" },
  { id: "services", label: "SERVICES" },
  { id: "work", label: "PROJETS" },
  { id: "about", label: "À PROPOS" },
  { id: "contact", label: "CONTACT" },
] as const;

export function SectionIndicator() {
  const ids = useMemo(() => SECTIONS.map((s) => s.id), []);
  const active = useActiveSection(ids);

  return (
    <nav
      aria-label="Sections du site"
      className="pointer-events-none fixed right-6 top-6 z-20 hidden sm:right-8 sm:top-8 sm:block"
    >
      <ul className="flex flex-col items-end gap-2">
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`pointer-events-auto block text-xs font-medium uppercase tracking-[0.14em] transition-opacity duration-300 focus-visible:opacity-100 focus-visible:outline-none ${
                  isActive ? "opacity-100" : "opacity-50 hover:opacity-80"
                }`}
              >
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
