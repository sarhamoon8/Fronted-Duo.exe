import type { Metadata, Viewport } from "next";
// Inter autoalojada (paquete @fontsource-variable/inter), la tipografía del diseño en Figma.
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "FilaCero", template: "%s · FilaCero" },
  description:
    "Turnos virtuales y seguimiento de la dispensación de medicamentos en servicios de salud.",
};

export const viewport: Viewport = {
  themeColor: "#115E59",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className="h-full antialiased">
      <body className="min-h-full bg-neutro text-tinta">{children}</body>
    </html>
  );
}
