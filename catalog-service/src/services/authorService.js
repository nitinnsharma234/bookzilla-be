import { prisma } from "@bookzilla/database";
import { NotFoundError, ConflictError } from "@bookzilla/shared";
class AuthorService {
  async getAuthors({ page = 1, limit = 20, search } = {}) {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = search
      ? { name: { contains: search, mode: "insensitive" } }
      : {};

    const [authors, total] = await Promise.all([
      prisma.author.findMany({
        where,
        skip,
        take,
        orderBy: { name: "asc" },
        include: {
          books: {
            select: {
              authorOrder: true,
              book: { select: { id: true, title: true, coverImageUrl: true } },
            },
          },
        },
      }),
      prisma.author.count({ where }),
    ]);

    return {
      authors: authors.map(formatAuthor),
      pagination: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getAuthorById(id) {
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        books: {
          orderBy: { authorOrder: "asc" },
          select: {
            authorOrder: true,
            book: { select: { id: true, title: true, coverImageUrl: true } },
          },
        },
      },
    });

    if (!author) throw new NotFoundError("Author", id);
    return formatAuthor(author);
  }

  async createAuthor(data) {
    console.log("Here is the data ",data)
    const { name, bio, profileUrl, birthDate, nationality } = data;

    const existing = await prisma.author.findFirst({ where: { name } });
    if (existing) throw new ConflictError(`Author with name "${name}" already exists`);

    const author = await prisma.author.create({
      data: { name, bio, photoUrl:profileUrl, nationality, birthDate: birthDate ? new Date(birthDate) : undefined },
      include: { books: true },
    });

    return formatAuthor(author);
  }

  async updateAuthor(id, data) {
    const existing = await prisma.author.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Author", id);

    const { name, bio, photoUrl, birthDate, nationality } = data;

    const author = await prisma.author.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(photoUrl !== undefined && { photoUrl }),
        ...(nationality !== undefined && { nationality }),
        ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
      },
      include: {
        books: {
          orderBy: { authorOrder: "asc" },
          select: {
            authorOrder: true,
            book: { select: { id: true, title: true, coverImageUrl: true } },
          },
        },
      },
    });

    return formatAuthor(author);
  }

  async deleteAuthor(id) {
    const existing = await prisma.author.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Author", id);

    await prisma.author.delete({ where: { id } });
  }

  async bulkCreateAuthors(authors) {
    const errors = [];
    const toInsert = [];

    // Check existing names in one query
    const names = authors.map((a) => a.name?.trim()).filter(Boolean);
    const existing = await prisma.author.findMany({
      where: { name: { in: names } },
      select: { name: true },
    });
    const existingNames = new Set(existing.map((a) => a.name));

    authors.forEach((row, i) => {
      const rowNum = i + 2; // +1 for header, +1 for 1-index
      if (!row.name?.trim()) {
        errors.push({ row: rowNum, field: "name", message: "name is required" });
        return;
      }
      if (existingNames.has(row.name.trim())) {
        errors.push({ row: rowNum, field: "name", message: `Author "${row.name}" already exists` });
        return;
      }
      toInsert.push({
        name: row.name.trim(),
        bio: row.bio?.trim() || null,
        photoUrl: row.photoUrl?.trim() || null,
        nationality: row.nationality?.trim() || null,
        birthDate: row.birthDate ? new Date(row.birthDate) : null,
      });
    });

    if (errors.length) {
      return { summary: { total: authors.length, inserted: 0, failed: errors.length }, errors };
    }

    await prisma.author.createMany({ data: toInsert });

    return { summary: { total: authors.length, inserted: toInsert.length, failed: 0 }, errors: [] };
  }
}
// async function deleteAuthors() {
//   const { count } = await prisma.author.deleteMany({});
//   console.log(`Deleted ${count} authors`);
// }

// deleteAuthors();
function formatAuthor(author) {
  return {
    id: author.id,
    name: author.name,
    bio: author.bio,
    photoUrl: author.photoUrl,
    birthDate: author.birthDate,
    nationality: author.nationality,
    books: (author.books ?? []).map(({ authorOrder, book }) => ({ ...book, authorOrder })),
    createdAt: author.createdAt,
    updatedAt: author.updatedAt,
  };
}

export default new AuthorService();
