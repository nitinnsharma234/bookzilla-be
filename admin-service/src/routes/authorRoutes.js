import { Router } from "express";
import { asyncHandler } from "@bookzilla/shared";

import authorController from "../controllers/authorController.js";

const router = Router();

router.post("/", asyncHandler(authorController.create.bind(authorController)));


export default router;