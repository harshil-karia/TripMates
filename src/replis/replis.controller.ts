import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ReplisService } from './replis.service';
import { GetCurrentUser, GetCurrentUserId } from 'src/auth/common/decorator';
import { AddReplyDto } from './dto';

@Controller('replies')
export class ReplisController {
    constructor(
        private repliesService: ReplisService
    ) {}

    @Get('getAllReplies')
    getAllReplies(
        @GetCurrentUser() user: any
    ) {
        return this.repliesService.getAllReplies(user)
    }

    @Get('getCommentReplies/:commentId')
    getCommentReplies(
        @Param('commentId',ParseIntPipe) commentId: number,
        @GetCurrentUser() user: any
    ) {
        return this.repliesService.getCommentReplies(commentId,user)
    }

    @Get('getPostReplies')
    getPostReplies() {
        return this.repliesService.getPostReplies()
    }

    @Get('getUserReplies')
    getUserReplies() {
        return this.repliesService.getUserReplies()
    }

    @Post('addReply/:commentId')
    addReplies(
        @Param('commentId',ParseIntPipe) commentId: number,
        @Body() dto: AddReplyDto,
        @GetCurrentUser() user: any
    ) {
        return this.repliesService.addReplies(commentId,dto,user)
    }

    @Patch('updateReply')
    updateReplies() {
        return this.repliesService.updateReplies()
    }

    @Delete('deleteReply')
    deleteReplies() {
        return this.repliesService.deleteReplies()
    }

    @Post('likeReply/:replyId')
    async likeComment(
        @Param('replyId',ParseIntPipe) replyId: number,
        @GetCurrentUserId() userId: number
    ) {
        return this.repliesService.likeReply(userId,replyId);    
    }

    @Delete('removeLike/:replyId')
    async removeLike(
        @Param('replyId',ParseIntPipe) replyId: number,
        @GetCurrentUserId() userId: number,
        @GetCurrentUser() user:any
    ) {
        return this.repliesService.removeLike(replyId, userId,user)
    }
}
