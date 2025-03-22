import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResetPasswordDto, SettingsUpdationDto, UpdatePasswordDto, UpdateUserDto } from './dto';
import * as argon from 'argon2'

import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/mail/mail.service';
import { Request } from 'express';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
        private jwtService: JwtService,
        private cloudinaryService: CloudinaryService,
        private authService: AuthService,
        private mailService: MailService
        
    ){}

    //Update the user
    async updateUser(userId: number, dto: UpdateUserDto){

        const filteredData = Object.fromEntries(
            Object.entries(dto).filter(([_, value]) => value !== undefined)
        )
        try{
            const user = await this.prisma.user.update({
                where: {
                    id: userId,
                    refreshToken: {
                        not: null
                    }
                },
                data: filteredData
            })
            const tokens = await this.updateAccessToken(userId,user.email) //Update the access token
            delete user.refreshToken
            delete user.password
            return {
                user,
                accessToken: tokens
            }
        } catch(error) {
            throw new ForbiddenException('Updation of user failed')
        }
    }

    //Genrate access token after updating the user
    async updateAccessToken(userId: number, email: string) {
        try {
            const accessToken = await this.jwtService.signAsync({
                sub: userId,
                email,
            }, {
                secret: this.config.get<string>("ACCESS_SECRET"),
                expiresIn: '15m',
            })
            return accessToken;
        } catch(error) {
            throw new ForbiddenException('Generation of token failed')
        }
    }

    async updatePassword(dto: UpdatePasswordDto) {
        const hashedPassword = await argon.hash(dto.password)
        try{
            const user = await this.prisma.user.findUnique({
                where: {
                    email: dto.email
                }
            })

            if(!user) {
                throw new ForbiddenException('No user with this email found')
            }
            await this.prisma.user.update({
                where: {
                    email: dto.email
                },
                data: {
                    password: hashedPassword
                }
            })

            return { message: 'Password updated successfully' };
            
        } catch(error) {    
            throw new ForbiddenException('Error in primsa opreation')
        }
    }

    async forgotPassword(userEmail: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: userEmail
            }
        })

        if(!user) {
            throw new ForbiddenException('No user with this email found')
        }

        const otp = this.genrateOtp()
        
        const otpJwt = await this.jwtService.signAsync({
            otp,
            userEmail
        }, {
            secret: this.config.get<string>("OTP_SECRET"),
            expiresIn: '10m'
        })

        //console.log("User email",userEmail)
        const mailStatus = await this.mailService.sendResetPasswordEmail(userEmail,otp)
        console.log("mail status ",mailStatus)
        return {jwt: otpJwt}
    }

    async resetPassword(request: Request, dto: ResetPasswordDto) {
        const authHeader = request.headers.authorization;
        const jwt = authHeader.split(' ')[1]

        try {
            
            const payload = await this.jwtService.verifyAsync(jwt,{
                secret: this.config.get<string>("OTP_SECRET")
            });
            if(payload.otp !== dto.otp) {
                throw new ForbiddenException('Invalid Otp')
            }
    
            const hashedPassword = await argon.hash(dto.password)
    
            await this.prisma.user.update({
                where: {
                    email: payload.userEmail
                },
                data: {
                    password: hashedPassword
                }
            });
    
            return {message: 'Password updated successfully'}
        
        } catch (error) {
            if(error instanceof TokenExpiredError) {
                throw new UnauthorizedException('Token Expired Please reset password again')
            }
        }
        return {message: 'Password updated successfully'}
    }

    async searchUserByUsername(username: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                username
            },
            select: {
                username: true,
                firstName: true,
                lastName: true,
                dob: true,
                gender: true,
                bio: true,
                email: true,
                mobile: true,
                location: true,
                rating: true,
                id: true,
                posts: {
                    select: {
                        like: true,
                        comments: true,
                        images: true,
                        budget: true,
                        budget_type: true,
                        description: true,
                        end_date: true,
                        location: true,
                        preferedMate: true,
                        start_date: true,
                        time: true,
                        trip_duration: true,
                        hashtag: true,
                    }
                },
                intrests: true,
                social_links: true,
                images: {
                    select: {
                        imageType: true,
                        url: true,
                    }
                }
            }
        })
        if(!user) {
            throw new ForbiddenException('Invalid username')
        }
        const tokens = await this.authService.getTokens(user.id,user.email)
        const at = tokens.access_token
        return {
            access_token: at,
            user
        };
        
    }

    async updateProfilePhoto(image: Express.Multer.File,userId: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if(!user) {
            throw new NotFoundException('User not found')
        }
        const addedImage = await this.cloudinaryService.uploadOnCloudinary(image.path)
        const findImage = await this.prisma.image.findMany({
            where: {
                userId,
                imageType: 'Profile_Photo'
            }
        })
        const tokens = await this.authService.getTokens(userId,user.email)
        const at = tokens.access_token
        if(!findImage || findImage.length === 0) {
            const profilePicture = await this.prisma.image.create({
                data: {
                    imageType: 'Profile_Photo',
                    userId,
                    url: addedImage.secure_url,
                    public_id: addedImage.public_id,                  
                }
            })
            return {
                at,
                profilePicture
            }
        } else {
            const removedImage = await this.cloudinaryService.deleteFromCloudinary(findImage[0].public_id)
            const updateProfilePicture = await this.prisma.image.update({
                where: {
                    id: findImage[0].id
                },
                data: {
                    url: addedImage.secure_url,
                    public_id: addedImage.public_id
                }
            })
            return {
                at,
                updateProfilePicture
            }
        }
        
    }

    async updateCoverPhoto(image: Express.Multer.File,userId: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if(!user) {
            throw new NotFoundException('User not found')
        }
        const addedImage = await this.cloudinaryService.uploadOnCloudinary(image.path)
        const findImage = await this.prisma.image.findMany({
            where: {
                userId,
                imageType: 'Cover_Photo'
            }
        })
        const tokens = await this.authService.getTokens(userId,user.email)
        const at = tokens.access_token
        if(!findImage || findImage.length === 0) {
            const coverPicture = await this.prisma.image.create({
                data: {
                    imageType: 'Cover_Photo',
                    userId,
                    url: addedImage.secure_url,
                    public_id: addedImage.public_id,                  
                }
            })
            return {
                at,
                coverPicture
            }
        } else {
            const removedImage = await this.cloudinaryService.deleteFromCloudinary(findImage[0].public_id)
            const updateCoverPicture = await this.prisma.image.update({
                where: {
                    id: findImage[0].id
                },
                data: {
                    url: addedImage.secure_url,
                    public_id: addedImage.public_id
                }
            })
            return {
                at,
                updateCoverPicture
            }
        }
    }

    async updateSettings(userId: number, notifications: SettingsUpdationDto) {
        const user = await this.prisma.user.findUnique({
                where: {
                    id: userId
                }
            }
        )

        if(!user) {
            throw new ForbiddenException("Unauthoirzed Access")
        }

        const updatedNotification = await this.prisma.notification.update({
            where: {
                userId
            },
            data: {
                chatNotifications: notifications.chatNotifications,
                likeCommentNotifications: notifications.likeCommentNotifications,
                recommendedNotifications: notifications.recommendedNotifications     
            }
        })
        const tokens = await this.authService.getTokens(userId,user.email)
        const at = tokens.access_token
        return {
            accessToken: at,
            message: "Notification Settings Updated"
        }
    }



    genrateOtp(): string {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        return otp;
    }

    // async sendEmail(email: string, otp: string) {
    //     //Use nodemailer and send the link and with otp and jwt
    //     console.log(email)
    //     console.log(otp)
    // }
}
