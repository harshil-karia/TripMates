import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { CommentDto } from './dto';

@Injectable()
export class CommentsService {
    constructor(
        private prisma: PrismaService,
        private authService: AuthService
    ) {}

    async addComment(postId: number, dto: CommentDto, userId: number) {
        const post = await this.prisma.post.findUnique({
            where: {
                id: postId
            }
        })

        if(!post) {
            throw new NotFoundException('Invalid Post Id')
        }

        const updatedPost = await this.prisma.post.update({
            where: {
                id: postId
            },
            data: {
                comments: {
                    create: {
                        comment: dto.comment,
                        userId
                    }
                }
            }
        })
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        const tokens = await this.authService.getTokens(userId,user.email)
        const at = tokens.access_token
        return {at,updatedPost}
    }

    async deleteComment(commentId: number,userId: number) {
        const comment = await this.prisma.comment.findUnique({
            where: {
                id: commentId
            }
        })

        if(!comment) {
            throw new NotFoundException('Invalid Comment Id')
        }
        if(comment.userId !== userId) {
            throw new ForbiddenException('Invalid User to delete comment')
        }
        const deleteComment = await this.prisma.comment.delete({
            where: {
                id: commentId
            }
        })
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        const tokens = await this.authService.getTokens(userId,user.email)
        const at = tokens.access_token
        return {at,deleteComment}
    }

    async updateComment(commentId: number,dto: CommentDto,userId: number) {
        const comment = await this.prisma.comment.findUnique({
            where: {
                id: commentId
            }
        })
        if(!comment) {
            throw new NotFoundException('Comment not found')
        }

        const updateComment = await this.prisma.comment.update({
            where: {
                id: commentId
            },
            data: {
                comment: dto.comment
            }
        })
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        const tokens = await this.authService.getTokens(userId,user.email)
        const at = tokens.access_token
        return {at,updateComment}
    }
}
