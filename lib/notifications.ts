type ConfirmationSource = "voluntariado" | "patrocinios" | "speakers";

type ConfirmationPayload = {
  recipientEmail: string;
  recipientName: string;
  source: ConfirmationSource;
  notificationType?: "initial" | "status";
  applicationStatus?: string;
  trackingUrl?: string;
};

function getNotificationApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_NOTIFICATION_API_BASE_URL?.trim();

  if (!baseUrl) {
    throw new Error("Falta NEXT_PUBLIC_NOTIFICATION_API_BASE_URL para enviar correos y newsletter.");
  }

  return baseUrl.replace(/\/+$/, "");
}

async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(`${getNotificationApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  let parsed: unknown = null;

  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const message =
      typeof parsed === "object" && parsed !== null && "error" in parsed && typeof (parsed as { error?: unknown }).error === "string"
        ? (parsed as { error: string }).error
        : "No se pudo completar la solicitud.";
    throw new Error(message);
  }

  return (parsed ?? {}) as TResponse;
}

export async function sendConfirmationEmail(payload: ConfirmationPayload) {
  return postJson<{ message: string }>("/confirmacion", payload);
}

type StatusChangePayload = {
  recipientEmail: string;
  recipientName: string;
  source: ConfirmationSource;
  applicationStatus: string;
  trackingUrl: string;
};

export async function sendStatusChangeEmail(payload: StatusChangePayload) {
  return postJson<{ message: string }>("/confirmacion", {
    ...payload,
    notificationType: "status",
  });
}

export async function subscribeNewsletter(email: string) {
  return postJson<{ message: string }>("/newsletter", { email });
}

type NewsletterUpdatePayload = {
  subject: string;
  headline: string;
  messageText: string;
};

export async function sendNewsletterUpdate(payload: NewsletterUpdatePayload) {
  return postJson<{ message: string; campaignId: string }>("/newsletterActualizacion", payload);
}