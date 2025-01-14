import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddPostDto } from './dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as fs from 'fs'

@Injectable()
export class PostService {

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private cloudinaryService: CloudinaryService
    ) {}

    async getAllPosts() {
        const posts = await this.prisma.post.findMany({
            select: {
                description: true,
                time: true,
                budget: true,
                trip_duration: true,
                budget_type: true,
                images: true,
                user: {
                    select: {
                        username: true,
                        firstName: true,
                        lastName: true,
                    }
                },
                preferedMate: true,
                like: true,
                comments: true,
                hashtag: true,
            }
        })
        return posts
    }

    async getPostById(postId: number) {
        const post = await this.prisma.post.findUnique({
            where: {
                id: postId
            }
        })

        if(!post) {
            throw new ForbiddenException('No post with this id found')
        }
        return post
    }

    async getPostsOfUser(userId: number) {

        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if(!user) {
            throw new ForbiddenException('Invalid User id')
        }

        const posts = await this.prisma.post.findMany({
            where: {
                userId
            }
        })
        return posts
    }

    async addPost(dto: AddPostDto, images: Express.Multer.File, userId: number) {
        
        //Logic for post without images
        const budget = parseInt(dto.budget)
        if(!images) {
            console.log('No image')
            const newPost = await this.prisma.post.create({
                data: {
                    user: {
                        connect: {id: userId}
                    },
                    description: dto.description,
                    budget,
                    budget_type: dto.budget_type,
                    trip_duration: dto.trip_duration,
                }
            })
            return newPost
        }
        //const loaclFilePath = images.map((image) => image.path)
        try {
                console.log(images)
                const uploadResult = await this.cloudinaryService.uploadOnCloudinary(images.path)
                const imageUrl = uploadResult.secure_url
                const image_publicId = uploadResult.public_id

                const post = await this.prisma.post.create({
                    data: {
                        user: {
                            connect: {id: userId}
                        },
                        description: dto.description,
                        budget,
                        budget_type: dto.budget_type,
                        trip_duration: dto.trip_duration,
                        images: {
                            create: {
                                url: imageUrl,
                                public_id: image_publicId
                            }
                        }
                    }
                })
            return post
        } catch (error) {
            //console.log(error)
            throw new ForbiddenException("Unable to upload",error)   
        } finally {
            fs.unlink(images.path, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                } else {
                  console.log('File deleted from local storage');
                }
              });
        }
    }

    async updatePost() {}

    async deletePost(postId: number, userId: number) {

        const post = await this.prisma.post.findUnique({
            where: {
                id: postId
            },
            select: {
                id: true,
                images: {
                    select: {
                        public_id: true,
                        url: true,
                    }
                }
            }
        })
        
        if(!post) {
            throw new ForbiddenException('No post with this id found')
        }
        const publicIds = post.images.map((image) => image.public_id)
        console.log(publicIds)
        const status = await this.cloudinaryService.deleteFromCloudinary(publicIds[0])
        const response =  await this.prisma.post.delete({
            where: {
                id: postId
            }
        })
        console.log(response)
        console.log(status)
        return response
    }
}
