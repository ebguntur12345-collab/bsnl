const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dimpqnpdu', 
  api_key: '928189719839499', 
  api_secret: 'tXwsEkp9WmsH0SsRvDEKk2kItzI' 
});

// Check a specific resource to see its metadata and if it's actually a valid PDF
cloudinary.api.resource("bsnl_pdfs/e5jn3vx4vcz0sovwgigk", { resource_type: "image" })
.then(result => console.log("RESOURCE_INFO:", JSON.stringify(result, null, 2)))
.catch(error => console.error("ERROR:", error));
