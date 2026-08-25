import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    contentDispositionType: "inline",
    // La caché de imágenes optimizadas (.next/cache/images) se corrompe al
    // escribirse en exFAT (el servidor sirve bytes basura con un
    // Content-Length correcto pero contenido inválido). Solo pasa en dev
    // local sobre este disco externo; en Vercel corre en otro filesystem
    // y no tiene el problema, así que ahí sigue optimizando normal.
    unoptimized: process.env.NODE_ENV === "development",
  },
  experimental: {
    // La caché persistente de Turbopack (activada por defecto en Next 16)
    // usa una base de datos en disco que se corrompe en volúmenes exFAT.
    // El proyecto vive en un disco externo exFAT: la desactivamos.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
