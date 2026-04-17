"use client";

import { FormEvent, PointerEvent as ReactPointerEvent, useEffect, useState } from "react";
import { sendConfirmationEmail } from "../../lib/notifications";

type VolunteerCropState = {
  pointerId: number;
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

async function cropVolunteerImageSquare(
  file: File,
  options: { zoom: number; offsetX: number; offsetY: number },
) {
  const src = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("No se pudo cargar la imagen para recorte."));
      img.src = src;
    });

    const targetSize = 800;
    const targetAspect = 1;
    const imageAspect = image.naturalWidth / image.naturalHeight;

    let baseCropWidth = image.naturalWidth;
    let baseCropHeight = image.naturalHeight;
    let baseX = 0;
    let baseY = 0;

    if (imageAspect > targetAspect) {
      baseCropHeight = image.naturalHeight;
      baseCropWidth = baseCropHeight * targetAspect;
      baseX = (image.naturalWidth - baseCropWidth) / 2;
    } else {
      baseCropWidth = image.naturalWidth;
      baseCropHeight = baseCropWidth / targetAspect;
      baseY = (image.naturalHeight - baseCropHeight) / 2;
    }

    const clampedZoom = Math.max(1, Math.min(3, options.zoom));
    const cropWidth = baseCropWidth / clampedZoom;
    const cropHeight = baseCropHeight / clampedZoom;

    const offsetX = clampPercent(options.offsetX);
    const offsetY = clampPercent(options.offsetY);

    const sourceX = baseX + ((baseCropWidth - cropWidth) * offsetX) / 100;
    const sourceY = baseY + ((baseCropHeight - cropHeight) * offsetY) / 100;

    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo inicializar el canvas para recorte.");

    ctx.drawImage(image, sourceX, sourceY, cropWidth, cropHeight, 0, 0, targetSize, targetSize);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error("No se pudo generar la imagen recortada."));
            return;
          }
          resolve(result);
        },
        "image/jpeg",
        0.85,
      );
    });

    return blob;
  } finally {
    URL.revokeObjectURL(src);
  }
}

type FormState = {
  fullName: string;
  ageRange: string;
  email: string;
  phone: string;
  city: string;
  occupation: string;
  availabilityText: string;
  areas: string[];
  skills: string[];
  resources: string;
  socialLinks: Array<{ platform: string; url: string }>;
  areaDetailsText: string;
  experience: string;
  motivation: string;
  agree: boolean;
};

const areaOptions = [
  "Produccion",
  "Logistica",
  "Registro y atencion",
  "Escenario y speakers",
  "Comunicacion y redes",
  "Foto y video",
  "Cualquiera de las anteriores",
];

const primarySkillOptions = [
  "Comunicacion efectiva",
  "Atencion al publico",
  "Produccion de eventos",
  "Fotografia",
  "Video y camara",
];

const secondarySkillOptions = [
  "Diseno grafico",
  "Edicion de contenido",
  "Gestion de equipos",
  "Resolucion de problemas",
  "Herramientas digitales",
];

const socialPlatforms = ["Instagram", "TikTok", "LinkedIn", "X", "Facebook", "YouTube", "Sitio web", "Otro"];

const initialState: FormState = {
  fullName: "",
  ageRange: "",
  email: "",
  phone: "",
  city: "",
  occupation: "",
  availabilityText: "",
  areas: [],
  skills: [],
  resources: "",
  socialLinks: [],
  areaDetailsText: "",
  experience: "",
  motivation: "",
  agree: false,
};

const inputClass =
  "mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[#171717] outline-none transition placeholder:text-neutral-400 focus:border-[var(--color-ted-red)] focus:ring-4 focus:ring-[rgba(235,0,40,0.12)]";

