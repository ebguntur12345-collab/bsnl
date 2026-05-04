const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dimpqnpdu', 
  api_key: '928189719839499', 
  api_secret: 'tXwsEkp9WmsH0SsRvDEKk2kItzI' 
});

// Update the preset to raw to ensure PDFs are served exactly as they were uploaded without processing
cloudinary.api.update_upload_preset("bsnl_unsigned_preset", {
  unsigned: true,
  folder: "bsnl_pdfs",
  resource_type: "raw",
  allowed_formats: null // Remove format restrictions for raw
})
.then(result => console.log("SUCCESS_RAW_PRESET"))
.catch(error => console.error("ERROR:", error));
