const fs = require("fs");
const { initializeApp, getApps } = require("firebase/app");
const { getFirestore, collection, addDoc, serverTimestamp } = require("firebase/firestore");

function readEnvValue(raw, key) {
  const match = raw.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!match) return "";
  return match[1].trim().replace(/^"|"$/g, "");
}

async function main() {
  const rawEnv = fs.readFileSync(".env.local", "utf8");
  const config = {
    apiKey: readEnvValue(rawEnv, "NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: readEnvValue(rawEnv, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: readEnvValue(rawEnv, "NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: readEnvValue(rawEnv, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readEnvValue(rawEnv, "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readEnvValue(rawEnv, "NEXT_PUBLIC_FIREBASE_APP_ID"),
  };

  const app = getApps().length > 0 ? getApps()[0] : initializeApp(config);
  const db = getFirestore(app);
  const createdAt = new Date().toISOString();

  const testRecords = [
    {
      collectionName: "ponentesTedx",
      data: {
        id: `test-speaker-${Date.now()}`,
        createdAt: serverTimestamp(),
        nombre: "Prueba Speaker",
        edad: 33,
        correo: "speaker.prueba@example.com",
        telefono: "+50500000001",
        linkedin: "https://linkedin.com/in/prueba-speaker",
        redes: "https://instagram.com/prueba-speaker",
        perfil: "Speaker invitado",
        categorias: ["Tecnologia"],
        categoriaOtra: "",
        tituloCharla: "Prueba de flujo speaker",
        idea: "Registro de prueba para validar Firestore",
        porQue: "Prueba tecnica",
        novedad: "Ninguna",
        videoLink: "",
        confirmaReglas: true,
        confirmaPrivacidad: true,
        status: "Pendiente",
        source: "manual-test",
        testMarker: true,
        testCreatedAt: createdAt,
      },
    },
    {
      collectionName: "sponsorsTedx",
      data: {
        id: `test-sponsor-${Date.now()}`,
        createdAt: serverTimestamp(),
        companyName: "Sponsor Prueba S.A.",
        companySector: "Tecnologia",
        contactName: "Ana Prueba",
        contactRole: "Directora de Marketing",
        email: "sponsor.prueba@example.com",
        phone: "+50500000002",
        website: "https://example.com",
        sponsorshipType: "dinero",
        cashAmount: "1000",
        inKindDescription: "",
        customProposal: "",
        budgetRange: "1000-5000",
        eventInterest: "Marca",
        notes: "Registro de prueba para validar Firestore",
        status: "Pendiente",
        source: "manual-test",
        testMarker: true,
        testCreatedAt: createdAt,
      },
    },
    {
      collectionName: "voluntariosTedx",
      data: {
        id: `test-volunteer-${Date.now()}`,
        createdAt: serverTimestamp(),
        fullName: "Voluntario Prueba",
        ageRange: "18-24",
        email: "voluntario.prueba@example.com",
        phone: "+50500000003",
        city: "Managua",
        occupation: "Estudiante",
        availabilityText: "Fines de semana",
        areas: ["Logistica"],
        skills: ["Organizacion"],
        resources: "Ninguno",
        socialLinks: [],
        areaDetailsText: "",
        experience: "Sin experiencia previa",
        motivation: "Validar el flujo",
        photoUrl: "https://example.com/photo.png",
        agree: true,
        status: "Pendiente",
        source: "manual-test",
        testMarker: true,
        testCreatedAt: createdAt,
      },
    },
  ];

  for (const record of testRecords) {
    const docRef = await addDoc(collection(db, record.collectionName), record.data);
    console.log(`${record.collectionName}=${docRef.id}`);
  }
}

main().catch((error) => {
  console.error(`ERROR ${(error && error.message) || String(error)}`);
  process.exitCode = 1;
});