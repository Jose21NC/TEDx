# TEDx Avenida Bolivar - Web

Sitio en Next.js con formularios conectados a Firebase Firestore y correo transaccional para confirmaciones y newsletter.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Configuración Firebase (producción y local)

1. Crea un proyecto en Firebase.
2. Activa Firestore Database.
3. En Firebase Console -> Project settings -> Service accounts -> Generate new private key.
4. Copia `.env.example` a `.env.local` y llena:

```bash
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Nota: `FIREBASE_PRIVATE_KEY` debe conservar los `\n` escapados.

## Despliegue en hosting

En Hostinger solo sube el contenido exportado de `out/`.
Los formularios de voluntariado y patrocinio siguen guardando en Firestore desde el navegador con el SDK cliente.
Sin las variables de Firebase, esos guardados no funcionarán.

## Correo y newsletter

Agrega también estas variables en `.env.local` para activar los correos automáticos:

```bash
RESEND_API_KEY=tu_clave_de_resend
RESEND_FROM_EMAIL=TEDx Avenida Bolivar <noreply@tu-dominio.com>
MAILCHIMP_API_KEY=tu_clave_de_mailchimp
MAILCHIMP_AUDIENCE_ID=tu_audience_id
MAILCHIMP_SERVER_PREFIX=usXX
NEXT_PUBLIC_NOTIFICATION_API_BASE_URL=https://us-central1-tu-proyecto.cloudfunctions.net
```

Las funciones disponibles son:

- `POST /confirmacion`: envía un correo automático de confirmación al usuario.
- `POST /newsletter`: suscribe el correo al newsletter de Mailchimp.

## Despliegue

El frontend está preparado para llamar a Firebase Functions directamente, así que en Hostinger solo necesitas servir los archivos estáticos.

## Firebase Functions

La carpeta `functions/` contiene el backend serverless para Resend y Mailchimp. Debes instalar dependencias y desplegarla con Firebase CLI.

Pasos de despliegue:

1. Entra a `functions/` y ejecuta `npm install`.
2. Configura en Firebase los secretos `RESEND_API_KEY` y `MAILCHIMP_API_KEY`, y los valores `RESEND_FROM_EMAIL`, `MAILCHIMP_AUDIENCE_ID` y `MAILCHIMP_SERVER_PREFIX`.
3. Despliega con `firebase deploy --only functions`.
4. Copia la URL base de las funciones en `NEXT_PUBLIC_NOTIFICATION_API_BASE_URL` y vuelve a exportar el sitio estático.
