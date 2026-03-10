import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientScripts from "./components/ClientScripts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tedxavenidabolivar.com"),
  title: {
    default: "TEDx Avenida Bolivar",
    template: "%s | TEDx Avenida Bolivar",
  },
  description: "Sitio oficial de TEDx Avenida Bolivar. Ideas que vale la pena compartir desde Managua.",
  keywords: [
    "TEDx",
    "TEDx Avenida Bolivar",
    "Managua",
    "Ideas",
    "Conferencias",
    "Open Mic",
    "Speakers",
    "Nicaragua",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_NI",
    url: "https://tedxavenidabolivar.com",
    siteName: "TEDx Avenida Bolivar",
    title: "TEDx Avenida Bolivar",
    description: "Ideas que vale la pena compartir desde Managua.",
    images: [
      {
        url: "/media/SPEAKERS.png",
        width: 1200,
        height: 630,
        alt: "TEDx Avenida Bolivar - Convocatoria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TEDx Avenida Bolivar",
    description: "Ideas que vale la pena compartir desde Managua.",
    images: ["/media/SPEAKERS.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientScripts />
        {children}
      </body>
    </html>
  );
}
