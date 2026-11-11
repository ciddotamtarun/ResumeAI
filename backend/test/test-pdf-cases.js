const fs = require('fs');
const path = require('path');
const { parseResume } = require('../dist/services/parser.service');

async function testPdfParsing() {
  const tmpDir = path.join(__dirname, 'tmp-pdfs');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  // 1. Empty PDF
  const emptyPdf = path.join(tmpDir, 'empty.pdf');
  fs.writeFileSync(emptyPdf, Buffer.alloc(0));

  // 2. Corrupt PDF
  const corruptPdf = path.join(tmpDir, 'corrupt.pdf');
  fs.writeFileSync(corruptPdf, Buffer.from('NOT A REAL PDF FILE HEADER %%%%'));

  // 3. Valid text PDF (minimal PDF structure)
  // We can test pdfParse behavior on corrupt/empty
  console.log('--- Testing empty PDF ---');
  try {
    await parseResume(emptyPdf, 'application/pdf');
    console.log('Empty PDF succeeded (unexpected!)');
  } catch (e) {
    console.log('Empty PDF threw as expected:', e.message);
  }

  console.log('--- Testing corrupt PDF ---');
  try {
    await parseResume(corruptPdf, 'application/pdf');
    console.log('Corrupt PDF succeeded (unexpected!)');
  } catch (e) {
    console.log('Corrupt PDF threw as expected:', e.message);
  }

  // Cleanup tmpDir
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
}

testPdfParsing();
