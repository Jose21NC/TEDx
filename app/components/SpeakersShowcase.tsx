"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { collection, onSnapshot } from "firebase/firestore";
import { createPortal } from "react-dom";
import { getClientDb } from "../../lib/firebaseClient";

type SpeakerRecord = {
  id: string;
  nombre?: string;
  tituloCharla?: string;
  idea?: string;
  novedad?: string;
  perfil?: string;
  photoUrl?: string;
  fotoPerfil?: string;
  status?: string;
  createdAt?: { seconds?: number } | string | number | null;
};

type SpeakerCard = {
  id: string;
  name: string;
  topic: string;
  bio: string;
  profile: string;
  initials: string;
  tone: string;
  photoUrl: string;
};

const colorPairs = [
  "from-white/18 to-white/4",
  "from-[var(--color-ted-red)]/30 to-white/6",
  "from-cyan-300/20 to-white/5",
  "from-amber-300/20 to-white/5",
  "from-emerald-300/20 to-white/5",
  "from-fuchsia-300/20 to-white/5",
];

function normalizeStatus(value: string | undefined) {
  if (!value || value === "Sin revisar" || value === "Pendiente") return "Pendiente";
  return value;
}

function formatSpeaker(record: SpeakerRecord, index: number): SpeakerCard {
  const name = record.nombre?.trim() || "Ponente TEDx";
  const topic = record.tituloCharla?.trim() || "Idea por anunciar";
  const bio = record.idea?.trim() || record.novedad?.trim() || "Estamos preparando nuevas voces para esta edición.";
  const profile = record.perfil?.trim() || "TEDx Speaker";
  const photoUrl = record.photoUrl?.trim() || record.fotoPerfil?.trim() || "";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2) || "TD";

  return {
    id: record.id,
    name,
    topic,
    bio,
    profile,
    initials,
    tone: colorPairs[index % colorPairs.length],
    photoUrl,
  };
}

