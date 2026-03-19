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
    const { name, bio, photoUrl, birthDate, nationality } = data;

    const existing = await prisma.author.findFirst({ where: { name } });
    if (existing) throw new ConflictError(`Author with name "${name}" already exists`);

    const author = await prisma.author.create({
      data: { name, bio, photoUrl, nationality, birthDate: birthDate ? new Date(birthDate) : undefined },
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
}

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
