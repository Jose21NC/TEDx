"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { collection, onSnapshot } from "firebase/firestore";
import { createPortal } from "react-dom";
import { getClientDb } from "../../lib/firebaseClient";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  initials: string;
  tone: string;
};

const colorPairs = [
  "from-white/18 to-white/4",
  "from-[var(--color-ted-red)]/30 to-white/6",
  "from-cyan-300/20 to-white/5",
  "from-amber-300/20 to-white/5",
  "from-emerald-300/20 to-white/5",
  "from-fuchsia-300/20 to-white/5",
];

export default function TeamShowcase() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
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
    const db = getClientDb();
    const unsub = onSnapshot(collection(db, "websiteTeam"), (snap) => {
      const items = snap.docs.map((docSnap, index) => {
        const data = docSnap.data();
        const initials = (data.name || "TD")
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((p: any) => p[0]?.toUpperCase())
          .join("");
        
        return {
          id: docSnap.id,
          name: data.name || "Miembro del Equipo",
          role: data.role || "Organizador",
          bio: data.bio || "",
          photoUrl: data.photoUrl || "",
          initials,
          tone: colorPairs[index % colorPairs.length]
        } as TeamMember;
      });
      setMembers(items);
      setLoading(false);
    });
    return unsub;
  }, [isInView]);

  useEffect(() => {
    if (!selectedMember) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setSelectedMember(null);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onEsc);
    };
  }, [selectedMember]);

  return (
    <section ref={sectionRef} className="px-6 pb-24 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        {loading ? (
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
             {[1,2,3,4].map(i => (
               <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-2xl" />
             ))}
          </div>
        ) : members.length === 0 ? (
           <div className="text-center py-32 rounded-3xl border border-white/5 bg-white/[0.02]">
              <p className="text-3xl font-black text-white/20 uppercase tracking-widest">Próximamente</p>
           </div>
        ) : (
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {members.map((member, index) => {
              const drift = Math.sin(scrollY * 0.003 + index * 0.5) * 4;
              return (
                <motion.button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="group text-left outline-none"
                  style={{ y: drift }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className={`relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br ${member.tone} transition-transform duration-500 group-hover:scale-[1.02]`}>
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl font-black text-white/20">
                        {member.initials}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                    <div className="absolute inset-0 flex items-end p-6">
                       <div className="translate-y-2 transition-transform group-hover:translate-y-0">
                          <h3 className="text-sm font-black uppercase tracking-widest text-white leading-tight">{member.name}</h3>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{member.role}</p>
                       </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {isMounted && createPortal(
        <AnimatePresence>
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/90 p-6 backdrop-blur-2xl"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] bg-[#121212] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
              >
                <div className="grid md:grid-cols-2">
                  <div className={`aspect-square md:aspect-auto h-full min-h-[400px] bg-gradient-to-br ${selectedMember.tone} relative overflow-hidden`}>
                    {selectedMember.photoUrl ? (
                      <img src={selectedMember.photoUrl} alt={selectedMember.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-8xl font-black text-white/10">
                        {selectedMember.initials}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                  </div>
                  <div className="p-10 md:p-16 flex flex-col justify-center">
                    <button 
                      onClick={() => setSelectedMember(null)}
                      className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-[var(--color-ted-red)] font-bold uppercase tracking-[0.3em] text-xs mb-4">Equipo Organizador</p>
                    <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">{selectedMember.name}</h3>
                    <p className="text-xl text-white/50 font-medium mb-8 uppercase tracking-widest">{selectedMember.role}</p>
                    <div className="h-px w-20 bg-white/20 mb-8" />
                    <p className="text-gray-300 text-lg leading-relaxed font-medium">{selectedMember.bio}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}