export default function SpeakersShowcase() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<SpeakerCard | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [speakers, setSpeakers] = useState<SpeakerCard[]>([]);
  const [scrollY, setScrollY] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "200px" });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY || 0);
        raf = 0;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!isInView) return;
    let alive = true;

    try {
      const db = getClientDb();
      const col = collection(db, "ponentesTedx");

      const unsubscribe = onSnapshot(
        col,
        (snapshot) => {
          if (!alive) return;

          const items = snapshot.docs
            .map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<SpeakerRecord, "id">) }))
            .filter((record) => normalizeStatus(record.status) === "Aprobada" && record.publicarEnWeb !== false)
            .sort((a, b) => {
              const ta = typeof a.createdAt === "object" && a.createdAt && "seconds" in a.createdAt ? a.createdAt.seconds ?? 0 : 0;
              const tb = typeof b.createdAt === "object" && b.createdAt && "seconds" in b.createdAt ? b.createdAt.seconds ?? 0 : 0;
              return tb - ta;
            })
            .map((record, index) => formatSpeaker(record, index));

          setSpeakers(items);
          setError("");
          setLoading(false);
        },
        (snapshotError) => {
          if (!alive) return;
          setError(snapshotError.message || "No se pudo conectar con Firebase.");
          setLoading(false);
        },
      );

      return () => {
        alive = false;
        unsubscribe();
      };
    } catch (setupError: any) {
      setError(setupError?.message || "No se pudo inicializar Firebase.");
      setLoading(false);
      return () => {
        alive = false;
      };
    }
  }, [isInView]);

  useEffect(() => {
    if (!selectedSpeaker) return;

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedSpeaker(null);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEsc);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onEsc);
    };
  }, [selectedSpeaker]);

  const emptyMotion = useMemo(
    () => ({
      initial: { opacity: 0, y: 18, scale: 0.985 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    }),
    [],
  );

  return (
    <section ref={sectionRef} aria-labelledby="speakers-heading" className="px-6 pb-16 md:px-10 md:pb-20">
      <div className="mx-auto w-full max-w-[1450px]">
        <h2
          id="speakers-heading"
          className="text-center [font-family:Inter,system-ui,sans-serif] text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.02em] text-white"
        >
          Speakers
        </h2>

        {loading ? (
          <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4" aria-busy="true" aria-live="polite">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-sm bg-white/5">
                <div className="aspect-square animate-pulse bg-white/8" />
                <div className="space-y-2 pt-3">
                  <div className="h-4 w-3/4 animate-pulse bg-white/10" />
                  <div className="h-3 w-1/2 animate-pulse bg-white/8" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <motion.div
            className="mt-10 rounded-md bg-white/5 px-6 py-14 text-center text-white/80"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm uppercase tracking-[0.22em] text-white/45">Error de conexión</p>
            <p className="mt-3 text-lg">No se pudo cargar la lista de speakers en este momento.</p>
          </motion.div>
        ) : speakers.length === 0 ? (
          <motion.div
            className="relative mt-10 overflow-hidden rounded-md bg-white/[0.03] px-6 py-20 text-center text-white"
            {...emptyMotion}
          >
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              animate={{ opacity: [0.35, 0.6, 0.35] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
              <div className="absolute right-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-[var(--color-ted-red)]/10 blur-2xl" />
              <div className="absolute left-10 bottom-8 h-20 w-20 rounded-full bg-white/6 blur-2xl" />
            </motion.div>
            <div className="relative mx-auto max-w-2xl">
              <p className="text-[clamp(2.4rem,6vw,4.6rem)] font-black tracking-[-0.08em] text-white">
                PROXIMAMENTE
              </p>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/72 md:text-base">
                Estamos preparando la mejor selección de speakers para esta edición. Atento a nuestras redes soiales!
                </p>
            </div>
          </motion.div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {speakers.map((speaker, index) => {
              const drift = Math.sin(scrollY * 0.0036 + index * 0.9) * 2.2;
              const gradient = speaker.tone;

              return (
                <motion.button
                  key={speaker.id}
                  type="button"
                  onClick={() => setSelectedSpeaker(speaker)}
                  className="group text-left focus-visible:outline-none"
                  style={{ transform: `translate3d(0, ${drift}px, 0)` }}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-8%" }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className={`relative aspect-square overflow-hidden bg-gradient-to-br ${gradient}`}>
                    {speaker.photoUrl ? (
                      <img src={speaker.photoUrl} alt={speaker.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                    ) : null}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.24),transparent_26%),linear-gradient(180deg,transparent,rgba(0,0,0,0.45))]" />
                    <div className="absolute inset-0 flex items-end p-4">
                      {!speaker.photoUrl ? (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/12 bg-black/20 text-xl font-black tracking-[-0.08em] text-white backdrop-blur-sm md:h-20 md:w-20 md:text-2xl">
                          {speaker.initials}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="pt-3">
                    <h3 className="[font-family:Inter,system-ui,sans-serif] text-sm font-semibold uppercase tracking-[0.08em] text-white">
                      {speaker.name}
                    </h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.11em] text-white/70">{speaker.topic}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {isMounted &&
        createPortal(
          <AnimatePresence>
            {selectedSpeaker ? (
              <motion.div
                key="speaker-modal"
                className="fixed inset-0 z-[120] bg-black/35 px-4 py-6 backdrop-blur-2xl backdrop-saturate-150"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28 }}
                onClick={() => setSelectedSpeaker(null)}
                aria-hidden={!selectedSpeaker}
              >
                <motion.div
                  className="mx-auto mt-6 w-full max-w-4xl bg-transparent p-6 text-white md:mt-10 md:p-8"
                  initial={{ y: 24, opacity: 0, scale: 0.97, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ y: 18, opacity: 0, scale: 0.97, filter: "blur(4px)" }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(event) => event.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-label={`Speaker ${selectedSpeaker.name}`}
                >
                  <div className="flex items-center justify-between border-b border-white/70 pb-4">
                    <div>
                      <h3 className="[font-family:Inter,system-ui,sans-serif] text-xl font-semibold uppercase tracking-[0.08em]">
                        {selectedSpeaker.name}
                      </h3>
                      <p className="mt-1 text-sm uppercase tracking-[0.12em] text-white/80">{selectedSpeaker.topic}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSpeaker(null)}
                      className="rounded-sm p-2 text-3xl leading-none text-white/90 transition hover:bg-white/10 hover:text-white"
                      aria-label="Cerrar modal"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid gap-6 pt-6 md:grid-cols-[1fr_1.25fr] md:items-start">
                    <div className={`relative aspect-square overflow-hidden bg-gradient-to-br ${selectedSpeaker.tone}`}>
                      {selectedSpeaker.photoUrl ? (
                        <img src={selectedSpeaker.photoUrl} alt={selectedSpeaker.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                      ) : null}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.24),transparent_26%),linear-gradient(180deg,transparent,rgba(0,0,0,0.45))]" />
                      <div className="absolute inset-0 flex items-end p-5">
                        {!selectedSpeaker.photoUrl ? (
                          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/12 bg-black/20 text-3xl font-black tracking-[-0.08em] text-white backdrop-blur-sm">
                            {selectedSpeaker.initials}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[1.08rem] leading-8 text-white/92">{selectedSpeaker.bio}</p>
                      <p className="text-sm uppercase tracking-[0.18em] text-white/60">{selectedSpeaker.profile}</p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-white/70 pt-1" />
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
}