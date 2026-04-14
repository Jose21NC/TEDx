import React from 'react';
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';

import { styles } from '../pdfStyles';

interface ApplicantPDFProps {
  p: any;
  logoSrc: string;
  qrDataUrl: string;
  dateStr: string;
}

export const ApplicantPDF = ({ p, logoSrc, qrDataUrl, dateStr }: ApplicantPDFProps) => {
  // Lógica de mapeo
  const perfilText = p.perfil === "Otro" ? `${p.perfil} - ${p.perfilOtro || ''}` : p.perfil;
  const cats = p.categorias ? (Array.isArray(p.categorias) ? p.categorias.join(' / ') : p.categorias) : '—';

  // Margen de seguridad para el QR (para que el texto no quede detrás)
  const qrSafeStyle = { marginRight: 90 };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* 1 y 2. HEADER FIJO */}
        <View style={styles.headerBlack} fixed>
          {logoSrc ? (
            <Image src={logoSrc} style={styles.logo} />
          ) : (
            <Text style={styles.logoFallback}>TEDx Avenida Bolivar</Text>
          )}
        </View>
        <View style={styles.headerRed} fixed />

        {/* CONTENIDO PRINCIPAL */}
        <View style={styles.body}>
          
          {/* --- ESPACIADOR DINÁMICO PARA PÁGINAS 2+ --- */}
          <View 
            fixed 
            render={({ pageNumber }) => (
              pageNumber > 1 ? <View style={{ height: 60, width: '100%' }} /> : null
            )} 
          />

          {/* 5. TÍTULO Y ESTADO */}
          <Text style={styles.mainTitle}>EXPEDIENTE DE POSTULACIÓN</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>ID POSTULACIÓN: {p.id}</Text>
            <Text style={styles.statusText}>REGISTRADO: {dateStr}</Text>
          </View>
          <View style={styles.divider} />

          {/* 6. DATOS DEL POSTULANTE */}
          <Text style={styles.sectionTitle}>1. DATOS DEL POSTULANTE</Text>
          <Text style={styles.applicantName}>{p.nombre || "—"}</Text>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.gridText}>Correo: {p.correo || '—'}</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridText}>Teléfono: {p.telefono || '—'}</Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.gridText}>Edad: {p.edad || '—'} años</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridText}>Perfil: {perfilText || '—'}</Text>
            </View>
          </View>

          {p.linkedin && (
            <View style={styles.gridRow}>
              <Text style={styles.gridText}>LinkedIn: {p.linkedin}</Text>
            </View>
          )}
          {p.redes && (
            <View style={styles.gridRow}>
              <Text style={styles.gridText}>Redes: {p.redes}</Text>
            </View>
          )}

          <View style={styles.dividerLight} />

          {/* 7. PROPUESTA DE LA CHARLA */}
          <Text style={styles.sectionTitle}>2. PROPUESTA DE LA CHARLA</Text>
          <Text style={styles.talkTitle}>"{p.tituloCharla || '—'}"</Text>
          
          <Text style={styles.categoriesText}>Categorías de interés: {cats}</Text>

          {/* BLOQUE: IDEA CENTRAL */}
          <View style={[styles.blockContainer, qrSafeStyle]} wrap={false}>
            <Text style={styles.blockTitle}>Idea Central:</Text>
            <Text style={styles.blockText}>{p.idea || '—'}</Text>
          </View>

          {/* BLOQUE: NOVEDAD */}
          <View style={[styles.blockContainer, qrSafeStyle]} wrap={false}>
            <Text style={styles.blockTitle}>Por qué es importante o novedoso:</Text>
            <Text style={styles.blockText}>{p.novedad || '—'}</Text>
          </View>

          {/* BLOQUE: POR QUÉ */}
          {p.porQue && (
            <View style={[styles.blockContainer, qrSafeStyle]} wrap={false}>
              <Text style={styles.blockTitle}>Por qué quiero dar esta charla:</Text>
              <Text style={styles.blockText}>{p.porQue}</Text>
            </View>
          )}

        </View>

        {/* 4. CÓDIGO QR FIJO */}
        {qrDataUrl && (
          <View style={styles.qrWrapper} fixed>
            <Image src={qrDataUrl} style={styles.qrImage} />
            <Text style={styles.qrLabel1}>ESCANEA PARA</Text>
            <Text style={styles.qrLabel2}>VER ESTADO</Text>
          </View>
        )}

        {/* 8. PIE DE PÁGINA FIJO */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            TEDx Avenida Bolivar - Evento Independiente operado bajo licencia TED
          </Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
            `Página ${pageNumber} de ${totalPages}`
          )} />
        </View>

      </Page>
    </Document>
  );
};