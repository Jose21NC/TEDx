// app/admin/invitations/page.tsx
"use client";
import Link from "next/link";
import InvitationForm from "../../components/admin/InvitationForm";

export default function InvitationsPage() {
  return (
    <main className="min-h-dvh flex flex-col bg-[#1a1a1a] text-white selection:bg-[var(--color-ted-red)] selection:text-white animate-page-fade">
      
      <div className="flex-1 mx-auto w-full max-w-[55rem] px-6 py-12 lg:py-16">
        
        {/* Enlace para volver */}
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            <span>Volver al Panel de Administración</span>
          </Link>
        </div>

        {/* Cabecera de la sección */}
        <header className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black border border-gray-800 rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-[var(--color-ted-red)] animate-pulse"></span>
            <span className="text-[10px] font-mono tracking-widest text-gray-400">HERRAMIENTA INTERNA</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-white tracking-tight">
            Generador de Invitaciones
          </h1>
          
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Ingresa los datos del prospecto a speaker. Esta información se utilizará para generar un documento PDF formal y personalizado bajo los estándares de TEDxAvenidaBolivar.
          </p>
        </header>

        {/* Contenedor del Formulario */}
        <section>
          <InvitationForm />
        </section>

      </div>
    </main>
  );
}