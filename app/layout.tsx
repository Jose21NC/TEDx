import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientScripts from "./components/ClientScripts";

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
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
        url: "/media/SPEAKERS_OG.jpg",
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
    <html lang="es" data-scroll-behavior="smooth">
      <head>
      </head>
      <body className={`${geistSans.className} antialiased`} suppressHydrationWarning>
        <ClientScripts />
        {children}
      </body>
    </html>
  );
}
