import type { Metadata } from "next";
import { Geist, Fraunces, Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SmoothScroll } from "@/components/SmoothScroll";

// Anti-FOUC theme init: reads the saved theme from localStorage and writes
// `<html data-theme>` before page hydration. Inlined into <head> as a static
// <script> — the layout is a Server Component so React hydrates the tag in
// place rather than re-creating it client-side (which would trigger the
// "Encountered a script tag while rendering React component" warning that
// next/script triggers because its rendered <script> is matched as a
// non-data block during hydration).
const themeInitScript = `(() => {
  try {
    var t = localStorage.getItem('portfolio-theme');
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
    else document.documentElement.dataset.theme = 'light';
  } catch (_) {
    document.documentElement.dataset.theme = 'light';
  }
})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  style: ["normal", "italic"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Johan — Sites, applications & intégrations IA",
  description:
    "Indépendant. Sites web, applications et intégrations IA, pensés et codés à la main pour marques et entrepreneurs exigeants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} ${plusJakarta.variable} ${instrumentSerif.variable} antialiased`}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
