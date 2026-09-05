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
  heading: { className: string; sample: string; family?: string; fileUrl?: string };
  body: { className: string; family?: string; fileUrl?: string };
};

export const CUSTOM_HEADING_FONT_FAMILY = "landing-custom-heading";
export const CUSTOM_BODY_FONT_FAMILY = "landing-custom-body";

/** Adivina el `format()` de @font-face a partir de la extensión del archivo. */
export function fontFileFormat(url: string) {
  const ext = url.split(".").pop()?.toLowerCase().split("?")[0];
  switch (ext) {
    case "woff2":
      return "woff2";
    case "woff":
      return "woff";
    case "ttf":
      return "truetype";
    case "otf":
      return "opentype";
    default:
      return "woff2";
  }
}

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

/**
 * "custom" no es una pareja de la lista — son dos tipografías (título y
 * texto) que el dueño del negocio elige a mano (plan Pro), cada una de dos
 * formas posibles:
 *   - un archivo propio (woff2/woff/ttf/otf) subido por él — tiene prioridad,
 *     se sirve vía @font-face con un nombre de familia fijo.
 *   - o, si no subió archivo, el nombre de una familia de Google Fonts,
 *     cargada en vivo con un <link> (next/font solo soporta fuentes
 *     elegidas en build time).
 */
export function getLandingFontPair(
  id: string | undefined,
  customHeadingFamily?: string,
  customBodyFamily?: string,
  customHeadingFileUrl?: string,
  customBodyFileUrl?: string
) {
  if (id === "custom" && (customHeadingFamily || customBodyFamily || customHeadingFileUrl || customBodyFileUrl)) {
    const heading = customHeadingFileUrl ? CUSTOM_HEADING_FONT_FAMILY : customHeadingFamily || customBodyFamily;
    const body = customBodyFileUrl ? CUSTOM_BODY_FONT_FAMILY : customBodyFamily || customHeadingFamily;
    return {
      label: "Personalizada",
      description: [customHeadingFamily, customBodyFamily].filter(Boolean).join(" + "),
      heading: { className: "", sample: "Aa", family: heading, fileUrl: customHeadingFileUrl },
      body: { className: "", family: body, fileUrl: customBodyFileUrl },
    };
  }
  return LANDING_FONT_PAIRS[(id as LandingFontPairId) ?? "default"] ?? LANDING_FONT_PAIRS.default;
}

export function googleFontsCssUrl(family: string) {
  const encoded = encodeURIComponent(family.trim());
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;600;700&display=swap`;
}
