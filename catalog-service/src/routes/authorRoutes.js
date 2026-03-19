import { asyncHandler } from "@bookzilla/shared"
import {Router} from "express"
import authorController from "../controllers/authorController.js"


const router = Router()

router.get("/",asyncHandler(authorController.list.bind(authorController)))
router.post("/",asyncHandler(authorController.create.bind(authorController)))

export default router;