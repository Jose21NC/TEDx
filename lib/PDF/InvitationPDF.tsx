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
    qrCodeStr?: string;
  };
  logoSrc: string;
  signatureSrc?: string;
  qrDataUrl: string;
  dateStr: string;
}

export const InvitationPDF = ({ data, logoSrc, signatureSrc, qrDataUrl, dateStr }: InvitationPDFProps) => {
  const nombreLimpio = data.nombre?.trim() || "Candidato Distinguido";
  
  const estudiosDisplay = data.estudios?.trim() || "Trayectoria Destacada";
  const cargoDisplay = data.cargo?.trim() || "Cargo no especificado";

  const bioFallback = "Su perfil ha sido seleccionado debido a su trayectoria excepcional y su capacidad para articular ideas que desafían el status quo. Consideramos que su voz es una pieza fundamental para la narrativa de nuestra próxima edición.";

  const isSponsor = (data as any).tipo === "sponsor";
  
  // Saludo dinámico según género
  let saludo = "Estimado/a";
  if (data.genero === "Masculino") saludo = "Estimado";
  if (data.genero === "Femenino") saludo = "Estimada";

  // Parseador manual de Negritas en Texto Base para React-PDF (**texto**)
  const renderTextWithBold = (text: string) => {
    // Si no hay texto, retornar vacio
    if (!text) return null;
    // Partir por los encerramientos en asteriscos dobles
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={index} style={{ fontFamily: 'Helvetica-Bold' }}>{part.slice(2, -2)}</Text>;
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <Document title={`Invitación Oficial - ${nombreLimpio}`}>
      <Page size="LETTER" style={styles.page}>
        
        <View style={styles.headerBlack} fixed>
          {logoSrc ? (
            <Image src={logoSrc} style={styles.logo} />
          ) : (
            <Text style={styles.logoFallback}>TEDx Avenida Bolivar</Text>
          )}
        </View>
        <View style={styles.headerRed} fixed />

        <View style={styles.body}>
          
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11, textAlign: 'right', color: '#333' }}>
              Managua, Nicaragua
              {"\n"}{dateStr}
            </Text>
          </View>

          {/* SALUDO FORMAL */}
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 14, color: '#000', marginBottom: 15 }}>
            {saludo} {nombreLimpio},
          </Text>

          {/* CUERPO DE LA CARTA */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontFamily: 'Helvetica', fontSize: 11, lineHeight: 1.6, textAlign: 'justify' }}>
              {data.curriculum ? renderTextWithBold(data.curriculum.trim()) : bioFallback}
            </Text>
          </View>

          {/* INFORMACIÓN ADICIONAL O CIERRE */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontFamily: 'Helvetica', fontSize: 11, lineHeight: 1.6, textAlign: 'justify', color: '#333' }}>
              Este próximo sábado 29 de agosto, reuniremos en el Centro Cultural Tino López Guerra a las mentes más brillantes de nuestra ciudad. 
              {isSponsor 
                ? " Nuestro objetivo es forjar sólidas alianzas con la empresa privada. Formar parte de este evento inaugural le brindará una plataforma inigualable de exposición de marca y un puente directo con la innovación social."
                : " Tenga en cuenta que esta es una invitación a iniciar un proceso de postulación a través de nuestro Equipo Organizador, lo cual es el primer paso vital para consolidar su perfil antes de emitir un veredicto definitivo de participación."}
            </Text>
          </View>

          {/* DESPEDIDA Y FIRMA */}
          <View style={{ marginTop: 30 }}>
            {/* Atentamente alineado a la izquierda */}
            <Text style={{ fontFamily: 'Helvetica', fontSize: 11, textAlign: 'left', marginBottom: 40 }}>
              Atentamente,
            </Text>

            {/* Bloque de firma y nombre centrado */}
            <View style={{ alignItems: 'center', position: 'relative' }}>
              
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 12, marginTop: 25 }}>
                José Manuel Obregón Alonzo
              </Text>
              <Text style={{ fontFamily: 'Helvetica', fontSize: 10, color: '#555', marginTop: 2 }}>
                Organizador y Licenciatario
              </Text>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10, marginTop: 2 }}>
                TEDx Avenida Bolivar
              </Text>

              {/* FIRMA OVERLAY DESPUÉS DEL TEXTO PARA RENDERIZAR ARRIBA */}
              {signatureSrc && (
                <Image 
                  src={signatureSrc} 
                  style={{ 
                    position: 'absolute', 
                    top: -10, 
                    width: 100, 
                    height: 50, 
                    objectFit: 'contain'
                  }} 
                />
              )}
            </View>
          </View>

        </View>

        {/* QR CODE A LA DERECHA ESTÁTICO Y MÁS GRANDE (Se Oculta para Sponsors) */}
        {!isSponsor && qrDataUrl && (
          <View style={{ position: 'absolute', bottom: 40, right: 42, alignItems: 'flex-end' }}>
             <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#EB0028', marginBottom: 1 }}>INICIAR</Text>
             <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#EB0028', marginBottom: 4 }}>PROCESO ACÁ</Text>
             <View style={[styles.qrWrapper, { position: 'relative', marginTop: 2, width: 70, height: 70 }]}>
               <Image src={qrDataUrl} style={{ width: 70, height: 70, objectFit: 'contain' }} />
             </View>
          </View>
        )}

        {/* FOOTER - DINÁMICO */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {isSponsor ? "Enlace personalizado: " : "Enlace para comenzar tu registro: "}tedxavenidabolivar.com/convocatoria/invitacion?c={data.qrCodeStr || "XXXXXX"}
          </Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
            `Página ${pageNumber} de ${totalPages}`
          )} />
        </View>

      </Page>
    </Document>
  );
};