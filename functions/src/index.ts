import { onRequest } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
export {
  generateCertificates,
  mergeCertificatesPdf,
  processVolunteerAttendanceCredits,
} from "./legacyRestore.js";

initializeApp();

const resendApiKey = defineString("RESEND_API_KEY");
const resendFromEmail = defineString("RESEND_FROM_EMAIL");
const mailchimpApiKey = defineString("MAILCHIMP_API_KEY");
const mailchimpAudienceId = defineString("MAILCHIMP_AUDIENCE_ID");
const mailchimpServerPrefix = defineString("MAILCHIMP_SERVER_PREFIX");

type ConfirmationSource = "voluntariado" | "patrocinios" | "speakers";

type ConfirmationBody = {
  recipientEmail?: string;
  recipientName?: string;
  source?: ConfirmationSource;
  notificationType?: "initial" | "status";
  applicationStatus?: string;
  trackingUrl?: string;
};

type NewsletterBody = {
  email?: string;
};

type NewsletterUpdateBody = {
  subject?: string;
  headline?: string;
  messageText?: string;
};

type ResendAttachment = {
  filename: string;
  content: string;
  content_id?: string;
  disposition?: "inline" | "attachment";
};

const tedxLogoCid = "tedx-logo@tedxavenidabolivar";
const tedxLogoPath = path.resolve(process.cwd(), "assets", "logo-white.png");
const tedxLogoPublicUrl = "https://raw.githubusercontent.com/Jose21NC/TEDx/main/app/media/logo-white.png";
let tedxLogoBase64Cache: string | null = null;

function getTedxLogoBase64() {
  if (!tedxLogoBase64Cache) {
    tedxLogoBase64Cache = fs.readFileSync(tedxLogoPath).toString("base64");
  }

  return tedxLogoBase64Cache;
}

function formatDisplayName(rawName: string) {
  const clean = rawName
    .trim()
    .replace(/\s+/g, " ");
  if (!clean) return "Hola";
  const parts = clean.split(" ").filter(Boolean);
  if (parts.length <= 2) return parts.join(" ");
  return `${parts[0]} ${parts[1]}`;
}

