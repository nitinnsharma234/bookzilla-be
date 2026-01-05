import { Router } from "express";
import multer from "multer";
import { asyncHandler, authenticateToken } from "@bookzilla/shared";
import mediaController from "../controllers/mediaController.js";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG images are allowed"), false);
    }
  },
});

/**
 * @swagger
 * /api/media/upload:
 *   post:
 *     summary: Upload an image
 *     description: Upload a JPEG image to S3 and get CloudFront CDN URL
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: JPEG image file (max 5MB)
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Image uploaded successfully
 *                 data:
 *                   $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Invalid file type or no file provided
 *       401:
 *         description: Unauthorized - No token provided
 *       413:
 *         description: File too large (max 5MB)
 */
router.post(
  "/upload",
  authenticateToken(),
  upload.single("image"),
  asyncHandler(mediaController.uploadImage.bind(mediaController))
);

export default router;
