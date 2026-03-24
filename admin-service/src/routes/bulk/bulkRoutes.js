import multer from "multer";
import { Router } from "express";
import { asyncHandler, authenticateToken, requireAdmin } from "@bookzilla/shared";
import bulkUploadController from "../../controllers/bulkUploadController.js";

const router = Router();

const handleUpload = (upload) => (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "text/csv",
      "application/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .csv or .xlsx files are allowed"), false);
    }
  },
});

router.post("/authors/upload", authenticateToken(), requireAdmin, handleUpload(upload.single("file")), asyncHandler(bulkUploadController.uploadAuthors.bind(bulkUploadController)));
router.post("/books/upload", authenticateToken(), requireAdmin, handleUpload(upload.single("file")), asyncHandler(bulkUploadController.uploadBooks.bind(bulkUploadController)));


export default router;

