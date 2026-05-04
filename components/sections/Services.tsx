"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ServiceOrbScene,
  type ServiceMotion,
} from "@/components/webgl/ServiceOrbScene";
import { useTheme } from "@/components/ThemeProvider";
import { themes } from "@/lib/theme";

type Service = {
  num: string;
  title: ReactNode;
  body: string;
  motion: ServiceMotion;
};

const services: Service[] = [
  {
    num: "01",
    title: (
      <>
        S<i className="font-serif italic italic-i-gradient">i</i>tes web
      </>
    ),
    body: "Landing, vitrine ou site complet, design sur mesure, animations subtiles, performances de premier ordre.",
    // Calme et ample — drift large, rotation visible (~14s/tour), satellite
    // en orbite ouverte qui flotte autour.
    motion: {
      drift: { ampX: 0.32, ampY: 0.22, freqX: 0.28, freqY: 0.22, rotSpeed: 0.45 },
      orbit: { speed: 0.4, radiusX: 1.05, radiusY: 0.5, radiusZ: 0.5, phaseOffset: 0 },
    },
  },
  {
    num: "02",
    title: (
      <>
        Appl<i className="font-serif italic italic-i-gradient">i</i>cations
      </>
    ),
    body: "Web apps de zéro, interfaces fluides, gestion d'état pensée pour scaler, et un soin du détail à chaque interaction.",
    // Vif et net — rotation rapide (~10s/tour), satellite en orbite serrée
    // tournant dans le sens opposé (speed négatif).
    motion: {
      drift: { ampX: 0.24, ampY: 0.32, freqX: 0.42, freqY: 0.36, rotSpeed: 0.62 },
      orbit: { speed: -0.7, radiusX: 0.85, radiusY: 0.7, radiusZ: 0.35, phaseOffset: 1.4 },
    },
  },
  {
    num: "03",
    title: (
      <>
        <i className="font-serif italic italic-i-gradient">I</i>ntégrations IA
      </>
    ),
    body: "Branchement de modèles Anthropic et OpenAI dans vos flux : chatbots, génération de contenu, agents, automatisations.",
    // Flottant et 3D — rotation modérée, satellite en orbite très inclinée
    // qui passe nettement devant et derrière la principale (gros radiusZ).
    motion: {
      drift: { ampX: 0.18, ampY: 0.28, freqX: 0.22, freqY: 0.18, rotSpeed: 0.32 },
      orbit: { speed: 0.55, radiusX: 0.95, radiusY: 0.4, radiusZ: 1.2, phaseOffset: 2.7 },
    },
  },
];

function ServiceItem({ service, index }: { service: Service; index: number }) {
  const articleRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ServiceOrbScene | null>(null);
  const [hovered, setHovered] = useState(false);
  const { theme } = useTheme();

  // Palette / halo derive from the current theme on every render — the live
  // scene is updated through updatePalette() in the theme effect below, and
  // the CSS halo flips through inline style here.
  const config = themes[theme];
  const palette = config.services[index];

  useEffect(() => {
    const article = articleRef.current;
    const canvas = canvasRef.current;
    if (!article || !canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealIO = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          article.classList.add("is-revealed");
          revealIO.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    revealIO.observe(article);

    if (reduceMotion) {
      article.classList.add("is-revealed");
      return () => revealIO.disconnect();
    }

    // Mount with dark defaults; the theme effect below syncs uniforms to the
    // active theme on the first commit (no flash, no remount).
    const initial = themes.dark;
    const scene = new ServiceOrbScene(
      canvas,
      initial.services[index],
      service.motion,
      initial.glass,
    );
    sceneRef.current = scene;

    const playIO = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? scene.start() : scene.stop()),
      { threshold: 0.1 },
    );
    playIO.observe(article);

    return () => {
      revealIO.disconnect();
      playIO.disconnect();
      scene.dispose();
      sceneRef.current = null;
    };
  }, [service.motion, index]);

  // Theme swap — push new colours / glass into live uniforms, no remount.
  useEffect(() => {
    const cfg = themes[theme];
    sceneRef.current?.updatePalette(cfg.services[index], cfg.glass);
  }, [theme, index]);

  useEffect(() => {
    sceneRef.current?.setHover(hovered);
  }, [hovered]);

  return (
    <article
      ref={articleRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="service-item border-t border-foreground/10"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24 md:py-32">
        <div className="grid items-start gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <div
            className="service-orb-wrap relative mx-auto aspect-square w-full max-w-sm md:max-w-md"
            style={{ "--orb-halo": `#${(palette.colorA as number).toString(16).padStart(6, "0")}` } as CSSProperties}
          >
            <canvas ref={canvasRef} className="block h-full w-full" aria-hidden />
          </div>

          <div className="service-body flex flex-col gap-5 sm:gap-6 md:gap-8">
            <div className="service-title-row flex gap-4 sm:gap-6 md:gap-8">
              <span className="mt-2 shrink-0 text-xs font-medium uppercase tracking-[0.14em] tabular-nums text-foreground/40 md:mt-3">
                {service.num}
              </span>
              <h3 className="text-balance text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                {service.title}
              </h3>
            </div>
            <p className="service-paragraph text-balance text-2xl font-medium leading-[1.2] tracking-tight text-foreground/70 sm:text-3xl md:text-4xl">
              {service.body}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Services() {
  return (
    <section id="services" className="relative isolate overflow-clip">
      <div className="mx-auto max-w-6xl px-6 pt-24 sm:px-8 sm:pt-32 md:pt-40">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">Services</h2>
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-foreground/60">
            Trois manières de travailler ensemble
          </span>
        </header>
      </div>

      <div className="services-marquee mt-12 overflow-x-clip sm:mt-16">
        <div
          aria-hidden
          className="services-marquee-track flex whitespace-nowrap pl-[8vw] text-[8vw] font-medium leading-none tracking-tight will-change-transform"
        >
          <span className="pr-[0.4em]">Conception, code, animation —</span>
          <span className="pr-[0.4em]">Conception, code, animation —</span>
          <span className="pr-[0.4em]">Conception, code, animation —</span>
          <span className="pr-[0.4em]">Conception, code, animation —</span>
        </div>
      </div>

      <div className="mt-12 sm:mt-20 md:mt-28">
        {services.map((s, i) => (
          <ServiceItem key={s.num} service={s} index={i} />
        ))}
      </div>
    </section>
  );
}
