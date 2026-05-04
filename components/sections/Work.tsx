import Image from "next/image";
import { LinkPreview } from "@/components/LinkPreview";

// Work — direction "film-poster éditorial". Un seul moment visuel : grand
// cadre 16/10 pleine largeur. À l'intérieur, un composite des 3 écrans clés
// de Réviz (accueil, prépare, mes cours) en triptyque, posé sur halo mint
// radial + gradient ambient. Une seule motion : reveal opacity+scale à
// l'entrée du viewport via view-timeline natif.
//
// L'image hero est `public/work/reviz-hero.png` — ratio ~2:1, alpha transparent
// pour que les 3 phones flottent sur le gradient du cadre. Pour la mettre à
// jour, remplace ce fichier en gardant un ratio proche de 2:1.
export function Work() {
  return (
    <section id="work" className="relative isolate overflow-clip border-t border-foreground/10">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32 md:py-40">
        <header className="mb-16 flex items-baseline justify-between sm:mb-20 md:mb-28">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-foreground/60">
            Sélection — Dernier projet en ligne
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.14em] tabular-nums text-foreground/40">
            2026
          </span>
        </header>

        <div className="mb-10 flex items-end justify-between gap-6 sm:mb-14 md:mb-16">
          <h3 className="text-balance text-6xl font-medium leading-[0.92] tracking-tight sm:text-7xl md:text-8xl lg:text-[8rem]">
            Rév<i className="font-serif italic italic-i-gradient">i</i>z
          </h3>
          <span className="hidden shrink-0 text-xs font-medium uppercase tracking-[0.14em] tabular-nums text-foreground/40 sm:block">
            N°&nbsp;01
          </span>
        </div>

        <LinkPreview
          url="https://reviz-landing.vercel.app/"
          imageAlt="Aperçu de la landing Réviz"
        >
          <a
            href="https://reviz-landing.vercel.app/"
            target="_blank"
            rel="noreferrer"
            aria-label="Ouvrir Réviz dans un nouvel onglet"
            className="work-feature group relative block aspect-[10522/5168] w-full overflow-hidden"
          >
            <div className="work-feature-fill absolute inset-0" />
            <div className="work-feature-aura absolute inset-0" />

            <div className="absolute -inset-[8%]">
              <Image
                src="/work/reviz-hero.png"
                alt="Réviz — trio d'écrans clés : accueil, préparation de session, mes cours"
                fill
                sizes="(max-width: 640px) 116vw, 1300px"
                className="object-contain"
                priority={false}
              />
            </div>

            <div className="work-feature-grain absolute inset-0" />

            <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-6 sm:p-10">
              <span className="text-xs font-medium uppercase tracking-[0.14em] tabular-nums text-background/80 sm:text-sm">
                reviz-landing.vercel.app
              </span>
              <span className="text-sm font-medium uppercase tracking-[0.14em] text-background transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
                →
              </span>
            </div>
          </a>
        </LinkPreview>

        <div className="mt-10 grid gap-10 sm:mt-14 md:mt-16 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-16">
          <p className="text-balance text-2xl font-medium leading-[1.25] tracking-tight text-foreground/80 sm:text-3xl">
            Plateforme de révision propulsée par l&apos;IA, pour aider les
            étudiants à réviser plus vite et mieux.
          </p>

          <dl className="grid h-fit gap-y-3 text-xs font-medium uppercase tracking-[0.14em] sm:grid-cols-[auto_1fr] sm:gap-x-6">
            <dt className="text-foreground/40">Rôle</dt>
            <dd className="text-foreground/75">
              Solo, du brief à la production
            </dd>
            <dt className="text-foreground/40">Stack</dt>
            <dd className="text-foreground/75">
              Next.js · React · TypeScript · IA
            </dd>
            <dt className="text-foreground/40">Statut</dt>
            <dd className="text-foreground/75">En ligne</dd>
            <dt className="text-foreground/40">Lien</dt>
            <dd>
              <a
                href="https://reviz-landing.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline-offset-4 hover:underline"
              >
                Voir le site live →
              </a>
            </dd>
          </dl>
        </div>
      </div>
    </section>
  );
}
