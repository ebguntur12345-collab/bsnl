const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dimpqnpdu', 
  api_key: '928189719839499', 
  api_secret: 'tXwsEkp9WmsH0SsRvDEKk2kItzI' 
});

// Update the preset to be completely open and use the 'image' resource type by default
cloudinary.api.update_upload_preset("bsnl_unsigned_preset", {
  unsigned: true,
  folder: "bsnl_pdfs",
  resource_type: "auto", // Let Cloudinary decide, but usually it picks image for PDFs
  allowed_formats: null,
  access_mode: "public"
})
.then(result => console.log("SUCCESS_FINAL_PRESET"))
.catch(error => console.error("ERROR:", error));
