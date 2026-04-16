import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import logoBlack from "../media/logo-black.png";
import MobileNav from "../components/MobileNav";
import SponsorsCtaSection from "../components/SponsorsCtaSection";
import TeamShowcase from "../components/TeamShowcase";

export const metadata: Metadata = {
  title: "Equipo Organizador | TEDx Avenida Bolivar",
  description: "Conoce a las mentes brillantes y corazones apasionados que hacen posible TEDx Avenida Bolivar.",
};

export default function EquipoPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-[rgb(230,0,30)] selection:text-white animate-page-fade">
      <header className="border-b border-black/5 bg-white text-[#222] sticky top-0 z-[100]">
        <nav className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 py-0.5">
          <Link href="/" className="flex items-center">
            <Image src={logoBlack} alt="TEDx Avenida Bolivar" className="h-[4.5rem] w-auto" />
          </Link>

          <ul className="hidden items-center gap-6 text-base font-medium md:flex">
            <li>
              <Link className="transition hover:text-[rgb(230,0,30)]" href="/">Inicio</Link>
            </li>
            <li>
              <Link className="transition hover:text-[rgb(230,0,30)]" href="/acerca">Acerca de</Link>
            </li>
            <li>
              <Link className="transition hover:text-[rgb(230,0,30)]" href="/patrocinios">
                Patrocinadores
              </Link>
            </li>
          </ul>
          <MobileNav />
        </nav>
      </header>

      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,rgba(230,0,30,0.08),transparent_70%)] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-[rgb(230,0,30)] font-black uppercase tracking-[0.4em] text-xs mb-6">Detrás de escena</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-8">
            El Equipo <span className="text-white/40">Organizador</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-400 leading-relaxed font-medium">
            Somos un grupo de voluntarios apasionados por el poder de las ideas. Trabajamos meses para crear una plataforma donde la comunidad pueda conectar, aprender y trascender.
          </p>
        </div>
      </section>

      <TeamShowcase />

      <SponsorsCtaSection />
    </main>
  );
}
