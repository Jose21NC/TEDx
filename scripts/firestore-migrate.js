const fs = require("fs");
const path = require("path");
const { initializeApp, cert, getApps, deleteApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

function readJsonFile(filePath) {
  const resolvedPath = path.resolve(filePath);
  return JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
}

function tryParseJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizePrivateKey(value) {
  return String(value || "").replace(/\\n/g, "\n");
}

function loadServiceAccount(prefix, options = {}) {
  const jsonEnv = process.env[`${prefix}_FIREBASE_SERVICE_ACCOUNT_JSON`] || process.env[`${prefix}_SERVICE_ACCOUNT_JSON`];
  const pathEnv = process.env[`${prefix}_FIREBASE_SERVICE_ACCOUNT_PATH`] || process.env[`${prefix}_SERVICE_ACCOUNT_PATH`];

  if (jsonEnv) {
    const parsed = tryParseJson(jsonEnv);
    if (!parsed) throw new Error(`No se pudo parsear ${prefix}_FIREBASE_SERVICE_ACCOUNT_JSON.`);
    return parsed;
  }

  if (pathEnv) {
    return readJsonFile(pathEnv);
  }

  if (options.allowLegacyEnv) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (projectId && clientEmail && privateKey) {
      return { projectId, clientEmail, privateKey };
    }
  }

  throw new Error(
    `Faltan credenciales para ${prefix}. Usa ${prefix}_FIREBASE_SERVICE_ACCOUNT_PATH, ${prefix}_FIREBASE_SERVICE_ACCOUNT_JSON o variables legacy cuando corresponda.`,
  );
}

function getCollectionNamesFromEnv() {
  const raw = process.env.FIRESTORE_COLLECTIONS || "";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function isTruthy(value) {
  return /^(1|true|yes|y)$/i.test(String(value || "").trim());
}

async function deleteDocumentTree(docRef, depth = 0) {
  const subcollections = await docRef.listCollections();
  for (const subcollection of subcollections) {
    const docs = await subcollection.listDocuments();
    for (const childDocRef of docs) {
      await deleteDocumentTree(childDocRef, depth + 1);
    }
  }

  await docRef.delete();
  console.log(`${"  ".repeat(depth)}DELETE ${docRef.path}`);
}

async function purgeCollections(collectionRefs) {
  for (const collectionRef of collectionRefs) {
    const docs = await collectionRef.listDocuments();
    console.log(`PURGE ${collectionRef.path} (${docs.length} docs)`);
    for (const docRef of docs) {
      await deleteDocumentTree(docRef, 1);
    }
  }
}

async function migrateDocument(sourceDocRef, targetDocRef, state, depth = 0) {
  const data = sourceDocRef.data();

  if (state.dryRun) {
    console.log(`${"  ".repeat(depth)}DRY ${targetDocRef.path}`);
  } else {
    await targetDocRef.set(data, { merge: false });
    console.log(`${"  ".repeat(depth)}COPY ${targetDocRef.path}`);
  }

  state.documentCount += 1;

  const subcollections = await sourceDocRef.listCollections();
  for (const subcollection of subcollections) {
    await migrateCollection(subcollection, targetDocRef.collection(subcollection.id), state, depth + 1);
  }
}

async function migrateCollection(sourceCollectionRef, targetCollectionRef, state, depth = 0) {
  const snapshot = await sourceCollectionRef.get();
  console.log(`${"  ".repeat(depth)}COLLECTION ${sourceCollectionRef.path} (${snapshot.size} docs)`);

  for (const docSnap of snapshot.docs) {
    await migrateDocument(docSnap.ref, targetCollectionRef.doc(docSnap.id), state, depth + 1);
  }
}

async function main() {
  const sourceAccount = loadServiceAccount("SOURCE", { allowLegacyEnv: true });
  const targetAccount = loadServiceAccount("TARGET");
  const collectionNames = getCollectionNamesFromEnv();
  const dryRun = isTruthy(process.env.FIRESTORE_DRY_RUN);
  const purgeTarget = isTruthy(process.env.FIRESTORE_PURGE_TARGET);

  const sourceAppName = "firestore-migrate-source";
  const targetAppName = "firestore-migrate-target";

  if (getApps().some((app) => app.name === sourceAppName || app.name === targetAppName)) {
    throw new Error("Ya existe una app Firebase temporal con ese nombre en este proceso.");
  }

  const sourceApp = initializeApp({ credential: cert(sourceAccount) }, sourceAppName);
  const targetApp = initializeApp({ credential: cert(targetAccount) }, targetAppName);

  try {
    const sourceDb = getFirestore(sourceApp);
    const targetDb = getFirestore(targetApp);

    const sourceCollections = collectionNames.length > 0
      ? collectionNames.map((name) => sourceDb.collection(name))
      : await sourceDb.listCollections();

    const state = {
      dryRun,
      documentCount: 0,
    };

    console.log(`SOURCE=${sourceAccount.projectId || "(unknown)"}`);
    console.log(`TARGET=${targetAccount.projectId || "(unknown)"}`);
    console.log(`DRY_RUN=${dryRun ? "yes" : "no"}`);
    console.log(`PURGE_TARGET=${purgeTarget ? "yes" : "no"}`);
    console.log(`ROOT_COLLECTIONS=${sourceCollections.map((collectionRef) => collectionRef.id).join(",") || "(none)"}`);

    if (purgeTarget && !dryRun) {
      const targetCollections = sourceCollections.map((collectionRef) => targetDb.collection(collectionRef.id));
      await purgeCollections(targetCollections);
    }

    for (const sourceCollectionRef of sourceCollections) {
      const targetCollectionRef = targetDb.collection(sourceCollectionRef.id);
      await migrateCollection(sourceCollectionRef, targetCollectionRef, state);
    }

    console.log(`DONE documents=${state.documentCount}`);
  } finally {
    await Promise.allSettled([deleteApp(sourceApp), deleteApp(targetApp)]);
  }
}

main().catch((error) => {
  console.error(`ERROR ${(error && error.message) || String(error)}`);
  process.exitCode = 1;
});