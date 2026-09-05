import { Poppins, Playfair_Display, Space_Grotesk, DM_Sans, Fraunces } from "next/font/google";

// Set curado de Google Fonts para el "kit de identidad" de la landing —
// autohospedadas por next/font (sin pedidos externos, sin CLS) y con pesos
// fijos. Nada de texto libre: el dueño del negocio elige una de la lista.
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "700"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700"] });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "600", "700"] });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "600", "700"] });

export const LANDING_FONTS = {
  default: { label: "Original", className: "" },
  poppins: { label: "Poppins", className: poppins.className },
  playfair: { label: "Playfair Display", className: playfair.className },
  space: { label: "Space Grotesk", className: spaceGrotesk.className },
  dm: { label: "DM Sans", className: dmSans.className },
  fraunces: { label: "Fraunces", className: fraunces.className },
} as const;

export type LandingFontId = keyof typeof LANDING_FONTS;
export const LANDING_FONT_IDS = Object.keys(LANDING_FONTS) as LandingFontId[];

export function getLandingFont(id: string | undefined) {
  return LANDING_FONTS[(id as LandingFontId) ?? "default"] ?? LANDING_FONTS.default;
}
