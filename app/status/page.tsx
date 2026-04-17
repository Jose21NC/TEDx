"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logoBlack from "../media/logo-black.png";
import confetti from "canvas-confetti";
import MobileNav from "../components/MobileNav";

function StatusContent() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) {
      setError("No se ha proporcionado un ID de postulación válido.");
      setLoading(false);
      return;
    }

    async function fetchStatus() {
      try {
        const firebaseModule = await import("../../lib/firebaseClient");
        const firestore = await import("firebase/firestore");
        const db = firebaseModule.getClientDb();
        const docRef = firestore.doc(db, "ponentesTedx", applicationId as string);
        const snap = await firestore.getDoc(docRef);

        if (!snap.exists()) {
          setError("No se encontró la postulación correspondiente.");
        } else {
          setData({ id: snap.id, ...snap.data() });
        }
      } catch (err: any) {
        setError("Error de conexión al buscar el estado.");
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, [applicationId]);

  useEffect(() => {
    if (data?.status === 'Aprobada') {
      confetti({
        particleCount: 300,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#eb0028', '#ffffff', '#000000']
      });
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6, x: 0.3 },
          colors: ['#eb0028', '#ffffff', '#000000']
        });
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6, x: 0.7 },
          colors: ['#eb0028', '#ffffff', '#000000']
        });
      }, 400);
    }
  }, [data?.status]);

  return (
    <div className="flex-1 mx-auto w-full max-w-3xl px-6 py-4 md:py-8 text-center">
      {loading ? (
        <p className="text-gray-500 animate-pulse text-lg font-mono">Buscando estado de la postulación...</p>
      ) : error ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-lg mx-auto">
          <div className="w-12 h-12 bg-red-100 text-[var(--color-ted-red)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="font-bold">X</span>
          </div>
          <p className="font-semibold text-gray-800">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 md:p-12 relative text-left sm:text-center">
          <div
            className="absolute top-0 left-0 w-full h-2"
            style={{
              backgroundColor:
                data?.status === 'Aprobada' || data?.status === 'Aprobado' ? '#22c55e' :
                  data?.status === 'Rechazada' || data?.status === 'Rechazado' ? 'var(--color-ted-red)' :
                    data?.status === 'En revisión' || data?.status === 'Reserva' || data?.status === 'En revision' ? '#eab308' :
                      '#9ca3af'
            }}
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2 mt-4 tracking-tight">Hola, {data?.nombre ? data.nombre.split(' ').slice(0, 2).join(' ') : 'Postulante'}</h1>
          <p className="text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed">Este es el estado actual de tu postulación para ser ponente en TEDx Avenida Bolivar.</p>

          <div className="inline-flex flex-col items-center justify-center p-8 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner mb-8 w-full max-w-sm mx-auto">
            <div className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">Estado de Evaluación</div>
            <div
              className={`text-3xl font-black uppercase tracking-tight ${data?.status === 'Aprobada' || data?.status === 'Aprobado' ? 'text-green-600' :
                  data?.status === 'Rechazada' || data?.status === 'Rechazado' ? 'text-[var(--color-ted-red)]' :
                    data?.status === 'En revisión' || data?.status === 'Reserva' || data?.status === 'En revision' ? 'text-yellow-600' :
                      'text-gray-600'
                }`}
            >
              {data?.status === 'Reserva' ? 'En revisión' : (data?.status || 'Pendiente')}
            </div>
          </div>

          {(data?.status === 'Aprobada' || data?.status === 'Aprobado') && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-center">
              <p className="text-xl font-bold mb-2">¡Felicidades por este gran logro!</p>
              <p className="text-sm leading-relaxed">Has sido seleccionado para compartir tu idea en nuestro escenario. Estamos muy emocionados de tenerte y pronto nos pondremos en contacto contigo para coordinar los siguientes pasos.</p>
            </div>
          )}

          {(data?.status === 'Rechazada' || data?.status === 'Rechazado') && (
            <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl text-[var(--color-ted-red)] text-center">
              <p className="text-xl font-bold mb-2">Gracias por compartir tu voz</p>
              <p className="text-sm leading-relaxed">
                Queremos agradecerte sinceramente por el tiempo y la pasión que pusiste en tu propuesta. Aunque en esta ocasión no hemos podido incluir tu charla en el programa, esto no significa que tu idea no sea valiosa. 
                El proceso de selección es sumamente complejo debido al tiempo limitado del evento. Te alentamos a seguir puliendo tu idea y a participar en nuestras próximas iniciativas. ¡Tu perspectiva es importante para nosotros!
              </p>
            </div>
          )}

          <div className="mt-4 pt-8 border-t border-gray-100 text-sm md:text-base text-gray-600 text-left bg-white">
            <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-widest text-[11px]">Resumen de la Postulación</h3>
            <p className="mb-3 leading-relaxed"><strong>Charla propuesta:</strong> {data?.tituloCharla || data?.companyName || 'N/A'}</p>
            <p className="mb-3 leading-relaxed"><strong>Idea Central:</strong> {data?.idea || data?.eventInterest || 'N/A'}</p>
            <p className="mb-3"><strong>Categoría(s):</strong> {Array.isArray(data?.categorias) ? data.categorias.join(', ') : (data?.areas ? data.areas.join(', ') : 'N/A')}</p>
            <p className="mt-8 text-[11px] font-mono text-gray-400 text-center bg-gray-50 py-2 rounded border border-gray-100">ID de Validación: {data?.id}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationStatusPage() {
  return (
    <main className="min-h-dvh flex flex-col bg-gray-50 text-gray-900 animate-page-fade">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm">
        <nav className="relative mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 py-0.5">
          <Link href="/" className="flex items-center">
            <Image src={logoBlack} alt="TEDx Avenida Bolivar" className="h-14 w-auto sm:h-[4.5rem]" priority unoptimized />
          </Link>
          <MobileNav />
        </nav>
      </header>

      <Suspense fallback={<div className="flex-1 mx-auto w-full flex items-center justify-center py-20 text-gray-400 font-mono animate-pulse">Cargando estado...</div>}>
        <StatusContent />
      </Suspense>

      <footer className="border-t border-gray-200 bg-white px-6 py-8 text-sm text-gray-500 mt-auto">
        <div className="mx-auto flex w-full max-w-7xl justify-center text-center">
          <p>Este evento TEDx independiente se opera bajo licencia de TED.</p>
        </div>
      </footer>
    </main>
  );
}