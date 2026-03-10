const fs = require('fs');

const file = 'app/admin/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace imports
content = content.replace('import logoBlack from "../media/logo-black.png";', 'import logoBlack from "../media/logo-black.png";\nimport logoWhite from "../media/logo-white.png";\nimport { generateApplicantPDF } from "../../lib/pdfGenerator";');

// Define new generatePDF
const newFunc = `  async function generatePDF(p: any) {
    setProcessing(true);
    await generateApplicantPDF(p, logoWhite.src);
    setProcessing(false);
  }

  function formatDate(value: any) {`;

content = content.replace(/async function generatePDF\(p: any\) \{[\s\S]*?function formatDate\(value: any\) \{/m, newFunc);

fs.writeFileSync(file, content, 'utf8');
