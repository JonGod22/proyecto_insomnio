import type { Metadata } from "next";
import { bricolage } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proyecto Insomnio",
  description: "Sistema operativo modular para negocios de servicios.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${bricolage.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background">{children}</body>
    </html>
  );
}
