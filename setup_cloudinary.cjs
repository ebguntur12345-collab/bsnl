const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dimpqnpdu', 
  api_key: '928189719839499', 
  api_secret: 'tXwsEkp9WmsH0SsRvDEKk2kItzI' 
});

cloudinary.api.create_upload_preset({
  name: "bsnl_unsigned_preset",
  unsigned: true,
  folder: "bsnl_pdfs",
  allowed_formats: "pdf"
})
.then(result => console.log("SUCCESS_PRESET:" + result.name))
.catch(error => console.error("ERROR:", error));
