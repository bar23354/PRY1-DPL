import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Proyecto 01 | Interfaz Unificada",
  description: "Interfaz integrada para dashboard, analisis, generador lexico y gestor de pruebas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
