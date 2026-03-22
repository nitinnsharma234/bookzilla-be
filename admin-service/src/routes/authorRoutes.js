import { Router } from "express";
import { asyncHandler, authenticateToken, requireAdmin } from "@bookzilla/shared";
import authorController from "../controllers/authorController.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Author:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "d290f1ee-6c54-4b01-90e6-d701748f0851"
 *         name:
 *           type: string
 *           example: "George Orwell"
 *         bio:
 *           type: string
 *           nullable: true
 *           example: "English novelist and essayist"
 *         photoUrl:
 *           type: string
 *           nullable: true
 *           example: "https://d1x7l5ugwu617m.cloudfront.net/assets/orwell.jpg"
 *         birthDate:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "1903-06-25"
 *         nationality:
 *           type: string
 *           nullable: true
 *           example: "British"
 *         books:
 *           type: array
 *           description: Books linked via BookAuthor junction table
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               coverImageUrl:
 *                 type: string
 *               authorOrder:
 *                 type: integer
 *                 description: Order of this author on the book (1 = primary)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AuthorCreate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "George Orwell"
 *         bio:
 *           type: string
 *           example: "English novelist and essayist"
 *         photoUrl:
 *           type: string
 *           example: "https://d1x7l5ugwu617m.cloudfront.net/assets/orwell.jpg"
 *         birthDate:
 *           type: string
 *           format: date
 *           example: "1903-06-25"
 *         nationality:
 *           type: string
 *           example: "British"
 */

/**
 * @swagger
 * /catalog/authors:
 *   get:
 *     summary: List all authors (Admin)
 *     description: Retrieve a paginated list of authors with their associated books via BookAuthor.
 *     tags: [Author Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter authors by name
 *     responses:
 *       200:
 *         description: Authors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     authors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Author'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/", authenticateToken(),requireAdmin, asyncHandler(authorController.list.bind(authorController)));

/**
 * @swagger
 * /catalog/authors/{id}:
 *   get:
 *     summary: Get an author by ID (Admin)
 *     description: Retrieve a single author including all books linked via the BookAuthor junction table.
 *     tags: [Author Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Author UUID
 *     responses:
 *       200:
 *         description: Author retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Author'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Author not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", authenticateToken(), requireAdmin, asyncHandler(authorController.getById.bind(authorController)));

/**
 * @swagger
 * /catalog/authors:
 *   post:
 *     summary: Create a new author (Admin)
 *     description: Add a new author to the catalog.
 *     tags: [Author Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthorCreate'
 *           example:
 *             name: "George Orwell"
 *             bio: "English novelist and essayist"
 *             photoUrl: "https://d1x7l5ugwu617m.cloudfront.net/assets/orwell.jpg"
 *             birthDate: "1903-06-25"
 *             nationality: "British"
 *     responses:
 *       201:
 *         description: Author created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Author created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Author'
 *       409:
 *         description: Author with this name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post("/", authenticateToken(), requireAdmin, asyncHandler(authorController.create.bind(authorController)));

/**
 * @swagger
 * /catalog/authors/{id}:
 *   put:
 *     summary: Update an author (Admin)
 *     description: Update an existing author's details. All fields are optional (partial update).
 *     tags: [Author Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Author UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthorCreate'
 *     responses:
 *       200:
 *         description: Author updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Author updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Author'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Author not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", authenticateToken(), requireAdmin, asyncHandler(authorController.update.bind(authorController)));

/**
 * @swagger
 * /catalog/authors/{id}:
 *   delete:
 *     summary: Delete an author (Admin)
 *     description: Remove an author from the catalog. Cascades to BookAuthor junction records.
 *     tags: [Author Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Author UUID
 *     responses:
 *       200:
 *         description: Author deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Author deleted successfully"
 *                 data:
 *                   nullable: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Author not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", authenticateToken(), requireAdmin, asyncHandler(authorController.delete.bind(authorController)));

export default router;
