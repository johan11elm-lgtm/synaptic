const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vPos;

  uniform vec3 uBaseFirstColor;
  uniform vec3 uBaseSecondColor;
  uniform vec3 uBaseThirdColor;
  uniform vec3 uAccentColor;
  uniform float uTime;
  uniform float uZoom;
  uniform float uBaseFrequency;
  uniform float uAccentOpacity;
  uniform float uOpacity;
  uniform float uProgress;
  uniform float uGrainStrength;
  uniform vec2  uResolution;

  // Stefan Gustavson simplex noise (MIT — github.com/stegu/webgl-noise)
  vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise3(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  // Uniforms keep their original names but their meaning shifted with the
  // stripes → blobs rewrite:
  //   uBaseFirstColor  → main blob colour (lime)
  //   uBaseSecondColor → secondary blob colour (gold)
  //   uBaseThirdColor  → bright pocket / sparkle colour (pale lime)
  //   uAccentColor     → DARK BASELINE of the bg (deep teal), not a sparse accent
  //   uBaseFrequency   → global frequency multiplier (1.0 = default density)
  void main() {
    vec3 uv3 = vPos;
    float t  = uTime * 0.38;

    // Iterated domain warp (IQ-style). Pass 1 builds q, pass 2 samples r with q
    // as input offset. Feeding noise into noise is what gives the bg its
    // ferrofluid swirl — a single-pass warp just translates.
    vec3 q = vec3(
      snoise3(uv3 * 0.45 + vec3(t * 0.10,           0.0, 0.0)),
      snoise3(uv3 * 0.45 + vec3(0.0,       t * 0.10 + 41.0, 0.0)),
      snoise3(uv3 * 0.45 + vec3(0.0,       0.0, t * 0.10 + 17.0))
    );
    vec3 flow = vec3(
      snoise3(uv3 * 0.85 + 1.5 * q + vec3(t * 0.07,  5.2,  0.0)),
      snoise3(uv3 * 0.85 + 1.5 * q + vec3(0.0, t * 0.07 + 47.0, 8.3)),
      snoise3(uv3 * 0.85 + 1.5 * q + vec3(0.0,       0.0, t * 0.07 + 19.0))
    );
    vec3 sampPos = uv3 + 0.40 * flow;

    // Baseline — accent colour fills the empty space between blobs. Layers
    // are composited as mix() + pow(mask, 3) * gain : mix() handles the
    // body of each blob (works on either luminance baseline without blow-
    // out), and the cubic-falloff additive term injects glow on the
    // brightest centres so the bg keeps its luminous feel in dark mode
    // while staying readable in light.
    vec3 col = uAccentColor;

    // Layer 1 — large slow lime blobs. Threshold breathes on a slow sin so the
    // silhouette never reads as static.
    float bA = smoothstep(0.30 + 0.04 * sin(t * 0.31), 0.85,
      snoise3(sampPos * (0.55 * uBaseFrequency) + vec3(t * 0.13, 0.0, 0.0)));
    col = mix(col, uBaseFirstColor, bA * 0.90);
    col += uBaseFirstColor * pow(bA, 3.0) * 0.25;

    // Layer 2 — medium gold blobs, phase-offset so they don't track layer 1.
    float bB = smoothstep(0.42 + 0.04 * sin(t * 0.27 + 1.7), 0.90,
      snoise3(sampPos * (0.95 * uBaseFrequency) + vec3(11.0, t * 0.17, 0.0)));
    col = mix(col, uBaseSecondColor, bB * 0.75);
    col += uBaseSecondColor * pow(bB, 3.0) * 0.22;

    // Layer 3 — tight bright pockets. Higher freq + higher threshold means
    // these read as concentrated highlights, the kind that show up sharp on
    // the orb's rim.
    float bC = smoothstep(0.60 + 0.03 * sin(t * 0.37 + 3.1), 0.95,
      snoise3(sampPos * (1.60 * uBaseFrequency) + vec3(0.0, 17.0, t * 0.19)));
    col = mix(col, uBaseThirdColor, bC * 0.85);
    col += uBaseThirdColor * pow(bC, 3.0) * 0.20;

    // Layer 4 — sparkles. Higher threshold + intensity so they read as
    // intentional pinpoints, not digital noise.
    float spark = smoothstep(0.88, 0.97,
      snoise3(sampPos * (3.50 * uBaseFrequency) + vec3(t * 0.23, 23.0, 7.0)));
    col += uBaseThirdColor * spark * 0.40 * uAccentOpacity;

    // Soft vignette + reveal — same falloff family as before, slightly gentler.
    vec2 res = uResolution;
    vec2 st  = gl_FragCoord.xy / res - 0.5;
    st.y    *= res.y / res.x;
    float r  = length(st);
    float vignette = 1.0 - smoothstep(0.4, 1.2, r) * 0.40;
    float reveal   = smoothstep(0.0, 1.0, uProgress);
    col *= vignette * reveal;

    // Film grain — slow analogue crawl, unchanged.
    float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uTime * 0.6) * 43758.5453) - 0.5;
    col += grain * uGrainStrength;

    gl_FragColor = vec4(col, uOpacity);
  }
`;

export default fragmentShader;
