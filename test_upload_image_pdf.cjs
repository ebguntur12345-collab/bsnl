const https = require('https');

const CLOUD_NAME = 'dimpqnpdu';
const UPLOAD_PRESET = 'bsnl_unsigned_preset';

async function testUpload() {
  const dummyPdfContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td (TEST PDF FILE) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000223 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n318\n%%EOF';
  const base64Data = Buffer.from(dummyPdfContent, 'utf-8').toString('base64');
  const file = 'data:application/pdf;base64,' + base64Data;

  const postData = `file=${encodeURIComponent(file)}&upload_preset=${UPLOAD_PRESET}&public_id=${encodeURIComponent('test_image_pdf_' + Date.now())}&format=pdf`;

  const options = {
    hostname: 'api.cloudinary.com',
    port: 443,
    path: `/v1_1/${CLOUD_NAME}/image/upload`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => {
      const data = JSON.parse(body);
      if (res.statusCode === 200) {
        console.log("UPLOAD_SUCCESS_IMAGE_BUCKET!");
        console.log("SECURE_URL:", data.secure_url);
      } else {
        console.error("UPLOAD_FAILED_IMAGE_BUCKET:", body);
      }
    });
  });

  req.on('error', (e) => console.error("REQ_ERROR:", e));
  req.write(postData);
  req.end();
}

testUpload();
