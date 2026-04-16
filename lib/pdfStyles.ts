import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    paddingBottom: 70,
  },
  
  // 1 & 2. HEADER
  headerTop: {
    backgroundColor: '#FCFCFC',
    height: 94,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 42,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  headerBlack: {
    backgroundColor: '#111111',
    height: 94,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 42,
  },
  headerRed: {
    backgroundColor: '#EB0028',
    height: 7,
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
    color: '#000000',
  },

  // CONTENEDOR PRINCIPAL
  body: {
    paddingTop: 24,
    paddingHorizontal: 42,
  },

  // 5. STATUS BADGE AND TITLE
  mainTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: '#000000',
    marginBottom: 4,
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
    marginBottom: 10,
  },

  // 6. DATOS DEL POSTULANTE
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#EB0028',
    marginBottom: 3,
  },
  applicantName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: '#000000',
    marginBottom: 6,
  },
  
  // Grid layout (Correo/Teléfono/Edad/Perfil)
  gridRow: {
    flexDirection: 'row',
    marginBottom: 6,
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
    marginTop: 8,
    marginBottom: 10,
  },

  // 7. PROPUESTA DE LA CHARLA
  talkTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: '#000000',
    marginBottom: 10,
  },
  categoriesText: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    marginBottom: 8,
  },
  blockContainer: {
    marginBottom: 10,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: 58,
    height: 58,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  qrImage: {
    width: 54,
    height: 54,
  },

  gridLabel: {
    fontFamily: 'Helvetica-Bold',
  },

  // 8. PIE DE PÁGINA (Fixed across pages)
  footer: {
    position: 'absolute',
    bottom: 16,
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