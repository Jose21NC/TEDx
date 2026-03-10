# Despliegue en Hostinger (estático / Next.js export)

Este documento explica cómo desplegar la aplicación Next.js en Hostinger como sitio estático (opción `next export`). Se transforma la app para que funcione sin un servidor Node en el host y para que el formulario escriba directamente a Firestore desde el navegador usando el SDK cliente de Firebase.

Requisitos previos
- Cuenta en Hostinger con soporte para aplicaciones Node.js (hPanel "Node.js Apps" o acceso SSH/VPS).
- Node.js >= 18 (recomendado) y npm instalados en el servidor proporcionado por Hostinger.

Pasos resumidos para sitio estático
1. Generar los archivos estáticos localmente: `npm ci && npm run export`. Esto crea la carpeta `out/` con los archivos listos para servir.
2. Subir la carpeta `out/` a Hostinger (SFTP o el gestor de archivos). No necesitas crear una Node.js App.

3. Configurar variables públicas de Firebase en el archivo de entorno del build (opcional) o usar `NEXT_PUBLIC_*` en `.env.local` antes de exportar.

Variables públicas de Firebase para el cliente
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` (opcional)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (opcional)
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` (opcional)
- `NEXT_PUBLIC_FIREBASE_APP_ID` (opcional)

IMPORTANTE: estas variables serán embebidas en el sitio estático y por tanto son públicas. Para aceptar envíos seguros desde el cliente, debes ajustar las reglas de Firestore para permitir escrituras controladas o usar alguna otra capa de validación (reCAPTCHA, verificación por correo, etc.).


Recomendaciones de seguridad
- No subir `*.env` al repositorio público. `.gitignore` ya contiene `.env*`.
- Ajusta las reglas de Firestore para permitir escrituras sólo si cumplen criterios (por ejemplo, colecciones públicas con validaciones o workflows con moderación).

Probar localmente antes de exportar
1. Crear un archivo `.env.local` (solo local) con las variables `NEXT_PUBLIC_FIREBASE_*` adecuadas.
2. Ejecutar:

```bash
npm ci
npm run export
```

3. Subir el contenido de `out/` a Hostinger y probar el formulario en producción. Verifica en la consola de Firestore que los documentos se crean en la colección `ponentesTedx`.

Notas específicas para Hostinger (sitio estático)
- Sube `out/` al directorio público del sitio. Hostinger servirá los archivos estáticos sin necesidad de Node.
- Si prefieres no exponer las variables `NEXT_PUBLIC_*`, considera alojar una función serverless externa que reciba el formulario y escriba en Firestore con `firebase-admin`.

Si quieres, puedo:
- Preparar la variante que usa `FIREBASE_PRIVATE_KEY_B64` si finalmente eliges servidor Node.
- Añadir soporte para reCAPTCHA en el formulario y validaciones adicionales antes de escribir en Firestore.

---
Archivo relacionado: `lib/firebaseClient.ts` (usa `NEXT_PUBLIC_FIREBASE_*` y escribe a la colección `ponentesTedx`).
