"use client";
import { useEffect, useState } from "react";
import ConvocatoriaForm from "./Form";
import Link from "next/link";

export default function ClientFormWrapper() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 5 days from 2026-07-02T20:02:17-06:00 is 2026-07-07T20:02:17-06:00
    const deadline = new Date("2026-07-07T20:02:17-06:00");
    const now = new Date();
    setIsOpen(now < deadline);
  }, []);

  if (!mounted) return null;

  if (!isOpen) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-2">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-[var(--color-ted-red)] mb-4">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Convocatoria Finalizada</h3>
        <p className="text-gray-600 text-sm max-w-sm mb-4">
          La convocatoria para speakers de esta edición de TEDx Avenida Bolivar ha finalizado oficialmente el lunes 10 de junio de 2026.
        </p>
        <p className="text-gray-500 text-xs max-w-xs">
          ¡Agradecemos enormemente tu interés en participar! Síguenos en nuestras redes sociales para estar al tanto de futuras ediciones y novedades del evento.
        </p>
        <Link href="/" className="mt-8 inline-flex items-center justify-center rounded-lg bg-[var(--color-ted-red)] px-5 py-3 font-semibold text-white transition-all hover:bg-[#c00020] hover:scale-[1.02] active:scale-[0.98] shadow-md">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return <ConvocatoriaForm />;
}
