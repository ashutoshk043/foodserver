// r2config/r2config.ts
import { S3Client } from "@aws-sdk/client-s3";
import * as dotenv from 'dotenv';
dotenv.config();

// Read from .env with fallbacks
const accountId = process.env.R2_ACCOUNT_ID;
const accessKey = process.env.R2_ACCESS_KEY || process.env.R2_ACCESS_KEY_ID;
const secretKey = process.env.R2_SECRET_KEY || process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;
const publicUrl = process.env.R2_PUBLIC_URL;

// Validate
if (!accountId) {
  throw new Error('R2_ACCOUNT_ID is required in .env file');
}
if (!accessKey) {
  throw new Error('R2_ACCESS_KEY or R2_ACCESS_KEY_ID is required');
}
if (!secretKey) {
  throw new Error('R2_SECRET_KEY or R2_SECRET_ACCESS_KEY is required');
}
if (!bucket) {
  throw new Error('R2_BUCKET is required');
}

// Create endpoint from account ID
const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

console.log('R2 Configuration:', {
  endpoint,
  bucket,
  publicUrl: publicUrl || 'not set',
  hasAccessKey: !!accessKey,
  hasSecretKey: !!secretKey,
});

export const r2Client = new S3Client({
  region: "auto",
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
  forcePathStyle: true,
});

export const R2_BUCKET_NAME = bucket;
export const R2_PUBLIC_URL_BASE = publicUrl || `https://${bucket}.${accountId}.r2.cloudflarestorage.com`;