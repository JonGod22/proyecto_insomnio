import {
  Raleway,
  Open_Sans,
  Playfair_Display,
  Montserrat,
  Oswald,
  Merriweather,
  Special_Elite,
  Mrs_Sheppards,
  Permanent_Marker,
} from "next/font/google";

// Parejas tipográficas curadas (título + texto), tomadas de combinaciones de
// Google Fonts con buen criterio de diseño (contraste de peso/estilo entre
// titular y cuerpo) — el dueño del negocio elige la pareja completa, no
// fuentes sueltas, así el resultado siempre queda bien armado.
const raleway = Raleway({ subsets: ["latin"], weight: ["400", "600", "700"] });
const openSans = Open_Sans({ subsets: ["latin"], weight: ["400", "600", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "700"] });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "600", "700"] });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "600", "700"] });
const merriweather = Merriweather({ subsets: ["latin"], weight: ["400", "700"] });
const specialElite = Special_Elite({ subsets: ["latin"], weight: ["400"] });
const mrsSheppard = Mrs_Sheppards({ subsets: ["latin"], weight: ["400"] });
const permanentMarker = Permanent_Marker({ subsets: ["latin"], weight: ["400"] });

type FontPair = {
  label: string;
  description: string;
  heading: { className: string; sample: string };
  body: { className: string };
};

export const LANDING_FONT_PAIRS: Record<string, FontPair> = {
  default: {
    label: "Original",
    description: "La tipografía de base del sistema.",
    heading: { className: "", sample: "Aa" },
    body: { className: "" },
  },
  editorial: {
    label: "Editorial",
    description: "Playfair Display + Raleway — elegante, ideal para estudios y salones.",
    heading: { className: playfair.className, sample: "Aa" },
    body: { className: raleway.className },
  },
  moderna: {
    label: "Moderna",
    description: "Montserrat + Oswald — dos sans serif en contraste, look actual.",
    heading: { className: montserrat.className, sample: "Aa" },
    body: { className: oswald.className },
  },
  clasica: {
    label: "Clásica",
    description: "Raleway + Open Sans — simple, prolija, funciona en cualquier rubro.",
    heading: { className: raleway.className, sample: "Aa" },
    body: { className: openSans.className },
  },
  femenina: {
    label: "Femenina",
    description: "Mrs Sheppard + Montserrat — script caligráfico para el título, prolijo abajo.",
    heading: { className: mrsSheppard.className, sample: "Aa" },
    body: { className: montserrat.className },
  },
  vintage: {
    label: "Vintage",
    description: "Merriweather + Special Elite — clásico con un toque de máquina de escribir.",
    heading: { className: merriweather.className, sample: "Aa" },
    body: { className: specialElite.className },
  },
  audaz: {
    label: "Audaz",
    description: "Permanent Marker + Open Sans — título gráfico y llamativo.",
    heading: { className: permanentMarker.className, sample: "Aa" },
    body: { className: openSans.className },
  },
};

export type LandingFontPairId = keyof typeof LANDING_FONT_PAIRS;
export const LANDING_FONT_PAIR_IDS = Object.keys(LANDING_FONT_PAIRS) as LandingFontPairId[];

export function getLandingFontPair(id: string | undefined) {
  return LANDING_FONT_PAIRS[(id as LandingFontPairId) ?? "default"] ?? LANDING_FONT_PAIRS.default;
}
