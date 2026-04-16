"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getClientDb } from "../../../lib/firebaseClient";
import confetti from "canvas-confetti";
import { Suspense } from "react";

import Image from "next/image";
import logoWhite from "../../media/logo-white.png";

function BienvenidaContent() {
  const searchParams = useSearchParams();
  const codigo = searchParams.get("c");
  const [data, setData] = useState<{ nombre: string; genero: string; tipo: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyCode() {
      if (!codigo) {
        setLoading(false);
        return;
      }
      try {
        const db = getClientDb();
        const q = query(collection(db, "invitacionesGeneradas"), where("code", "==", codigo));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const doc = snap.docs[0];
          setData({
            nombre: doc.data().nombre || "",
            genero: doc.data().genero || "Neutro",
            tipo: doc.data().tipo || "ponente"
          });

          // Lanzar Confeti extendido
          const duration = 1000;
          const end = Date.now() + duration;

          const frame = () => {
            confetti({
              particleCount: 5,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#EB0028', '#ffffff', '#000000']
            });
            confetti({
              particleCount: 5,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#EB0028', '#ffffff', '#000000']
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          frame();

        }
      } catch (error) {
        console.error("Error validando código:", error);
      } finally {
        setLoading(false);
      }
    }
    verifyCode();
  }, [codigo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center relative z-20">
        <div className="w-8 h-8 border-4 border-[var(--color-ted-red)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center text-white relative z-20">
        <h1 className="text-3xl font-bold mb-4">Código no validado</h1>
        <p className="mb-8 text-gray-400">Te estamos redirigiendo a la convocatoria general.</p>
        <Link href="/convocatoria" className="px-6 py-3 bg-[var(--color-ted-red)] text-white font-bold rounded hover:bg-red-700 transition">
          Ir a Convocatoria General
        </Link>
      </div>
    );
  }

  // Parsear Nombre y un Apellido (Evitar segundo nombre)
  const nameParts = data.nombre.trim().split(" ");
  let primerNombre = nameParts[0];
  let primerApellido = "";

  if (nameParts.length === 2) {
    primerApellido = nameParts[1];
  } else if (nameParts.length >= 3) {
    primerApellido = nameParts[2];
  }

  const shortName = primerApellido ? `${primerNombre} ${primerApellido}` : primerNombre;

  // Derivar saludo por genero estricto para evitar ambiguedades
  const saludo = data.genero === "Femenino" ? "Bienvenida" : "Bienvenido";

  const isSponsor = data.tipo === "sponsor";
  const buttonText = isSponsor ? "Explorar Alianzas" : "Continuar Postulación";
  const buttonLink = isSponsor ? "/patrocinios/solicitud/" : "/convocatoria"; // Fallback URL para patrocinadores

  return (
    <div className="relative z-10 w-full max-w-2xl mt-6 mx-auto">
      {/* Fondo Blanco del Modal */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 md:px-12 md:py-8 shadow-2xl relative overflow-hidden">
        {/* Banda Superior */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[var(--color-ted-red)]" />

        <div className="flex flex-col items-center text-center">

          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 text-[var(--color-ted-red)]">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight text-black">
            ¡{saludo}, <br className="hidden md:block" /> {shortName}!
          </h1>

          <div className="w-12 h-1 bg-[var(--color-ted-red)] my-4 rounded-full"></div>

          <p className="text-gray-700 text-lg md:text-lg leading-relaxed mb-3 max-w-sm">
            Agradecemos enormemente que te hayas tomado el tiempo de leer nuestra invitación{isSponsor ? " comercial" : ""}.
          </p>
          <p className="text-gray-500 text-sm md:text-sm leading-relaxed mb-8 max-w-sm">
            {isSponsor
              ? "Estás a un paso de explorar una alianza corporativa oficial y ayudarnos a dar vida a las grandes ideas de TEDxAvenida Bolivar."
              : "Estás a un paso de iniciar el proceso de selección oficial para compartir tu idea en TEDxAvenida Bolivar."
            }
          </p>

          <Link href={buttonLink} className="group relative w-full sm:w-auto overflow-hidden px-10 py-3 bg-[var(--color-ted-red)] text-white text-sm font-black tracking-[0.2em] uppercase rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(235,0,40,0.3)] flex items-center justify-center gap-3">
            <span className="relative z-10">{buttonText}</span>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>

        </div>
      </div>

      <div className="text-center flex flex-col items-center mt-6 space-y-2 pb-8">
        <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mt-1">El Arte de Reinventar</p>
        <p className="text-gray-600 text-[10px] uppercase tracking-widest">Código validado: {codigo}</p>

        {/* Logo TEDx White centrado y abajo */}
        <div className="w-48 mt-2">
          <Image src={logoWhite} alt="TEDx Logo" width={500} height={160} className="w-full object-contain opacity-80 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}

export default function InvitacionBienvenida() {
  return (
    <div className="min-h-screen relative flex flex-col justify-center p-6 overflow-hidden bg-[#0A0A0A] selection:bg-[var(--color-ted-red)] selection:text-white">
      {/* Background Decorativo */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-ted-red)]/10 rounded-full blur-[150px] opacity-70 transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--color-ted-red)]/5 rounded-full blur-[120px] opacity-50 transform -translate-x-1/3 translate-y-1/3" />
      </div>

      <Suspense fallback={<div className="text-white relative z-20 text-center mt-20">Cargando validación...</div>}>
        <BienvenidaContent />
      </Suspense>
    </div>
  );
}
