import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client } from "../config/r2.js";
import crypto from "crypto";

/**
 * Uploads a file to Cloudflare R2
 * @param {Object} file - The file object from multer
 * @param {string} folder - The folder to upload to (e.g. 'thumbnails', 'media')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadToR2 = async (file, folder = "uploads") => {
  if (!file) return null;

  const r2 = getR2Client();
  const fileExtension = file.originalname.split(".").pop();
  const fileName = `${folder}/${crypto.randomBytes(16).toString("hex")}.${fileExtension}`;
  
  const bucketName = process.env.R2_BUCKET || "portfolio";

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  try {
    await r2.send(command);
    
    // Construct the public URL
    // Format: https://pub-<hash>.r2.dev/filename
    const publicUrl = process.env.R2_PUBLIC_URL?.trim();
    if (!publicUrl) {
      throw new Error("R2_PUBLIC_URL is not defined in environment variables");
    }
    
    return `${publicUrl}/${fileName}`;
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw new Error("Failed to upload file to storage");
  }
};
