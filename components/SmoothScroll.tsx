"use client";

import { ReactLenis } from "lenis/react";
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return true;
}

// `<ReactLenis root>` ne wrap aucun DOM (juste un Provider + attache Lenis à
// window). On le garde TOUJOURS monté et on toggle le comportement via les
// options : flipper `smoothWheel`/`anchors` recrée l'instance Lenis en
// interne mais l'arbre React ne change pas, donc les enfants ne remontent
// jamais — pas de remontage du Hero / dispose+recreate de LensScene / restart
// des keyframes `.hero-line` quand le snapshot reducedMotion bascule de la
// valeur SSR (true) à la valeur client (false) après hydratation.
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reducedMotion = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.15,
        anchors: !reducedMotion,
        smoothWheel: !reducedMotion,
      }}
    >
      {children}
    </ReactLenis>
  );
}
