import jsPDF from "jspdf";
import QRCode from "qrcode";

export async function generateApplicantPDF(p: any, logoSrc: string) {
  try {
    const doc = new jsPDF();

    // 1. HEADER section (Black block)
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');

    // 2. HEADER Red line accent (TEDx red)
    doc.setFillColor(235, 0, 40);
    doc.rect(0, 40, 210, 3, 'F');

    // 3. Logo
    try {
      const img = new Image();
      img.src = logoSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      // aspect ratio approx: w = 3.5 * h
      const aspect = img.width / img.height;
      doc.addImage(img, 'PNG', 15, 10, 22 * aspect, 22);
    } catch (e) {
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("TEDx Avenida Bolivar", 15, 24);
    }

    // 4. Generate QR for tracking
    let qrDataUrl = '';
    try {
      const trackingUrl = `${window.location.origin}/status?id=${p.id}`;
      qrDataUrl = await QRCode.toDataURL(trackingUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
    } catch(err) {
      console.error("No se pudo generar QR", err);
    }

    // Formatear fecha
    let dateStr = "—";
    if (p.createdAt) {
      if (typeof p.createdAt?.toDate === "function") dateStr = p.createdAt.toDate().toLocaleDateString();
      else if (p.createdAt?.seconds) dateStr = new Date(p.createdAt.seconds * 1000).toLocaleDateString();
      else {
        const d = new Date(p.createdAt);
        if (!isNaN(d.getTime())) dateStr = d.toLocaleDateString();
      }
    }

    // 5. STATUS BADGE AND TITLE
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("EXPEDIENTE DE POSTULACIÓN", 15, 60);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`ID POSTULACIÓN: ${p.id}`, 15, 68);
    doc.text(`REGISTRADO: ${dateStr}`, 155, 68);

    doc.setDrawColor(230, 230, 230);
    doc.line(15, 74, 195, 74);

    // 6. DATOS DEL POSTULANTE
    doc.setTextColor(235, 0, 40); // TEDx Red
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("1. DATOS DEL POSTULANTE", 15, 85);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(p.nombre || "—", 15, 94);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    // Grid-like layout
    doc.text(`Correo: ${p.correo || '—'}`, 15, 102);
    doc.text(`Teléfono: ${p.telefono || '—'}`, 115, 102);
    
    doc.text(`Edad: ${p.edad || '—'} años`, 15, 110);
    const perfilText = p.perfil === "Otro" ? `${p.perfil} - ${p.perfilOtro||''}` : p.perfil;
    doc.text(`Perfil: ${perfilText || '—'}`, 115, 110);

    if (p.linkedin) doc.text(`LinkedIn: ${p.linkedin}`, 15, 118);
    if (p.redes) {
      const parsedRedes = doc.splitTextToSize(p.redes, 90);
      doc.text(parsedRedes, 115, 118);
    }

    doc.setDrawColor(240, 240, 240);
    doc.line(15, 128, 195, 128);

    // 7. PROPUESTA DE LA CHARLA
    doc.setTextColor(235, 0, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("2. PROPUESTA DE LA CHARLA", 15, 140);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    const titleLines = doc.splitTextToSize(`"${p.tituloCharla || '—'}"`, 180);
    doc.text(titleLines, 15, 150);

    let nextY = 150 + (titleLines.length * 7) + 2;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const cats = p.categorias ? (Array.isArray(p.categorias) ? p.categorias.join(' / ') : p.categorias) : '—';
    doc.text(`Categorías de interés: ${cats}`, 15, nextY);

    nextY += 12;

    doc.setFont("helvetica", "bold");
    doc.text("Idea Central:", 15, nextY);
    doc.setFont("helvetica", "normal");
    const ideaLines = doc.splitTextToSize(p.idea || '—', 180);
    doc.text(ideaLines, 15, nextY + 6);
    nextY += (ideaLines.length * 5) + 12;

    if (nextY > 260) {
      doc.addPage();
      nextY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.text("Por qué es importante o novedoso:", 15, nextY);
    doc.setFont("helvetica", "normal");
    const novLines = doc.splitTextToSize(p.novedad || '—', 180);
    doc.text(novLines, 15, nextY + 6);
    nextY += (novLines.length * 5) + 12;

    if (p.porQue) {
      if (nextY > 260) { doc.addPage(); nextY = 20; }
      doc.setFont("helvetica", "bold");
      doc.text("Por qué quiero dar esta charla:", 15, nextY);
      doc.setFont("helvetica", "normal");
      const porLines = doc.splitTextToSize(p.porQue || '—', 180);
      doc.text(porLines, 15, nextY + 6);
    }

    // 8. PIE DE PÁGINA
    const pages = doc.getNumberOfPages();
    
    if (qrDataUrl) {
      doc.setPage(1);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(165, 245, 30, 30, 1.5, 1.5, 'F');
      doc.addImage(qrDataUrl, 'PNG', 166, 246, 28, 28);
      
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text("ESCANEA PARA", 168, 279);
      doc.text("VER ESTADO", 169, 282);
    }

    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${pages}`, 195, 290, { align: "right" });
      doc.text("TEDx Avenida Bolivar - Evento Independiente operado bajo licencia TED", 15, 290);
    }

    doc.save(`TEDx_${(p.nombre || "Postulacion").replace(/\s+/g, '_')}_${p.id.substring(0,6)}.pdf`);
    
    return true;
  } catch (err) {
    console.error(err);
    alert("No se pudo generar el documento PDF.");
    return false;
  }
}
