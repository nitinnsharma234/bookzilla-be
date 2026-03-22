import multer from "multer";
import { Router } from "express";
import { asyncHandler, authenticateToken, requireAdmin } from "@bookzilla/shared";
import bulkUploadController from "../../controllers/bulkUploadController.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      cb(null, true);
    } else {
      cb(new Error("Only .xlsx files are allowed"), false);
    }
  },
});

router.post("/authors/upload", authenticateToken, requireAdmin, upload.single("file"), asyncHandler(bulkUploadController.uploadAuthors.bind(bulkUploadController)));
router.post("/books/upload", authenticateToken, requireAdmin, upload.single("file"), asyncHandler(bulkUploadController.uploadBooks.bind(bulkUploadController)));

export default router;
