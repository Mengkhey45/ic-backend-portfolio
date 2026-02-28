import { S3Client } from "@aws-sdk/client-s3";

let r2Instance = null;

export const getR2Client = () => {
  if (!r2Instance) {
    console.log("Initializing R2 Client... 📦");
    r2Instance = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT?.trim(),
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY?.trim(),
        secretAccessKey: process.env.R2_SECRET_KEY?.trim()
      },
      forcePathStyle: true
    });
  }
  return r2Instance;
};