function getTedxLogoInlineAttachment(): ResendAttachment[] {
  return [
    {
      filename: "logo-white.png",
      content: getTedxLogoBase64(),
      content_id: tedxLogoCid,
      disposition: "inline",
    },
  ];
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEmailShell(content: {
  title: string;
  subtitle: string;
  paragraphs: string[];
  badge: string;
  ctaLabel?: string;
  ctaUrl?: string;
  logoSrc?: string;
}) {
  const paragraphsHtml = content.paragraphs
    .map((paragraph) => `<p style=\"margin: 0 0 12px; color: #2c2c2c; font-size: 16px; line-height: 1.6;\">${escapeHtml(paragraph)}</p>`)
    .join("");
  const ctaHtml = content.ctaLabel && content.ctaUrl
    ? `<div style="margin-top:20px;"><a href="${escapeHtml(content.ctaUrl)}" target="_blank" rel="noreferrer" style="display:inline-block;background:#eb0028;color:#ffffff;text-decoration:none;border-radius:999px;padding:12px 20px;font-size:13px;font-weight:700;letter-spacing:0.02em;">${escapeHtml(content.ctaLabel)}</a></div>`
    : "";

  return `
    <div style="margin:0;padding:28px;background:#f3f3f3;font-family:'Inter',Arial,sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e9e9e9;">
        <tr>
          <td style="padding:20px 24px;background:#111111;">
            <img src="${escapeHtml(content.logoSrc || `cid:${tedxLogoCid}`)}" alt="TEDx Avenida Bolivar" style="display:block;max-width:230px;width:100%;height:auto;" />
          </td>
        </tr>
        <tr>
          <td style="padding:24px 24px 20px;">
            <p style="margin:0 0 14px;display:inline-block;background:#f9e9ec;color:#b3122f;border:1px solid #f3c7d0;border-radius:999px;padding:6px 12px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(content.badge)}</p>
            <h1 style="margin:0 0 10px;color:#d01438;font-size:30px;line-height:1.12;font-weight:800;">${escapeHtml(content.title)}</h1>
            <p style="margin:0 0 18px;color:#5f5f5f;font-size:14px;line-height:1.5;">${escapeHtml(content.subtitle)}</p>
            ${paragraphsHtml}
            ${ctaHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;background:#ffffff;">
            <div style="height:4px;border-radius:999px;background:linear-gradient(90deg,#eb0028 0%,#111111 100%);"></div>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 24px 24px;background:#fafafa;border-top:1px solid #efefef;">
            <p style="margin:0 0 6px;color:#3b3b3b;font-size:13px;font-weight:700;line-height:1.5;">Equipo TEDx Avenida Bolivar</p>
            <p style="margin:0;color:#6d6d6d;font-size:12px;line-height:1.5;">Managua, Nicaragua</p>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function getStatusChangeCopy(source: ConfirmationSource, recipientName: string, applicationStatus: string, trackingUrl: string) {
  const statusText = applicationStatus.trim() || "Actualizado";
  const roleLabel = source === "speakers"
    ? "speaker"
    : source === "voluntariado"
      ? "voluntariado"
      : "patrocinio";

  const paragraphs = [
    `Tu estado de postulación para ${roleLabel} cambió a: ${statusText}.`,
    "Puedes revisar el estado actualizado y su seguimiento desde el enlace de abajo.",
    "Si tienes dudas, responde este correo y con gusto te apoyamos.",
  ];

  return {
    subject: `Actualización de estado TEDx Avenida Bolívar: ${statusText}`,
    html: buildEmailShell({
      title: `Hola, ${recipientName}`,
      subtitle: "Tu postulación tuvo una actualización",
      badge: "Cambio de estado",
      paragraphs,
      ctaLabel: "Ver estado de mi postulación",
      ctaUrl: trackingUrl,
    }),
    text: [
      `Hola, ${recipientName}`,
      "",
      ...paragraphs,
      "",
      `Ver estado: ${trackingUrl}`,
    ].join("\n"),
  };
}

function corsHeaders(origin: string | undefined) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function getConfirmationCopy(source: ConfirmationSource, recipientName: string) {
  if (source === "voluntariado") {
    const paragraphs = [
      `Recibimos tu postulación como voluntario para TEDx Avenida Bolívar.`,
      "Tu información ya quedó registrada y en breve revisaremos tu perfil para continuar con el proceso.",
      "Si necesitamos un dato adicional, te escribiremos al mismo correo con el que enviaste tu formulario.",
    ];
    return {
      subject: "Recibimos tu postulación como voluntario TEDx Avenida Bolívar",
      html: buildEmailShell({
        title: `Gracias, ${recipientName}`,
        subtitle: "Confirmación de postulación de voluntariado",
        badge: "Postulación recibida",
        paragraphs,
      }),
      text: [
        `Gracias, ${recipientName}`,
        "",
        ...paragraphs,
      ].join("\n"),
    };
  }

  if (source === "speakers") {
    const paragraphs = [
      "Recibimos tu postulación para formar parte de TEDx Avenida Bolívar como speaker.",
      "Tu propuesta ya está registrada y nuestro equipo curatorial revisará tu idea junto con el material enviado.",
      "Si avanzas a la siguiente etapa, te contactaremos por este mismo correo con los próximos pasos.",
    ];

    return {
      subject: "Recibimos tu postulación de speaker TEDx Avenida Bolívar",
      html: buildEmailShell({
        title: `Gracias, ${recipientName}`,
        subtitle: "Confirmación de postulación de speaker",
        badge: "Convocatoria de speakers",
        paragraphs,
      }),
      text: [
        `Gracias, ${recipientName}`,
        "",
        ...paragraphs,
      ].join("\n"),
    };
  }

  const paragraphs = [
    "Recibimos tu solicitud de patrocinio para TEDx Avenida Bolívar.",
    "Tu información ya quedó registrada y nuestro equipo revisará tu propuesta para darte seguimiento.",
    "Si necesitamos coordinar detalles adicionales, te contactaremos al correo que compartiste.",
  ];

  return {
    subject: "Recibimos tu solicitud de patrocinio TEDx Avenida Bolívar",
    html: buildEmailShell({
      title: `Gracias, ${recipientName}`,
      subtitle: "Confirmación de solicitud de patrocinio",
      badge: "Solicitud recibida",
      paragraphs,
    }),
    text: [
      `Gracias, ${recipientName}`,
      "",
      ...paragraphs,
    ].join("\n"),
  };
}

async function resendEmail(
  recipientEmail: string,
  subject: string,
  html: string,
  text: string,
  attachments?: ResendAttachment[],
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey.value()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail.value(),
      to: [recipientEmail],
      subject,
      html,
      text,
      attachments,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "No se pudo enviar el correo de confirmación.");
  }
}

export const confirmacion = onRequest({ cors: true, invoker: "public" }, async (request, response) => {
  if (request.method === "OPTIONS") {
    response.status(204).set(corsHeaders(request.headers.origin)).send("");
    return;
  }

  if (request.method !== "POST") {
    response.status(405).set(corsHeaders(request.headers.origin)).json({ error: "Método no permitido." });
    return;
  }

  const body = request.body as ConfirmationBody | undefined;
  const recipientEmail = body?.recipientEmail?.trim() ?? "";
  const recipientName = formatDisplayName(body?.recipientName?.trim() || "");
  const source = body?.source;
  const notificationType = body?.notificationType ?? "initial";
  const applicationStatus = body?.applicationStatus?.trim() ?? "";
  const trackingUrl = body?.trackingUrl?.trim() ?? "";

  if (!recipientEmail || !source) {
    response.status(400).set(corsHeaders(request.headers.origin)).json({ error: "Faltan datos para enviar la confirmación." });
    return;
  }

  if (notificationType === "status" && (!applicationStatus || !trackingUrl)) {
    response.status(400).set(corsHeaders(request.headers.origin)).json({ error: "Faltan datos para notificar cambio de estado." });
    return;
  }

  try {
    const { subject, html, text } = notificationType === "status"
      ? getStatusChangeCopy(source, recipientName, applicationStatus, trackingUrl)
      : getConfirmationCopy(source, recipientName);
    await resendEmail(recipientEmail, subject, html, text, getTedxLogoInlineAttachment());
    response.status(200).set(corsHeaders(request.headers.origin)).json({ message: "Correo de confirmación enviado." });
  } catch (error) {
    response.status(502).set(corsHeaders(request.headers.origin)).json({
      error: error instanceof Error ? error.message : "No se pudo enviar el correo de confirmación.",
    });
  }
});

export const newsletter = onRequest({ cors: true }, async (request, response) => {
  if (request.method === "OPTIONS") {
    response.status(204).set(corsHeaders(request.headers.origin)).send("");
    return;
  }

  if (request.method !== "POST") {
    response.status(405).set(corsHeaders(request.headers.origin)).json({ error: "Método no permitido." });
    return;
  }

  const body = request.body as NewsletterBody | undefined;
  const email = body?.email?.trim().toLowerCase() ?? "";

  if (!email) {
    response.status(400).set(corsHeaders(request.headers.origin)).json({ error: "El correo es obligatorio." });
    return;
  }

  try {
    const subscriberHash = crypto.createHash("md5").update(email).digest("hex");
    const mailchimpResponse = await fetch(
      `https://${mailchimpServerPrefix.value()}.api.mailchimp.com/3.0/lists/${mailchimpAudienceId.value()}/members/${subscriberHash}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Basic ${Buffer.from(`anystring:${mailchimpApiKey.value()}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          status_if_new: "subscribed",
          status: "subscribed",
        }),
      },
    );

    if (!mailchimpResponse.ok) {
      const errorText = await mailchimpResponse.text();
      throw new Error(errorText || "No se pudo completar la suscripción al newsletter.");
    }

    response.status(200).set(corsHeaders(request.headers.origin)).json({ message: "Suscripción completada." });
  } catch (error) {
    response.status(502).set(corsHeaders(request.headers.origin)).json({
      error: error instanceof Error ? error.message : "No se pudo completar la suscripción al newsletter.",
    });
  }
});

