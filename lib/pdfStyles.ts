import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    paddingBottom: 85, // Espacio reservado para el footer (aprox 30mm)
  },
  
  // 1 & 2. HEADER
  headerBlack: {
    backgroundColor: '#000000',
    height: 113, // 40mm
    justifyContent: 'center',
    paddingLeft: 42, // 15mm
  },
  headerRed: {
    backgroundColor: '#EB0028',
    height: 8.5, // 3mm
  },
  
  // 3. LOGO
  logo: {
    height: 62, // 22mm
    width: 217, // 22 * 3.5 aspect ratio
    objectFit: 'contain',
  },
  logoFallback: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },

  // CONTENEDOR PRINCIPAL
  body: {
    paddingTop: 42,
    paddingHorizontal: 42,
  },

  // 5. STATUS BADGE AND TITLE
  mainTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: '#000000',
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusText: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#787878',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    marginBottom: 14,
  },

  // 6. DATOS DEL POSTULANTE
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#EB0028',
    marginBottom: 4,
  },
  applicantName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: '#000000',
    marginBottom: 8,
  },
  
  // Grid layout (Correo/Teléfono/Edad/Perfil)
  gridRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  gridCol: {
    width: '50%',
    paddingRight: 10,
  },
  gridText: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.3,
    color: '#000000',
  },
  dividerLight: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0', // rgb(240,240,240)
    marginTop: 10,
    marginBottom: 14,
  },

  // 7. PROPUESTA DE LA CHARLA
  talkTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
  },
  categoriesText: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    marginBottom: 12,
  },
  blockContainer: {
    marginBottom: 14,
  },
  headerSpacer: {
    height: 60,
    width: '100%',
  },
  blockTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginBottom: 4,
  },
  blockText: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.4,
  },

  // 4. QR CODE (Posición absoluta solo en la primera página)
  qrWrapper: {
    position: 'absolute',
    bottom: 80,
    right: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 3,
    alignItems: 'center',
    width: 85,
    height: 100,
  },
  qrImage: {
    width: 79,
    height: 95,
  },
  qrLabel1: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: '#646464', // rgb(100,100,100)
    marginTop: -2,
  },
  qrLabel2: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: '#646464',
    marginTop: 1,
  },

  // 8. PIE DE PÁGINA (Fixed across pages)
  footer: {
    position: 'absolute',
    bottom: 20, // Y:290 aprox
    left: 42, // X:15
    right: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontFamily: 'Helvetica-Oblique', // "helvetica", "italic"
    fontSize: 8,
    color: '#969696', // rgb(150,150,150)
  }
});