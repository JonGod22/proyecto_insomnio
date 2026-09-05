// Utilidades chicas para derivar una paleta completa a partir de 3 colores
// elegidos a mano (fondo/principal/texto) en el selector "Personalizada" del
// Landing Builder — sin esto habría que pedirle al usuario 9 colores en vez
// de 3, y seguro terminaría con contrastes rotos.

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex([r, g, b]: [number, number, number]) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}

export function hexToRgba(hex: string, alpha: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function darkenHex(hex: string, amount = 0.35) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex([r * (1 - amount), g * (1 - amount), b * (1 - amount)]);
}

/** Negro o blanco, el que dé más contraste sobre ese color de fondo. */
export function contrastText(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0a0a0a" : "#ffffff";
}

export function lightenHex(hex: string, amount = 0.9) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex([r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount]);
}
