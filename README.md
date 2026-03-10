# TEDx Avenida Bolivar - Web

Sitio en Next.js con formulario de convocatoria conectado a Firebase Firestore.

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

## API de postulaciones

- `POST /api/postulaciones`: guarda una postulación en Firestore (colección `postulaciones`).
- `GET /api/postulaciones`: lista postulaciones.

## Despliegue en hosting

En tu proveedor (Vercel, Railway, Render, etc.) agrega las mismas variables de entorno de Firebase.
Sin esas variables, la API no podrá guardar ni leer postulaciones.
