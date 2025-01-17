import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikesService {
    constructor(
        private prisma: PrismaService,
        private authService: AuthService
    ) {}

    async findUserLike(postId: number, userId: number) {
        const post = await this.prisma.post.findUnique({
            where: {
                id: postId
            },
            select: {
                like: {
                    select: {
                        userId: true
                    }
                }
            }
        })
        const postLikes = post.like.map((like) => like.userId)
        const userFound = postLikes.find((id)=> id===userId)

        if(userFound){
            return true
        } 
        return false
    }

    async addLike(postId: number, userId: number,user:any) {
        const userFound = await this.findUserLike(postId,userId)
        if(userFound) {
            return {msg: 'Liked the post'}
        }
        const likedPost = await this.prisma.post.update({
            where: {
                id: postId
            },
            data: {
                like: {
                    create: {
                        userId: userId
                    }
                }
            }
        })
        const tokens = await this.authService.getTokens(user.sub,user.email)
        const at = tokens.access_token
        return {
            at,
            msg: 'Liked The Post',
            likedPost
        }
    }

    async removeLike(postId: number, userId: number,user:any) {
        const userFound = await this.findUserLike(postId,userId)

        if(!userFound) {
            return {msg: 'Not Liked'}
        }

        const like = await this.prisma.like.findFirst({
            where: {
                postId,
                userId
            }
        })

        const removedLike = await this.prisma.like.delete({
            where: {
                id: like.id
            }
        })
        const tokens = await this.authService.getTokens(user.sub,user.email)
        const at = tokens.access_token
        return {at,msg: 'Removed Like'}
    }
}
