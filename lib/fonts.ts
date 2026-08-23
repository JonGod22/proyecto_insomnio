import localFont from "next/font/local";

/**
 * Bricolage Grotesque — única tipografía del sistema (ver kit de marca).
 * Es variable: los ejes wdth/wght/opsz se controlan por CSS
 * (font-variation-settings), no por múltiples archivos. Display usa
 * ancho condensado + peso 800; cuerpo usa ancho normal + 400/500.
 */
export const bricolage = localFont({
  src: "../app/fonts/BricolageGrotesque-Variable.ttf",
  variable: "--font-bricolage",
  display: "swap",
});
