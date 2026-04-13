"use client";

import { FormEvent, useState } from "react";
import { sendConfirmationEmail } from "../../../lib/notifications";

type SponsorshipType = "efectivo" | "especie" | "personalizado";

type FormState = {
  companyName: string;
  companySector: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  website: string;
  sponsorshipType: SponsorshipType;
  cashAmount: string;
  inKindDescription: string;
  customProposal: string;
  budgetRange: string;
  eventInterest: string;
  notes: string;
};

const initialState: FormState = {
  companyName: "",
  companySector: "",
  contactName: "",
  contactRole: "",
  email: "",
  phone: "",
  website: "",
  sponsorshipType: "efectivo",
  cashAmount: "",
  inKindDescription: "",
  customProposal: "",
  budgetRange: "",
  eventInterest: "",
  notes: "",
};

const sponsorshipDescriptions: Record<SponsorshipType, string> = {
  efectivo: "Aporte monetario directo para apoyar la producción, logística y activaciones del evento.",
  especie: "Aporte de bienes o servicios que reemplazan parte del gasto del evento, como alimentos, impresión, transporte o producción.",
  personalizado: "Propuesta mixta o diferente a las opciones anteriores, adaptada a las capacidades y objetivos de tu empresa.",
};

const inputClass =
  "mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[#171717] outline-none transition placeholder:text-neutral-400 focus:border-[var(--color-ted-red)] focus:ring-4 focus:ring-[rgba(235,0,40,0.12)]";

const textareaClass =
  "mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[#171717] outline-none transition placeholder:text-neutral-400 focus:border-[var(--color-ted-red)] focus:ring-4 focus:ring-[rgba(235,0,40,0.12)]";

const selectClass =
  "mt-1 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[#171717] outline-none transition focus:border-[var(--color-ted-red)] focus:ring-4 focus:ring-[rgba(235,0,40,0.12)]";