export const newsletterActualizacion = onRequest(
  { cors: true },
  async (request, response) => {
    if (request.method === "OPTIONS") {
      response.status(204).set(corsHeaders(request.headers.origin)).send("");
      return;
    }

    if (request.method !== "POST") {
      response.status(405).set(corsHeaders(request.headers.origin)).json({ error: "Método no permitido." });
      return;
    }

    const body = request.body as NewsletterUpdateBody | undefined;
    const subject = body?.subject?.trim() ?? "";
    const headline = body?.headline?.trim() || "Actualización TEDx Avenida Bolivar";
    const messageText = body?.messageText?.trim() ?? "";

    if (!subject || !messageText) {
      response.status(400).set(corsHeaders(request.headers.origin)).json({ error: "Subject y mensaje son obligatorios." });
      return;
    }

    const paragraphs = messageText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      response.status(400).set(corsHeaders(request.headers.origin)).json({ error: "El mensaje no puede estar vacío." });
      return;
    }

    try {
      const authHeader = `Basic ${Buffer.from(`anystring:${mailchimpApiKey.value()}`).toString("base64")}`;
      const base = `https://${mailchimpServerPrefix.value()}.api.mailchimp.com/3.0`;
      const timestamp = new Date().toISOString().replace(/[.:]/g, "-");

      const createCampaignResponse = await fetch(`${base}/campaigns`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "regular",
          recipients: { list_id: mailchimpAudienceId.value() },
          settings: {
            subject_line: subject,
            title: `TEDx Update ${timestamp}`,
            from_name: "TEDx Avenida Bolivar",
            reply_to: resendFromEmail.value().match(/<([^>]+)>/)?.[1] ?? resendFromEmail.value(),
          },
        }),
      });

      if (!createCampaignResponse.ok) {
        const errorText = await createCampaignResponse.text();
        throw new Error(errorText || "No se pudo crear la campaña en Mailchimp.");
      }

      const campaign = (await createCampaignResponse.json()) as { id: string };

      const contentResponse = await fetch(`${base}/campaigns/${campaign.id}/content`, {
        method: "PUT",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: buildEmailShell({
            title: headline,
            subtitle: "Novedades para nuestra comunidad TEDx",
            badge: "Actualización newsletter",
            logoSrc: tedxLogoPublicUrl,
            paragraphs,
          }),
        }),
      });

      if (!contentResponse.ok) {
        const errorText = await contentResponse.text();
        throw new Error(errorText || "No se pudo cargar el contenido de la campaña.");
      }

      const sendResponse = await fetch(`${base}/campaigns/${campaign.id}/actions/send`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      if (!sendResponse.ok) {
        const errorText = await sendResponse.text();
        throw new Error(errorText || "No se pudo enviar la campaña.");
      }

      response.status(200).set(corsHeaders(request.headers.origin)).json({
        message: "Campaña enviada a los contactos del newsletter.",
        campaignId: campaign.id,
      });
    } catch (error) {
      response.status(502).set(corsHeaders(request.headers.origin)).json({
        error: error instanceof Error ? error.message : "No se pudo enviar la actualización de newsletter.",
      });
    }
  },
);