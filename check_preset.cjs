const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dimpqnpdu', 
  api_key: '928189719839499', 
  api_secret: 'tXwsEkp9WmsH0SsRvDEKk2kItzI' 
});

// Check the preset details to see if any weird transformations are applied
cloudinary.api.upload_preset("bsnl_unsigned_preset")
.then(result => console.log("PRESET_INFO:", JSON.stringify(result, null, 2)))
.catch(error => console.error("ERROR:", error));
