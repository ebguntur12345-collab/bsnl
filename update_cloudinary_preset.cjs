const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dimpqnpdu', 
  api_key: '928189719839499', 
  api_secret: 'tXwsEkp9WmsH0SsRvDEKk2kItzI' 
});

// Update the preset to allow auto resource type and avoid format restrictions that might block legitimate PDFs
cloudinary.api.update_upload_preset("bsnl_unsigned_preset", {
  unsigned: true,
  folder: "bsnl_pdfs",
  resource_type: "auto",
  allowed_formats: "pdf,jpg,png" 
})
.then(result => console.log("SUCCESS_UPDATE_PRESET:" + result.name))
.catch(error => console.error("ERROR:", error));
