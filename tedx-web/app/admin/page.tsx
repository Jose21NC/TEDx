"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import logoBlack from "../media/logo-black.png";
import logoWhite from "../media/logo-white.png";
import { generateApplicantPDF } from "../../lib/pdfGenerator";
import MobileNav from "../components/MobileNav";


export default function AdminPage() {
  const [posts, setPosts] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [statusMenuFor, setStatusMenuFor] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const statusMenuRef = useRef<HTMLDivElement | null>(null);

  // close menu on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!(e.target instanceof Node)) return;
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false);
      if (statusMenuRef.current && !statusMenuRef.current.contains(target)) setStatusMenuFor(null);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchPosts() {
      try {
        const firebaseModule = await import("../../lib/firebaseClient");
        const firestore = await import("firebase/firestore");
        const db = firebaseModule.getClientDb();
        const col = firestore.collection(db, "ponentesTedx");
        const snap = await firestore.getDocs(col);
        if (!mounted) return;
        const items: Array<any> = [];
        snap.forEach(doc => items.push({ ...doc.data(), id: doc.id }));
        items.sort((a, b) => {
          const ta = a.createdAt?.seconds ?? 0;
          const tb = b.createdAt?.seconds ?? 0;
          return tb - ta;
        });
        setPosts(items);
      } catch (err: any) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
    return () => { mounted = false };
  }, []);

      async function generatePDF(p: any) {
    setProcessing(true);
    await generateApplicantPDF(p, logoWhite.src);
    setProcessing(false);
  }

  function formatDate(value: any) {
    if (!value) return "";
    if (typeof value?.toDate === "function") return value.toDate().toLocaleString();
    if (value?.seconds) return new Date(value.seconds * 1000).toLocaleString();
    try { const d = new Date(value); if (!isNaN(d.getTime())) return d.toLocaleString(); } catch {}
    return String(value);
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function selectAll() {
    setSelectedIds(posts.map(p => p.id));
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  async function updateStatusForSelected(status: string) {
    if (selectedIds.length === 0) return;
    setProcessing(true);
    try {
      const firebaseModule = await import("../../lib/firebaseClient");
      const firestore = await import("firebase/firestore");
      const db = firebaseModule.getClientDb();
      for (const id of selectedIds) {
        const docRef = firestore.doc(db, "ponentesTedx", id);
        await firestore.updateDoc(docRef, { status });
      }
      const col = firestore.collection(db, "ponentesTedx");
      const snap = await firestore.getDocs(col);
      const items: Array<any> = [];
      snap.forEach(d => items.push({ ...d.data(), id: d.id }));
      items.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setPosts(items);
      clearSelection();
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setProcessing(false);
    }
  }

  async function updateStatusForSingle(id: string, status: string) {
    setProcessing(true);
    try {
      const firebaseModule = await import("../../lib/firebaseClient");
      const firestore = await import("firebase/firestore");
      const db = firebaseModule.getClientDb();
      const docRef = firestore.doc(db, "ponentesTedx", id);
      await firestore.updateDoc(docRef, { status });
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      setStatusMenuFor(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setProcessing(false);
    }
  }

  async function deleteSelected() {
    if (selectedIds.length === 0) return;
    if (!confirm(`Eliminar ${selectedIds.length} postulación(es)? Esta acción no se puede deshacer.`)) return;
    setProcessing(true);
    try {
      const firebaseModule = await import("../../lib/firebaseClient");
      const firestore = await import("firebase/firestore");
      const db = firebaseModule.getClientDb();
      for (const id of selectedIds) {
        const docRef = firestore.doc(db, "ponentesTedx", id);
        await firestore.deleteDoc(docRef);
      }
      const col = firestore.collection(db, "ponentesTedx");
      const snap = await firestore.getDocs(col);
      const items: Array<any> = [];
      snap.forEach(d => items.push({ ...d.data(), id: d.id }));
      items.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setPosts(items);
      clearSelection();
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setProcessing(false);
    }
  }

  return (
    <main className="min-h-dvh flex flex-col bg-[#1a1a1a] text-white selection:bg-[var(--color-ted-red)] selection:text-white animate-page-fade">
      <header className="border-b border-black/5 bg-black text-[#222] sticky top-0 z-20 shadow-md">
        <nav className="relative mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 py-0.5">
          <Link href="/" className="flex items-center">
            <Image src={logoBlack} alt="TEDx Avenida Bolivar" className="h-[4.5rem] w-auto brightness-0 invert" priority />
          </Link>

          <ul className="hidden items-center gap-6 text-base font-medium md:flex text-white">
            <li>
              <Link className="transition hover:text-[var(--color-ted-red)]" href="/">
                Inicio
              </Link>
            </li>
            <li>
              <Link className="transition text-[var(--color-ted-red)] font-semibold" href="/admin">
                Panel Admin
              </Link>
            </li>
          </ul>
          <MobileNav />
        </nav>
      </header>

      <div className="flex-1 mx-auto w-full max-w-[88rem] px-6 py-12">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">Panel de Revisión</h1>
            <div className="text-sm text-gray-400">Colección actual: <span className="text-[var(--color-ted-red)] font-mono">ponentesTedx</span></div>
          </div>
        </header>

        <section className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div ref={menuRef} className="relative z-10 w-fit">
            <button onClick={() => setMenuOpen(v => !v)} className="rounded-md border border-[var(--color-ted-red)] bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-ted-red)] focus:outline-none transition-colors min-w-[140px] text-left relative flex justify-between items-center shadow-lg">
              Acciones <span className="text-[10px] ml-2">▼</span>
            </button>
            {menuOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-md border border-gray-700 bg-black p-1.5 shadow-xl text-white">
                <button onClick={() => { setSelectionMode(true); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 rounded transition-colors">Activar selección</button>
                <button onClick={() => { setSelectionMode(false); clearSelection(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 rounded transition-colors">Desactivar selección</button>
                {selectionMode && (
                  <>
                    <button onClick={() => { selectAll(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 rounded transition-colors">Seleccionar todo</button>
                    <div className="my-1 h-px bg-gray-800 mx-1" />
                    <button onClick={() => { setMenuOpen(false); updateStatusForSelected('Aprobada'); }} disabled={processing || selectedIds.length===0} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-green-400">Marcar Aprobada</button>
                    <button onClick={() => { setMenuOpen(false); updateStatusForSelected('Rechazada'); }} disabled={processing || selectedIds.length===0} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[var(--color-ted-red)]">Marcar Rechazada</button>
                    <button onClick={() => { setMenuOpen(false); updateStatusForSelected('Sin revisar'); }} disabled={processing || selectedIds.length===0} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-300">Marcar Sin revisar</button>
                    <div className="my-1 h-px bg-gray-800 mx-1" />
                    <button onClick={() => { setMenuOpen(false); deleteSelected(); }} disabled={processing || selectedIds.length===0} className="w-full text-left px-3 py-2 text-sm text-[var(--color-ted-red)] font-semibold hover:bg-gray-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Eliminar items</button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm">
            {selectionMode && <span className="bg-black border border-gray-600 px-3 py-1.5 rounded-full text-white font-mono shadow-inner shadow-black/50 tracking-wider text-xs uppercase">SELECCIONADOS: {selectedIds.length}</span>}
          </div>
        </section>

        {loading && <p className="text-gray-400 font-mono tracking-wider animate-pulse py-8 text-center text-lg">CARGANDO BASE DE DATOS...</p>}
        {error && <p className="text-[var(--color-ted-red)] font-medium bg-black/50 p-4 rounded border border-[var(--color-ted-red)] shadow-lg">Error de conexión: {error}</p>}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-20 border border-gray-800 rounded-lg bg-black/40 shadow-inner">
            <p className="text-gray-500 font-mono text-lg">No se han recibido postulaciones</p>
          </div>
        )}

        <section className="grid gap-6">
          {posts.map(p => (
            <article key={p.id} className="relative overflow-hidden rounded-xl bg-white p-6 shadow-xl text-black transition-all border border-gray-200 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: p.status === 'Aprobada' ? '#22c55e' : p.status === 'Rechazada' ? 'var(--color-ted-red)' : '#d1d5db' }} />
              
              <div className="flex items-start gap-4 pl-4">
                {selectionMode && (
                  <div className="pt-1.5">
                    <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="h-5 w-5 rounded border-gray-300 text-[var(--color-ted-red)] focus:ring-[var(--color-ted-red)] cursor-pointer" />
                  </div>
                )}
                <div className="flex-1 w-full min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{p.nombre || "—"}</h3>
                      <div className="flex flex-wrap items-center mt-1 gap-2 text-sm text-gray-600 font-medium">
                        <a href={`mailto:${p.correo}`} className="hover:text-[var(--color-ted-red)] underline underline-offset-2">{p.correo || "—"}</a>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <span>{p.telefono || "—"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                       <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-sm border border-gray-200">{formatDate(p.createdAt)}</span>
                       <div className="flex items-center gap-2">
                         <div className="text-[10px] text-gray-400 font-mono" title={p.id}>ID_{p.id.substring(0,8)}</div>
                         <button onClick={() => generatePDF(p)} disabled={processing} className="flex items-center gap-1 px-2.5 py-1 bg-black text-white text-[10px] uppercase tracking-wider font-bold rounded hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50">
                           PDF + QR
                         </button>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-black/[0.02] rounded-lg p-5 mb-5 border border-black/[0.05]">
                    <div className="space-y-4 text-sm">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#eb0028] mb-1">Perfil Profesional</span>
                        <p className="font-medium text-gray-900">{p.perfil === "Otro" ? `${p.perfil} - ${p.perfilOtro || ''}` : (p.perfil || '—')}</p>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#eb0028] mb-1">Edad</span>
                        <p className="font-medium text-gray-900">{p.edad ?? '—'} <span className="text-gray-500 font-normal">años</span></p>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#eb0028] mb-1">Categorías de Interés</span>
                        <p className="font-medium text-gray-900 leading-snug">{(p.categorias && p.categorias.length) ? p.categorias.join(' / ') : '—'} {p.categoriaOtra ? ` (${p.categoriaOtra})` : ''}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 text-sm lg:col-span-2">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#eb0028] mb-1">Título de la Charla (Propuesta)</span>
                        <p className="font-bold text-gray-900 text-lg border-b border-gray-200 pb-2">{p.tituloCharla || '—'}</p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Idea Central</span>
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{p.idea || '—'}</p>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Impacto / Novedad</span>
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{p.novedad || '—'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-2">
                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                      {p.linkedin && (
                        <a href={p.linkedin} target="_blank" rel="noreferrer" className="bg-[#0077b5] text-white px-3 py-1.5 rounded text-xs hover:bg-[#005e93] transition flex items-center shadow-sm">
                          LinkedIn ↗
                        </a>
                      )}
                      {p.redes && (
                        <span className="text-gray-600 border border-gray-200 bg-gray-50 px-3 py-1.5 rounded text-xs max-w-[200px] whitespace-normal break-words" title={p.redes}>
                          <span className="font-bold text-gray-400 mr-1">@</span>{p.redes}
                        </span>
                      )}
                      {p.videoLink && (
                        <a href={p.videoLink} target="_blank" rel="noreferrer" className="bg-black text-[var(--color-ted-red)] px-4 py-1.5 rounded hover:bg-gray-900 transition flex items-center gap-2 font-bold text-xs uppercase tracking-wider shadow-sm border border-[var(--color-ted-red)]">
                          ▶ Ver Pitch URL
                        </a>
                      )}
                    </div>
                    
                    <div ref={statusMenuFor === p.id ? statusMenuRef : undefined} className="relative mt-2 sm:mt-0">
                      <button 
                        onClick={() => setStatusMenuFor(statusMenuFor === p.id ? null : p.id)} 
                        className={`inline-flex items-center gap-2 rounded-md px-4 py-2 font-bold text-[10px] uppercase tracking-widest border transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 ${
                          p.status === 'Aprobada' ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100' : 
                          p.status === 'Rechazada' ? 'bg-red-50 text-[var(--color-ted-red)] border-red-300 hover:bg-red-100' : 
                          'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full shadow-inner ${p.status === 'Aprobada' ? 'bg-green-500' : p.status === 'Rechazada' ? 'bg-[var(--color-ted-red)]' : 'bg-gray-400'}`}></span>
                        Estatus: {p.status || 'Pendiente'} ▾
                      </button>
                      
                      {statusMenuFor === p.id && (
                        <div className="absolute right-0 bottom-full mb-2 z-50 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] text-black">
                          <button onClick={() => updateStatusForSingle(p.id, 'Aprobada')} className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-xs hover:bg-green-50 rounded-md font-bold text-green-700 transition-colors uppercase tracking-wider">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></span> Aprobada
                          </button>
                          <button onClick={() => updateStatusForSingle(p.id, 'Rechazada')} className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-xs hover:bg-red-50 rounded-md font-bold text-[var(--color-ted-red)] transition-colors uppercase tracking-wider">
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-ted-red)] shadow-sm"></span> Rechazada
                          </button>
                          <div className="my-1 h-px bg-gray-100 mx-2" />
                          <button onClick={() => updateStatusForSingle(p.id, 'Sin revisar')} className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-xs hover:bg-gray-50 rounded-md font-bold text-gray-500 transition-colors uppercase tracking-wider">
                            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 shadow-sm"></span> Pendiente
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </article>
          ))}
        </section>
      </div>

      <footer className="border-t border-gray-800 bg-black px-6 py-8 text-sm text-gray-300 relative z-10 mt-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="hidden md:block">
            <p className="font-mono text-xs text-gray-500 mb-1">ESTA ES UNA VISTA PRIVADA (ADMINISTRADOR)</p>
            <p>Este evento TEDx independiente se opera bajo licencia de TED.</p>
            <p className="mt-2 text-xs text-gray-500">
              Más información sobre el programa oficial TEDx:
              <a href="https://www.ted.com/tedx/program" target="_blank" rel="noreferrer" className="ml-1 font-semibold text-[var(--color-ted-red)] underline underline-offset-4">
                ted.com/tedx/program
              </a>
            </p>
          </div>

          <div className="md:hidden text-center">
            <p className="font-mono text-[10px] text-gray-500 mb-2">VISTA DE ADMINISTRADOR</p>
            <p className="text-xs">
              Este evento TEDx independiente se opera bajo licencia de TED.
            </p>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-end">
            <a
              href="https://instagram.com/tedxavenidabolivar"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="rounded-full border border-gray-800 bg-gray-900 p-2 text-gray-400 transition hover:border-[var(--color-ted-red)] hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="mailto:contacto@tedxavenidabolivar.com"
              aria-label="Correo"
              className="rounded-full border border-gray-800 bg-gray-900 p-2 text-gray-400 transition hover:border-[var(--color-ted-red)] hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
