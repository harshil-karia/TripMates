import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddPostDto, UpdatePostDto } from './dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as fs from 'fs'

@Injectable()
export class PostService {

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private cloudinaryService: CloudinaryService
    ) {}

    // Retrive all the posts
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

    // Get a post having specific id
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

    // Get all posts of a specific user 
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

    // Create a post
    async addPost(dto: AddPostDto, images: Express.Multer.File, userId: number) {
        
        //Logic for post without images
        const budget = parseInt(dto.budget)
        if(!images) {
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
        //Logic for post with image
        try {
                // Upload the file on cloudinary
                const uploadResult = await this.cloudinaryService.uploadOnCloudinary(images.path)
                const imageUrl = uploadResult.secure_url // Url of the post image of cloudinary
                const image_publicId = uploadResult.public_id // Public id of the image uploaded on cloudinary


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
            throw new ForbiddenException("Unable to upload",error)   
        } finally {
            // Remove the image that is stored locally
            fs.unlink(images.path, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                } else {
                  console.log('File deleted from local storage');
                }
              });
        }
    }

    async updatePost(dto: UpdatePostDto, postId: number, userId: number) {
        const post = await this.prisma.post.findUnique({
            where: {
                id: postId
            }
        })
        
        if(!post) {
            throw new ForbiddenException('Invalid post id')
        }

        if(post.userId !== userId) {
            throw new ForbiddenException('You are not authorized to update post')
        }

        const filteredData = Object.fromEntries(
            Object.entries(dto).filter(([_, value]) => value !== undefined)
        )

        const updatedPost = await this.prisma.post.update({
            where: {
                id: postId
            },
            data: filteredData
        })

        return updatedPost
    }

    // Delete a specific post
    async deletePost(postId: number, userId: number) {

        // Find the post of postId
        const post = await this.prisma.post.findUnique({
            where: {
                id: postId
            },
            select: {
                id: true,
                images: {
                    select: {
                        id: true,
                        public_id: true,
                        url: true,
                    }
                },
                userId: true
            }
        })
        if(!post) {
            throw new ForbiddenException('No post with this id found')
        }

        // Check if the user owns the post or not
        if(post.userId !== userId) {
            throw new ForbiddenException('You are not authorized to delete the post')
        }

        // Get the public id of cloudinary image and image id of the post
        const publicIds = post.images.map((image) => image.public_id)
        const ids = post.images.map((image) => image.id)
        const imageId = ids[0]

        // Remove the image from cloudinary
        const status = await this.cloudinaryService.deleteFromCloudinary(publicIds[0])
        
        // Delete the image before deleting the post
        const removedImage = await this.prisma.image.delete({
            where: {
                id: imageId
            }
        })
        if(!removedImage) {
            throw new ForbiddenException('Unable to delete the image')
        }

        // Delete the post after deleting image
        const response =  await this.prisma.post.delete({
            where: {
                id: postId
            }
        })
        return response
    }
}
