"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getClientDb, getClientStorage } from "../../lib/firebaseClient";
import { createPortal } from "react-dom";

interface WebsiteSponsor {
  id: string;
  name: string;
  website: string;
  logoUrl: string;
  category: "Main Sponsor" | "Sponsor" | "Aliado";
  logoScale?: number;
  visible?: boolean;
  createdAt?: any;
}

export default function WebsiteSponsorsManager() {
  const [sponsors, setSponsors] = useState<WebsiteSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState<"Main Sponsor" | "Sponsor" | "Aliado">("Aliado");
  const [logoScale, setLogoScale] = useState(1);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [visible, setVisible] = useState(true);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    try {
      const db = getClientDb();
      const col = collection(db, "websiteSponsors");
      const unsubscribe = onSnapshot(col, (snap) => {
        if (!alive) return;
        const items: WebsiteSponsor[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() } as WebsiteSponsor));
        items.sort((a, b) => {
          const ta = a.createdAt?.seconds ?? 0;
          const tb = b.createdAt?.seconds ?? 0;
          return tb - ta;
        });
        setSponsors(items);
        setLoading(false);
      });
      return () => {
        alive = false;
        unsubscribe();
      };
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.setProperty('overflow', 'hidden', 'important');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!logoFile) return;
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  function openNew() {
    setEditingId(null);
    setName("");
    setWebsite("");
    setCategory("Aliado");
    setLogoScale(1);
    setLogoFile(null);
    setLogoPreview("");
    setVisible(true);
    setError("");
    setIsOpen(true);
  }

  function openEdit(sponsor: WebsiteSponsor) {
    setEditingId(sponsor.id);
    setName(sponsor.name);
    setWebsite(sponsor.website);
    setCategory(sponsor.category);
    setLogoScale(sponsor.logoScale ?? 1);
    setLogoFile(null);
    setLogoPreview(sponsor.logoUrl);
    setVisible(sponsor.visible !== false);
    setError("");
    setIsOpen(true);
  }

  async function toggleVisibility(sp: WebsiteSponsor) {
    try {
      const db = getClientDb();
      await setDoc(doc(db, "websiteSponsors", sp.id), { visible: !sp.visible }, { merge: true });
    } catch (e) {
      console.error("Error toggling visibility:", e);
    }
  }

  async function save() {
    if (!name.trim()) {
       setError("El nombre es requerido.");
       return;
    }
    if (!logoPreview && !logoFile) {
       setError("Se requiere un logo de la marca.");
       return;
    }

    setSaving(true);
    setError("");

    try {
      const db = getClientDb();
      const storage = getClientStorage();
      const docId = editingId || Math.random().toString(36).slice(2);
      let finalLogoUrl = logoPreview;

      if (logoFile) {
        const ext = logoFile.name.split('.').pop() || 'png';
        const storageRef = ref(storage, `website-sponsors/${docId}_${Date.now()}.${ext}`);
        await uploadBytes(storageRef, logoFile);
        finalLogoUrl = await getDownloadURL(storageRef);
      }

      const sponsorData = {
        name: name.trim(),
        website: website.trim(),
        logoUrl: finalLogoUrl,
        category,
        logoScale,
        visible,
        updatedAt: serverTimestamp(),
      };

      if (!editingId) {
        (sponsorData as any).createdAt = serverTimestamp();
      }

      await setDoc(doc(db, "websiteSponsors", docId), sponsorData, { merge: true });
      setIsOpen(false);
    } catch (e: any) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar definitivamente este patrocinador oficial?")) return;
    try {
      const db = getClientDb();
      await deleteDoc(doc(db, "websiteSponsors", id));
    } catch(e) {
      alert("Error al eliminar.");
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Sponsors Oficiales del Sitio</h3>
          <p className="mt-1 text-sm text-gray-400">Gestiona los Patrocinadores que se muestran en el Inicio y en la página /patrocinios.</p>
        </div>
        <button onClick={openNew} className="rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black transition hover:bg-gray-200">
           + Agregar
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : sponsors.length === 0 ? (
        <p className="text-gray-500 text-sm py-4 border border-dashed border-gray-600 rounded-lg text-center">No hay sponsors registrados. Agrega uno nuevo.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sponsors.map(sp => (
            <div key={sp.id} className={`relative rounded-xl border transition-all ${sp.visible === false ? 'border-dashed border-white/20 opacity-60 grayscale' : 'border-white/10 bg-black/40'} p-5 flex flex-col items-center group`}>
               <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-white/10 text-gray-300">
                 {sp.category}
               </div>

               <div className="absolute top-2 right-2 flex gap-1">
                 <button 
                   onClick={() => toggleVisibility(sp)}
                   className={`p-1.5 rounded-md transition ${sp.visible === false ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
                   title={sp.visible === false ? "Mostrar en la web" : "Ocultar en la web"}
                 >
                   {sp.visible === false ? (
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                   ) : (
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                   )}
                 </button>
               </div>

               <img src={sp.logoUrl} alt={sp.name} className="h-16 w-auto object-contain mt-4 mb-3" />
               <p className="font-bold text-white text-center text-sm">{sp.name}</p>
               <a href={sp.website} target="_blank" className="text-[10px] text-gray-400 truncate w-full text-center block" rel="noreferrer">{sp.website || "—"}</a>
               <div className="mt-4 flex gap-2 w-full">
                  <button onClick={() => openEdit(sp)} className="flex-1 rounded-md border border-white/20 bg-transparent py-1.5 text-xs font-bold text-white hover:bg-white/10 transition">Editar</button>
                  <button onClick={() => remove(sp.id)} className="flex-1 rounded-md border border-red-500/30 bg-red-500/10 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/20 transition">Eliminar</button>
               </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
           <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#121212] shadow-2xl p-6 relative">
              <h4 className="text-xl font-bold text-white">{editingId ? "Editar Sponsor" : "Nuevo Sponsor"}</h4>
              
              <div className="mt-6 space-y-4">
                 <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 block">Nombre Comercial</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-ted-red)] outline-none" />
                 </div>
                 <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 block">Enlace Web</label>
                    <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-ted-red)] outline-none" />
                 </div>
                 <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 block">Categoría de Auspicio</label>
                    <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--color-ted-red)] outline-none">
                       <option value="Main Sponsor">Main Sponsor</option>
                       <option value="Sponsor">Sponsor</option>
                       <option value="Aliado">Aliado</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 block">Ajuste de Tamaño (Zoom)</label>
                    <div className="flex items-center gap-4">
                       <input type="range" min="0.5" max="3" step="0.1" value={logoScale} onChange={e => setLogoScale(parseFloat(e.target.value))} className="w-full accent-[var(--color-ted-red)]" />
                       <span className="text-xs font-bold text-gray-300 w-8 text-right">{logoScale}x</span>
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 block">Logo (Preferentemente PNG/SVG blanco)</label>
                    <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white/10 file:text-white file:font-semibold hover:file:bg-white/20 transition cursor-pointer" />
                    {logoPreview && (
                       <div className="mt-3 p-4 bg-black/40 rounded-lg border border-white/5 flex justify-center overflow-hidden">
                          <img src={logoPreview} style={{ transform: `scale(${logoScale})` }} className="max-h-16 w-auto object-contain transition-transform" alt="Preview" />
                       </div>
                    )}
                 </div>

                 {error && <p className="text-red-400 text-xs font-bold">{error}</p>}
                 
                 <div className="flex gap-3 pt-4 border-t border-white/10">
                    <button onClick={() => setIsOpen(false)} className="flex-1 py-2.5 rounded-full border border-white/20 text-white font-bold text-sm hover:bg-white/5 transition">Cancelar</button>
                    <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-full bg-[var(--color-ted-red)] text-white font-bold text-sm hover:brightness-110 transition disabled:opacity-50">
                      {saving ? "Guardando..." : "Guardar Auspicio"}
                    </button>
                 </div>
              </div>
           </div>
        </div>,
        document.body
      )}
    </div>
  );
}
