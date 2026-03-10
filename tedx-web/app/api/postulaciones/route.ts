import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";

type Submission = Record<string, unknown>;

const COLLECTION = "ponentesTedx";

export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection(COLLECTION).orderBy("createdAt", "desc").get();
    const submissions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ submissions });
  } catch {
    return NextResponse.json({ message: "No se pudieron obtener las postulaciones" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Submission;

    if (!body || typeof body !== "object") {
      return NextResponse.json({ message: "Payload inválido" }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection(COLLECTION).add({
      ...body,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "No se pudo guardar la postulación" }, { status: 500 });
  }
}
