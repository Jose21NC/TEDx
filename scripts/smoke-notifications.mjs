import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const envPath = path.join(root, '.env.local');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, 'utf8');
  const result = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function getEnv(name, fallback = '') {
  return process.env[name] ?? fallback;
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let body = text;
  try {
    body = JSON.parse(text);
  } catch {
    // Keep raw text when response is not JSON.
  }

  return {
    ok: response.ok,
    status: response.status,
    body,
  };
}

async function run() {
  const fileEnv = parseEnvFile(envPath);
  const mergedEnv = { ...fileEnv, ...process.env };

  const baseUrl = (mergedEnv.NEXT_PUBLIC_NOTIFICATION_API_BASE_URL || '').replace(/\/+$/, '');
  if (!baseUrl) {
    console.error('Falta NEXT_PUBLIC_NOTIFICATION_API_BASE_URL en .env.local o variables de entorno.');
    process.exit(1);
  }

  const now = Date.now();
  const testEmail = getEnv('TEST_EMAIL', getEnv('TEST_MAIL', `tedx.qa.${now}@gmail.com`));
  const testName = getEnv('TEST_NAME', 'QA Local');

  const tests = [
    {
      label: 'confirmacion_invalida',
      url: `${baseUrl}/confirmacion`,
      payload: {},
      expectedStatus: 400,
    },
    {
      label: 'newsletter_invalida',
      url: `${baseUrl}/newsletter`,
      payload: {},
      expectedStatus: 400,
    },
    {
      label: 'confirmacion_valida',
      url: `${baseUrl}/confirmacion`,
      payload: {
        recipientEmail: testEmail,
        recipientName: testName,
        source: 'voluntariado',
      },
      expectedStatus: 200,
    },
    {
      label: 'newsletter_valida',
      url: `${baseUrl}/newsletter`,
      payload: {
        email: testEmail,
      },
      expectedStatus: 200,
    },
  ];

  console.log(`Base URL: ${baseUrl}`);
  console.log(`Email de prueba: ${testEmail}`);

  let failures = 0;

  for (const t of tests) {
    try {
      const result = await postJson(t.url, t.payload);
      const statusOk = result.status === t.expectedStatus;
      if (!statusOk) failures += 1;

      console.log('');
      console.log(`[${t.label}] status=${result.status} expected=${t.expectedStatus} ok=${statusOk}`);
      console.log(`[${t.label}] response=${typeof result.body === 'string' ? result.body : JSON.stringify(result.body)}`);
    } catch (error) {
      failures += 1;
      console.log('');
      console.log(`[${t.label}] ERROR=${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log('');
  if (failures > 0) {
    console.error(`Smoke test finalizado con ${failures} fallo(s).`);
    process.exit(1);
  }

  console.log('Smoke test completado correctamente.');
}

run();
