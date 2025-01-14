import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PostService } from './post.service';
import { FileInterceptor, MulterModule } from '@nestjs/platform-express';
import { AddPostDto } from './dto';
import { GetCurrentUserId } from 'src/auth/common/decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { multerOptions } from 'src/multer/multer.options';

MulterModule.register({
    storage: diskStorage({
        destination: './uploads',
        filename(req, file, callback) {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
           const ext = extname(file.originalname); // Get file extension
           callback(null, `${file.fieldname}-${uniqueSuffix}-${ext}`); // Save with unique name
        },
    })
})

@Controller('post')
export class PostController {

    constructor(private postService: PostService) {}
    

    @Get('getPosts')
    @HttpCode(HttpStatus.OK)
    async getAllPosts(){
        return this.postService.getAllPosts()
    }

    @Get(':postId')
    async getPostById(@Param('postId',ParseIntPipe)postId: number) {
        return this.postService.getPostById(postId)   
    }

    @Get('user/:userId')
    async getPostsOfUser(@Param('userId',ParseIntPipe)userId: number) {
        return this.postService.getPostsOfUser(userId)
    }

    @Post()
    @UseInterceptors(FileInterceptor('image',multerOptions))
    async addPost(
        @UploadedFile() images: Express.Multer.File,
        @Body() dto: AddPostDto,
        @GetCurrentUserId() userId: number
    ) {
        console.log(images); // Check the image object in the logs
        // image.path will give you the path to the saved file
        return this.postService.addPost(dto, images, userId);
    }
    async updatePost() {}

    @Delete('delete/:postId')
    async deletePost(
        @Param('postId',ParseIntPipe) postId: number,
        @GetCurrentUserId() userId: number
    ) {
        return await this.postService.deletePost(postId,userId)
    }
}
