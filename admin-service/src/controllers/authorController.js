import { ResponseHandler } from "@bookzilla/shared";
import catalogService from "../services/catalogService.js";

/**
 * Author Controller (Admin Service)
 * Proxies author management requests to catalog-service
 */
class AuthorController {
  /**
   * GET /catalog/authors
   * List all authors with optional pagination and search
   */
  async list(req, res) {
    const authHeader = req.headers.authorization;
    const result = await catalogService.getAuthors(req.query, req.requestId, authHeader);
    return ResponseHandler.success(res, result.data, result.message || "Authors retrieved successfully");
  }

  /**
   * GET /catalog/authors/:id
   * Get a single author by UUID, including their books (via BookAuthor)
   */
  async getById(req, res) {
    const authHeader = req.headers.authorization;
    const result = await catalogService.getAuthorById(req.params.id, req.requestId, authHeader);
    return ResponseHandler.success(res, result.data, result.message || "Author retrieved successfully");
  }

  /**
   * POST /catalog/authors
   * Create a new author
   */
  async create(req, res) {
    const authHeader = req.headers.authorization;
    const result = await catalogService.createAuthor(req.body, req.requestId, authHeader);
    return ResponseHandler.success(res, result.data, result.message || "Author created successfully", 201);
  }

  /**
   * PUT /catalog/authors/:id
   * Update an existing author (partial update supported)
   */
  async update(req, res) {
    const authHeader = req.headers.authorization;
    const result = await catalogService.updateAuthor(req.params.id, req.body, req.requestId, authHeader);
    return ResponseHandler.success(res, result.data, result.message || "Author updated successfully");
  }

  /**
   * DELETE /catalog/authors/:id
   * Delete an author (cascades to BookAuthor junction)
   */
  async delete(req, res) {
    const authHeader = req.headers.authorization;
    await catalogService.deleteAuthor(req.params.id, req.requestId, authHeader);
    return ResponseHandler.success(res, null, "Author deleted successfully");
  }
}

export default new AuthorController();
