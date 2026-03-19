import { ResponseHandler } from "@bookzilla/shared";
import catalogService from "../services/catalogService.js";

/**
 * Auth Controller
 * Handles admin author management requests by proxying to catalog-service
 */
class AuthorController {
  /**
   * Create a new book
   * POST /api/catalog/authors
   */
  async create(req, res) {
    const authHeader = req.headers.authorization;
    const result = await catalogService.createAuthor(req.body, req.requestId, authHeader);

    return ResponseHandler.success(
      res,
      result.data,
      result.message || "Book created successfully",
      201
    );
  }

  /**
   * Get all authors with pagination and filtering
   * GET /api/catalog/authors
   */
  async list(req, res) {
    const authHeader = req.headers.authorization;
    const result = await catalogService.getAuthors(req.query, req.requestId, authHeader);

    return ResponseHandler.success(
      res,
      result.data,
      result.message || "Authors retrieved successfully"
    );
  }

  /**
   * Get a single book by ID
   * GET /api/catalog/books/:id
   */
  async getById(req, res) {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const result = await catalogService.getBookById(id, req.requestId, authHeader);

    return ResponseHandler.success(
      res,
      result.data,
      result.message || "Book retrieved successfully"
    );
  }

  /**
   * Update a book
   * PUT /api/catalog/books/:id
   */
  async update(req, res) {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const result = await catalogService.updateBook(id, req.body, req.requestId, authHeader);

    return ResponseHandler.success(
      res,
      result.data,
      result.message || "Book updated successfully"
    );
  }

  /**
   * Delete a book
   * DELETE /api/catalog/books/:id
   */
  async delete(req, res) {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    await catalogService.deleteBook(id, req.requestId, authHeader);

    return ResponseHandler.success(res, null, "Book deleted successfully");
  }
}

export default new AuthorController();
