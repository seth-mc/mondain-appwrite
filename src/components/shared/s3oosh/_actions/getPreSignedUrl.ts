"use server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

export const s3Config = {
  region: import.meta.env.VITE_AWS_REGION,
  bucket: import.meta.env.VITE_S3_BUCKET,
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
};

export async function getPreSignedUrl(fileName: string, fileType: string, dirInBucket: string | null) {
  const client = new S3Client({
    region: s3Config.region,
    credentials: {
      accessKeyId: s3Config.accessKeyId!,
      secretAccessKey: s3Config.secretAccessKey!,
    },
  });

  const uniqueFileName = `${uuidv4()}.${fileName.split('.').pop()}`;
  const newFileName = dirInBucket ? `${dirInBucket}/${uniqueFileName}` : uniqueFileName;
  const url = await getSignedUrl(client, new PutObjectCommand({
    Bucket: s3Config.bucket,
    Key: newFileName,
    ContentType: fileType,
  }), { expiresIn: 60 });

  return { newFileName, url };
}
