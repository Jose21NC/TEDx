import { pdf } from '@react-pdf/renderer';
import QRCode from "qrcode";
import { ApplicantPDF } from '../PDF/ApplicantPDF';
import { saveAs } from 'file-saver';

export async function generateApplicantPDF(p: any, logoSrc: string) {
  try {
    
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

    let dateStr = "—";
    if (p.createdAt) {
       const d = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt.seconds * 1000 || p.createdAt);
       dateStr = isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
    }

    const blob = await pdf(
      ApplicantPDF({
        p,
        logoSrc,
        qrDataUrl,
        dateStr
      })
    ).toBlob();

    const fileName = `TEDx_${(p.nombre || "Postulacion").replace(/\s+/g, '_')}_${p.id.substring(0,6)}.pdf`;
    saveAs(blob, fileName);

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}