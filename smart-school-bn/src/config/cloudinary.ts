import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";
import path from "path";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  mimetype: string,
  fileName?: string
) => {
  return new Promise<string>((resolve, reject) => {
    let resourceType: "image" | "video" | "raw" = "raw";

    if (mimetype.startsWith("image/")) resourceType = "image";
    else if (mimetype.startsWith("audio/") || mimetype.startsWith("video/")) resourceType = "video";

    const extension = mimetype.split("/")[1] || "file";
    const baseName = fileName ? path.parse(fileName).name : uuidv4();

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "lesson_contents",
        resource_type: resourceType,
        public_id: `${baseName}.${extension}`,
        use_filename: true,
        unique_filename: false,
      },
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
