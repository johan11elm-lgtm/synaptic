"use client";

import { SectionIndicator } from "@/components/SectionIndicator";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteChrome() {
  return (
    <>
      <div className="fixed left-6 top-6 z-20 flex items-baseline gap-1 sm:left-8 sm:top-8">
        <span className="font-sans text-[22px] font-medium leading-none tracking-tight sm:text-[25px]">
          synaptic
        </span>
        <span className="font-instrument-serif text-[24px] italic leading-none sm:text-[27px]">
          studio
        </span>
      </div>
      <SectionIndicator />
      <ThemeToggle />
    </>
  );
}
