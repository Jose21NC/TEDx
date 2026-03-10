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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-4 text-2xl font-bold">Admin - Postulaciones</h1>
        {loading && <p>Cargando...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {!loading && !error && (
          <div className="space-y-4">
            {posts.length === 0 && <p>No hay postulaciones.</p>}
            {posts.map(p => (
              <div key={p.id} className="rounded border bg-white p-4 shadow-sm">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{p.nombre}</h3>
                    <p className="text-sm text-gray-600">{p.correo} — {p.telefono}</p>
                  </div>
                  <div className="text-sm text-gray-500">{p.createdAt?.toDate ? p.createdAt.toDate().toString() : String(p.createdAt || '')}</div>
                </div>
                <div className="mt-3 text-sm text-gray-700">
                  <p><strong>Título:</strong> {p.tituloCharla}</p>
                  <p><strong>Idea central:</strong> {p.idea}</p>
                  <p><strong>Por qué:</strong> {p.porQue}</p>
                  <p><strong>Redes:</strong> {p.redes}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
