import { Controller, Delete, Param, ParseIntPipe, Post } from '@nestjs/common';
import { LikesService } from './likes.service';
import { GetCurrentUser, GetCurrentUserId } from 'src/auth/common/decorator';

@Controller('likes')
export class LikesController {
    constructor(
        private likeService: LikesService
    ) {}
    @Post('/addLike/:postId')
    async addLike(
        @Param('postId',ParseIntPipe) postId: number,
        @GetCurrentUserId() userId: number,
        @GetCurrentUser() user: any
    ) {
        return this.likeService.addLike(postId,userId,user)
    }

    @Delete('removeLike/:postId')
    async removeLike(
        @Param('postId',ParseIntPipe) postId: number,
        @GetCurrentUserId() userId: number,
        @GetCurrentUser() user:any
    ) {
        return this.likeService.removeLike(postId, userId,user)
    }
}
