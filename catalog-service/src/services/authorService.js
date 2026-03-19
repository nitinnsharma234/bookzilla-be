
import { prisma } from "@bookzilla/database";



class AuthorService {
    async createAuthor(authorData) {
        const {
            name,
            bio,
            birthDate,
            photoUrl,
            nationality
        } = authorData
    
    const author = await prisma.author.create({
data:{
            name,
            bio,
            birthDate,
            photoUrl,
            nationality 
}
    });
     return {
        id: author.id, 
        name: author.name, 
        bio : author.bio, 
        birthDate : author.birthDate, 
        photoUrl : author.photoUrl, 
        nationality: author.nationality,
        createdAt: author.createdAt, 

     }
}
async fetchAuthors(){
    return await prisma.author.findMany();
}
}


export default new AuthorService();