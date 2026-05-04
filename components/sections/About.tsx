const ABOUT_COPY =
  "Autodidacte, j'ai appris en construisant. Réviz, app d'apprentissage IA pour collégiens, en est la preuve : conçue, codée, déployée seul de A à Z. Je travaille en solo — du brief à la production, un seul interlocuteur, décisions rapides, retours directs. Sites qui convertissent, apps qui tournent, intégrations IA utiles. Pixel près, perf serrée, zéro générique.";

const TOKENS = ABOUT_COPY.split(/(\s+)/);

export function About() {
  return (
    <section
      id="about"
      className="relative isolate overflow-clip border-t border-foreground/10 px-6 py-32 sm:px-8 md:py-48"
    >
      <p className="mx-auto mb-12 max-w-5xl text-base font-medium text-foreground/55 sm:mb-16 sm:text-lg md:mb-20">
        <span className="text-foreground">Johan</span>
        <span className="mx-2 text-foreground/30">—</span>
        dev autodidacte, fondateur de{" "}
        <i className="font-serif italic text-foreground">Synaptic</i>.
      </p>
      <p className="mx-auto max-w-5xl text-3xl font-medium leading-[1.15] tracking-tight sm:text-5xl md:text-7xl">
        {TOKENS.map((tok, i) =>
          /\s+/.test(tok) ? (
            <span key={i}>{tok}</span>
          ) : (
            <span
              key={i}
              data-reveal-word
              className="inline-block text-foreground/30"
            >
              {tok}
            </span>
          ),
        )}
      </p>
    </section>
  );
}
