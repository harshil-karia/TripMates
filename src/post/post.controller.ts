import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { PostService } from './post.service';
import { FileInterceptor, FilesInterceptor, MulterModule } from '@nestjs/platform-express';
import { AddPostDto, UpdatePostDto } from './dto';
import { GetCurrentUser, GetCurrentUserId } from 'src/auth/common/decorator';
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
    async getAllPosts(@GetCurrentUser() user: any){
        return this.postService.getAllPosts(user)
    }

    @Get(':postId')
    @HttpCode(HttpStatus.OK)
    async getPostById(
        @Param('postId',ParseIntPipe)postId: number,
        @GetCurrentUser() user: any
    ) {
        return this.postService.getPostById(postId,user)   
    }

    @Get('user/:userId')
    @HttpCode(HttpStatus.OK)
    async getPostsOfUser(
        @Param('userId',ParseIntPipe)userId: number,
        @GetCurrentUser() user: any
    ) {
        return this.postService.getPostsOfUser(userId)
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FilesInterceptor('image',10))
    async addPost(
        @UploadedFiles() images: Array<Express.Multer.File>,
        @Body() dto: AddPostDto,
        @GetCurrentUserId() userId: number
    ) {
        return this.postService.addPost(dto, images, userId);
    }

    @Patch('updatePost/:postId')
    @HttpCode(HttpStatus.OK)
    updatePost(
        @Param('postId', ParseIntPipe) postId: number,
        @Body() dto: UpdatePostDto,
        @GetCurrentUserId() userId: number
    ) {
        return this.postService.updatePost(dto,postId,userId)
    }

    @Delete('delete/:postId')
    @HttpCode(HttpStatus.OK)
    async deletePost(
        @Param('postId',ParseIntPipe) postId: number,
        @GetCurrentUserId() userId: number,
        @GetCurrentUser() user: any
    ) {
        return await this.postService.deletePost(postId,userId,user)
    }
}
