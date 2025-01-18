import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { GetCurrentUser, GetCurrentUserId } from 'src/auth/common/decorator';
import { CommentDto } from './dto';

@Controller('comments')
export class CommentsController {
    constructor(
        private commentsService: CommentsService
    ) {}

    @Post(':postId')
    async addComment(
        @Param('postId',ParseIntPipe) postId: number,
        @Body() dto: CommentDto,
        @GetCurrentUserId() userId: number 
    ) {
        return this.commentsService.addComment(postId,dto,userId)
    }

    @Delete('deleteComment/:commentId')
    async deleteComment(
        @Param('commentId',ParseIntPipe) commentId: number,
        @GetCurrentUserId() userId: number
    ) {
        return this.commentsService.deleteComment(commentId,userId)
    }

    @Patch('updateComment/:commentId')
    async updateComment(
        @Param('commentId',ParseIntPipe) commentId: number,
        @Body() dto: CommentDto,
        @GetCurrentUserId() userId: number
    ) {
        return this.commentsService.updateComment(commentId,dto,userId)
    }


}
