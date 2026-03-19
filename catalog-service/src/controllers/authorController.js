
import authorService from "../services/authorService.js"
import { ResponseHandler } from "@bookzilla/shared";
class AuthorController{
    async list(req,res){
            const authors = await authorService.fetchAuthors(req.body);


    return ResponseHandler.success(res, authors, "Authors retrieved successfully");
  
    }
    async create (req,res){
          const author = await authorService.createAuthor(req.body);
    return ResponseHandler.success(res, author, "Book created successfully", 201);
 
    }

}
export default new AuthorController();