"use client";
import { FormEvent, useState } from "react";

export default function ConvocatoriaForm() {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [redes, setRedes] = useState("");
  const [perfil, setPerfil] = useState("");
  const [perfilOtro, setPerfilOtro] = useState("");

  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaOtra, setCategoriaOtra] = useState("");
  const [tituloCharla, setTituloCharla] = useState("");
  const [idea, setIdea] = useState("");
  const [porQue, setPorQue] = useState("");
  const [novedad, setNovedad] = useState("");

  const [videoLink, setVideoLink] = useState("");
  const [confirmaReglas, setConfirmaReglas] = useState(false);
  const [confirmaPrivacidad, setConfirmaPrivacidad] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");

  function toggleCategoria(value: string) {
    setCategorias(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    setSubmitMessage("");
    setSubmitError("");

    if (!nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!edad.trim()) newErrors.edad = "La edad es obligatoria.";
    else if (!/^\d+$/.test(edad.trim())) newErrors.edad = "La edad debe ser un número entero.";
    if (!correo.trim()) newErrors.correo = "El correo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) newErrors.correo = "Formato de correo inválido.";
    if (!telefono.trim()) newErrors.telefono = "El número telefónico es obligatorio.";
    else if (!/^\d{4}-\d{4}$/.test(telefono.trim())) newErrors.telefono = "El número debe tener el formato 1234-5678.";
    if (!linkedin.trim()) newErrors.linkedin = "El perfil de LinkedIn es obligatorio.";
    if (!perfil.trim()) newErrors.perfil = "Selecciona tu perfil.";
    if (perfil === "Otro" && !perfilOtro.trim()) newErrors.perfilOtro = "Por favor especifique su perfil.";
    if (categorias.length === 0) newErrors.categorias = "Seleccione al menos una categoría.";
    if (categorias.includes("Otra") && !categoriaOtra.trim()) newErrors.categoriaOtra = "Especifica cuál es la otra categoría.";
    if (!idea.trim()) newErrors.idea = "La idea central es obligatoria.";
    else if (idea.trim().split(/\s+/).length > 15) newErrors.idea = "La idea central debe tener máximo 15 palabras.";
    if (!porQue.trim()) newErrors.porQue = "Este campo es obligatorio.";
    else if (porQue.trim().split(/\s+/).length > 100) newErrors.porQue = "Máximo 100 palabras.";
    if (!novedad.trim()) newErrors.novedad = "Este campo es obligatorio.";
    else if (novedad.trim().split(/\s+/).length > 100) newErrors.novedad = "Máximo 100 palabras.";
    if (!videoLink.trim()) newErrors.videoLink = "El enlace al Video Pitch es obligatorio.";
    if (!confirmaReglas) newErrors.confirmaReglas = "Debes confirmar el cumplimiento de las reglas TEDx.";
    if (!confirmaPrivacidad) newErrors.confirmaPrivacidad = "Debes aceptar el Aviso de Privacidad.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      return;
    }

    try {
      const payload = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        nombre: nombre.trim(),
        edad: Number(edad.trim()),
        correo: correo.trim(),
        telefono: telefono.trim(),
        linkedin: linkedin.trim(),
        redes: redes.trim(),
        perfil: perfil === "Otro" ? `${perfil} - ${perfilOtro.trim()}` : perfil,
        categorias,
        categoriaOtra: categoriaOtra.trim(),
        tituloCharla: tituloCharla.trim(),
        idea: idea.trim(),
        porQue: porQue.trim(),
        novedad: novedad.trim(),
        videoLink: videoLink.trim(),
        confirmaReglas,
        confirmaPrivacidad,
      };

      const firebaseModule = await import("../../lib/firebaseClient");
      const firestoreModule = await import("firebase/firestore");
      const db = firebaseModule.getClientDb();
      const col = firestoreModule.collection(db, "ponentesTedx");
      await firestoreModule.addDoc(col, {
        ...payload,
        createdAt: firestoreModule.serverTimestamp(),
      });

      setSubmitMessage("Postulación guardada correctamente.");

      setNombre("");
      setEdad("");
      setCorreo("");
      setTelefono("");
      setLinkedin("");
      setRedes("");
      setPerfil("");
      setPerfilOtro("");
      setCategorias([]);
      setCategoriaOtra("");
      setTituloCharla("");
      setIdea("");
      setPorQue("");
      setNovedad("");
      setVideoLink("");
      setConfirmaReglas(false);
      setConfirmaPrivacidad(false);
      setErrors({});
    } catch {
      setSubmitError("No se pudo enviar la postulación al servidor. Intenta nuevamente.");
    }
  }

  return (
    <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">SECCIÓN 1: Datos Personales</h2>

        <label className="block">
          <span className="text-sm font-medium">Nombre Completo *</span>
          <input value={nombre} onChange={e => setNombre(e.target.value)} className={`mt-1 block w-full rounded-md border px-3 py-2 ${errors.nombre ? 'border-red-600' : 'border-gray-300'}`} placeholder="Nombre completo" />
          {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Edad *</span>
            <input value={edad} onChange={e => setEdad(e.target.value)} type="number" min={0} className={`mt-1 block w-full rounded-md border px-3 py-2 ${errors.edad ? 'border-red-600' : 'border-gray-300'}`} placeholder="Edad" />
            {errors.edad && <p className="mt-1 text-sm text-red-600">{errors.edad}</p>}
          </label>

          <label className="block">
            <span className="text-sm font-medium">Correo *</span>
            <input value={correo} onChange={e => setCorreo(e.target.value)} type="email" className={`mt-1 block w-full rounded-md border px-3 py-2 ${errors.correo ? 'border-red-600' : 'border-gray-300'}`} placeholder="ejemplo@correo.com" />
            {errors.correo && <p className="mt-1 text-sm text-red-600">{errors.correo}</p>}
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Número telefónico *</span>
            <input value={telefono} onChange={e => setTelefono(e.target.value)} className={`mt-1 block w-full rounded-md border px-3 py-2 ${errors.telefono ? 'border-red-600' : 'border-gray-300'}`} placeholder="1234-5678" />
            {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
          </label>

          <label className="block">
            <span className="text-sm font-medium">Perfil de LinkedIn *</span>
            <input value={linkedin} onChange={e => setLinkedin(e.target.value)} className={`mt-1 block w-full rounded-md border px-3 py-2 ${errors.linkedin ? 'border-red-600' : 'border-gray-300'}`} placeholder="https://linkedin.com/in/tu-perfil" />
            {errors.linkedin && <p className="mt-1 text-sm text-red-600">{errors.linkedin}</p>}
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium">Enlace a redes sociales (Opcional)</span>
          <input value={redes} onChange={e => setRedes(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Facebook / Instagram / TikTok - enlace" />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Selecciona tu perfil *</span>
          <select value={perfil} onChange={e => setPerfil(e.target.value)} className={`mt-1 block w-full rounded-md px-3 py-2 ${errors.perfil ? 'border-red-600 border' : 'border border-gray-300'}`}>
            <option value="">Seleccione</option>
            <option>Estudiante</option>
            <option>Investigador</option>
            <option>Profesional</option>
            <option>Artista</option>
            <option>Otro</option>
          </select>
          {errors.perfil && <p className="mt-1 text-sm text-red-600">{errors.perfil}</p>}
        </label>

        {perfil === "Otro" && (
          <label className="block">
            <span className="text-sm font-medium">Especificar perfil</span>
            <input value={perfilOtro} onChange={e => setPerfilOtro(e.target.value)} className={`mt-1 block w-full rounded-md px-3 py-2 ${errors.perfilOtro ? 'border-red-600 border' : 'border border-gray-300'}`} placeholder="Describa su perfil" />
            {errors.perfilOtro && <p className="mt-1 text-sm text-red-600">{errors.perfilOtro}</p>}
          </label>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">SECCIÓN 2: Tu charla</h2>

        <div>
          <span className="text-sm font-medium">¿En qué categoría principal encaja tu idea? (Selecciona una o varias)</span>
          <div className="mt-2 grid grid-cols-1 gap-2">
            {[
              "Ciencia / Tecnología / Sostenibilidad",
              "Arte / Cultura / Diseño",
              "Sociedad / Historia / Identidad",
              "Educación / Impacto Social",
              "Otra",
            ].map(option => (
              <label key={option} className="inline-flex items-start gap-2 text-justify">
                <input type="checkbox" checked={categorias.includes(option)} onChange={() => toggleCategoria(option)} className="rounded border-gray-300 mt-1" />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
          {errors.categorias && <p className="mt-1 text-sm text-red-600">{errors.categorias}</p>}

          {categorias.includes("Otra") && (
            <label className="mt-3 block">
              <span className="text-sm font-medium">Especifica la otra categoría</span>
              <input
                value={categoriaOtra}
                onChange={e => setCategoriaOtra(e.target.value)}
                className={`mt-1 block w-full rounded-md px-3 py-2 ${errors.categoriaOtra ? 'border-red-600 border' : 'border border-gray-300'}`}
                placeholder="Escribe la categoría"
              />
              {errors.categoriaOtra && <p className="mt-1 text-sm text-red-600">{errors.categoriaOtra}</p>}
            </label>
          )}
        </div>

        <label className="block">
          <span className="text-sm font-medium">¿Cuál es el título de tu charla? (No es necesario que sea el definitivo)</span>
          <input
            value={tituloCharla}
            onChange={e => setTituloCharla(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Título tentativo de tu charla"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">En una sola oración (máximo 15 palabras), ¿cuál es la IDEA CENTRAL que quieres compartir?</span>
          <input value={idea} onChange={e => setIdea(e.target.value)} maxLength={200} className={`mt-1 block w-full rounded-md px-3 py-2 ${errors.idea ? 'border-red-600 border' : 'border border-gray-300'}`} placeholder="Idea central (una oración)" />
          {errors.idea && <p className="mt-1 text-sm text-red-600">{errors.idea}</p>}
        </label>

        <label className="block">
          <span className="text-sm font-medium">¿Por qué crees que esta idea encaja con el lema "El Arte de Reinventar" en el contexto de Nicaragua? (Máximo 100 palabras)</span>
          <textarea value={porQue} onChange={e => setPorQue(e.target.value)} maxLength={1200} className={`mt-1 block w-full rounded-md px-3 py-2 ${errors.porQue ? 'border-red-600 border' : 'border border-gray-300'}`} rows={4} />
          {errors.porQue && <p className="mt-1 text-sm text-red-600">{errors.porQue}</p>}
        </label>

        <label className="block">
          <span className="text-sm font-medium">¿Qué tiene de NUEVA o DIFERENTE tu perspectiva sobre este tema? (Máximo 100 palabras)</span>
          <textarea value={novedad} onChange={e => setNovedad(e.target.value)} maxLength={1200} className={`mt-1 block w-full rounded-md px-3 py-2 ${errors.novedad ? 'border-red-600 border' : 'border border-gray-300'}`} rows={4} />
          {errors.novedad && <p className="mt-1 text-sm text-red-600">{errors.novedad}</p>}
        </label>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">SECCIÓN 3: El Video Pitch</h2>

        <label className="block">
          <span className="text-sm font-medium">Enlace a tu Video Pitch *</span>
          <input value={videoLink} onChange={e => setVideoLink(e.target.value)} className={`mt-1 block w-full rounded-md px-3 py-2 ${errors.videoLink ? 'border-red-600 border' : 'border border-gray-300'}`} placeholder="https://youtube.com/...." />
          {errors.videoLink && <p className="mt-1 text-sm text-red-600">{errors.videoLink}</p>}
        </label>

        <label className="inline-flex items-start gap-2">
          <input type="checkbox" checked={confirmaReglas} onChange={e => setConfirmaReglas(e.target.checked)} className="mt-1" />
          <span className="text-sm text-justify">Confirmo que mi propuesta cumple estrictamente con los lineamientos de TED (no promueve agendas políticas, religiosas, comerciales ni pseudocientíficas) y que, de ser preseleccionado/a, tengo total disponibilidad para asistir presencialmente al Open Mic el sábado 18 de abril de 2026 en Managua. *</span>
        </label>
        {errors.confirmaReglas && <p className="mt-1 text-sm text-red-600">{errors.confirmaReglas}</p>}

        <label className="inline-flex items-start gap-2">
          <input type="checkbox" checked={confirmaPrivacidad} onChange={e => setConfirmaPrivacidad(e.target.checked)} className="mt-1" />
          <span className="text-sm text-justify">He leído y acepto el Aviso de Privacidad y autorizo el uso de mi imagen bajo los términos descritos. *</span>
        </label>
        {errors.confirmaPrivacidad && <p className="mt-1 text-sm text-red-600">{errors.confirmaPrivacidad}</p>}

        <p className="text-xs text-gray-500 text-justify">Aviso Legal: El equipo organizador de TEDxAvenida Bolivar informa que los datos personales proporcionados serán tratados de forma confidencial y segura, conforme a la Ley de Protección de Datos Personales de Nicaragua (Ley No. 787), con la finalidad exclusiva de gestionar su postulación, evaluar su perfil y enviarle información relacionada al proceso de selección y al evento.</p>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="submit" className="rounded-md bg-[var(--color-ted-red)] px-4 py-2 text-white font-semibold">
          Enviar
        </button>
      </div>

      {submitMessage && (
        <p className="rounded-md border border-green-600/30 bg-green-50 px-3 py-2 text-sm text-green-700">{submitMessage}</p>
      )}
      {submitError && (
        <p className="rounded-md border border-red-600/30 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>
      )}
    </form>
  );
}
