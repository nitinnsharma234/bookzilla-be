import { ResponseHandler } from "@bookzilla/shared";
import mediaService from "../services/mediaService.js";

class MediaController {
  /**
   * Upload image to S3
   * POST /api/media/upload
   */
  async uploadImage(req, res) {
    const result = await mediaService.uploadImage(req.file);

    return ResponseHandler.success(
      res,
      result,
      "Image uploaded successfully",
      201
    );
  }
}

export default new MediaController();
