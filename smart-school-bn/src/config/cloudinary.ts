import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Upload a file buffer to Cloudinary
 * Works with multer.memoryStorage()
 */
export const uploadBufferToCloudinary = async (buffer: Buffer, mimetype: string) => {
  return new Promise<string>((resolve, reject) => {
    let resourceType: "image" | "video" | "raw" = "raw";

    if (mimetype.startsWith("image/")) resourceType = "image";
    else if (mimetype.startsWith("audio/") || mimetype.startsWith("video/")) resourceType = "video";

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "lesson_contents", resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload failed"));
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export default cloudinary;
