import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

export const createCloudinaryStorage = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.ST_API_KEY || process.env.API_Key, // Handling user variables
    api_secret: process.env.ST_API_SECRET || process.env.API_Secret,
  });

  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (_req, file) => {
      return {
        folder: 'omnilist_properties',
        allowed_formats: ['jpg', 'png', 'webp', 'gif'],
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      };
    },
  });
};
