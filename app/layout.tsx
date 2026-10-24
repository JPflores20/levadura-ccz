/**
 * @fileoverview Layout raíz de la aplicación Next.js (App Router).
 * Configura tipografías Geist, metadatos del sistema HMI de Cervecería y notificaciones Toaster.
 */

import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const fuente_geist_sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const fuente_geist_mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Analisis de Levadura y Cineticas de Fermentacion- Reposo · HMI Cervecería",
  description:
    "Sistema de monitoreo de variables de propagación y cinética de levadura en la elaboración de cerveza.",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)"
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)"
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml"
      }
    ],
    apple: "/apple-icon.png"
  }
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
  ]
}

/**
 * Envuelve todas las páginas de la aplicación con el documento HTML y el proveedor de notificaciones.
 *
 * @param {{ children: React.ReactNode }} propiedades_layout - Contenido hijo de la ruta activa.
 * @returns {JSX.Element} Estructura HTML raíz.
 */
export default function RootLayout({
  children: contenido_pagina
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`dark bg-zinc-950 ${fuente_geist_sans.variable} ${fuente_geist_mono.variable}`}
    >
      <body className="font-sans antialiased">
        {contenido_pagina}
        <Toaster theme="dark" richColors position="top-center" />
      </body>
    </html>
  )
}
