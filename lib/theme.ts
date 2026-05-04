// Theme palettes — Crystal Reflections family across both modes. Cyan glacier
// + pale lavender sit at opposite ends of the cool spectrum so the orb's
// chromatic dispersion (3 RGB refraction vectors) actually splits them into
// visible iridescence at the rim instead of refracting onto the same hue.
// Dark mode runs the cyan/lavender blobs on a deep indigo baseline; light
// mode keeps the same saturated hues on a cool cream-blue baseline. The
// glass tint flips per mode so the orb stays readable: dark indigo glass on
// dark, saturated mid-cyan glass on light (contrast comes from saturation,
// not luminance, against the cool cream).

export type Theme = "dark" | "light";

export type HeroPalette = {
  baseFirst: number;
  baseSecond: number;
  baseThird: number;
  accent: number;
};

export type GlassParams = {
  tint: number;
  tintAmount: number;
  rimColor: number;
  rimIntensity: number;
  rimPower: number;
  // Centre opacity of the orb (alpha at fresnel ≈ 0). Lower = more
  // transparent, page bg shows through more. The shader still adds a hover
  // lerp on top in ServiceOrbScene; this is the BASE.
  refractionPower: number;
};

export type ServiceTriplet = {
  colorA: number;
  colorB: number;
  colorC: number;
};

export type ThemeConfig = {
  hero: HeroPalette;
  glass: GlassParams;
  services: [ServiceTriplet, ServiceTriplet, ServiceTriplet];
};

export const themes: Record<Theme, ThemeConfig> = {
  dark: {
    hero: {
      baseFirst: 0x88e1ff, // cyan glacier — main blob
      baseSecond: 0xc8a8ff, // pale lavender — secondary blobs
      baseThird: 0xe6f4ff, // pearly sparkle pockets
      accent: 0x0a1828, // deep indigo baseline
    },
    glass: {
      tint: 0x0d1622, // night-blue glass body
      tintAmount: 0.32,
      rimColor: 0xffffff,
      rimIntensity: 0.4,
      rimPower: 3.0,
      refractionPower: 0.78,
    },
    services: [
      { colorA: 0x88e1ff, colorB: 0xc8a8ff, colorC: 0x0a1828 },
      { colorA: 0xc8a8ff, colorB: 0x88e1ff, colorC: 0x0a1828 },
      { colorA: 0x88e1ff, colorB: 0xc8a8ff, colorC: 0x05101c }, // deeper baseline
    ],
  },
  light: {
    hero: {
      // Same saturated cyan / lavender as dark mode — the bg shader uses
      // mix() (not addition) so blobs read as punchy patches of cool colour
      // on the cool-cream baseline instead of blowing out into white.
      baseFirst: 0x88e1ff,
      baseSecond: 0xc8a8ff,
      baseThird: 0xfff4fa, // pearly rosé sparkle (additive low gain)
      accent: 0xeef2f8, // cool cream-blue baseline (matches page bg in light mode)
    },
    glass: {
      // Pivot from "dark glass" to "saturated mid-cyan glass" in light mode.
      // The cool cream bg cannot host a near-black orb without it reading
      // as a copy-paste accident; equally, a near-cream orb on cream has
      // zero contrast. We saturate the orb in a hue from the palette family
      // (cyan glacier → mid-cyan) so the contrast comes from SATURATION
      // against the cool baseline, not luminance. The orb becomes a tinted
      // crystal rather than a smoke shape, and the rim Fresnel still splits
      // chromatically into a faint iris at the edge.
      tint: 0x4ab8e8,
      tintAmount: 0.5,
      // White rim still works because the orb body is now mid-luminance
      // (saturated cyan), so a bright additive on top reads as a sharp
      // glass edge — same logic as the previous chartreuse-glass version.
      rimColor: 0xffffff,
      rimIntensity: 0.55,
      rimPower: 3.0,
      // refractionPower drives the alpha at the orb centre BEFORE the shader
      // forces gl_FragColor.a = 1.0, so it no longer affects the visible
      // pixel. Kept around for parity with dark mode and future toggles.
      refractionPower: 0.78,
    },
    services: [
      { colorA: 0x88e1ff, colorB: 0xc8a8ff, colorC: 0xeef2f8 },
      { colorA: 0xc8a8ff, colorB: 0x88e1ff, colorC: 0xeef2f8 },
      { colorA: 0x88e1ff, colorB: 0xc8a8ff, colorC: 0xd6dde8 }, // slightly cooler-grey baseline for contrast
    ],
  },
};

export const DEFAULT_THEME: Theme = "dark";