export default function SponsorInquiryForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate() {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.companyName.trim()) nextErrors.companyName = "La empresa u organización es obligatoria.";
    if (!form.contactName.trim()) nextErrors.contactName = "El nombre del encargado es obligatorio.";
    if (!form.email.trim()) nextErrors.email = "El correo de contacto es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Ingresa un correo válido.";
    if (!form.phone.trim()) nextErrors.phone = "El teléfono o WhatsApp es obligatorio.";
    if (form.sponsorshipType === "efectivo" && !form.cashAmount.trim()) {
      nextErrors.cashAmount = "Indica un monto aproximado o un rango.";
    }

    if (form.sponsorshipType === "especie" && !form.inKindDescription.trim()) {
      nextErrors.inKindDescription = "Describe los bienes o servicios que deseas aportar.";
    }

    if (form.sponsorshipType === "personalizado" && !form.customProposal.trim()) {
      nextErrors.customProposal = "Explica brevemente tu propuesta personalizada.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const firebaseModule = await import("../../../lib/firebaseClient");
      const firestore = await import("firebase/firestore");
      const db = firebaseModule.getClientDb();
      const collectionRef = firestore.collection(db, "sponsorsTedx");

      await firestore.addDoc(collectionRef, {
        id: crypto.randomUUID(),
        createdAt: firestore.serverTimestamp(),
        companyName: form.companyName.trim(),
        companySector: form.companySector.trim(),
        contactName: form.contactName.trim(),
        contactRole: form.contactRole.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        website: form.website.trim(),
        sponsorshipType: form.sponsorshipType,
        cashAmount: form.cashAmount.trim(),
        inKindDescription: form.inKindDescription.trim(),
        customProposal: form.customProposal.trim(),
        budgetRange: form.budgetRange.trim(),
        eventInterest: form.eventInterest.trim(),
        notes: form.notes.trim(),
        status: "Pendiente",
        source: "patrocinios/solicitud",
      });

      try {
        await sendConfirmationEmail({
          recipientEmail: form.email.trim(),
          recipientName: form.contactName.trim(),
          source: "patrocinios",
        });
      } catch (error) {
        console.error("Error sending sponsor confirmation email:", error);
      }

      setForm(initialState);
      setSent(true);
    } catch (error) {
      console.error("Error saving sponsor request:", error);
    } finally {
      setSubmitting(false);
    }
  }

  function closeSuccess() {
    setSent(false);
  }

  function startAnotherRequest() {
    setSent(false);
    setForm(initialState);
    setErrors({});
  }

  function contactByEmail() {
    const subject = encodeURIComponent("Información adicional - patrocinio TEDx");
    const body = encodeURIComponent(
      [
        "Hola equipo TEDx Avenida Bolívar,",
        "",
        "Me gustaría solicitar información adicional sobre patrocinio.",
        "",
        "Empresa u organización:",
        "",
      ].join("\n")
    );

    window.location.href = `mailto:contacto@tedxavenidabolivar.com?subject=${subject}&body=${body}`;
  }

  return (
    <div className="space-y-6">
      {sent ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-white text-[#171717] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <div className="absolute left-0 top-0 h-1.5 w-full bg-[var(--color-ted-red)]" />
            <div className="relative overflow-hidden p-6 sm:p-8">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[rgba(235,0,40,0.08)] blur-3xl" />
              <div className="absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-black/5 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="max-w-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ted-red)]">Registro enviado</p>
                  <h3 className="mt-2 text-3xl font-semibold tracking-tight text-[#111] sm:text-4xl">Gracias por compartir tu interés</h3>
                  <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">
                    Tu solicitud fue guardada correctamente en nuestro sistema. En breve nos pondremos en contacto contigo para darte seguimiento y compartirte el dossier de publicidad.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeSuccess}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-950"
                >
                  Cerrar
                </button>
              </div>

              <div className="relative mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-700 shadow-sm">
                  <p className="font-semibold text-[#111]">Confirmación de recepción</p>
                  <p className="mt-2 leading-6">
                    Ya tenemos tus datos y pronto un miembro del equipo se comunicará contigo para continuar el proceso.
                  </p>
                </div>

                <div className="rounded-2xl border border-[rgba(235,0,40,0.12)] bg-[rgba(235,0,40,0.06)] p-5 text-sm text-neutral-700 shadow-sm">
                  <p className="font-semibold text-[#111]">¿Necesitas información adicional?</p>
                  <p className="mt-2 leading-6">
                    Si deseas resolver dudas antes del contacto, puedes escribirnos directamente y con gusto te apoyamos.
                  </p>
                </div>
              </div>

              <div className="relative mt-6 rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600 shadow-sm">
                <p className="font-semibold text-[#111]">Siguiente paso</p>
                <p className="mt-2 leading-6">
                  Revisaremos tu información y te compartiremos más detalles sobre patrocinio, beneficios y el dossier correspondiente.
                </p>
                <p className="mt-2 leading-6">
                  Si deseas registrar otra propuesta, puedes iniciar una nueva solicitud cuando quieras.
                </p>
              </div>

              <div className="relative mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={contactByEmail}
                  className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                >
                  Enviar correo electrónico
                </button>
                <button
                  type="button"
                  onClick={startAnotherRequest}
                  className="rounded-full bg-[var(--color-ted-red)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c90022]"
                >
                  Enviar otra solicitud
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-[#111]">Empresa u organización *</span>
            <input
              value={form.companyName}
              onChange={(event) => updateField("companyName", event.target.value)}
              className={inputClass}
              placeholder="Nombre de la empresa"
            />
            {errors.companyName ? <p className="mt-1 text-sm text-red-600">{errors.companyName}</p> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#111]">Giro o sector</span>
            <input
              value={form.companySector}
              onChange={(event) => updateField("companySector", event.target.value)}
              className={inputClass}
              placeholder="Tecnología, alimentos, educación..."
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-[#111]">Encargado que llena el formulario *</span>
            <input
              value={form.contactName}
              onChange={(event) => updateField("contactName", event.target.value)}
              className={inputClass}
              placeholder="Nombre y apellidos"
            />
            {errors.contactName ? <p className="mt-1 text-sm text-red-600">{errors.contactName}</p> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#111]">Cargo o puesto</span>
            <input
              value={form.contactRole}
              onChange={(event) => updateField("contactRole", event.target.value)}
              className={inputClass}
              placeholder="Marketing, dirección, RRPP..."
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-[#111]">Correo electrónico *</span>
            <input
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              type="email"
              className={inputClass}
              placeholder="contacto@empresa.com"
            />
            {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email}</p> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#111]">Teléfono o WhatsApp *</span>
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className={inputClass}
              placeholder="+505 1234-5678"
            />
            {errors.phone ? <p className="mt-1 text-sm text-red-600">{errors.phone}</p> : null}
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-[#111]">Sitio web o red principal</span>
            <input
              value={form.website}
              onChange={(event) => updateField("website", event.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#111]">Rango de </span>
            <input
              value={form.budgetRange}
              onChange={(event) => updateField("budgetRange", event.target.value)}
              className={inputClass}
              placeholder="Ej. $250 - $500"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-[#111]">Forma de patrocinio *</span>
          <select
            value={form.sponsorshipType}
            onChange={(event) => updateField("sponsorshipType", event.target.value as SponsorshipType)}
            className={selectClass}
          >
            <option value="efectivo">Efectivo</option>
            <option value="especie">En especie</option>
            <option value="personalizado">Personalizado</option>
          </select>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{sponsorshipDescriptions[form.sponsorshipType]}</p>
        </label>

        {form.sponsorshipType === "efectivo" ? (
          <label className="block">
            <span className="text-sm font-medium text-[#111]">Monto aproximado o rango *</span>
            <input
              value={form.cashAmount}
              onChange={(event) => updateField("cashAmount", event.target.value)}
              className={inputClass}
              placeholder="Ej. $500 o un rango"
            />
            {errors.cashAmount ? <p className="mt-1 text-sm text-red-600">{errors.cashAmount}</p> : null}
          </label>
        ) : null}

        {form.sponsorshipType === "especie" ? (
          <label className="block">
            <span className="text-sm font-medium text-[#111]">¿Qué bienes o servicios quieres aportar? *</span>
            <textarea
              value={form.inKindDescription}
              onChange={(event) => updateField("inKindDescription", event.target.value)}
              rows={4}
              className={textareaClass}
              placeholder="Por ejemplo: impresión de material, alimentos, transporte, audio, hospedaje..."
            />
            {errors.inKindDescription ? <p className="mt-1 text-sm text-red-600">{errors.inKindDescription}</p> : null}
          </label>
        ) : null}

        {form.sponsorshipType === "personalizado" ? (
          <label className="block">
            <span className="text-sm font-medium text-[#111]">Describe tu propuesta personalizada *</span>
            <textarea
              value={form.customProposal}
              onChange={(event) => updateField("customProposal", event.target.value)}
              rows={4}
              className={textareaClass}
              placeholder="Cuéntanos cómo imaginas colaborar con el evento."
            />
            {errors.customProposal ? <p className="mt-1 text-sm text-red-600">{errors.customProposal}</p> : null}
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-[#111]">Hay algo en particular que a su empresa le gustaría apoyar?</span>
          <textarea
            value={form.eventInterest}
            onChange={(event) => updateField("eventInterest", event.target.value)}
            rows={4}
            className={textareaClass}
            placeholder="Ej. logística, experiencia del público, producción audiovisual, zona de networking..."
          />
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            No es obligatorio. Si lo dejas en blanco, de todas formas nos estaremos contactando en breve para compartirte más información y el dossier de publicidad.
          </p>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[#111]">Notas adicionales</span>
          <textarea
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            rows={3}
            className={textareaClass}
            placeholder="Tiempo ideal para contacto, referencias, dudas o comentarios..."
          />
        </label>

        <div className="flex flex-col gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-500">La información se enviará por correo al equipo de TEDx Avenida Bolívar.</p>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-[var(--color-ted-red)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c90022]"
          >
            {submitting ? "Enviando..." : "Enviar solicitud"}
          </button>
        </div>
      </form>
    </div>
  );
}