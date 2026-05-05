"use client";

import { useEffect, useRef } from "react";
import { LensScene } from "@/components/webgl/LensScene";
import { useTheme } from "@/components/ThemeProvider";
import { themes } from "@/lib/theme";

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<LensScene | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current || !sectionRef.current) return;
    const scene = new LensScene(canvasRef.current);
    sceneRef.current = scene;
    const section = sectionRef.current;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Section-scoped listener: pointer events only fire while the cursor is
    // over the hero. Outside, no updates reach the scene — parallax freezes
    // at its last in-hero value instead of drifting to out-of-bounds NDC
    // (clientY - rect.top can produce ny << -1 when the hero is scrolled
    // off) and snapping back on re-entry.
    //
    // Rect cached: `getBoundingClientRect()` per pointermove forced a layout
    // flush every move (often dozens/sec under Lenis smooth scroll). We cache
    // it at mount and refresh only on resize / scroll / Lenis tick.
    let rect = section.getBoundingClientRect();
    const refreshRect = () => {
      rect = section.getBoundingClientRect();
    };
    const handlePointer = (e: PointerEvent) => {
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      scene.setPointer(nx, ny);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (reduceMotion) return scene.stop();
        if (entry.isIntersecting) scene.start();
        else scene.stop();
      },
      { threshold: 0.05 },
    );
    io.observe(section);

    section.addEventListener("pointermove", handlePointer);
    window.addEventListener("resize", refreshRect, { passive: true });
    window.addEventListener("scroll", refreshRect, { passive: true });

    return () => {
      section.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("resize", refreshRect);
      window.removeEventListener("scroll", refreshRect);
      io.disconnect();
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Theme swap — push new colours / glass tint into the live scene's uniforms,
  // no remount. First run after mount syncs to the user's saved theme.
  useEffect(() => {
    const config = themes[theme];
    sceneRef.current?.updatePalette(config.hero, config.glass);
  }, [theme]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex h-svh w-full items-center justify-start overflow-hidden px-6 sm:px-12 md:px-20 lg:px-32"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <h1 className="relative z-10 w-full max-w-2xl text-3xl font-medium leading-[0.95] tracking-tight sm:max-w-3xl sm:text-5xl md:text-6xl">
        <span className="hero-line block">S<i className="font-serif italic">i</i>tes.</span>
        <span className="hero-line block">Appl<i className="font-serif italic">i</i>cations.</span>
        <span className="hero-line block">Intégrat<i className="font-serif italic">i</i>ons IA.</span>
      </h1>

      <div className="pointer-events-none absolute right-6 bottom-10 z-10 hidden sm:right-8 sm:bottom-14 sm:block">
        <svg
          viewBox="0 0 100 100"
          aria-hidden
          className="scroll-indicator h-24 w-24 text-foreground/70"
        >
          <defs>
            <path
              id="scroll-circle"
              d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
            />
          </defs>
          <text className="fill-current font-medium uppercase" style={{ fontSize: "9px", letterSpacing: "0.32em" }}>
            <textPath href="#scroll-circle">
              SCROLL DOWN · SCROLL DOWN ·{" "}
            </textPath>
          </text>
          <circle cx="50" cy="50" r="3" className="fill-current" />
        </svg>
      </div>
    </section>
  );
}
