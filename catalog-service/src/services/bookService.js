import { prisma } from "@bookzilla/database";
import { NotFoundError, ConflictError } from "@bookzilla/shared";

/**
 * Book Service
 * Handles all book-related business logic and database operations
 */
class BookService {
  /**
   * Create a new book
   * @param {Object} bookData - Book data including optional authorIds and categoryIds
   * @returns {Promise<Object>} Created book with relations
   */
  async createBook(bookData) {
    const {
      isbn,
      isbn13,
      title,
      subtitle,
      description,
      publisher,
      publicationDate,
      edition,
      language = "en",
      pageCount,
      format,
      price,
      discountPrice,
      stockQuantity = 0,
      coverImageUrl,
      previewUrl,
      additionalInfo = {},
      isFeatured = false,
      isActive = true,
      authorIds = [],
      categoryIds = [],
    } = bookData;

    // Check for duplicate ISBN
    if (isbn || isbn13) {
      const existing = await prisma.book.findFirst({
        where: {
          OR: [
            isbn ? { isbn } : undefined,
            isbn13 ? { isbn13 } : undefined,
          ].filter(Boolean),
        },
      });

      if (existing) {
        throw new ConflictError("A book with this ISBN already exists");
      }
    }

    // Create book with relations
    const book = await prisma.book.create({
      data: {
        isbn,
        isbn13,
        title,
        subtitle,
        description,
        publisher,
        publicationDate: publicationDate ? new Date(publicationDate) : null,
        edition,
        language,
        pageCount,
        format,
        price,
        discountPrice,
        stockQuantity,
        coverImageUrl,
        previewUrl,
        additionalInfo,
        isFeatured,
        isActive,
        // Create author relations
        authors:
          authorIds.length > 0
            ? {
                create: authorIds.map((authorId, index) => ({
                  authorId,
                  authorOrder: index + 1,
                })),
              }
            : undefined,
        // Create category relations
        categories:
          categoryIds.length > 0
            ? {
                create: categoryIds.map((categoryId, index) => ({
                  categoryId,
                  isPrimary: index === 0,
                })),
              }
            : undefined,
      },
      include: {
        authors: {
          include: { author: true },
          orderBy: { authorOrder: "asc" },
        },
        categories: {
          include: { category: true },
          orderBy: { isPrimary: "desc" },
        },
      },
    });

    return this.formatBookResponse(book);
  }

