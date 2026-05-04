import { ParisTime } from "@/components/ParisTime";

export function Footer() {
  return (
    <footer className="border-t border-foreground/10 bg-background">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid gap-14 py-16 sm:py-20 md:grid-cols-12 md:gap-10">
          <div className="flex flex-col gap-7 md:col-span-6">
            <div className="flex items-baseline gap-1">
              <span className="font-jakarta text-[28px] font-medium leading-none tracking-tight">
                synaptic
              </span>
              <span className="font-instrument-serif text-[30px] italic leading-none">
                studio
              </span>
            </div>

            <p className="max-w-md text-balance text-[15px] leading-relaxed text-foreground/65">
              Studio indépendant.
              <span className="text-foreground/40"> Sites, applications & intégrations IA</span>{" "}
              pensés et codés à la main pour marques et entrepreneurs exigeants.
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-medium uppercase tracking-[0.14em] text-foreground/55">
              <span className="inline-flex items-center gap-2.5">
                <span className="status-dot" aria-hidden />
                <span className="text-foreground">Disponible</span>
              </span>
              <span className="text-foreground/20" aria-hidden>
                ·
              </span>
              <ParisTime />
            </div>
          </div>

          <nav aria-label="Navigation du site" className="flex flex-col gap-4 md:col-span-3">
            <h4 className="text-xs font-medium uppercase tracking-[0.14em] text-foreground/35">
              Sitemap
            </h4>
            <ul className="flex flex-col gap-2.5 text-[15px]">
              <li>
                <a
                  href="#services"
                  className="text-foreground/70 underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#work"
                  className="text-foreground/70 underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline"
                >
                  Travaux
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-foreground/70 underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline"
                >
                  À propos
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-foreground/70 underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <div className="flex flex-col gap-4 md:col-span-3">
            <h4 className="text-xs font-medium uppercase tracking-[0.14em] text-foreground/35">
              Ailleurs
            </h4>
            <ul className="flex flex-col gap-2.5 text-[15px]">
              <li>
                <a
                  href="mailto:johanelm@gosynaptic.agency"
                  className="group inline-flex items-center gap-2 text-foreground/70 underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline"
                >
                  johanelm@gosynaptic.agency
                </a>
              </li>
              <li>
                <a
                  href="https://cal.com/your-handle"
                  className="group inline-flex items-center gap-1.5 text-foreground/70 underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline"
                >
                  Cal.com
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  >
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/your-handle"
                  className="group inline-flex items-center gap-1.5 text-foreground/70 underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline"
                >
                  GitHub
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  >
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/your-handle"
                  className="group inline-flex items-center gap-1.5 text-foreground/70 underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline"
                >
                  LinkedIn
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  >
                    ↗
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-foreground/10 py-6 text-xs font-medium uppercase tracking-[0.14em] tabular-nums text-foreground/40 sm:flex-row sm:items-center sm:gap-6">
          <span>
            © 2026 Johan
            <span className="mx-2 text-foreground/20">·</span>
            Built with Three.js & Next.js
          </span>
          <a
            href="#hero"
            className="group inline-flex items-center gap-2 text-foreground/55 transition-colors duration-200 hover:text-foreground"
          >
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5"
            >
              ↑
            </span>
            Retour en haut
          </a>
        </div>
      </div>
    </footer>
  );
}
