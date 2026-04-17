import * as ftp from "basic-ftp";
import path from "path";
import { fileURLToPath } from "url";

// Configurar __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  // Credenciales desde variables de entorno
  const host = process.env.FTP_HOST;
  const user = process.env.FTP_USER;
  const password = process.env.FTP_PASSWORD;
  const secure = process.env.FTP_SECURE === "true"; // Cambiar a true si el servidor usa FTPS
  const remoteDir = process.env.FTP_REMOTE_DIR || "/public_html/";

  if (!host || !user || !password) {
    console.error("Error: Faltan credenciales FTP (FTP_HOST, FTP_USER, FTP_PASSWORD).");
    process.exit(1);
  }

  try {
    console.log(`Conectando a ${host}...`);
    await client.access({
      host,
      user,
      password,
      secure,
    });

    console.log("Conexion establecida. Subiendo archivos de la carpeta 'out'...");
    const localOutPath = path.resolve(__dirname, "../out");
    
    // Sincronizar la carpeta local 'out' con la remota
    await client.ensureDir(remoteDir);
    await client.uploadFromDir(localOutPath, remoteDir);

    console.log("¡Despliegue completado con exito!");
  } catch (err) {
    console.error("Error durante el despliegue:", err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
