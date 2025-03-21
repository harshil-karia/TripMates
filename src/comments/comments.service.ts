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
        const access_token = tokens.access_token
        return {access_token,updatedPost}
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
        const access_token = tokens.access_token
        return {access_token,deleteComment}
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
        const access_token = tokens.access_token
        return {access_token,updateComment}
    }

   async likeComment(userId: number,commentId: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if(!user) {
            throw new ForbiddenException('Invalid User')
        }

        const likedComment = await this.prisma.comment.update({
            where: {
                id: commentId
            },
            data: {
                like: {
                    create: {
                        userId: userId
                    }
                }
            }
        })

        const tokens = await this.authService.getTokens(user.id,user.email)
        const access_token = tokens.access_token
        return {
            access_token,
            msg: 'Liked The Post',
            likedComment
        }
    }

    async removeLike(commentId: number, userId: number,user:any) {
        const userFound = await this.findCommentLike(commentId,userId)

        if(!userFound) {
            return {msg: 'Not Liked',status: 404}
        }

        const like = await this.prisma.like.findFirst({
            where: {
                commentId,
                userId
            }
        })

        const removedLike = await this.prisma.like.delete({
            where: {
                id: like.id
            }
        })
        const tokens = await this.authService.getTokens(user.sub,user.email)
        const access_token = tokens.access_token
        return {access_token,msg: 'Removed Like'}
    }

    async findCommentLike(commentId: number, userId: number) {
        const comments = await this.prisma.comment.findUnique({
            where: {
                id: commentId
            },
            select: {
                like: {
                    select: {
                        userId: true
                    }
                }
            }
        })
        const commentLikes = comments.like.map((like) => like.userId)
        const userFound = commentLikes  .find((id)=> id===userId)

        if(userFound){
            return true
        } 
        return false
    }

}
