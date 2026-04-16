"use client";
import { useState } from "react";
import InvitationToast from "./invitation/InvitationToast";
import FormTextField from "./invitation/FormTextField";
import SocialLinkInput from "./invitation/SocialLinkInput";
import { generateInvitationPDF } from "../../../lib/generators/generateInvitation";
import logoBlack from "../../media/logo-black.png";
import firmaDigital from "../../media/firma_digital.png";

import { getClientDb } from "../../../lib/firebaseClient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface InvitationData {
  tipo: "ponente" | "sponsor";
  nombre: string;
  genero: string;
  estudios: string;
  cargo: string;
  curriculum: string;
}

const formFields = [
  { name: "nombre", label: "Nombre Completo *", placeholder: "Ej: Juan Pérez" },
  { name: "cargo", label: "Cargo Actual / Profesión", placeholder: "Ej: CEO en TechNova" },
  { name: "estudios", label: "Notas relevantes (Para la IA)", placeholder: "Detalles que deba tomar en cuenta la IA" },
];

export default function InvitationForm() {
  const [formData, setFormData] = useState<InvitationData>({
    tipo: "ponente",
    nombre: "",
    genero: "Masculino",
    estudios: "",
    cargo: "",
    curriculum: "",
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const triggerToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000);
  };

  const handleCopyEmailTemplate = async () => {
    if (!formData.nombre) {
      triggerToast("Necesitas nombre y cargo.", "error");
      return;
    }
    
    let plainStr = "";
    let htmlStr = "";

    if (formData.tipo === "sponsor") {
      plainStr = `Hola ${formData.nombre},\n\nDesde el Equipo Organizador de la primera edición de TEDxAvenida Bolivar, tu perfil administrativo y liderazgo nos ha llamado fuertemente la atención. Tu destacada labor como ${formData.cargo} nos resulta ideal para explorar una alianza estratégica y sumarte como Sponsor Oficial en nuestro ciclo de conferencias de este año: "El Arte de Reinventar".\n\nAdjunto a este correo encontrarás dos documentos:\n- Una carta de intenciones formales elaborada por nuestro equipo, donde expresamos nuestro interés en colaborar.\n- Un Dossier Comercial / de Publicidad detallado, para que puedas entender a fondo la misión de TEDx y evaluar los distintos niveles de patrocinio o alianzas disponibles.\n\nEs una oportunidad fantástica de impacto cívico e intelectual. Te invitamos a revisar los documentos y esperamos entablar un posible acercamiento pronto.\n\nAtentamente,\nJosé Manuel Obregón Alonzo\nOrganizador y Licenciatario\nTEDxAvenida Bolivar`;
      
      htmlStr = `<p>Hola <b>${formData.nombre}</b>,</p><p>Desde el <b>Equipo Organizador</b> de la primera edición de TEDxAvenida Bolivar, el liderazgo e influencia de tu perfil nos enorgullece localmente. Tu rol como <b>${formData.cargo}</b> nos parece el canal idóneo para invitarte a una alianza estratégica y sumar esfuerzos como Sponsor de nuestra edición: "<b>El Arte de Reinventar</b>".</p><p>Adjuntamos en este correo dos documentos vitales:<ul><li>Una <b>misiva protocolar de acercamiento</b> institucional.</li><li>Nuestro <b>Dossier Comercial de Publicidad</b>, diseñado para que todo tu equipo comprenda los valores TEDx y pueda explorar los múltiples <b>niveles de patrocinio</b> con los que podemos aliarnos.</li></ul></p><p>Revisen el dossier a detenimiento. Estaremos dichosos de que juntos convirtamos grandes ideas en realidades tangibles para nuestra ciudad este agosto.</p><br/><p>A tu entera disposición,</p><p><b>José Manuel Obregón Alonzo</b><br/>Organizador y Licenciatario<br/>TEDxAvenida Bolivar</p>`;
    } else {
      plainStr = `Hola ${formData.nombre},\n\nDesde el Equipo Organizador de la primera edición de TEDxAvenida Bolivar, tu trayectoria como ${formData.cargo} nos resulta sumamente interesante para nuestra temática de este año, "El Arte de Reinventar".\n\nAdjunto a este correo encontrarás una carta de invitación formal para postular al proceso de audiciones con nuestro equipo, además de un manual guía rápido de cómo convertir una Idea en una charla TEDx auténtica.\n\nTe invitamos a leer los lineamientos detenidamente y decirnos si deseas embarcarte en este reto de alto impacto.\n\nAtentamente,\nJosé Manuel Obregón Alonzo\nOrganizador y Licenciatario\nTEDxAvenida Bolivar`;
      
      htmlStr = `<p>Hola <b>${formData.nombre}</b>,</p><p>Desde el <b>Equipo Organizador</b> de la primera edición de TEDxAvenida Bolivar, nos ha atrapado tu perfil. Tu trayectoria como <b>${formData.cargo}</b> nos parece un caso perfecto a explorar para nuestra edición de este año, "<b>El Arte de Reinventar</b>".</p><p>En el presente correo adjuntamos:<ul><li>Una carta de invitación formal.</li><li>Un PDF manual que contiene la guía oficial de postulación para convertir tus vivencias en una charla TEDx transformadora.</li></ul></p><p>Nuestra invitación es para que inicies tu ruta de postulación con nosotros de forma oficial. Explora la guía y haznos saber si te interesa subir al escenario de ideas más grande de la ciudad.</p><br/><p>Quedamos a tu entera disponibilidad,</p><p><b>José Manuel Obregón Alonzo</b><br/>Organizador y Licenciatario<br/>TEDxAvenida Bolivar</p>`;
    }

    try {
      const blobHtml = new Blob([htmlStr], { type: 'text/html' });
      const blobPlain = new Blob([plainStr], { type: 'text/plain' });
      await navigator.clipboard.write([
        new window.ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobPlain
        })
      ]);
      triggerToast("Mensaje enriquecido copiado al portapapeles", "success");
    } catch (e) {
      triggerToast("Error al copiar al portapapeles. Prueba usar otro navegador.", "error");
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.nombre || !formData.cargo) {
      triggerToast("Ingresa nombre y cargo para usar IA", "error");
      return;
    }
    
    setIsGeneratingAI(true);
    triggerToast("La IA está redactando la carta...", "success");

    try {
      const resp = await fetch("/api/generate-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: formData.tipo,
          nombre: formData.nombre,
          genero: formData.genero,
          cargo: formData.cargo,
          estudios: formData.estudios
        })
      });
      const data = await resp.json();
      
      if (resp.ok) {
        setFormData(prev => ({ ...prev, curriculum: data.result }));
        triggerToast("Cuerpo de carta generado con éxito", "success");
      } else {
        triggerToast("Error: " + (data.error || "Falla de red"), "error");
      }
    } catch (error) {
      triggerToast("Error conectando con la IA", "error");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    const tieneRazon = formData.cargo.trim() !== "" || formData.estudios.trim() !== "";

    if (!formData.nombre.trim()) {
      triggerToast("ERROR: El nombre es obligatorio.", "error");
      return;
    }
    if (!tieneRazon) {
      triggerToast("FALTA INFORMACIÓN: Indica el cargo o notas para la invitación.", "error");
      return;
    }

    triggerToast("Registrando código online y generando PDF...", "success");

    // 1. Generar Código Único de 6 dígitos
    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // 2. Guardar a Firebase
    try {
      const db = getClientDb();
      await addDoc(collection(db, "invitacionesGeneradas"), {
        code: generatedCode,
        tipo: formData.tipo,
        nombre: formData.nombre,
        cargo: formData.cargo,
        genero: formData.genero,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      triggerToast("Error sincronizando a Firebase, pero el PDF se generará.", "error");
      console.error(e);
    }

    const pdfData = {
        ...formData,
        qrCodeStr: generatedCode,
        redes: [] 
    };

    const success = await generateInvitationPDF(pdfData, logoBlack.src, firmaDigital.src);

    if (success) {
        triggerToast("PDF descargado con éxito", "success");
    } else {
        triggerToast("Hubo un error al crear el archivo.", "error");
    }

  };

  const updateField = (name: keyof InvitationData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-[#111] rounded-xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-ted-red)] to-[#ff4d4d]" />
      <InvitationToast show={toast.show} message={toast.message} type={toast.type} />

      <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-white">
        <span className="w-1.5 h-6 bg-[var(--color-ted-red)] rounded-sm"></span>
        Datos de Invitación
      </h2>
      
      <form onSubmit={handlePreview} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        
        {/* SELECTOR DE TIPO (PONENTE VS SPONSOR) */}
        <div className="md:col-span-2 flex w-full relative h-14 bg-black rounded-lg border border-gray-800 p-1 mb-2 shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)]">
           <button
             type="button"
             onClick={() => updateField("tipo", "ponente")}
             className={`flex-1 relative z-10 text-xs font-bold uppercase tracking-widest rounded-md transition-all duration-300 ${formData.tipo === 'ponente' ? 'text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
           >
             Ponente
           </button>
           <button
             type="button"
             onClick={() => updateField("tipo", "sponsor")}
             className={`flex-1 relative z-10 text-xs font-bold uppercase tracking-widest rounded-md transition-all duration-300 ${formData.tipo === 'sponsor' ? 'text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
           >
             Sponsor / Aliado
           </button>
           {/* Slider background */}
           <div 
             className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--color-ted-red)] rounded-md transition-all duration-300 shadow-[0_0_15px_rgba(235,0,40,0.5)]`}
             style={{ transform: formData.tipo === 'ponente' ? 'translateX(0)' : 'translateX(calc(100% + 1px))' }}
           />
        </div>

        {formFields.map((field) => {
          let dynamicLabel = field.label;
          let dynamicPlaceholder = field.placeholder;
          
          if (field.name === "cargo" && formData.tipo === "sponsor") {
            dynamicLabel = "Cargo Directivo y Organización *";
            dynamicPlaceholder = "Ej: Dueño de Café Latino";
          }
          if (field.name === "estudios" && formData.tipo === "sponsor") {
            dynamicLabel = "Rubro o Contexto de Interés Económico (Para IA)";
            dynamicPlaceholder = "Ej: Están invirtiendo en educación nacional...";
          }

          return (
            <FormTextField
              key={field.name}
              name={field.name}
              label={dynamicLabel}
              placeholder={dynamicPlaceholder}
              value={formData[field.name as keyof InvitationData]}
              required={field.name === "nombre" || (field.name === "cargo" && formData.tipo === "sponsor")}
              onChange={(value) => updateField(field.name as keyof InvitationData, value)}
              className={field.name === "nombre" ? "md:col-span-2" : ""}
            />
          );
        })}

        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Género / Tratamiento</label>
          <select
            value={formData.genero}
            onChange={(e) => updateField("genero", e.target.value)}
            className="w-full bg-[#121212] text-white p-3 border border-gray-700/60 rounded-lg focus:border-[var(--color-ted-red)] outline-none transition-all text-sm shadow-inner"
          >
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Neutro">No Binario / Neutro</option>
          </select>
        </div>

        {/* BIO */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Cuerpo de la Carta (Texto Completo)
            </label>
            <button 
              type="button" 
              onClick={handleAIGenerate} 
              disabled={isGeneratingAI}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg ${isGeneratingAI ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isGeneratingAI ? "Generando..." : "✨ Redactar con IA"}
            </button>
          </div>
          <textarea 
            name="curriculum" 
            value={formData.curriculum}
            onChange={(e) => updateField("curriculum", e.target.value)}
            rows={5} 
            className="w-full bg-[#121212] text-white p-4 border border-gray-700/60 rounded-lg focus:border-[var(--color-ted-red)] outline-none transition-all text-sm resize-y leading-relaxed placeholder:text-gray-500 shadow-inner" 
            placeholder="Puedes redactar la invitación a mano o presionar el botón superior para que la IA la redacte por ti."
          />
        </div>

        {/* BOTÓN PREVISUALIZAR Y COPIAR CORREO */}
        <div className="md:col-span-2 pt-8 flex flex-col sm:flex-row justify-center items-center gap-4 border-t border-gray-800 mt-4">
          
          <button 
            type="button"
            onClick={handleCopyEmailTemplate}
            className="w-full sm:w-auto px-6 py-4 bg-gray-800 text-white text-xs font-bold tracking-wider uppercase rounded-xl transition-all hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>
            Copiar Correo Base
          </button>

          <button 
            type="submit"
            className="group relative w-full sm:w-auto overflow-hidden px-10 py-4 bg-[var(--color-ted-red)] text-white text-xs font-black tracking-[0.3em] uppercase rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(235,0,40,0.3)]"
          >
            <span className="relative z-10">Generar Carta PDF</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </form>
    </div>
  );
}