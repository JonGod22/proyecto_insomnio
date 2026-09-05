import { hexToRgba, darkenHex, contrastText, lightenHex } from "@/lib/color-utils";

// Paletas curadas para el "kit de identidad" de la landing pública. Cada
// paleta ya viene con buen contraste probado — el dueño del negocio elige
// una de la lista en vez de tipear colores sueltos, así no hay forma de
// romper la legibilidad del sitio.
export type LandingPalette = {
  id: string;
  name: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  /** Mismo primary en rgba, para el resplandor (.halo) de los botones sobre foto. */
  primaryGlow: string;
  /** Versión más oscura de primary — para elementos chicos sobre superficies
   * blancas (ej. el chat del agente) donde el primary "puro" no da suficiente
   * contraste, sobre todo en paletas pasteles. */
  primaryDark: string;
  muted: string;
  mutedForeground: string;
  border: string;
};

export const LANDING_PALETTES: LandingPalette[] = [
  {
    id: "default",
    name: "Original",
    background: "#f8f9e9",
    foreground: "#0a0a0a",
    card: "#ffffff",
    cardForeground: "#0a0a0a",
    primary: "#fab200",
    primaryForeground: "#0a0a0a",
    primaryGlow: "rgba(250, 178, 0, 0.45)",
    primaryDark: "#7a5200",
    muted: "#efefe2",
    mutedForeground: "#7a7a6e",
    border: "#e3e3d4",
  },
  {
    id: "rosa",
    name: "Rosa",
    background: "#fdf3f2",
    foreground: "#2b1a1a",
    card: "#ffffff",
    cardForeground: "#2b1a1a",
    primary: "#e0788f",
    primaryForeground: "#2b1a1a",
    primaryGlow: "rgba(224, 120, 143, 0.45)",
    primaryDark: "#a14a5f",
    muted: "#f7e6e3",
    mutedForeground: "#8a6a68",
    border: "#f0d9d5",
  },
  {
    id: "salvia",
    name: "Verde salvia",
    background: "#f3f5ef",
    foreground: "#1c2118",
    card: "#ffffff",
    cardForeground: "#1c2118",
    primary: "#7a9471",
    primaryForeground: "#ffffff",
    primaryGlow: "rgba(122, 148, 113, 0.45)",
    primaryDark: "#4c6144",
    muted: "#e7ebe0",
    mutedForeground: "#6f7a66",
    border: "#dde3d3",
  },
  {
    id: "lavanda",
    name: "Lavanda",
    background: "#f6f4fb",
    foreground: "#211c2e",
    card: "#ffffff",
    cardForeground: "#211c2e",
    primary: "#8b7fd1",
    primaryForeground: "#ffffff",
    primaryGlow: "rgba(139, 127, 209, 0.45)",
    primaryDark: "#584c9e",
    muted: "#ece8f7",
    mutedForeground: "#756e94",
    border: "#e0daf1",
  },
  {
    id: "medianoche",
    name: "Medianoche",
    background: "#14161c",
    foreground: "#f2f2ea",
    card: "#1d2029",
    cardForeground: "#f2f2ea",
    primary: "#f2c14e",
    primaryForeground: "#14161c",
    primaryGlow: "rgba(242, 193, 78, 0.45)",
    primaryDark: "#b8860b",
    muted: "#22252f",
    mutedForeground: "#9a9da8",
    border: "#2b2f3a",
  },
];

export function getLandingPalette(id: string | undefined) {
  return LANDING_PALETTES.find((p) => p.id === id) ?? LANDING_PALETTES[0];
}

/**
 * "Personalizada" (plan Pro): el dueño del negocio elige solo 3 colores
 * (fondo, principal, texto) y el resto de la paleta (muted, glow, versión
 * oscura, etc.) se deriva automáticamente para garantizar contraste, en vez
 * de pedirle 9 colores sueltos.
 */
export function buildCustomPalette(custom: { background: string; foreground: string; primary: string }): LandingPalette {
  return {
    id: "custom",
    name: "Personalizada",
    background: custom.background,
    foreground: custom.foreground,
    card: lightenHex(custom.background, 0.6),
    cardForeground: custom.foreground,
    primary: custom.primary,
    primaryForeground: contrastText(custom.primary),
    primaryGlow: hexToRgba(custom.primary, 0.45),
    primaryDark: darkenHex(custom.primary, 0.4),
    muted: lightenHex(custom.background, 0.4),
    mutedForeground: lightenHex(custom.foreground, 0.35),
    border: lightenHex(custom.foreground, 0.85),
  };
}
