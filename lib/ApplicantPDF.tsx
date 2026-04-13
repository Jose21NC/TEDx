import React from 'react';
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';

import { styles } from './pdfStyles';

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

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        {/* 1 y 2. HEADER FIJO */}
        <View style={styles.headerTop} fixed>
          <View>
            {logoSrc ? (
              <Image src={logoSrc} style={styles.logo} />
            ) : (
              <Text style={styles.logoFallback}>TEDx Avenida Bolivar</Text>
            )}
          </View>
          
          {qrDataUrl && (
            <View style={styles.qrWrapper}>
              <Image src={qrDataUrl} style={styles.qrImage} />
            </View>
          )}
        </View>
        <View style={styles.headerRed} fixed />

        {/* CONTENIDO PRINCIPAL */}
        <View style={styles.body}>

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
              <Text style={styles.gridText}><Text style={styles.gridLabel}>Correo:</Text> {p.correo || '—'}</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridText}><Text style={styles.gridLabel}>Teléfono:</Text> {p.telefono || '—'}</Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.gridText}><Text style={styles.gridLabel}>Edad:</Text> {p.edad || '—'} años</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridText}><Text style={styles.gridLabel}>Perfil:</Text> {perfilText || '—'}</Text>
            </View>
          </View>

          {p.linkedin && (
            <View style={styles.gridRow}>
              <Text style={styles.gridText}><Text style={styles.gridLabel}>LinkedIn:</Text> {p.linkedin}</Text>
            </View>
          )}
          {p.redes && (
            <View style={styles.gridRow}>
              <Text style={styles.gridText}><Text style={styles.gridLabel}>Redes:</Text> {p.redes}</Text>
            </View>
          )}

          <View style={styles.dividerLight} />

          {/* 7. PROPUESTA DE LA CHARLA */}
          <Text style={styles.sectionTitle}>2. PROPUESTA DE LA CHARLA</Text>
          <Text style={styles.talkTitle}>"{p.tituloCharla || '—'}"</Text>
          
          <Text style={styles.categoriesText}>Categorías de interés: {cats}</Text>

          {/* BLOQUE: IDEA CENTRAL */}
          <View style={styles.blockContainer}>
            <Text style={styles.blockTitle}>Idea Central:</Text>
            <Text style={[styles.blockText, { textAlign: 'justify' }]}>{p.idea || '—'}</Text>
          </View>

          {/* BLOQUE: NOVEDAD */}
          <View style={styles.blockContainer}>
            <Text style={styles.blockTitle}>Por qué es importante o novedoso:</Text>
            <Text style={[styles.blockText, { textAlign: 'justify' }]}>{p.novedad || '—'}</Text>
          </View>

          {/* BLOQUE: POR QUÉ */}
          {p.porQue && (
            <View style={styles.blockContainer}>
              <Text style={styles.blockTitle}>Por qué quiero dar esta charla:</Text>
              <Text style={[styles.blockText, { textAlign: 'justify' }]}>{p.porQue}</Text>
            </View>
          )}

        </View>

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