import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    paddingBottom: 85,
  },
  headerTop: {
    backgroundColor: "#FFFFFF",
    height: 113,
    flexDirection: 'row',
    justifyContent: "flex-end", // Logo a la derecha
    alignItems: "center",
    paddingHorizontal: 42,
  },
  headerRed: {
    backgroundColor: "#EB0028",
    height: 8.5,
  },
  logo: {
    height: 62,
    width: 217,
    objectFit: "contain",
  },
  logoFallback: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    color: "#000000",
  },
  body: {
    paddingTop: 42,
    paddingHorizontal: 42,
  },
  mainTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: "#000000",
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusText: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#787878",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E6E6E6",
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#EB0028",
    marginBottom: 6,
  },
  card: {
    borderWidth: 1,
    borderColor: "#EAEAEA",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
  },
  row: {
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 8,
    color: "#6B7280",
    textTransform: "uppercase",
  },
  rowValue: {
    marginTop: 2,
    fontSize: 11,
    color: "#111827",
    lineHeight: 1.35,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 42,
    right: 42,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 8,
    color: "#969696",
  },
});

function sponsorTypeLabel(value: string | undefined) {
  if (!value) return "—";
  if (value === "efectivo") return "Efectivo";
  if (value === "especie") return "En especie";
  if (value === "personalizado") return "Personalizado";
  return value;
}

export function SponsorPDF({ sponsor, dateStr, logoSrc }: { sponsor: any; dateStr: string; logoSrc: string }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerTop} fixed>
          {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : <Text style={styles.logoFallback}>TEDx Avenida Bolivar</Text>}
        </View>
        <View style={styles.headerRed} fixed />

        <View style={styles.body}>
          <Text style={styles.mainTitle}>EXPEDIENTE DE PATROCINIO</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>ID SOLICITUD: {sponsor.id || "—"}</Text>
            <Text style={styles.statusText}>REGISTRADO: {dateStr}</Text>
          </View>
          <View style={styles.divider} />

          <View wrap={false}>
            <Text style={styles.sectionTitle}>1. EMPRESA Y CONTACTO</Text>
            <View style={styles.card}>
              <View style={styles.row}><Text style={styles.rowLabel}>Empresa</Text><Text style={[styles.rowValue, { textAlign: 'justify' }]}>{sponsor.companyName || "—"}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Sector</Text><Text style={[styles.rowValue, { textAlign: 'justify' }]}>{sponsor.companySector || "—"}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Encargado</Text><Text style={[styles.rowValue, { textAlign: 'justify' }]}>{sponsor.contactName || "—"}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Cargo</Text><Text style={[styles.rowValue, { textAlign: 'justify' }]}>{sponsor.contactRole || "—"}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Correo</Text><Text style={[styles.rowValue, { textAlign: 'justify' }]}>{sponsor.email || "—"}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Telefono</Text><Text style={[styles.rowValue, { textAlign: 'justify' }]}>{sponsor.phone || "—"}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Sitio Web</Text><Text style={[styles.rowValue, { textAlign: 'justify' }]}>{sponsor.website || "—"}</Text></View>
            </View>
          </View>

          <View wrap={false}>
            <Text style={styles.sectionTitle}>2. INFORMACION DE PATROCINIO</Text>
            <View style={styles.card}>
              <View style={styles.row}><Text style={styles.rowLabel}>Tipo de patrocinio</Text><Text style={[styles.rowValue, { textAlign: 'justify' }]}>{sponsorTypeLabel(sponsor.sponsorshipType)}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Rango de presupuesto</Text><Text style={[styles.rowValue, { textAlign: 'justify' }]}>{sponsor.budgetRange || "—"}</Text></View>
              <View style={styles.row}><Text style={styles.rowLabel}>Que desea apoyar</Text><Text style={[styles.rowValue, { textAlign: 'justify' }]}>{sponsor.eventInterest || "—"}</Text></View>
              {sponsor.cashAmount ? <View style={styles.row}><Text style={styles.rowLabel}>Monto aproximado</Text><Text style={[styles.rowValue, { textAlign: 'justify' }]}>{sponsor.cashAmount}</Text></View> : null}
              {sponsor.inKindDescription ? <View style={styles.row}><Text style={styles.rowLabel}>Aporte en especie</Text><Text style={[styles.rowValue, { textAlign: 'justify' }]}>{sponsor.inKindDescription}</Text></View> : null}
              {sponsor.customProposal ? <View style={styles.row}><Text style={styles.rowLabel}>Propuesta personalizada</Text><Text style={[styles.rowValue, { textAlign: 'justify' }]}>{sponsor.customProposal}</Text></View> : null}
            </View>
          </View>

          <View wrap={false}>
            <Text style={styles.sectionTitle}>3. NOTAS</Text>
            <View style={styles.card}>
              <Text style={[styles.rowValue, { textAlign: 'justify' }]}>{sponsor.notes || "—"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>TEDx Avenida Bolivar - Evento Independiente operado bajo licencia TED</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
