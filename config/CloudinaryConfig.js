import { v2 as cloudinary } from "cloudinary";

export const cloudinaryConfig = ()=>{
    // Configuration
  cloudinary.config({
    cloud_name: "cloudvista",
    api_key: process.env.CLOUDINARY_api_key,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
  });
} 