  /**
   * Get all books with optional filtering and pagination
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-indexed)
   * @param {number} options.limit - Items per page
   * @param {string} options.search - Search term for title
   * @param {string} options.format - Filter by format
   * @param {boolean} options.isActive - Filter by active status
   * @param {boolean} options.isFeatured - Filter by featured status
   * @returns {Promise<Object>} Paginated books list
   */
  async getBooks(options = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      format,
      isActive,
      isFeatured,
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    if (format) {
      where.format = format;
    }

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    if (typeof isFeatured === "boolean") {
      where.isFeatured = isFeatured;
    }

    // Execute queries in parallel
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          authors: {
            include: { author: true },
            orderBy: { authorOrder: "asc" },
          },
          categories: {
            include: { category: true },
            orderBy: { isPrimary: "desc" },
          },
        },
      }),
      prisma.book.count({ where }),
    ]);

    return {
      books: books.map((book) => this.formatBookResponse(book)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get a single book by ID
   * @param {string} id - Book UUID
   * @returns {Promise<Object>} Book with relations
   */
  async getBookById(id) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        authors: {
          include: { author: true },
          orderBy: { authorOrder: "asc" },
        },
        categories: {
          include: { category: true },
          orderBy: { isPrimary: "desc" },
        },
      },
    });

    if (!book) {
      throw new NotFoundError("Book", id);
    }

    return this.formatBookResponse(book);
  }

  /**
   * Update a book
   * @param {string} id - Book UUID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated book
   */
  async updateBook(id, updateData) {
    // Check if book exists
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Book", id);
    }

    const { authorIds, categoryIds, publicationDate, ...data } = updateData;

    // Handle date conversion
    if (publicationDate) {
      data.publicationDate = new Date(publicationDate);
    }

    // Update book with optional author/category replacement
    const book = await prisma.book.update({
      where: { id },
      data: {
        ...data,
        ...(authorIds !== undefined && {
          authors: {
            deleteMany: {},
            create: authorIds.map((authorId, index) => ({
              authorId,
              authorOrder: index + 1,
            })),
          },
        }),
        ...(categoryIds !== undefined && {
          categories: {
            deleteMany: {},
            create: categoryIds.map((categoryId, index) => ({
              categoryId,
              isPrimary: index === 0,
            })),
          },
        }),
      },
      include: {
        authors: {
          include: { author: true },
          orderBy: { authorOrder: "asc" },
        },
        categories: {
          include: { category: true },
          orderBy: { isPrimary: "desc" },
        },
      },
    });

    return this.formatBookResponse(book);
  }

  /**
   * Delete a book
   * @param {string} id - Book UUID
   * @returns {Promise<void>}
   */
  async deleteBook(id) {
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Book", id);
    }

    await prisma.book.delete({ where: { id } });
  }

  /**
   * Format book response to flatten nested relations
   * @param {Object} book - Raw book from Prisma
   * @returns {Object} Formatted book
   */
  async bulkCreateBooks(books) {
    const errors = [];
    const toInsert = [];

    // Collect all ISBNs from the batch for duplicate check
    const isbns = books.map((b) => b.isbn != null ? b.isbn.toString().trim() : null).filter(Boolean);
    const isbn13s = books.map((b) => b.isbn13 != null ? b.isbn13.toString().trim() : null).filter(Boolean);

    const existingBooks = await prisma.book.findMany({
      where: {
        OR: [
          isbns.length ? { isbn: { in: isbns } } : undefined,
          isbn13s.length ? { isbn13: { in: isbn13s } } : undefined,
        ].filter(Boolean),
      },
      select: { isbn: true, isbn13: true },
    });

    const existingIsbns = new Set(existingBooks.map((b) => b.isbn).filter(Boolean));
    const existingIsbn13s = new Set(existingBooks.map((b) => b.isbn13).filter(Boolean));

    books.forEach((row, i) => {
      const rowNum = i + 2;

      const title = row.title != null ? row.title.toString().trim() : "";
      if (!title) {
        errors.push({ row: rowNum, field: "title", message: "title is required" });
        return;
      }
      if (!row.price) {
        errors.push({ row: rowNum, field: "price", message: "price is required" });
        return;
      }
      if (!row.format) {
        errors.push({ row: rowNum, field: "format", message: "format is required" });
        return;
      }

      const validFormats = ["HARDCOVER", "PAPERBACK", "EBOOK", "AUDIOBOOK"];
      const format = row.format.toString().trim().toUpperCase();
      if (!validFormats.includes(format)) {
        errors.push({ row: rowNum, field: "format", message: `Invalid format "${row.format}". Must be one of: ${validFormats.join(", ")}` });
        return;
      }

      const isbn = row.isbn != null ? row.isbn.toString().trim() : null;
      const isbn13 = row.isbn13 != null ? row.isbn13.toString().trim() : null;

      if (isbn && existingIsbns.has(isbn)) {
        errors.push({ row: rowNum, field: "isbn", message: `Book with ISBN "${isbn}" already exists` });
        return;
      }
      if (isbn13 && existingIsbn13s.has(isbn13)) {
        errors.push({ row: rowNum, field: "isbn13", message: `Book with ISBN-13 "${isbn13}" already exists` });
        return;
      }

      // Parse comma-separated IDs
      const authorIds = row.authorIds
        ? row.authorIds.toString().split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const categoryIds = row.categoryIds
        ? row.categoryIds.toString().split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      toInsert.push({
        isbn: isbn || null,
        isbn13: isbn13 || null,
        title,
        subtitle: row.subtitle != null ? row.subtitle.toString().trim() || null : null,
        description: row.description != null ? row.description.toString().trim() || null : null,
        publisher: row.publisher != null ? row.publisher.toString().trim() || null : null,
        publicationDate: row.publicationDate ? new Date(row.publicationDate) : null,
        edition: row.edition != null ? row.edition.toString().trim() || null : null,
        language: row.language != null ? row.language.toString().trim() || "en" : "en",
        pageCount: row.pageCount ? parseInt(row.pageCount, 10) : null,
        format,
        price: parseFloat(row.price),
        discountPrice: row.discountPrice ? parseFloat(row.discountPrice) : null,
        stockQuantity: row.stockQuantity ? parseInt(row.stockQuantity, 10) : 0,
        coverImageUrl: row.coverImageUrl != null ? row.coverImageUrl.toString().trim() || null : null,
        previewUrl: row.previewUrl != null ? row.previewUrl.toString().trim() || null : null,
        isFeatured: row.isFeatured != null ? row.isFeatured.toString().toLowerCase() === "true" : false,
        isActive: row.isActive != null ? row.isActive.toString().toLowerCase() !== "false" : true,
        authorIds,
        categoryIds,
      });
    });

    if (errors.length) {
      return { summary: { total: books.length, inserted: 0, failed: errors.length }, errors };
    }

    // Insert books one-by-one to support author/category relations
    const inserted = [];
    for (const bookData of toInsert) {
      const { authorIds, categoryIds, ...fields } = bookData;
      const book = await prisma.book.create({
        data: {
          ...fields,
          authors: authorIds.length
            ? { create: authorIds.map((authorId, idx) => ({ authorId, authorOrder: idx + 1 })) }
            : undefined,
          categories: categoryIds.length
            ? { create: categoryIds.map((categoryId, idx) => ({ categoryId, isPrimary: idx === 0 })) }
            : undefined,
        },
        include: {
          authors: { include: { author: true }, orderBy: { authorOrder: "asc" } },
          categories: { include: { category: true }, orderBy: { isPrimary: "desc" } },
        },
      });
      inserted.push(this.formatBookResponse(book));
    }

    return { summary: { total: books.length, inserted: inserted.length, failed: 0 }, errors: [], books: inserted };
  }

  formatBookResponse(book) {
    return {
      id: book.id,
      isbn: book.isbn,
      isbn13: book.isbn13,
      title: book.title,
      subtitle: book.subtitle,
      description: book.description,
      publisher: book.publisher,
      publicationDate: book.publicationDate,
      edition: book.edition,
      language: book.language,
      pageCount: book.pageCount,
      format: book.format,
      price: book.price,
      discountPrice: book.discountPrice,
      stockQuantity: book.stockQuantity,
      coverImageUrl: book.coverImageUrl,
      previewUrl: book.previewUrl,
      averageRating: book.averageRating,
      ratingsCount: book.ratingsCount,
      additionalInfo: book.additionalInfo,
      isFeatured: book.isFeatured,
      isActive: book.isActive,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      authors: book.authors?.map((ba) => ({
        id: ba.author.id,
        name: ba.author.name,
        order: ba.authorOrder,
      })),
      categories: book.categories?.map((bc) => ({
        id: bc.category.id,
        name: bc.category.name,
        slug: bc.category.slug,
        isPrimary: bc.isPrimary,
      })),
    };
  }
}

export default new BookService();
