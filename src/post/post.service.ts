import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddPostDto, UpdatePostDto } from './dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as fs from 'fs'
import { AuthService } from 'src/auth/auth.service';
import { Mate_Type } from '@prisma/client';

@Injectable()
export class PostService {

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private cloudinaryService: CloudinaryService,
        private authService: AuthService
    ) {}

    // Retrive all the posts
    async getAllPosts(user: any) {
        //console.log(user)
        if(user == null) {
            throw new ForbiddenException('Invalid User')
        }
        const posts = await this.prisma.post.findMany({
            select: {
                id: true,
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
                        bio: true,                        
                        images: {
                                where: {
                                    imageType: 'Profile_Photo'
                                },
                                select: {
                                    url: true
                                }                     
                        }
                    }
                },
                preferedMate: true,
                like: true,
                comments: {
                    select: {
                        id: true,
                        comment: true,
                        time: true,
                        like: true,
                        user: {
                            select: {
                                username: true,
                                firstName: true,
                                lastName: true,
                                bio: true,                        
                                images: {
                                        where: {
                                            imageType: 'Profile_Photo'
                                        },
                                        select: {
                                            url: true
                                        }                     
                                }
                            }
                        },
                        reply: {
                            select: {
                                id: true,
                                like: true,
                                content: true,
                                time: true,
                                user: {
                                    select: {
                                        username: true,
                                        firstName: true,
                                        lastName: true,
                                        bio: true,                        
                                        images: {
                                                where: {
                                                    imageType: 'Profile_Photo'
                                                },
                                                select: {
                                                    url: true
                                                }                     
                                        }
                                    }
                                },
                            }
                        }
                    }
                },
                hashtag: true,
            }
        })
        const tokens = await this.authService.getTokens(user.sub,user.email)
        const access_token = tokens.access_token
        return {
            access_token,
            posts
        }
    }

    // Get a post having specific id
    async getPostById(postId: number,user: any) {
        if(user == null) {
            throw new ForbiddenException('Invalid User')
        }
        const post = await this.prisma.post.findUnique({
            where: {
                id: postId
            },
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
                comments: {
                    select: {
                        id: true,
                        comment: true,
                        like: true,
                        user: {
                            select: {
                                username: true,
                                firstName: true,
                                lastName: true,
                            }
                        },
                        reply: {
                            select: {
                                id: true,
                                like: true,
                                content: true,
                                time: true,
                                user: {
                                    select: {
                                        id: true,
                                        username: true,
                                        firstName: true,
                                        lastName: true,
                                    }
                                }
                            }
                        }
                    }
                },
                hashtag: true,
            }
        })

        if(!post) {
            throw new ForbiddenException('No post with this id found')
        }
        const tokens = await this.authService.getTokens(user.sub,user.email)
        const access_token = tokens.access_token
        return {
            access_token,
            post
        }
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
            },
            select: {
                id: true,
                description: true,
                time: true,
                budget: true,
                trip_duration: true,
                budget_type: true,
                images: true,
                start_date: true,
                end_date: true,
                user: {
                    select: {
                        username: true,
                        firstName: true,
                        lastName: true,
                    }
                },
                preferedMate: true,
                like: true,
                comments: {
                    select:{
                        id: true,
                        comment: true,
                        like: true,
                        user: {
                            select: {
                                username: true,
                                firstName: true,
                                lastName: true,
                            }
                        },
                        reply: {
                            select: {
                                id: true,
                                like: true,
                                content: true,
                                time: true,
                                user: {
                                    select: {
                                        id: true,
                                        username: true,
                                        firstName: true,
                                        lastName: true,
                                    }
                                }
                            }
                        }
                    }
                },
                hashtag: true,
            }
        })
        const tokens = await this.authService.getTokens(userId,user.email)
        const access_token = tokens.access_token
        return {
            access_token,
            posts
        }
    }

    // Create a post
    async addPost(dto: AddPostDto, images: Array<Express.Multer.File>, userId: number) {
        
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if(!user) {
            throw new ForbiddenException('Invalid User')
        }
        //Logic for post without images
        const budget = parseInt(dto.budget)

        const hashtags = dto.hashtags; // Array of hashtags from the DTO

    // Prepare the hashtag processing
    const processedHashtags = await Promise.all(
        hashtags.map(async (hashtag) => {
          const existingHashtag = await this.prisma.hashtag.findUnique({
            where: { hashtag }, // Explicitly use the unique key
          });
    
          if (existingHashtag) {
            // If the hashtag exists, connect it
            return { id: existingHashtag.id };
          } else {
            // If the hashtag doesn't exist, create it
            const newHashtag = await this.prisma.hashtag.create({
              data: { hashtag },
            });
            return { id: newHashtag.id };
          }
        })
    )

        if(!images || images.length === 0) {
            const newPost = await this.prisma.post.create({
                data: {
                    user: {
                        connect: {id: userId}
                    },
                    location: dto.location,
                    description: dto.description,
                    budget,
                    budget_type: dto.budget_type,
                    trip_duration: dto.trip_duration,
                    start_date: dto.startDate,
                    end_date: dto.endDate,
                }
            })
            await this.prisma.postHashtag.createMany({
                data: processedHashtags.map((hashtag) => ({
                  postId: newPost.id,
                  hashtagId: hashtag.id,
                })),
              });
            const tokens = await this.authService.getTokens(userId,user.email)
            const access_token = tokens.access_token
            return {
                access_token,
                newPost
            }
        }
        //Logic for post with image
        try {
                // Upload the file on cloudinary

                const uploadedImages = await Promise.all(
                    images.map(async (image) => {
                        const uploadResult = await this.cloudinaryService.uploadOnCloudinary(image.path)        
                        return {
                            url: uploadResult.secure_url,
                            public_id: uploadResult.public_id
                        }
                    })
                )
                //const uploadResult = await this.cloudinaryService.uploadOnCloudinary(images.path)
                //const imageUrl = uploadResult.secure_url // Url of the post image of cloudinary
                //const image_publicId = uploadResult.public_id // Public id of the image uploaded on cloudinary
                const preferedMates = dto.preferedMate.map((mate: string) => mate as Mate_Type)
                const post = await this.prisma.post.create({
                    data: {
                        user: {
                            connect: {id: userId}
                        },
                        location: dto.location,
                        description: dto.description,
                        budget,
                        budget_type: dto.budget_type,
                        trip_duration: dto.trip_duration,
                        preferedMate: preferedMates,
                        start_date: dto.startDate,
                        end_date: dto.endDate,
                        images: {
                            create: uploadedImages
                        },
                    }
                })
                await this.prisma.postHashtag.createMany({
                    data: processedHashtags.map((hashtag) => ({
                      postId: post.id,
                      hashtagId: hashtag.id,
                    })),
                  });
                const tokens = await this.authService.getTokens(userId,user.email)
                const access_token = tokens.access_token
                return {access_token,post}
        } catch (error) {
            console.log(error)
            throw new ForbiddenException(error)   
        } finally {
            // Remove the image that is stored locally
            images.forEach((image) => {
                fs.unlink(image.path, (err) => {});
            })
        }
    }

    async updatePost(dto: UpdatePostDto, postId: number, userId: number) {
        
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        
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

        const tokens = await this.authService.getTokens(userId,user.email)
        const access_token = tokens.access_token
        return {access_token, updatedPost}
    }

    // Delete a specific post
    async deletePost(postId: number, userId: number,user: any) {

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
        publicIds.forEach(async (publicId) => {
            const status = await this.cloudinaryService.deleteFromCloudinary(publicId)
        })
        
        
        // Delete the image before deleting the post
        // const removedImage = await this.prisma.image.delete({
        //     where: {
        //         id: imageId
        //     }
        // })
        // if(!removedImage) {
        //     throw new ForbiddenException('Unable to delete the image')
        // }

        // Delete the post after deleting image
        const response =  await this.prisma.post.delete({
            where: {
                id: postId
            }
        })
        const tokens = await this.authService.getTokens(userId,user.email)
        const access_token = tokens.access_token
        return {access_token,response}
    }
}
