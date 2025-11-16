import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js"; 

// const storage = multer.diskStorage({
//     destination: function(req, file, cb){
//         cb(null, 'uploads/')
//     },

//     filename: function(req, file, cb){
//         const uniqueName = Date.now() + '-' + file.originalname;
//         cb(null, uniqueName)
//     }
// });

const storage = new CloudinaryStorage({cloudinary,
  params: {
    folder: "mern_uploads",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
  },
});

export const fileUpload = multer({storage})