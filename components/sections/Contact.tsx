"use client";

import { useEffect, useRef } from "react";

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      section.classList.add("is-revealed");
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add("is-revealed");
          io.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative isolate overflow-hidden bg-foreground px-6 pb-20 pt-28 text-background sm:px-8 sm:pb-24 sm:pt-36 md:pb-32 md:pt-44"
    >
      <div className="relative z-10 mx-auto grid max-w-6xl gap-16 md:grid-cols-12 md:gap-10">
        <div className="flex flex-col gap-10 md:col-span-9">
          <div
            data-contact-reveal="1"
            className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-background/60"
          >
            <span className="status-dot" aria-hidden />
            <span>Disponible</span>
          </div>

          <h2
            data-contact-reveal="2"
            className="text-balance text-6xl font-medium leading-[0.95] tracking-tight sm:text-7xl md:text-8xl lg:text-[8.5rem] lg:leading-[0.92]"
          >
            On en d<i className="font-serif italic italic-i-gradient">i</i>scute&nbsp;?
          </h2>

          <div data-contact-reveal="3" className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-background/40">
              Parlez-moi de votre projet
            </span>
            <a
              href="mailto:johanelm@gosynaptic.agency"
              className="email-gradient inline-block max-w-fit text-balance text-3xl font-medium leading-[1.05] tracking-tight transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 sm:text-5xl md:text-6xl"
            >
              johanelm@gosynaptic.agency
            </a>
          </div>

          <div data-contact-reveal="4" className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-background/40">
              Suivre
            </span>
            <a
              href="https://www.instagram.com/synapticagency/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex max-w-fit items-center gap-3 text-2xl font-medium tracking-tight transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 sm:text-3xl md:text-4xl"
            >
              <span>@synapticagency</span>
              <span
                aria-hidden
                className="inline-block text-base transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:-translate-y-0.5 sm:text-lg"
              >
                ↗
              </span>
            </a>
          </div>
        </div>

        <aside
          data-contact-reveal="5"
          aria-label="Informations pratiques"
          className="border-t border-background/15 pt-10 md:col-span-3 md:border-l md:border-t-0 md:pl-10 md:pt-0"
        >
          <dl className="grid gap-y-5 text-xs font-medium uppercase tracking-[0.14em]">
            <dt className="text-background/40">Basé en</dt>
            <dd className="text-background/85">France</dd>
            <dt className="text-background/40">Langues</dt>
            <dd className="text-background/85">Français · English</dd>
            <dt className="text-background/40">Réponse</dt>
            <dd className="text-background/85">Sous 24 heures</dd>
          </dl>
        </aside>
      </div>
    </section>
  );
}
