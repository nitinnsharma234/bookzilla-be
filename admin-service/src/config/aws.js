/**
 * AWS Configuration
 * Replace these dummy values with your actual AWS credentials
 */
export default {
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "YOUR_ACCESS_KEY_ID",
    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY || "YOUR_SECRET_ACCESS_KEY",
  },
  s3: {
    bucket: process.env.AWS_S3_BUCKET || "your-bookzilla-bucket",
    folder: process.env.AWS_S3_FOLDER || "uploads",
  },
  cloudfront: {
    url: process.env.CLOUDFRONT_URL || "https://d1234abcdef.cloudfront.net",
  },
};
