import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { tipo, nombre, genero, cargo, estudios } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "La clave GEMINI_API_KEY no está configurada en el servidor." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Condicionar Prompt Base
    const isSponsor = tipo === "sponsor";

    const prompt = `
      Eres el Equipo Organizador de TEDxAvenida Bolivar.
      Tu tarea es redactar el cuerpo principal de una carta de invitación formal y altamente profesional para la persona detallada a continuación. Esta será la PRIMERA EDICIÓN de nuestro evento local. La temática de este año es: "El Arte de Reinventar".
      
      Datos del candidato:
      - Nombre: ${nombre || "Candidato"}
      - Género/Tratamiento preferido: ${genero || "Neutro"}
      - Cargo y Empresa (Si aplica): ${cargo || "Líder Destacado"}
      - Contexto/Rubro de interés: ${estudios || "-"}
      
      INSTRUCCIONES CLAVES:
      1. Escribe 2 - 3 párrafos cortos (máximo 150 palabras en total).
      2. Empieza la carta destacando la novedad de que esta es la **Primera Edición** de TEDxAvenida Bolivar (somos un evento TEDx independiente oficial en Managua). Menciona explícitamente "El Arte de Reinventar".
      3. Tono: Impecable, formal, persuasivo y altamente prestigioso. Dirígete a la persona de usted o en un trato digno (si es sponsor, eleva aún más la formalidad corporativa).
      4. IMPORTANTE REQUERIMIENTO TÉCNICO: Usa negritas encerrando el texto en dobles asteriscos (ejemplo: **El Arte de Reinventar**) para resaltar Conceptos Clave, Títulos del Candidato, Nombres de Empresas, y Términos Importantes a lo largo del texto. 
      5. ${isSponsor 
          ? "Aclara explícitamente que el propósito de esta carta es extenderle una invitación corporativa para explorar una 'alianza estratégica' y sumarse como Sponsor Oficial de la primera edición." 
          : "Aclara elegantemente que la carta es una invitación oficial para 'iniciar el proceso de postulación a posibles charlas', y NO es una garantía de espacio directo en el ciclo de conferencias del día del evento."}
      6. NO inicies la carta con saludos u aperturas (Ej: "Estimado..."). La plataforma incrustará el saludo antes. Empieza directo con el primer párrafo ("Nos complace dirigirnos...").
      7. NO te despidas ni pongas firmas finales.
    `;

    let result;
    try {
      // Intento con el modelo 2.5
      result = await model.generateContent(prompt);
    } catch (apiError: any) {
      if (apiError.status === 503 || apiError.message.includes("503")) {
        console.warn("Gemini 2.5-flash alta demanda. Realizando fallback silencioso a 1.5-flash...");
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        result = await fallbackModel.generateContent(prompt);
      } else {
        throw apiError;
      }
    }

    let textoGenerado = result.response.text();
    
    // Limpieza de formato en caso retorne saludos no deseados
    textoGenerado = textoGenerado.replace(/^estimado.*?\n/im, '').trim();

    return NextResponse.json({ result: textoGenerado });
  } catch (error: any) {
    console.error("Error generating letter via Gemini:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
