import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import awsConfig from "../config/aws.js";
import { ValidationError } from "@bookzilla/shared";

const s3Client = new S3Client({
  region: awsConfig.region,
  credentials: awsConfig.credentials,
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

class MediaService {
  /**
   * Upload image to S3 and return CloudFront URL
   * @param {Object} file - Multer file object
   * @returns {Promise<Object>} Upload result with CDN URL
   */
  async uploadImage(file) {
    // Validate file exists
    if (!file) {
      throw new ValidationError("No file provided");
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new ValidationError("Only JPEG images are allowed");
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError("File size must be less than 5MB");
    }

    // Generate unique filename
    const fileExtension = "jpg";
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const s3Key = `${awsConfig.s3.folder}/${uniqueFilename}`;

    // Upload to S3
    const uploadParams = {
      Bucket: awsConfig.s3.bucket,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: "max-age=31536000", // 1 year cache
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Construct CloudFront URL
    const cdnUrl = `${awsConfig.cloudfront.url}/${s3Key}`;

    return {
      url: cdnUrl,
      key: s3Key,
      filename: uniqueFilename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}

export default new MediaService();
