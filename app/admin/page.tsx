"use client";
import { useEffect, useState, useRef } from "react";
import logoWhite from "../media/logo-white.png";
import { generateApplicantPDF } from "../../lib/generators/pdfGenerator";
import { AuthProvider, useAuth } from "../components/Auth/AuthProvider";
import ApplicantCard from "../components/admin/Postulant";
import Footer from "../components/admin/Footer";
import Header from "../components/admin/Header";

export function AdminContent() {
  const [mounted, setMounted] = useState(false);
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

  const { logout } = useAuth();

  // close menu on outside click
  useEffect(() => {
    setMounted(true);
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

  function ensureProtocol(url: string | null | undefined) {
    if (!url) return "#";
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  }

  if (!mounted) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-gray-900 px-6">
        <p className="text-gray-400 font-mono tracking-widest text-sm animate-pulse">CARGANDO...</p>
      </main>
    );
  }

  return (
      <main className="min-h-dvh flex flex-col bg-[#1a1a1a] text-white selection:bg-[var(--color-ted-red)] selection:text-white animate-page-fade">

      <Header logout={logout} />

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
            <ApplicantCard 
              key={p.id}
              applicant={p}
              selectionMode={selectionMode}
              isSelected={selectedIds.includes(p.id)}
              onToggleSelect={toggleSelect}
              onStatusUpdate={updateStatusForSingle}
              onGeneratePDF={generatePDF}
              processing={processing}
            />
          ))}
        </section>
      </div>
      <Footer />
    </main>
  );
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  )
}