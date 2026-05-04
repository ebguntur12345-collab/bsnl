const axios = require('axios');
const fs = require('fs');

const CLOUD_NAME = 'dimpqnpdu';
const UPLOAD_PRESET = 'bsnl_unsigned_preset';

async function testUpload() {
  // 1. Create a dummy PDF content
  const dummyPdfContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td (TEST PDF FILE) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000223 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n318\n%%EOF';
  
  const blob = Buffer.from(dummyPdfContent, 'utf-8');

  // 2. Upload to RAW bucket
  const formData = new URLSearchParams();
  formData.append('file', 'data:application/pdf;base64,' + blob.toString('base64'));
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('public_id', 'test_manual_pdf_' + Date.now());

  console.log("Uploading to RAW bucket...");
  try {
    const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, formData);
    console.log("UPLOAD_SUCCESS!");
    console.log("SECURE_URL:", res.data.secure_url);
  } catch (err) {
    console.error("UPLOAD_FAILED:", err.response ? err.response.data : err.message);
  }
}

testUpload();
