// components/admin/InvitationForm.tsx
"use client";
import { useState } from "react";

export default function InvitationForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    redes: "",
    estudios: "",
    cargo: "",
    curriculum: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos capturados:", formData);
    // Aquí conectaremos la generación del PDF más adelante
    alert("Datos listos para generar el PDF (Revisa la consola)");
  };

  return (
    <div className="bg-[#111] rounded-xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
      {/* Detalle visual sutil */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-ted-red)] to-[#ff4d4d]" />
      
      <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-white">
        <span className="w-1.5 h-6 bg-[var(--color-ted-red)] rounded-sm"></span>
        Datos del Postulante
      </h2>
      
      <form onSubmit={handlePreview} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Columna Izquierda */}
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Nombre Completo
            </label>
            <input 
              name="nombre" 
              value={formData.nombre}
              onChange={handleChange} 
              required
              className="w-full bg-black text-white p-3 border border-gray-700 rounded-lg focus:border-[var(--color-ted-red)] focus:ring-1 focus:ring-[var(--color-ted-red)] outline-none transition-all placeholder:text-gray-600 font-medium" 
              placeholder="Ej: María Antonieta" 
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Correo Electrónico
            </label>
            <input 
              name="correo" 
              type="email"
              value={formData.correo}
              onChange={handleChange} 
              className="w-full bg-black text-white p-3 border border-gray-700 rounded-lg focus:border-[var(--color-ted-red)] focus:ring-1 focus:ring-[var(--color-ted-red)] outline-none transition-all placeholder:text-gray-600 font-medium" 
              placeholder="contacto@ejemplo.com" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Redes Sociales / Enlaces
            </label>
            <input 
              name="redes" 
              value={formData.redes}
              onChange={handleChange} 
              className="w-full bg-black text-white p-3 border border-gray-700 rounded-lg focus:border-[var(--color-ted-red)] focus:ring-1 focus:ring-[var(--color-ted-red)] outline-none transition-all placeholder:text-gray-600 font-medium" 
              placeholder="LinkedIn, Instagram, Web..." 
            />
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Cargo Actual / Profesión
            </label>
            <input 
              name="cargo" 
              value={formData.cargo}
              onChange={handleChange} 
              className="w-full bg-black text-white p-3 border border-gray-700 rounded-lg focus:border-[var(--color-ted-red)] focus:ring-1 focus:ring-[var(--color-ted-red)] outline-none transition-all placeholder:text-gray-600 font-medium" 
              placeholder="Ej: Investigador Principal" 
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Estudios Destacados
            </label>
            <input 
              name="estudios" 
              value={formData.estudios}
              onChange={handleChange} 
              className="w-full bg-black text-white p-3 border border-gray-700 rounded-lg focus:border-[var(--color-ted-red)] focus:ring-1 focus:ring-[var(--color-ted-red)] outline-none transition-all placeholder:text-gray-600 font-medium" 
              placeholder="Ph.D en Física Cuántica" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Teléfono de Contacto
            </label>
            <input 
              name="telefono" 
              value={formData.telefono}
              onChange={handleChange} 
              className="w-full bg-black text-white p-3 border border-gray-700 rounded-lg focus:border-[var(--color-ted-red)] focus:ring-1 focus:ring-[var(--color-ted-red)] outline-none transition-all placeholder:text-gray-600 font-medium" 
              placeholder="+58 ..." 
            />
          </div>
        </div>

        {/* Fila Completa */}
        <div className="md:col-span-2 mt-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
            Breve Biografía / Resumen de Perfil
          </label>
          <textarea 
            name="curriculum" 
            value={formData.curriculum}
            onChange={handleChange} 
            rows={4} 
            className="w-full bg-black text-white p-3 border border-gray-700 rounded-lg focus:border-[var(--color-ted-red)] focus:ring-1 focus:ring-[var(--color-ted-red)] outline-none transition-all placeholder:text-gray-600 font-medium resize-y" 
            placeholder="Escribe un párrafo destacando por qué esta persona sería ideal para TEDx..."
          ></textarea>
        </div>

        {/* Botón de Acción */}
        <div className="md:col-span-2 pt-6 border-t border-gray-800">
          <button 
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 bg-[var(--color-ted-red)] hover:bg-[#c90022] text-white text-sm font-bold tracking-widest uppercase rounded-md transition-colors shadow-lg shadow-[var(--color-ted-red)]/20 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            Previsualizar Datos
          </button>
        </div>
      </form>
    </div>
  );
}