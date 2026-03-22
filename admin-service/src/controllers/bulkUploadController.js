import xlsx from "xlsx";
import { ResponseHandler, ValidationError } from "@bookzilla/shared";
import catalogService from "../services/catalogService.js";

class BulkUploadController {
  async uploadAuthors(req, res) {
    if (!req.file) throw new ValidationError("No file uploaded");

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!rows.length) throw new ValidationError("File is empty");

    const result = await catalogService.bulkCreateAuthors(
      { authors: rows },
      req.requestId,
      req.headers.authorization
    );

    return ResponseHandler.success(res, result.data, result.message || "Bulk author upload complete", 201);
  }

  async uploadBooks(req, res) {
    if (!req.file) throw new ValidationError("No file uploaded");

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!rows.length) throw new ValidationError("File is empty");

    const result = await catalogService.bulkCreateBooks(
      { books: rows },
      req.requestId,
      req.headers.authorization
    );

    return ResponseHandler.success(res, result.data, result.message || "Bulk book upload complete", 201);
  }
}

export default new BulkUploadController();
