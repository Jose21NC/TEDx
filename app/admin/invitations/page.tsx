// app/admin/invitaciones/page.tsx
"use client";
import Header from "@/app/components/admin/Header";
import Footer from "@/app/components/admin/Footer";
import InvitationForm from "@/app/components/admin/InvitationForm";
import { useAuth, AuthProvider } from "@/app/components/Auth/AuthProvider";

function InvitationsContent() {
  const { logout } = useAuth();

  return (
    <main className="min-h-dvh flex flex-col bg-[#1a1a1a] text-white selection:bg-[var(--color-ted-red)] selection:text-white animate-page-fade">
      <Header logout={logout} />
      
      <div className="flex-1 mx-auto w-full max-w-[55rem] px-6 py-12 lg:py-16">
        
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

      <Footer />
    </main>
  );
}

// Envolvemos con el Provider para la autenticación
export default function InvitationsPage() {
  return (
    <AuthProvider>
      <InvitationsContent />
    </AuthProvider>
  );
}