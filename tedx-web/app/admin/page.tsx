"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [posts, setPosts] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
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

  function formatDate(value: any) {
    if (!value) return "";
    // Firestore Timestamp
    if (typeof value?.toDate === "function") return value.toDate().toLocaleString();
    // Plain object { seconds: number }
    if (value?.seconds) return new Date(value.seconds * 1000).toLocaleString();
    // ISO string
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toLocaleString();
    } catch {
      // fallthrough
    }
    return String(value);
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin — Postulaciones</h1>
          <div className="text-sm text-gray-300">Colección: <span className="text-[var(--color-ted-red)] font-semibold">ponentesTedx</span></div>
        </header>
        {loading && <p>Cargando...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {!loading && !error && (
          <div className="space-y-4">
            {posts.length === 0 && <p className="text-gray-300">No hay postulaciones.</p>}
            {posts.map(p => (
              <article key={p.id} className="rounded-md border border-gray-800 bg-gray-900 p-5 shadow-lg">
                <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{p.nombre || "—"}</h3>
                    <p className="text-sm text-gray-300">{p.correo || "—"} • {p.telefono || "—"}</p>
                    <p className="mt-2 text-sm text-gray-300"><strong>Perfil:</strong> {p.perfil === "Otro" ? `${p.perfil} - ${p.perfilOtro || ''}` : (p.perfil || '—')}</p>
                  </div>
                  <div className="mt-2 text-sm text-gray-400 md:mt-0">{formatDate(p.createdAt)}</div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-200"><strong>Título:</strong> {p.tituloCharla || '—'}</p>
                    <p className="text-sm text-gray-200"><strong>Idea central:</strong> {p.idea || '—'}</p>
                    <p className="text-sm text-gray-200"><strong>Por qué:</strong> {p.porQue || '—'}</p>
                    <p className="text-sm text-gray-200"><strong>Novedad:</strong> {p.novedad || '—'}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-200"><strong>Categorías:</strong> {(p.categorias && p.categorias.length) ? p.categorias.join(', ') : '—'}</p>
                    <p className="text-sm text-gray-200"><strong>Otra categoría:</strong> {p.categoriaOtra || '—'}</p>
                    <p className="text-sm text-gray-200"><strong>LinkedIn:</strong> {p.linkedin || '—'}</p>
                    <p className="text-sm text-gray-200"><strong>Redes:</strong> {p.redes || '—'}</p>
                    <p className="text-sm text-gray-200"><strong>Video:</strong> {p.videoLink ? <a href={p.videoLink} target="_blank" rel="noreferrer" className="text-[var(--color-ted-red)] underline">Ver enlace</a> : '—'}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs ${p.confirmaReglas ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200'}`}>Reglas: {p.confirmaReglas ? 'OK' : 'NO'}</span>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs ${p.confirmaPrivacidad ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200'}`}>Privacidad: {p.confirmaPrivacidad ? 'OK' : 'NO'}</span>
                  <span className="ml-auto text-xs text-gray-400">ID: {p.id}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
