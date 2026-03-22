import { createHttpClient } from "@bookzilla/shared";
import servicesConfig from "../config/services.js";

/**
 * Catalog Service Client
 * HTTP client for communicating with the catalog-service
 */
class CatalogService {
  constructor() {
    this.client = createHttpClient({
      baseURL: servicesConfig.catalogService,
      serviceName: "catalog-service",
      timeout: 15000,
      retries: 2,
    });
  }

  /**
   * Create a new book
   * @param {Object} bookData - Book data to create
   * @param {string} requestId - Request ID for tracing
   * @param {string} authHeader - Authorization header to forward
   * @returns {Promise<Object>} Created book
   */
  async createBook(bookData, requestId, authHeader) {
    const response = await this.client
      .withRequestId(requestId)
      .withAuth(authHeader)
      .post("/books", bookData);
    return response.data;
  }

  /**
   * Get all books with optional filters
   * @param {Object} params - Query parameters
   * @param {string} requestId - Request ID for tracing
   * @param {string} authHeader - Authorization header to forward
   * @returns {Promise<Object>} Books list with pagination
   */
  async getBooks(params = {}, requestId, authHeader) {
    const response = await this.client
      .withRequestId(requestId)
      .withAuth(authHeader)
      .get("/books", { params });
    return response.data;
  }

  /**
   * Get a single book by ID
   * @param {string} id - Book UUID
   * @param {string} requestId - Request ID for tracing
   * @param {string} authHeader - Authorization header to forward
   * @returns {Promise<Object>} Book data
   */
  async getBookById(id, requestId, authHeader) {
    const response = await this.client
      .withRequestId(requestId)
      .withAuth(authHeader)
      .get(`/books/${id}`);
    return response.data;
  }

  /**
   * Update a book
   * @param {string} id - Book UUID
   * @param {Object} updateData - Fields to update
   * @param {string} requestId - Request ID for tracing
   * @param {string} authHeader - Authorization header to forward
   * @returns {Promise<Object>} Updated book
   */
  async updateBook(id, updateData, requestId, authHeader) {
    const response = await this.client
      .withRequestId(requestId)
      .withAuth(authHeader)
      .put(`/books/${id}`, updateData);
    return response.data;
  }

  /**
   * Delete a book
   * @param {string} id - Book UUID
   * @param {string} requestId - Request ID for tracing
   * @param {string} authHeader - Authorization header to forward
   * @returns {Promise<void>}
   */
  async deleteBook(id, requestId, authHeader) {
    const response = await this.client
      .withRequestId(requestId)
      .withAuth(authHeader)
      .delete(`/books/${id}`);
    return response.data;
  }


  async getAuthors(params = {}, requestId, authHeader) {
    const response = await this.client
      .withRequestId(requestId)
      .withAuth(authHeader)
      .get("/authors", { params });
    return response.data;
  }

  async getAuthorById(id, requestId, authHeader) {
    const response = await this.client
      .withRequestId(requestId)
      .withAuth(authHeader)
      .get(`/authors/${id}`);
    return response.data;
  }

  async createAuthor(authorData, requestId, authHeader) {
    const response = await this.client
      .withRequestId(requestId)
      .withAuth(authHeader)
      .post("/authors", authorData);
    return response.data;
  }

  async updateAuthor(id, authorData, requestId, authHeader) {
    const response = await this.client
      .withRequestId(requestId)
      .withAuth(authHeader)
      .put(`/authors/${id}`, authorData);
    return response.data;
  }

  async deleteAuthor(id, requestId, authHeader) {
    const response = await this.client
      .withRequestId(requestId)
      .withAuth(authHeader)
      .delete(`/authors/${id}`);
    return response.data;
  }

  async bulkCreateAuthors(data, requestId, authHeader) {
    const response = await this.client
      .withRequestId(requestId)
      .withAuth(authHeader)
      .post("/authors/bulk", data);
    return response.data;
  }

  async bulkCreateBooks(data, requestId, authHeader) {
    const response = await this.client
      .withRequestId(requestId)
      .withAuth(authHeader)
      .post("/books/bulk", data);
    return response.data;
  }
}

export default new CatalogService();
