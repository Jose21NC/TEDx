// components/Admin/ApplicantCard.tsx
"use client";
import { useState, useRef, useEffect } from "react";

interface ApplicantCardProps {
  applicant: any;
  selectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => Promise<void>;
  onGeneratePDF: (applicant: any) => Promise<void>;
  processing: boolean;
}

export default function ApplicantCard({
  applicant: p,
  selectionMode,
  isSelected,
  onToggleSelect,
  onStatusUpdate,
  onGeneratePDF,
  processing
}: ApplicantCardProps) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  const formatDate = (value: any) => {
    if (!value) return "";
    if (typeof value?.toDate === "function") return value.toDate().toLocaleString();
    if (value?.seconds) return new Date(value.seconds * 1000).toLocaleString();
    try { const d = new Date(value); if (!isNaN(d.getTime())) return d.toLocaleString(); } catch {}
    return String(value);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setStatusMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ensureProtocol = (url: string | null | undefined) => {
    if (!url) return "#";
    const trimmed = url.trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const statusColors = {
    Aprobada: { bar: '#22c55e', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', dot: 'bg-green-500' },
    Rechazada: { bar: 'var(--color-ted-red)', bg: 'bg-red-50', text: 'text-[var(--color-ted-red)]', border: 'border-red-300', dot: 'bg-[var(--color-ted-red)]' },
    default: { bar: '#d1d5db', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-300', dot: 'bg-gray-400' }
  };

  const style = statusColors[p.status as keyof typeof statusColors] || statusColors.default;

  return (
    <article className="relative overflow-hidden rounded-xl bg-white p-6 shadow-xl text-black transition-all border border-gray-200 hover:-translate-y-1 hover:shadow-2xl">
      <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: style.bar }} />
      
      <div className="flex items-start gap-4 pl-4">
        {selectionMode && (
          <div className="pt-1.5">
            <input 
              type="checkbox" 
              checked={isSelected} 
              onChange={() => onToggleSelect(p.id)} 
              className="h-5 w-5 rounded border-gray-300 text-[var(--color-ted-red)] focus:ring-[var(--color-ted-red)] cursor-pointer" 
            />
          </div>
        )}

        <div className="flex-1 w-full min-w-0">
          {/* Header del Card */}
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
                <button onClick={() => onGeneratePDF(p)} disabled={processing} className="flex items-center gap-1 px-2.5 py-1 bg-black text-white text-[10px] uppercase tracking-wider font-bold rounded hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50">
                  PDF + QR
                </button>
              </div>
            </div>
          </div>

          {/* Grid de Información */}
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
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#eb0028] mb-1">Categorías</span>
                <p className="font-medium text-gray-900 leading-snug">{(p.categorias?.length) ? p.categorias.join(' / ') : '—'} {p.categoriaOtra ? ` (${p.categoriaOtra})` : ''}</p>
              </div>
            </div>
            
            <div className="space-y-4 text-sm lg:col-span-2">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#eb0028] mb-1">Título de la Charla</span>
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

          {/* Footer del Card: Redes y Estatus */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-2">
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
              {p.linkedin && (
                <a href={ensureProtocol(p.linkedin)} target="_blank" rel="noreferrer" className="bg-[#0077b5] text-white px-3 py-1.5 rounded text-xs hover:bg-[#005e93] transition flex items-center shadow-sm">
                  LinkedIn ↗
                </a>
              )}
              {p.redes && (
                <span className="text-gray-600 border border-gray-200 bg-gray-50 px-3 py-1.5 rounded text-xs max-w-[200px] break-words">
                  <span className="font-bold text-gray-400 mr-1">@</span>{p.redes}
                </span>
              )}
              {p.videoLink && (
                <a href={ensureProtocol(p.videoLink)} target="_blank" rel="noreferrer" className="bg-black text-[var(--color-ted-red)] px-4 py-1.5 rounded hover:bg-gray-900 transition flex items-center gap-2 font-bold text-xs uppercase tracking-wider shadow-sm border border-[var(--color-ted-red)]">
                  ▶ Ver Pitch URL
                </a>
              )}
            </div>
            
            <div ref={statusMenuRef} className="relative mt-2 sm:mt-0">
              <button 
                onClick={() => setStatusMenuOpen(!statusMenuOpen)} 
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 font-bold text-[10px] uppercase tracking-widest border transition-all shadow-sm ${style.bg} ${style.text} ${style.border} hover:brightness-95`}
              >
                <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
                Estatus: {p.status || 'Pendiente'} ▾
              </button>
              
              {statusMenuOpen && (
                <div className="absolute right-0 bottom-full mb-2 z-50 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-xl text-black">
                  {['Aprobada', 'Rechazada', 'Sin revisar'].map((status) => (
                    <button 
                      key={status}
                      onClick={() => { onStatusUpdate(p.id, status); setStatusMenuOpen(false); }} 
                      className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-xs hover:bg-gray-50 rounded-md font-bold transition-colors uppercase tracking-wider"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${status === 'Aprobada' ? 'bg-green-500' : status === 'Rechazada' ? 'bg-[var(--color-ted-red)]' : 'bg-gray-400'}`}></span>
                      {status === 'Sin revisar' ? 'Pendiente' : status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}