// import multer from 'multer';
// import multerS3 from 'multer-s3';
// import s3 from '../config/aws.js';
// import path from 'path';

// const upload = multer({
//   storage: multerS3({
//     s3,
//     bucket: process.env.AWS_S3_BUCKET_NAME,
//     acl: 'public-read', // Optional: Use 'private' for signed URLs
//     key: (req, file, cb) => {
//       const uniqueName = `${Date.now().toString()}-${file.originalname}`;
//       cb(null, uniqueName);
//     }
//   }),
//   fileFilter: (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (!['.png', '.jpg', '.jpeg', '.pdf'].includes(ext)) {
//       return cb(new Error('Only images and PDFs are allowed'), false);
//     }
//     cb(null, true);
//   }
// });

// export default upload;



import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'service_requests',   // optional
    resource_type: 'auto',
    allowed_formats: ['jpg','jpeg','png','pdf','doc','docx'],
  },
});

const parser = multer({ storage });

export default parser;

