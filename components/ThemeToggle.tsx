"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  // Inverse les couleurs du bouton quand la section Contact occupe le bas du
  // viewport (Contact a `bg-foreground text-background`, donc nos couleurs par
  // défaut deviendraient illisibles). rootMargin focalisé sur les ~10% bas du
  // viewport — la zone où vit physiquement le toggle.
  const [onInverted, setOnInverted] = useState(false);
  useEffect(() => {
    const el = document.getElementById("contact");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setOnInverted(entry.isIntersecting),
      { rootMargin: "-90% 0px 0px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const colorClasses = onInverted
    ? "border-background/20 bg-foreground/30 text-background/70 hover:border-background/40 hover:text-background"
    : "border-foreground/15 bg-background/40 text-foreground/70 hover:border-foreground/35 hover:text-foreground";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
      className={`fixed bottom-6 left-6 z-30 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-[colors,transform] duration-300 hover:scale-105 motion-reduce:hover:scale-100 sm:bottom-8 sm:left-8 ${colorClasses}`}
    >
      <span className="relative block h-[18px] w-[18px]">
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className={`absolute inset-0 h-full w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:transform-none ${
            isDark
              ? "rotate-[-90deg] scale-50 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v1.6M12 19.4V21M3 12h1.6M19.4 12H21M5.6 5.6l1.1 1.1M17.3 17.3l1.1 1.1M5.6 18.4l1.1-1.1M17.3 6.7l1.1-1.1" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className={`absolute inset-0 h-full w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:transform-none ${
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-[90deg] scale-50 opacity-0"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
        </svg>
      </span>
    </button>
  );
}
