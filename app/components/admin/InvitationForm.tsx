"use client";
import { useState } from "react";
import InvitationToast from "./invitation/InvitationToast";
import FormTextField from "./invitation/FormTextField";
import SocialLinkInput from "./invitation/SocialLinkInput";
import { generateInvitationPDF } from "@/lib//generators/generateInvitation";
import logoWhite from "@/app/media/logo-white.png";

interface InvitationData {
  nombre: string;
  correo: string;
  telefono: string;
  estudios: string;
  cargo: string;
  curriculum: string;
}

const formFields = [
  { name: "nombre", label: "Nombre Completo *", placeholder: "Ej: Juan Pérez" },
  { name: "correo", label: "Correo Electrónico", placeholder: "contacto@ejemplo.com" },
  { name: "telefono", label: "Teléfono de Contacto", placeholder: "+58 ..." },
  { name: "cargo", label: "Cargo Actual / Profesión", placeholder: "Ej: CEO en TechNova" },
  { name: "estudios", label: "Estudios Destacados", placeholder: "Grado o Especialidad" },
];

export default function InvitationForm() {
  const [links, setLinks] = useState<string[]>([""]);
  const [formData, setFormData] = useState<InvitationData>({
    nombre: "",
    correo: "",
    telefono: "",
    estudios: "",
    cargo: "",
    curriculum: "",
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });

  const triggerToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000);
  };

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    const tieneContacto = formData.correo.trim() !== "" || formData.telefono.trim() !== "";
    const tieneRazon = formData.cargo.trim() !== "" || formData.estudios.trim() !== "";

    if (!tieneContacto) {
      triggerToast("ERROR: Necesitamos un correo o teléfono para contactar al invitado.", "error");
      return;
    }
    if (!tieneRazon) {
      triggerToast("FALTA INFORMACIÓN: Indica el cargo o estudios para la invitación.", "error");
      return;
    }

    triggerToast("Generando PDF... por favor espera.", "success");

    const pdfData = {
        ...formData,
        redes: links.filter(link => link.trim() !== "")
    };

    const success = await generateInvitationPDF(pdfData, logoWhite.src);

    if (success) {
        triggerToast("PDF descargado con éxito", "success");
    } else {
        triggerToast("Hubo un error al crear el archivo.", "error");
    }

  };

  const updateField = (name: keyof InvitationData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateLink = (index: number, value: string) => {
    setLinks((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const addLink = () => setLinks((prev) => [...prev, ""]);

  return (
    <div className="bg-[#111] rounded-xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-ted-red)] to-[#ff4d4d]" />
      <InvitationToast show={toast.show} message={toast.message} type={toast.type} />

      <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-white">
        <span className="w-1.5 h-6 bg-[var(--color-ted-red)] rounded-sm"></span>
        Datos de Invitación
      </h2>
      
      <form onSubmit={handlePreview} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {formFields.map((field) => (
          <FormTextField
            key={field.name}
            name={field.name}
            label={field.label}
            placeholder={field.placeholder}
            value={formData[field.name as keyof InvitationData]}
            required={field.name === "nombre"}
            onChange={(value) => updateField(field.name as keyof InvitationData, value)}
            className={field.name === "nombre" ? "md:col-span-2" : ""}
          />
        ))}

        {/* REDES SOCIALES */}
        <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-900">
          <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">Presencia en Redes</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {links.map((link, index) => (
              <SocialLinkInput
                key={index}
                value={link}
                onChange={(value) => updateLink(index, value)}
                onAdd={addLink}
                showAddButton={index === links.length - 1}
              />
            ))}
          </div>
        </div>

        {/* BIO */}
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Notas de Trayectoria</label>
          <textarea 
            name="curriculum" 
            onChange={(e) => updateField("curriculum", e.target.value)}
            rows={2} 
            className="w-full bg-black text-white p-3 border border-gray-800 rounded-lg focus:border-[var(--color-ted-red)] outline-none transition-all text-sm resize-none" 
            placeholder="Resumen para la invitación..."
          />
        </div>

        {/* BOTÓN PREVISUALIZAR */}
        <div className="md:col-span-2 pt-8 flex justify-center border-t border-gray-800 mt-4">
          <button 
            type="submit"
            className="group relative w-full sm:w-auto overflow-hidden px-12 py-5 bg-[var(--color-ted-red)] text-white text-xs font-black tracking-[0.4em] uppercase rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(235,0,40,0.3)]"
          >
            <span className="relative z-10">Previsualizar Archivo</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </form>
    </div>
  );
}