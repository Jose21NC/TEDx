# Despliegue en Hostinger (Node / Next.js)

Este documento explica cómo desplegar la aplicación Next.js en Hostinger usando el entorno Node.js. Está en español y asume que usarás la Firebase Admin SDK del servidor (ya integrada en el repo).

Requisitos previos
- Cuenta en Hostinger con soporte para aplicaciones Node.js (hPanel "Node.js Apps" o acceso SSH/VPS).
- Node.js >= 18 (recomendado) y npm instalados en el servidor proporcionado por Hostinger.

Pasos resumidos
1. Subir el código al servidor (Git, SFTP o ZIP). Git es preferible para mantener versiones.
2. En el panel de Hostinger, crear una nueva "Node.js App" apuntando al directorio del proyecto.
3. En la sección de variables de entorno de la app, agregar las variables necesarias para Firebase (ver sección siguiente).
4. En la terminal del servidor (o la interfaz), ejecutar:

```bash
npm ci
npm run build
```

5. Comando de inicio: Hostinger establecerá una variable `PORT`; el proyecto está preparado para usarla. El script de inicio es:

```bash
npm start
```

Variables de entorno necesarias (servidor)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

IMPORTANTE (formato de la clave privada):
- El `FIREBASE_PRIVATE_KEY` debe guardarse con los saltos de línea escapados como `\n`. Ejemplo parcial:

```
-----BEGIN PRIVATE KEY-----\nMIIE...\n...\n-----END PRIVATE KEY-----\n
```

Hostinger suele ofrecer un campo para variables de entorno; pega la clave privada con los `\n`. El código del servidor (`lib/firebaseAdmin.ts`) contiene una sustitución que convierte `\\n` en saltos reales de línea.

Recomendaciones de seguridad
- No subir `*.env` al repositorio público. `.gitignore` ya contiene `.env*`.
- Asegúrate de que el proyecto no sirva credenciales al cliente — la inicialización de Firebase Admin solo ocurre en el servidor.

Probar localmente antes de subir
1. Crear un archivo `.env.local` (solo local) con las tres variables de entorno.
2. Ejecutar:

```bash
npm ci
npm run dev
```

3. Probar la API: `http://localhost:3000/api/postulaciones` (GET/POST) y verificar en la consola de Firestore.

Notas específicas para Hostinger
- Si usas la interfaz de Node Apps, en el campo "Start command" coloca `npm start`.
- Si Hostinger no permite `\n` en la UI, alternativa: codificar la clave en Base64 y crear una pequeña variable en el servidor que la decodifique en runtime. (Puedo añadir ese método si lo deseas).

Si quieres, puedo:
- Preparar un script que decode una variable `FIREBASE_PRIVATE_KEY_B64` en caso de usar Base64.
- Crear un `server-status` endpoint protegido o una ruta admin (con auth simple) para listar las postulaciones.

---
Archivo relacionado: `lib/firebaseAdmin.ts` (usa `process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")`).
