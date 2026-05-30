"use client";
import Link from "next/link";
import InteractiveParticles from "../components/InteractiveParticles";

export default function VoluntariosHero() {
  return (
    <section className="relative min-h-dvh flex items-center justify-center overflow-hidden bg-[#171314]">
      <InteractiveParticles className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="text-[var(--color-ted-red)] font-bold uppercase tracking-[0.3em] text-sm mb-6">
          Voluntariado
        </p>
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.92] mb-6">
          Ayúdanos a hacer realidad
          <br />
          <span className="text-[var(--color-ted-red)]">TEDx Avenida Bolívar</span>
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          Este es el primer TEDx Avenida Bolívar. Un evento creado por y para la comunidad.
          Buscamos personas con energía, compromiso y ganas de servir. Queremos que todas las voces, sin importar de donde vengan sean escuchadas.
          Se parte de esta experiencia única y ayúdanos a crear un evento inolvidable.
        </p>
        <Link
          href="/voluntariado"
          className="inline-block bg-[var(--color-ted-red)] hover:bg-[#c00020] text-white font-bold px-10 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-red-900/30"
        >
          Quiero ser voluntario
        </Link>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#171314] to-transparent pointer-events-none" />
    </section>
  );
}