export default function VoluntariadoForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [imageError, setImageError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [profileImageCroppedBlob, setProfileImageCroppedBlob] = useState<Blob | null>(null);
  const [profileImageCroppedPreview, setProfileImageCroppedPreview] = useState("");
  const [profileImageZoom, setProfileImageZoom] = useState(1);
  const [profileImageOffsetX, setProfileImageOffsetX] = useState(50);
  const [profileImageOffsetY, setProfileImageOffsetY] = useState(50);
  const [profileCropDragState, setProfileCropDragState] = useState<VolunteerCropState | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [showMoreSkills, setShowMoreSkills] = useState(false);
  const [customSkillText, setCustomSkillText] = useState(""
  );
  const [customSkillOpen, setCustomSkillOpen] = useState(false);

  useEffect(() => {
    if (!profileImageFile) {
      setProfileImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(profileImageFile);
    setProfileImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [profileImageFile]);

  useEffect(() => {
    if (!profileImageCroppedBlob) {
      setProfileImageCroppedPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(profileImageCroppedBlob);
    setProfileImageCroppedPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [profileImageCroppedBlob]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function toggleArrayItem(field: "areas", value: string) {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item: string) => item !== value)
        : [...current[field], value],
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function toggleSkill(value: string) {
    setForm((current) => ({
      ...current,
      skills: current.skills.includes(value)
        ? current.skills.filter((item) => item !== value)
        : [...current.skills, value],
    }));
  }

  function addCustomSkill() {
    const nextSkill = customSkillText.trim();

    if (!nextSkill) return;

    setForm((current) => ({
      ...current,
      skills: current.skills.includes(nextSkill) ? current.skills : [...current.skills, nextSkill],
    }));
    setCustomSkillText("");
    setCustomSkillOpen(false);
    setShowMoreSkills(true);
  }

  function resetForm() {
    setForm(initialState);
    setErrors({});
    setImageError("");
    setProfileImageFile(null);
    setProfileImagePreview("");
    setProfileImageCroppedBlob(null);
    setProfileImageCroppedPreview("");
    setProfileImageZoom(1);
    setProfileImageOffsetX(50);
    setProfileImageOffsetY(50);
    setProfileCropDragState(null);
    setShowMoreSkills(false);
    setCustomSkillText("");
    setCustomSkillOpen(false);
  }

  function handleProfileImageChange(file: File | null) {
    if (!file) {
      setProfileImageFile(null);
      setImageError("Selecciona una imagen para continuar.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImageError("Sube un archivo de imagen válido (PNG, JPG, WEBP, etc.).");
      return;
    }

    const maxFileSize = 8 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setImageError("La imagen supera el límite de 8MB. Elige un archivo más liviano.");
      return;
    }

    setImageError("");
    setProfileImageFile(file);
    setProfileImageCroppedBlob(null);
    setProfileImageCroppedPreview("");
    setProfileImageZoom(1);
    setProfileImageOffsetX(50);
    setProfileImageOffsetY(50);
    setProfileCropDragState(null);
  }

  function handleProfileCropPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!profileImagePreview) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setProfileImageOffsetX(clampPercent(((event.clientX - rect.left) / rect.width) * 100));
      setProfileImageOffsetY(clampPercent(((event.clientY - rect.top) / rect.height) * 100));
    }
    setProfileCropDragState({ pointerId: event.pointerId });
  }

  function handleProfileCropPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!profileCropDragState || profileCropDragState.pointerId !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    setProfileImageOffsetX(clampPercent(((event.clientX - rect.left) / rect.width) * 100));
    setProfileImageOffsetY(clampPercent(((event.clientY - rect.top) / rect.height) * 100));
  }

  function handleProfileCropPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (!profileCropDragState || profileCropDragState.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setProfileCropDragState(null);
  }

  async function confirmProfileCrop() {
    if (!profileImageFile) return;

    setIsCropping(true);
    try {
      const cropped = await cropVolunteerImageSquare(profileImageFile, {
        zoom: profileImageZoom,
        offsetX: profileImageOffsetX,
        offsetY: profileImageOffsetY,
      });
      setProfileImageCroppedBlob(cropped);
      setImageError("");
    } catch (e) {
      setImageError(e instanceof Error ? e.message : "No se pudo recortar la imagen. Intenta con otra foto.");
    } finally {
      setIsCropping(false);
    }
  }

  function addSocialLink() {
    setForm((current) => ({
      ...current,
      socialLinks: [...current.socialLinks, { platform: "Instagram", url: "" }],
    }));
  }

  function removeSocialLink(index: number) {
    setForm((current) => ({
      ...current,
      socialLinks: current.socialLinks.filter((_, idx) => idx !== index),
    }));
  }

  function updateSocialLink(index: number, key: "platform" | "url", value: string) {
    setForm((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((item, idx) => (idx === index ? { ...item, [key]: value } : item)),
    }));
  }

  function validate() {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.fullName.trim()) nextErrors.fullName = "Tu nombre completo es obligatorio.";
    if (!form.email.trim()) nextErrors.email = "Tu correo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Ingresa un correo valido.";
    if (!form.phone.trim()) nextErrors.phone = "Tu telefono es obligatorio.";
    if (!form.availabilityText.trim()) nextErrors.availabilityText = "Escribe tu disponibilidad aproximada.";
    if (form.areas.length === 0) nextErrors.areas = "Selecciona al menos un area de apoyo.";
    if (!profileImageFile) setImageError("Agrega una imagen para completar tu postulación.");
    else if (!profileImageCroppedBlob) setImageError("Confirma el recorte de la imagen para continuar.");

    const invalidSocial = form.socialLinks.some((item) => item.url.trim() && !/^https?:\/\//i.test(item.url.trim()));
    if (invalidSocial) nextErrors.socialLinks = "Usa enlaces completos que inicien con http:// o https://.";

    if (!form.motivation.trim()) nextErrors.motivation = "Cuentanos por que quieres sumarte como voluntario.";
    if (!form.agree) nextErrors.agree = "Debes aceptar el tratamiento de datos para continuar.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 && !!profileImageFile && !!profileImageCroppedBlob;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const firebaseModule = await import("../../lib/firebaseClient");
      const firestore = await import("firebase/firestore");
      const storageModule = await import("firebase/storage");
      const db = firebaseModule.getClientDb();
      const storage = firebaseModule.getClientStorage();
      const collectionRef = firestore.collection(db, "voluntariosTedx");
      const submissionId = crypto.randomUUID();

      const croppedImageBlob = profileImageCroppedBlob as Blob;
      const safeName = form.fullName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "voluntario";
      const storageRef = storageModule.ref(storage, `volunteer-photos/${submissionId}/${Date.now()}_${safeName}.jpg`);

      await storageModule.uploadBytes(storageRef, croppedImageBlob, { contentType: "image/jpeg" });
      const photoUrl = await storageModule.getDownloadURL(storageRef);

      await firestore.addDoc(collectionRef, {
        id: submissionId,
        createdAt: firestore.serverTimestamp(),
        fullName: form.fullName.trim(),
        ageRange: form.ageRange.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        occupation: form.occupation.trim(),
        availabilityText: form.availabilityText.trim(),
        areas: form.areas,
        skills: form.skills,
        resources: form.resources.trim(),
        socialLinks: form.socialLinks
          .map((item) => ({ platform: item.platform.trim(), url: item.url.trim() }))
          .filter((item) => item.url),
        areaDetailsText: form.areaDetailsText.trim(),
        experience: form.experience.trim(),
        motivation: form.motivation.trim(),
        photoUrl,
        agree: form.agree,
        status: "Pendiente",
        source: "voluntariado",
      });

      try {
        await sendConfirmationEmail({
          recipientEmail: form.email.trim(),
          recipientName: form.fullName.trim(),
          source: "voluntariado",
        });
      } catch (error) {
        console.error("Error sending volunteer confirmation email:", error);
      }

      resetForm();
      setSent(true);
    } catch (error) {
      console.error("Error saving volunteer form:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-[#111]">Nombre completo *</span>
            <input value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} className={inputClass} placeholder="Nombre y apellidos" />
            {errors.fullName ? <p className="mt-1 text-sm text-red-600">{errors.fullName}</p> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#111]">Edad</span>
            <input value={form.ageRange} onChange={(event) => updateField("ageRange", event.target.value)} className={inputClass} placeholder="Ej. 20" />
          </label>
        </div>

        <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <span className="text-sm font-medium text-[#111]">Foto personal *</span>
          {!profileImageFile ? (
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleProfileImageChange(event.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm text-[#171717] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-ted-red)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#c90022]"
            />
          ) : (
            <p className="mt-2 text-sm font-medium text-emerald-700">Foto cargada. Usa el recorte de abajo para ajustarla.</p>
          )}
          {profileImagePreview && !profileImageCroppedBlob ? (
            <div className="mt-4 space-y-3 rounded-2xl border border-neutral-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Recorte cuadrado (arrastra para encuadrar)</p>

              <div
                className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
                onPointerDown={handleProfileCropPointerDown}
                onPointerMove={handleProfileCropPointerMove}
                onPointerUp={handleProfileCropPointerEnd}
                onPointerCancel={handleProfileCropPointerEnd}
                onWheel={(event) => {
                  event.preventDefault();
                  const delta = event.deltaY;
                  const step = delta > 0 ? -0.08 : 0.08;
                  setProfileImageZoom((prev) => Math.max(1, Math.min(3, Number((prev + step).toFixed(2)))));
                }}
              >
                <img
                  src={profileImagePreview}
                  alt="Vista previa de recorte"
                  className="absolute inset-0 h-full w-full select-none object-cover"
                  draggable={false}
                  style={{
                    objectPosition: `${profileImageOffsetX}% ${profileImageOffsetY}%`,
                    transform: `scale(${profileImageZoom})`,
                    transformOrigin: `${profileImageOffsetX}% ${profileImageOffsetY}%`,
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProfileImageZoom((prev) => Math.max(1, Number((prev - 0.1).toFixed(2))))}
                    className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm font-semibold text-[#171717] transition hover:border-neutral-400"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileImageZoom((prev) => Math.min(3, Number((prev + 0.1).toFixed(2))))}
                    className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm font-semibold text-[#171717] transition hover:border-neutral-400"
                  >
                    +
                  </button>
                  <span className="text-xs text-neutral-500">Usa +/− o arrastra para encuadrar</span>
                </div>

                <button
                  type="button"
                  onClick={confirmProfileCrop}
                  disabled={isCropping}
                  className="rounded-full bg-[var(--color-ted-red)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#c90022] disabled:opacity-50"
                >
                  {isCropping ? "Procesando..." : "Confirmar recorte"}
                </button>
              </div>

            </div>
          ) : null}
          {profileImageCroppedPreview ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Recorte confirmado</p>
              <img src={profileImageCroppedPreview} alt="Recorte final confirmado" className="mt-2 h-28 w-28 rounded-xl object-cover" />
            </div>
          ) : null}
          {imageError ? <p className="mt-2 text-sm text-red-600">{imageError}</p> : null}
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-[#111]">Correo electronico *</span>
            <input value={form.email} onChange={(event) => updateField("email", event.target.value)} type="email" className={inputClass} placeholder="tu@email.com" />
            {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email}</p> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#111]">Numero de WhatsApp *</span>
            <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className={inputClass} placeholder="+505 7123 4567" />
            {errors.phone ? <p className="mt-1 text-sm text-red-600">{errors.phone}</p> : null}
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-[#111]">Ciudad</span>
            <input value={form.city} onChange={(event) => updateField("city", event.target.value)} className={inputClass} placeholder="Managua" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#111]">Ocupacion</span>
            <input value={form.occupation} onChange={(event) => updateField("occupation", event.target.value)} className={inputClass} placeholder="Estudiante, profesional..." />
          </label>
        </div>

        <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <span className="text-sm font-medium text-[#111]">Disponibilidad *</span>
          <textarea
            value={form.availabilityText}
            onChange={(event) => updateField("availabilityText", event.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Ej. Lunes a viernes despues de las 5pm, sabados por la mañana; disponible para reuniones de coordinacion previas al evento."
          />
          {errors.availabilityText ? <p className="mt-1 text-sm text-red-600">{errors.availabilityText}</p> : null}
        </label>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <span className="text-sm font-medium text-[#111]">Areas en las que te gustaria apoyar *</span>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {areaOptions.map((option) => (
              <label key={option} className="inline-flex items-center gap-2 text-sm text-[#171717]">
                <input
                  type="checkbox"
                  checked={form.areas.includes(option)}
                  onChange={() => toggleArrayItem("areas", option)}
                  className="rounded border-neutral-300"
                />
                {option}
              </label>
            ))}
          </div>
          {errors.areas ? <p className="mt-1 text-sm text-red-600">{errors.areas}</p> : null}
        </div>

        <label className="block rounded-2xl border border-neutral-200 bg-white p-4">
          <span className="text-sm font-medium text-[#111]">Cuéntanos más detalles sobre las áreas seleccionadas</span>
          <textarea
            value={form.areaDetailsText}
            onChange={(event) => updateField("areaDetailsText", event.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Cuéntanos cómo podrías aportar en las áreas que marcaste, tu experiencia o cualquier contexto útil."
          />
        </label>

        <fieldset className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <legend className="text-sm font-medium text-[#111]">Habilidades y fortalezas (opcional)</legend>
          <p className="mt-1 text-sm text-neutral-600">Selecciona una o varias etiquetas que describan mejor tus fortalezas.</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {primarySkillOptions.map((skill) => {
              const selected = form.skills.includes(skill);

              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  aria-pressed={selected}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[rgba(235,0,40,0.12)] ${
                    selected
                      ? "border-[var(--color-ted-red)] bg-[var(--color-ted-red)] text-white"
                      : "border-neutral-300 bg-white text-[#171717] hover:border-neutral-400 hover:bg-neutral-100"
                  }`}
                >
                  {skill}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowMoreSkills((current) => !current)}
              aria-expanded={showMoreSkills}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[rgba(235,0,40,0.12)] ${
                showMoreSkills
                  ? "border-[var(--color-ted-red)] bg-[var(--color-ted-red)] text-white"
                  : "border-dashed border-neutral-300 bg-white text-[#171717] hover:border-neutral-400 hover:bg-neutral-100"
              }`}
            >
              {showMoreSkills ? "Ocultar" : "Otro"}
            </button>
          </div>

          {showMoreSkills ? (
            <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-white p-4">
              <p className="text-sm font-medium text-[#111]">Más opciones</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {secondarySkillOptions.map((skill) => {
                  const selected = form.skills.includes(skill);

                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      aria-pressed={selected}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[rgba(235,0,40,0.12)] ${
                        selected
                          ? "border-[var(--color-ted-red)] bg-[var(--color-ted-red)] text-white"
                          : "border-neutral-300 bg-white text-[#171717] hover:border-neutral-400 hover:bg-neutral-100"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCustomSkillOpen((current) => !current)}
                  aria-expanded={customSkillOpen}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[rgba(235,0,40,0.12)] ${
                    customSkillOpen
                      ? "border-[var(--color-ted-red)] bg-[var(--color-ted-red)] text-white"
                      : "border-dashed border-neutral-300 bg-white text-[#171717] hover:border-neutral-400 hover:bg-neutral-100"
                  }`}
                >
                  Nuevo
                </button>
              </div>

              {customSkillOpen ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    value={customSkillText}
                    onChange={(event) => setCustomSkillText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addCustomSkill();
                      }
                    }}
                    className={inputClass}
                    placeholder="Escribe una habilidad nueva"
                  />

                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="rounded-full bg-[var(--color-ted-red)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c90022]"
                  >
                    Agregar
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {form.skills.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {form.skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-ted-red)] bg-[rgba(235,0,40,0.08)] px-4 py-2 text-sm font-semibold text-[var(--color-ted-red)] transition hover:bg-[rgba(235,0,40,0.14)]"
                >
                  <span>{skill}</span>
                  <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          ) : null}
        </fieldset>

        <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <span className="text-sm font-medium text-[#111]">Equipo o recursos que puedes aportar (opcional)</span>
          <textarea
            value={form.resources}
            onChange={(event) => updateField("resources", event.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Ej. Camara, laptop, experiencia usando Canva, transporte propio, etc."
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[#111]">Experiencia previa en eventos o voluntariados</span>
          <textarea
            value={form.experience}
            onChange={(event) => updateField("experience", event.target.value)}
            rows={4}
            className={inputClass}
            placeholder="Cuéntanos si has participado en actividades similares"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[#111]">Por que quieres ser voluntario TEDx? *</span>
          <textarea
            value={form.motivation}
            onChange={(event) => updateField("motivation", event.target.value)}
            rows={4}
            className={inputClass}
            placeholder="Tu motivacion para sumarte"
          />
          {errors.motivation ? <p className="mt-1 text-sm text-red-600">{errors.motivation}</p> : null}
        </label>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-[#111]">Redes o links (opcional)</span>
            <button
              type="button"
              onClick={addSocialLink}
              className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm font-semibold text-[#171717] transition hover:border-neutral-400"
            >
              Agregar nuevo +
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {form.socialLinks.length === 0 ? (
              <p className="text-sm text-neutral-500">Agrega tus redes para conocerte mejor (LinkedIn, Instagram, TikTok, etc.).</p>
            ) : null}

            {form.socialLinks.map((item, index) => (
              <div key={`${item.platform}-${index}`} className="grid gap-3 sm:grid-cols-[190px_1fr_auto]">
                <select
                  value={item.platform}
                  onChange={(event) => updateSocialLink(index, "platform", event.target.value)}
                  className={inputClass}
                >
                  {socialPlatforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>

                <input
                  value={item.url}
                  onChange={(event) => updateSocialLink(index, "url", event.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />

                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="self-center rounded-full border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-[#171717] transition hover:border-neutral-400"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>

          {errors.socialLinks ? <p className="mt-2 text-sm text-red-600">{errors.socialLinks}</p> : null}
        </div>

        <label className="inline-flex items-start gap-2">
          <input type="checkbox" checked={form.agree} onChange={(event) => updateField("agree", event.target.checked)} className="mt-1" />
          <span className="text-sm text-justify text-[#171717]">
            Acepto que TEDx Avenida Bolivar trate mis datos para fines del proceso de seleccion de voluntariado. *
          </span>
        </label>
        {errors.agree ? <p className="mt-1 text-sm text-red-600">{errors.agree}</p> : null}

        <div className="flex justify-end border-t border-neutral-200 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-[var(--color-ted-red)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c90022] disabled:opacity-60"
          >
            {submitting ? "Enviando..." : "Enviar postulacion"}
          </button>
        </div>
      </form>

      {sent ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 px-4" role="dialog" aria-modal="true" aria-labelledby="voluntariado-success-title">
          <div className="w-full max-w-lg rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-2xl sm:p-8">
            <p id="voluntariado-success-title" className="text-2xl font-black text-emerald-800">Postulación enviada con éxito</p>
            <p className="mt-3 text-sm leading-6 text-emerald-700">
              Gracias por postularte como voluntario. Recibimos tu información correctamente y el equipo TEDx Avenida Bolivar revisará tu solicitud.
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Si avanzas a la siguiente fase, te contactaremos por correo con los próximos pasos.
            </p>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setSent(false)}
                className="rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
