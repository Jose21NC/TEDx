const fs = require('fs');

const file = 'app/admin/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import logoWhite from "\.\.\/media\/logo-white\.png";\nimport \{ generateApplicantPDF \} from "\.\.\/\.\.\/lib\/pdfGenerator";\nimport logoWhite from "\.\.\/media\/logo-white\.png";\nimport \{ generateApplicantPDF \} from "\.\.\/\.\.\/lib\/pdfGenerator";/m, 'import logoWhite from "../media/logo-white.png";\nimport { generateApplicantPDF } from "../../lib/pdfGenerator";');

content = content.replace('import jsPDF from "jspdf";\nimport QRCode from "qrcode";\n', '');

fs.writeFileSync(file, content, 'utf8');
