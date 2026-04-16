// utils/generateInvitationPDF.ts
import { pdf } from '@react-pdf/renderer';
import QRCode from "qrcode";
import { saveAs } from 'file-saver';
import { InvitationPDF } from '../PDF/InvitationPDF';

export async function generateInvitationPDF(data: any, logoSrc: string = '', signatureSrc: string = '') {
  try {
    let qrDataUrl = '';
    try {
      const targetUrl = window.location.origin;
      qrDataUrl = await QRCode.toDataURL(targetUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
    } catch(err) {
      console.error("No se pudo generar QR", err);
    }

    const dateStr = new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });

    const blob = await pdf(
      InvitationPDF({
        data,
        logoSrc,
        signatureSrc,
        qrDataUrl,
        dateStr
      })
    ).toBlob();

    const cleanName = (data.nombre || "Invitado").replace(/\s+/g, '_');
    const fileName = `TEDxAvenidaBolivar_Invitacion_${cleanName}.pdf`;
    
    saveAs(blob, fileName);

    return true;
  } catch (err) {
    console.error("Error al generar el PDF de invitación:", err);
    return false;
  }
}