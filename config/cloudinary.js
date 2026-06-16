
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only jpg, jpeg, png, webp allowed'), false);
  }
};

export const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('profilePicture');

export const uploadPortfolio = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).array('portfolio', 5);

export const uploadServiceImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB
}).single('serviceImage');


 export const uploadToCloudinary = async (buffer, folder) => {
  return new Promise((resolve, reject) => {
    // Buffer ko base64 mein convert karo
    const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    
    cloudinary.uploader.upload(
      base64,
      {
        folder: folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
};

export const deleteFromCloudinary = async (imageUrl) => {
  const parts = imageUrl.split('/');
  const folder = 'service-marketplace/portfolio';
  const filename = parts[parts.length - 1].split('.')[0];
  const publicId = `${folder}/${filename}`;
  return await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;