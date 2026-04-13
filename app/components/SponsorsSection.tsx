"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getClientDb } from "../../lib/firebaseClient";

type SponsorRecord = {
  id: string;
  companyName?: string;
  logoUrl?: string;
  website?: string;
  link?: string;
  url?: string;
  companyWebsite?: string;
  sponsorLevel?: string;
  status?: string;
  createdAt?: { seconds?: number } | string | number | null;
};

type SponsorCard = {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  sponsorLevel: "sponsor" | "apoyo";
};

const staticSupportSponsors: SponsorCard[] = [
  {
    id: "static-uam",
    name: "UAM",
    logoUrl: "/media/logo-uam-gray.png",
    website: "",
    sponsorLevel: "apoyo",
  },
  {
    id: "static-red-jovenes",
    name: "Red de Jovenes Comunicadores",
    logoUrl: "/media/logo-red-gray.png",
    website: "",
    sponsorLevel: "apoyo",
  },
  {
    id: "static-boreal",
    name: "Boreal",
    logoUrl: "/media/logo-boreal-gray.png",
    website: "",
    sponsorLevel: "apoyo",
  },
];

function ensureProtocol(url: string) {
  const value = url.trim();
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function normalizeSponsorStatus(value: string | undefined) {
  if (!value || value === "Pendiente" || value === "Sin revisar") return "Pendiente";
  return value;
}

function mapSponsor(record: SponsorRecord): SponsorCard {
  const level = String(record.sponsorLevel || "apoyo").toLowerCase() === "sponsor" ? "sponsor" : "apoyo";
  const website =
    ensureProtocol(record.website || "") ||
    ensureProtocol(record.link || "") ||
    ensureProtocol(record.url || "") ||
    ensureProtocol(record.companyWebsite || "");

  return {
    id: record.id,
    name: record.companyName?.trim() || "Sponsor TEDx",
    logoUrl: record.logoUrl?.trim() || "",
    website,
    sponsorLevel: level,
  };
}

function openSponsorLink(url: string) {
  if (!url || typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function SponsorsSection() {
  const [sponsors, setSponsors] = useState<SponsorCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    try {
      const db = getClientDb();
      const col = collection(db, "sponsorsTedx");

      const unsubscribe = onSnapshot(
        col,
        (snapshot) => {
          if (!alive) return;

          const firebaseItems = snapshot.docs
            .map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<SponsorRecord, "id">) }))
            .filter((record) => normalizeSponsorStatus(record.status) === "Finalizado")
            .sort((a, b) => {
              const ta = typeof a.createdAt === "object" && a.createdAt && "seconds" in a.createdAt ? a.createdAt.seconds ?? 0 : 0;
              const tb = typeof b.createdAt === "object" && b.createdAt && "seconds" in b.createdAt ? b.createdAt.seconds ?? 0 : 0;
              return tb - ta;
            })
            .map((record) => mapSponsor(record));

          const usedLogos = new Set(firebaseItems.map((item) => item.logoUrl).filter(Boolean));
          const fallbackSupport = staticSupportSponsors.filter((item) => !usedLogos.has(item.logoUrl));
          const items = [...firebaseItems, ...fallbackSupport];

          setSponsors(items);
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
  }, []);

  const primarySponsor = sponsors.find((item) => item.sponsorLevel === "sponsor") ?? sponsors[0] ?? null;
  const supportingSponsors = sponsors.filter((item) => !primarySponsor || item.id !== primarySponsor.id);

  return (
    <section aria-labelledby="sponsors-heading" className="relative overflow-hidden bg-[#171314] px-6 py-20 md:px-10 md:py-24">
      <div className="mx-auto w-full max-w-[1450px]">
        <h2
          id="sponsors-heading"
          className="text-center [font-family:Inter,system-ui,sans-serif] text-[52px] font-bold leading-[1.1] tracking-[-0.02em] text-white"
        >
          Sponsors
        </h2>

        {loading ? (
          <div className="mt-12 grid grid-cols-2 gap-4 md:mt-16 md:grid-cols-4 md:gap-6" aria-busy="true" aria-live="polite">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex min-h-20 items-center justify-center rounded-sm bg-white/[0.03] px-4 py-6">
                <div className="h-5 w-24 animate-pulse rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-12 rounded-md bg-white/[0.04] px-6 py-16 text-center text-white/80 md:mt-16">
            <p className="text-sm uppercase tracking-[0.22em] text-white/45">Error de conexión</p>
            <p className="mt-3 text-lg">No se pudo cargar la lista de sponsors en este momento.</p>
          </div>
        ) : sponsors.length === 0 ? (
          <div className="relative mt-12 overflow-hidden rounded-md bg-white/[0.03] px-6 py-20 text-center text-white md:mt-16">
            <div className="absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
            <div className="absolute right-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-[var(--color-ted-red)]/10 blur-2xl" aria-hidden="true" />
            <p className="text-[clamp(2.4rem,6vw,4.6rem)] font-black tracking-[-0.08em] text-white">PROXIMAMENTE</p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/72 md:text-base">
              Estamos preparando la selección de sponsors aprobados para esta edición. Cuando el equipo finalice alguno en Firebase, aparecerá aquí automáticamente.
            </p>
          </div>
        ) : (
          <>
            {primarySponsor ? (
              <div className="mt-12 md:mt-16">
                <div className="mx-auto flex max-w-[720px] flex-col items-center justify-center px-6 py-2 text-center md:px-8 md:py-3">
                  {primarySponsor.logoUrl ? (
                    primarySponsor.website ? (
                      <button
                        type="button"
                        onClick={() => openSponsorLink(primarySponsor.website)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openSponsorLink(primarySponsor.website);
                          }
                        }}
                        aria-label={`Ir al sitio de ${primarySponsor.name}`}
                        className="inline-flex cursor-pointer rounded-sm outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171314]"
                      >
                        <img src={primarySponsor.logoUrl} alt={primarySponsor.name} className="max-h-16 max-w-[220px] object-contain md:max-h-20" />
                      </button>
                    ) : (
                      <img src={primarySponsor.logoUrl} alt={primarySponsor.name} className="max-h-16 max-w-[220px] object-contain md:max-h-20" />
                    )
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-white/6 text-xs font-black uppercase tracking-[0.16em] text-white md:h-16 md:w-16 md:text-sm">
                      SP
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {supportingSponsors.length > 0 ? <div className="mx-auto mt-12 h-px w-full max-w-[1400px] bg-white/18" aria-hidden="true" /> : null}

            {supportingSponsors.length > 0 ? (
              <div className="mt-10 md:mt-12">
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                  {supportingSponsors.map((sponsor) => (
                    <div key={sponsor.id} className="group flex min-h-20 min-w-[160px] items-center justify-center px-4 py-4 text-center md:min-w-[190px]">
                      {sponsor.logoUrl ? (
                        sponsor.website ? (
                          <button
                            type="button"
                            onClick={() => openSponsorLink(sponsor.website)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                openSponsorLink(sponsor.website);
                              }
                            }}
                            aria-label={`Ir al sitio de ${sponsor.name}`}
                            className="inline-flex max-w-full cursor-pointer rounded-sm outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171314]"
                          >
                            <img src={sponsor.logoUrl} alt={sponsor.name} className="max-h-14 max-w-full object-contain md:max-h-16" />
                          </button>
                        ) : (
                          <img src={sponsor.logoUrl} alt={sponsor.name} className="max-h-14 max-w-full object-contain md:max-h-16" />
                        )
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55 md:text-sm">SP</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
