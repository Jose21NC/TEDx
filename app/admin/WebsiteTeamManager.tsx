"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getClientDb, getClientStorage } from "../../lib/firebaseClient";
import { createPortal } from "react-dom";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
};

export default function WebsiteTeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const db = getClientDb();
    const unsub = onSnapshot(collection(db, "websiteTeam"), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as TeamMember));
      setMembers(items);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview("");
    }
  }, [imageFile]);

  const openAdd = () => {
    setEditingMember(null);
    setName("");
    setRole("");
    setBio("");
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditingMember(m);
    setName(m.name);
    setRole(m.role);
    setBio(m.bio);
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const db = getClientDb();
      const storage = getClientStorage();
      let finalPhotoUrl = editingMember?.photoUrl || "";

      if (imageFile) {
        const storageRef = ref(storage, `team/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        finalPhotoUrl = await getDownloadURL(storageRef);
      }

      const payload = {
        name,
        role,
        bio,
        photoUrl: finalPhotoUrl
      };

      if (editingMember) {
        await updateDoc(doc(db, "websiteTeam", editingMember.id), payload);
      } else {
        await addDoc(collection(db, "websiteTeam"), payload);
      }

      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar miembro del equipo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar a este miembro del equipo?")) return;
    try {
      await deleteDoc(doc(getClientDb(), "websiteTeam", id));
    } catch (err) {
      console.error(err);
    }
  };

  const modalEl = modalOpen && (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div 
        className="absolute inset-0" 
        onClick={() => !saving && setModalOpen(false)} 
      />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-page-fade">
        <div className="border-b border-gray-100 px-8 py-5 flex items-center justify-between bg-gray-50">
          <h3 className="text-xl font-bold text-gray-900">
            {editingMember ? "Editar Miembro" : "Agregar Miembro al Equipo"}
          </h3>
          <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-2xl">×</button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Fotografía</label>
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
                {imagePreview || editingMember?.photoUrl ? (
                  <img src={imagePreview || editingMember?.photoUrl} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] text-gray-400 font-medium text-center px-2">Sin imagen</span>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-[9px] text-gray-400 text-center uppercase tracking-tighter">Click para subir</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-400">Nombre Completo</label>
                <input 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-[var(--color-ted-red)] transition-all"
                  placeholder="Ej. Maria Garcia"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-400">Cargo / Rol</label>
                <input 
                  required
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-[var(--color-ted-red)] transition-all"
                  placeholder="Ej. Directora de Producción"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-400">Biografía / Perfil</label>
            <textarea 
              required
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-[var(--color-ted-red)] transition-all"
              placeholder="Breve descripción del miembro del equipo..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => setModalOpen(false)} 
              className="px-6 py-3 rounded-full text-sm font-bold text-gray-500 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="px-8 py-3 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar Registro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">Equipo Organizador (Core Team)</h3>
          <p className="text-sm text-gray-400">Gestiona los miembros que aparecen en la página pública de Equipo.</p>
        </div>
        <button 
          onClick={openAdd}
          className="rounded-full bg-[var(--color-ted-red)] px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:brightness-110"
        >
          + Agregar Miembro
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-gray-500 font-mono text-sm animate-pulse tracking-widest">Sincronizando equipo...</p>
      ) : members.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-white/10">
          <p className="text-gray-500 text-sm">No hay miembros en el equipo todavía.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map(m => (
            <div key={m.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-800 border border-white/10">
                  <img src={m.photoUrl} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-base font-bold text-white">{m.name}</h4>
                  <p className="truncate text-xs text-gray-400 uppercase tracking-widest">{m.role}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEdit(m)}
                  className="flex-1 py-1.5 rounded-lg bg-white/10 text-[10px] font-bold uppercase text-white hover:bg-white/20 transition"
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(m.id)}
                  className="flex-1 py-1.5 rounded-lg bg-red-500/20 text-[10px] font-bold uppercase text-red-400 hover:bg-red-500/30 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isMounted && modalEl ? createPortal(modalEl, document.body) : null}
    </div>
  );
}
