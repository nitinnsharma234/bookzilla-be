import { ResponseHandler, ValidationError } from "@bookzilla/shared";
import authorService from "../services/authorService.js";

class AuthorController {
  async list(req, res) {
    const result = await authorService.getAuthors(req.query);
    return ResponseHandler.success(res, result, "Authors retrieved successfully");
  }

  async getById(req, res) {
    const author = await authorService.getAuthorById(req.params.id);
    return ResponseHandler.success(res, author, "Author retrieved successfully");
  }

  async create(req, res) {
    const author = await authorService.createAuthor(req.body);
    return ResponseHandler.success(res, author, "Author created successfully", 201);
  }

  async update(req, res) {
    const author = await authorService.updateAuthor(req.params.id, req.body);
    return ResponseHandler.success(res, author, "Author updated successfully");
  }

  async delete(req, res) {
    await authorService.deleteAuthor(req.params.id);
    return ResponseHandler.success(res, null, "Author deleted successfully");
  }

  async bulkCreate(req, res) {
    const { authors } = req.body;
    if (!Array.isArray(authors) || !authors.length) {
      throw new ValidationError("authors array is required");
    }
    const result = await authorService.bulkCreateAuthors(authors);
    return ResponseHandler.success(res, result, "Bulk author upload complete", 201);
  }
}

export default new AuthorController();
