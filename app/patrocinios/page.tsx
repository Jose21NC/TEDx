"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getClientDb } from "../../lib/firebaseClient";
import logoBlack from "../media/logo-black.png";
import MobileNav from "../components/MobileNav";
import SponsorInquiryModal from "../components/SponsorInquiryModal";
import logoBoreal from "../media/logoBoreal.png";
import SponsorsCtaSection from "../components/SponsorsCtaSection";

type SponsorCard = {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  sponsorLevel: "main" | "sponsor" | "apoyo";
  logoScale?: number;
};

export default function PatrociniosPage() {
  const [sponsorsTedx, setSponsorsTedx] = useState<SponsorCard[]>([]);
  const [webSponsors, setWebSponsors] = useState<SponsorCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    let unsubTedx: () => void;
    let unsubWeb: () => void;
    try {
      const db = getClientDb();
      unsubTedx = onSnapshot(collection(db, "sponsorsTedx"), (snapshot) => {
        if (!alive) return;
        const items = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() as any }))
          .filter(r => (r.status === "Finalizado" || r.status === "Aprobada"))
          .map(r => {
            const levelText = String(r.sponsorLevel || "apoyo").toLowerCase();
            let level: "main" | "sponsor" | "apoyo" = "apoyo";
            if (levelText.includes("main")) level = "main";
            else if (levelText.includes("sponsor")) level = "sponsor";
            return {
              id: r.id,
              name: r.companyName || "Sponsor",
              logoUrl: r.logoUrl || "",
              website: r.website || r.url || "",
              sponsorLevel: level,
              logoScale: 1
            } as SponsorCard;
          });
        setSponsorsTedx(items);
        setLoading(false);
      });

      unsubWeb = onSnapshot(collection(db, "websiteSponsors"), (snapshot) => {
        if (!alive) return;
        const items = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            logoUrl: data.logoUrl,
            website: data.website,
            logoScale: data.logoScale ?? 1,
            visible: data.visible !== false,
            sponsorLevel: data.category === "Main Sponsor" ? "main" : data.category === "Sponsor" ? "sponsor" : "apoyo"
          } as SponsorCard & { visible: boolean };
        }).filter(s => s.visible);
        setWebSponsors(items as SponsorCard[]);
      });
      return () => { alive = false; if (unsubTedx) unsubTedx(); if (unsubWeb) unsubWeb(); };
    } catch {
      setLoading(false);
    }
  }, []);

  const combinedSponsors = [...webSponsors, ...sponsorsTedx].filter(s => s.logoUrl);
  // Remove duplicates based on lowercasing names or logoUrls.
  const uniqueMap = new Map();
  combinedSponsors.forEach(s => uniqueMap.set(s.logoUrl, s));
  const uniqueSponsors = Array.from(uniqueMap.values()) as SponsorCard[];

  const mainSponsors = uniqueSponsors.filter(s => s.sponsorLevel === "main");
  const midSponsors = uniqueSponsors.filter(s => s.sponsorLevel === "sponsor");
  const aliadoSponsors = uniqueSponsors.filter(s => s.sponsorLevel === "apoyo");

  const openLink = (url: string) => {
    if (!url) return;
    const finalUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    window.open(finalUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[var(--color-ted-red)] selection:text-white animate-page-fade">
      <header className="border-b border-black/5 bg-white text-[#222] sticky top-0 z-20">
        <nav className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 py-0.5">
          <Link href="/" className="flex items-center">
            <Image src={logoBlack} alt="TEDx Avenida Bolivar" className="h-14 w-auto sm:h-[4.5rem]" priority unoptimized />
          </Link>

          <ul className="hidden items-center gap-6 text-base font-medium md:flex">
            <li>
              <Link className="transition hover:text-[var(--color-ted-red)]" href="/">Inicio</Link>
            </li>
            <li>
              <Link className="transition hover:text-[var(--color-ted-red)]" href="/acerca">Acerca de</Link>
            </li>
            <li>
              <Link className="transition hover:text-[var(--color-ted-red)]" href="/patrocinios">Patrocinadores</Link>
            </li>
          </ul>
          <MobileNav />
        </nav>
      </header>

      <section className="mx-auto w-full max-w-7xl px-6 py-28">
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-5xl text-white mb-6">Sponsors Oficiales</h2>
        <p className="text-center text-gray-400 max-w-2xl mx-auto mb-16 text-lg">Agradecemos profundamente el respaldo de estas organizaciones excepcionales que han depositado su confianza en nuestra primera edición, impulsando las ideas que merecen ser divulgadas.</p>

        {loading ? (
          <p className="text-center text-gray-400 py-12">Cargando aliados institucionales...</p>
        ) : (
          <div className="space-y-16 mt-12 w-full">
            {/* Main Sponsors */}
            {mainSponsors.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-x-18 gap-y-24 md:gap-24 lg:gap-32">
                {mainSponsors.map(sp => (
                  <button key={sp.id} onClick={() => openLink(sp.website)} className="group relative block outline-none transition-transform hover:scale-105">
                    <img src={sp.logoUrl} style={{ transform: `scale(${sp.logoScale || 1})` }} alt={sp.name} className="max-h-24 md:max-h-32 max-w-[280px] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] [filter:brightness(0)_invert(1)]" />
                  </button>
                ))}
              </div>
            )}

            {mainSponsors.length > 0 && midSponsors.length > 0 && (
              <div className="mx-auto h-px w-full max-w-[1000px] bg-white/10" aria-hidden="true" />
            )}

            {/* Premium Sponsors */}
            {midSponsors.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-16 md:gap-16 lg:gap-24">
                {midSponsors.map(sp => (
                  <button key={sp.id} onClick={() => openLink(sp.website)} className="group relative block outline-none transition-transform hover:scale-105">
                    <img src={sp.logoUrl} style={{ transform: `scale(${sp.logoScale || 1})` }} alt={sp.name} className="max-h-16 md:max-h-20 max-w-[220px] object-contain opacity-80 hover:opacity-100 transition-opacity [filter:brightness(0)_invert(1)]" />
                  </button>
                ))}
              </div>
            )}

            {(mainSponsors.length > 0 || midSponsors.length > 0) && aliadoSponsors.length > 0 && (
              <div className="mx-auto h-px w-full max-w-[1000px] bg-white/10" aria-hidden="true" />
            )}

            {/* Aliados */}
            {aliadoSponsors.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-14 md:gap-14 lg:gap-20">
                {aliadoSponsors.map(sp => (
                  <button key={sp.id} onClick={() => openLink(sp.website)} className="group relative block outline-none transition-transform hover:scale-105">
                    <img src={sp.logoUrl} style={{ transform: `scale(${sp.logoScale || 1})` }} alt={sp.name} className="max-h-12 md:max-h-14 max-w-[200px] object-contain opacity-40 hover:opacity-80 transition-opacity [filter:brightness(0)_invert(1)]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-16 flex flex-col items-center gap-8 border-t border-white/10 pt-12">
          <div className="space-y-3 text-center text-base text-gray-300 md:text-[17px]">
            <p>¿Quieres sumarte como patrocinador? Da el primer paso y cuéntanos sobre tu empresa.</p>
            <SponsorInquiryModal />
          </div>
        </div>
      </section>

      <SponsorsCtaSection />
    </main>
  );
}
