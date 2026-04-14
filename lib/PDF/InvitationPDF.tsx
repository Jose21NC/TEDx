import React from 'react';
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { styles } from '../pdfStyles';

interface InvitationPDFProps {
  data: {
    nombre: string;
    correo: string;
    telefono: string;
    cargo: string;
    estudios: string;
    curriculum: string;
    redes: string[];
  };
  logoSrc: string;
  qrDataUrl: string;
  dateStr: string;
}

export const InvitationPDF = ({ data, logoSrc, qrDataUrl, dateStr }: InvitationPDFProps) => {
  const nombreLimpio = data.nombre?.trim() || "Candidato Distinguido";
  
  const estudiosDisplay = data.estudios?.trim() 
    ? data.estudios 
    : `Especialista en ${data.cargo || 'su área de impacto'}`;

  const cargoDisplay = data.cargo?.trim() || "Líder de Pensamiento / Innovador";

  const bioFallback = "Su perfil ha sido seleccionado por nuestro comité de curaduría debido a su trayectoria excepcional y su capacidad para articular ideas que desafían el status quo. Consideramos que su voz es una pieza fundamental para la narrativa de nuestra próxima edición.";

  return (
    <Document title={`Invitación Oficial - ${nombreLimpio}`}>
      <Page size="A4" style={styles.page}>
        
        <View style={styles.headerBlack} fixed>
          {logoSrc ? (
            <Image src={logoSrc} style={styles.logo} />
          ) : (
            <Text style={styles.logoFallback}>TEDx Avenida Bolivar</Text>
          )}
        </View>
        <View style={styles.headerRed} fixed />

        <View style={styles.body}>
          
          {/* TÍTULO Y FECHA */}
          <Text style={styles.mainTitle}>INVITACIÓN A PONENTE: EDICIÓN VANGUARDIA</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>DOCUMENTO DE CURADURÍA EXTERNA</Text>
            <Text style={styles.statusText}>{dateStr}</Text>
          </View>
          <View style={styles.divider} />

          {/* SALUDO FORMAL */}
          <Text style={[styles.applicantName, { color: '#EB0028', fontSize: 18 }]}>
            {nombreLimpio.toUpperCase()}
          </Text>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.sectionTitle}>ROL ACTUAL</Text>
              <Text style={styles.gridText}>{cargoDisplay}</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.sectionTitle}>ÁREA DE IMPACTO</Text>
              <Text style={styles.gridText}>{estudiosDisplay}</Text>
            </View>
          </View>

          <View style={styles.dividerLight} />

          {/* CUERPO DE LA CARTA (Copy Persuasivo) */}
          <View style={styles.blockContainer}>
            <Text style={[styles.blockText, { marginBottom: 10, fontFamily: 'Helvetica-Bold' }]}>
              ¿Por qué usted?
            </Text>
            <Text style={styles.blockText}>
              En <Text style={{ color: '#EB0028' }}>TEDx Avenida Bolivar</Text>, no buscamos solo oradores; buscamos catalizadores de cambio. Tras un análisis exhaustivo de su trayectoria, hemos identificado en su trabajo una resonancia única con los valores de innovación y profundidad que caracterizan a la plataforma TED.
            </Text>
          </View>

          <View style={[styles.blockContainer, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>LA PROPUESTA DE VALOR</Text>
            <Text style={[styles.blockText, { fontStyle: 'italic', backgroundColor: '#F9F9F9', padding: 10 }]}>
              {data.curriculum?.trim() || bioFallback}
            </Text>
          </View>

          {/* INFORMACIÓN DEL EVENTO */}
          <View style={{ marginTop: 20 }}>
            <Text style={styles.blockTitle}>Nuestra Visión:</Text>
            <Text style={[styles.blockText, { color: '#666' }]}>
              Nuestra misión es amplificar ideas locales con poder global. Usted ha sido pre-seleccionado para ocupar una de nuestras prestigiosas plazas de ponente, donde contará con el respaldo de nuestro equipo de coaching para llevar su mensaje a una audiencia de alto impacto.
            </Text>
          </View>

          {/* CIERRE */}
          <View style={{ marginTop: 30 }}>
            <Text style={styles.blockText}>Esperamos con entusiasmo la posibilidad de colaborar.</Text>
            <Text style={[styles.blockText, { fontFamily: 'Helvetica-Bold', marginTop: 5 }]}>
              Comité Organizador | TEDx Avenida Bolivar
            </Text>
          </View>

        </View>

        {/* QR CODE (Call to Action) */}
        {qrDataUrl && (
          <View style={styles.qrWrapper} fixed>
            <Image src={qrDataUrl} style={styles.qrImage} />
            <Text style={styles.qrLabel1}>CONECTA CON</Text>
            <Text style={styles.qrLabel2}>EL EQUIPO</Text>
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Este documento es una invitación formal y confidencial.
          </Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
            `Página ${pageNumber} de ${totalPages}`
          )} />
        </View>

      </Page>
    </Document>
  );
};