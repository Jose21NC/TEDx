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
  htmlContent: string;
  badge: string;
  ctaLabel?: string;
  ctaUrl?: string;
  logoSrc?: string;
  showNewsletterFooter?: boolean;
}) {
  const ctaHtml = content.ctaLabel && content.ctaUrl
    ? `<div style="margin-top:24px;"><a href="${content.ctaUrl}" target="_blank" rel="noreferrer" style="display:inline-block;background:#eb0028;color:#ffffff;text-decoration:none;border-radius:999px;padding:14px 24px;font-size:14px;font-weight:700;letter-spacing:0.02em;">${content.ctaLabel}</a></div>`
    : "";

  const footerHtml = content.showNewsletterFooter ? `
    <!-- Mailchimp Mandatory Footer -->
    <div style="border-top:1px solid #eeeeee;padding-top:24px;color:#999999;font-size:11px;line-height:1.6;text-align:center;">
      <p style="margin:0 0 8px;">Recibes este correo porque te suscribiste a nuestro newsletter o aplicaste a una convocatoria de TEDxAvenidaBolivar.</p>
      <p style="margin:0 0 16px;">
        <a href="*|UNSUB|*" style="color:#eb0028;text-decoration:underline;">Darse de baja (Unsubscribe)</a> | 
        <a href="*|UPDATE_PROFILE|*" style="color:#eb0028;text-decoration:underline;">Actualizar preferencias</a>
      </p>
      <p style="margin:0;">*|HTML:LIST_ADDRESS_HTML|*</p>
      <p style="margin:12px 0 0;">© ${new Date().getFullYear()} TEDx Avenida Bolivar. Todos los derechos reservados.</p>
    </div>
  ` : `
    <!-- Standard Footer -->
    <div style="border-top:1px solid #eeeeee;padding-top:20px;color:#999999;font-size:11px;line-height:1.5;text-align:center;">
       <p style="margin:0;">Alianza Estratégica TEDx Avenida Bolivar. Nicaragua.</p>
       <p style="margin:4px 0 0;">© ${new Date().getFullYear()} TEDx Avenida Bolivar. Todos los derechos reservados.</p>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
    <style>
        body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f4f4f4; }
        table { border-spacing: 0; border-collapse: collapse; table-layout: fixed; margin: 0 auto; width: 100% !important; max-width: 600px !important; }
        img { display: block; border: 0; height: auto; outline: none; text-decoration: none; max-width: 100% !important; }
        .content-area img { max-width: 100% !important; height: auto !important; border-radius: 8px; margin: 12px 0; }
        .main-container { padding: 40px 20px; }
        p { margin: 0; }
        a { text-decoration: none; color: #eb0028; }
        * { box-sizing: border-box; }
    </style>
</head>
<body style="background-color:#f4f4f4; margin:0; padding:0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="background-color:#f4f4f4;">
        <tr>
            <td class="main-container">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e0e0e0;">
                    <!-- Header -->
                    <tr>
                        <td style="padding:28px; background-color:#111111; text-align:center;">
                            <img src="${content.logoSrc || `cid:${tedxLogoCid}`}" alt="TEDx Avenida Bolivar" style="display:inline-block; max-width:220px; width:100%;" />
                        </td>
                    </tr>
                    <!-- Main Body -->
                    <tr>
                        <td style="padding:40px 32px 32px;">
                            <p style="margin:0 0 16px; display:inline-block; background-color:#f9e9ec; color:#b3122f; border:1px solid #f3c7d0; border-radius:20px; padding:6px 14px; font-size:10px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase;">${content.badge}</p>
                            <h1 style="margin:0 0 12px; color:#000000; font-size:30px; line-height:1.2; font-weight:800; letter-spacing:-0.02em;">${content.title}</h1>
                            <p style="margin:0 0 28px; color:#555555; font-size:16px; line-height:1.5;">${content.subtitle}</p>
                            
                            <div class="content-area" style="color:#222222; font-size:16px; line-height:1.65;">
                                ${content.htmlContent}
                            </div>

                            ${ctaHtml}
                        </td>
                    </tr>
                    <!-- Divider Accent -->
                    <tr>
                        <td style="padding:0 32px 32px;">
                            <div style="height:4px; border-radius:2px; background:linear-gradient(90deg, #eb0028 0%, #111111 100%);"></div>
                        </td>
                    </tr>
                    <!-- Sub-footer -->
                    <tr>
                        <td style="padding:0 32px 32px;">
                            <p style="margin:0 0 6px; color:#111111; font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:0.03em;">TEDx Avenida Bolivar</p>
                            <p style="margin:0 0 24px; color:#777777; font-size:12px; line-height:1.5;">Esta es una iniciativa independiente organizada bajo licencia de TED.</p>
                            
                            ${footerHtml}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
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
      htmlContent: paragraphs.map(p => `<p style="margin: 0 0 12px; line-height: 1.6;">${escapeHtml(p)}</p>`).join(""),
      ctaLabel: "Ver estado de mi postulación",
      ctaUrl: trackingUrl,
      showNewsletterFooter: false,
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
        htmlContent: paragraphs.map(p => `<p style="margin: 0 0 12px; line-height: 1.6;">${escapeHtml(p)}</p>`).join(""),
        showNewsletterFooter: false,
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
        htmlContent: paragraphs.map(p => `<p style="margin: 0 0 12px; line-height: 1.6;">${escapeHtml(p)}</p>`).join(""),
        showNewsletterFooter: false,
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
      htmlContent: paragraphs.map(p => `<p style="margin: 0 0 12px; line-height: 1.6;">${escapeHtml(p)}</p>`).join(""),
      showNewsletterFooter: false,
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
            htmlContent: messageText, // This will be raw HTML from the editor
            showNewsletterFooter: true,
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