import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddReplyDto } from './dto';

@Injectable()
export class ReplisService {

    constructor(
        private authService: AuthService,
        private prisma: PrismaService,
    ) {}

    async getAllReplies(user: any) {
        if(!user) {
            throw new UnauthorizedException('Please Login First')
        }
        const allReplies = await this.prisma.reply.findMany({
            select: {
                content: true
            }
        })
        const tokens = await this.authService.getTokens(user.sub,user.email)
        const at = tokens.access_token
        return {
            at,
            allReplies
        }
    }

    async getCommentReplies(commentId: number, user: any) {
        if(!user) {
            throw new UnauthorizedException('Please Login First')
        }
        if(!commentId) {
            throw new NotFoundException('Comment Not Found')
        }

        const replies = await this.prisma.reply.findMany({
            where: {
                commentId
            },
            select: {
                content: true,
                time: true,
                user: {
                    select: {
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                }                
            }
        })
        const tokens = await this.authService.getTokens(user.sub,user.email)
        const at = tokens.access_token

        return {
            at,
            replies
        }
    }

    async getPostReplies() {}

    async getUserReplies() {}

    async addReplies(commentId: number,dto: AddReplyDto,user: any) {
        if(!commentId) {
            throw new NotFoundException("Comment id not found")
        }
        if(!user) {
            throw new ForbiddenException('Unauthorized User')
        }

        const comment = await this.prisma.comment.findUnique({
            where: {
                id: commentId
            }
        })
        if(!comment) {
            throw new NotFoundException('Comment with this id doesnot exist')
        }

        const reply = await this.prisma.reply.create({
            data: {
                content: dto.reply,
                userId: user.sub,
                commentId
            }
        })

        const tokens = await this.authService.getTokens(user.sub,user.email)
        const at = tokens.access_token
        return {
            at,
            reply
        }
    }

    async likeReply(userId: number,replyId: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if(!user) {
            throw new ForbiddenException('Invalid User')
        }

        const likedComment = await this.prisma.reply.update({
            where: {
                id: replyId
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

    async removeLike(replyId: number, userId: number,user:any) {
        const userFound = await this.findReplyLike(replyId,userId)

        if(!userFound) {
            return {msg: 'Not Liked',status: 404}
        }

        const like = await this.prisma.like.findFirst({
            where: {
                replyId,
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

    async findReplyLike(replyId: number, userId: number) {
        const replies = await this.prisma.reply.findUnique({
            where: {
                id: replyId
            },
            select: {
                like: {
                    select: {
                        userId: true
                    }
                }
            }
        })
        const replyLikes = replies.like.map((like) => like.userId)
        const userFound = replyLikes.find((id)=> id===userId)

        if(userFound){
            return true
        } 
        return false
    }

    async updateReplies() {}

    async deleteReplies() {}
}
