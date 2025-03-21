import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2'
import { Gender } from '@prisma/client';
import { Tokens } from './types';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private config: ConfigService
    ){}

    //Creating and storing user (signUp)
    async signUp(dto: SignUpDto): Promise<any>{
        
        const password = await argon.hash(dto.password)
        const gender = dto.gender.toString().toUpperCase()
        try {
            const user = await this.prisma.user.create({
                data: {
                    username: dto.username,
                    email: dto.email,
                    password,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    gender: gender as Gender,
                    mobile: dto.mobile,
                    social_links: dto.social_links,
                    location: dto.location,
                    notificationId: {
                        create: {
                            recommendedNotifications: true,
                            chatNotifications: true,
                            likeCommentNotifications: true
                        }
                    }
                },
                include: {notificationId: true}
            })
            const tokens = await this.getTokens(user.id, user.email) //fetch the tokens
            //await this.updateRefreshToken(user.id, tokens.refresh_token) //put the refresh token in database
            return {
                access_token: tokens.access_token,
                userDetails: user
            }  
        } catch (error) {
            // Exception for the duplicate entry and to find which value is duplicate
            if(error.code === 'P2002'){
                const mobile = await this.prisma.user.findUnique({
                    where: {
                        mobile: dto.mobile
                    }
                })
                if(mobile){
                    throw new HttpException('Duplicate mobile',HttpStatus.CONFLICT)
                }
                const email = await this.prisma.user.findUnique({
                    where: {
                        email: dto.email
                    }
                })
                if(email) {
                    throw new HttpException('Duplicate email',HttpStatus.CONFLICT)
                }
                const username = await this.prisma.user.findUnique({
                    where: {
                        username: dto.username
                    }
                })
                if(username) {
                    throw new HttpException('Duplicate username',HttpStatus.CONFLICT)
                }
            }
        }
        
    }

    //For login
    async signIn(dto: SignInDto): Promise<any>{
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })

        //For invalid email id
        if(!user) {
            throw new ForbiddenException('Invalid email id')
        }
        
        // Check for the password conversion
        const success = await argon.verify(user.password,dto.password)
        if(!success) {
            throw new ForbiddenException('Invalid Password')
        }

        //Genrate tokens
        const tokens = await this.getTokens(user.id, user.email) //fetch the tokens
        //await this.updateRefreshToken(user.id, tokens.refresh_token) //put the refresh token in database
        return {
            access_token: tokens.access_token,
            userDetails: user
        }

    }

    //For logout
    async logout(userId: number){
        await this.prisma.user.updateMany({
            where:{
                id: userId,
                refreshToken: {
                    not: null
                }
            },
            data: {
                refreshToken: null
            }
        })
        return {
            msg: 'User logged out'
        }
    }

    //For refresh the refresh token (increase validity of access token)
    async refreshTokens(userId: number, refreshToken: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if(!user || !user.refreshToken) {
            throw new ForbiddenException('Invalid User')
        }
        //console.log(user.refreshToken)
        const success = await argon.verify(user.refreshToken, refreshToken)
        if(!success) {
            throw new ForbiddenException('Invalid Credentials')
        }
        //Genrate tokens
        const tokens = await this.getTokens(user.id, user.email) //fetch the tokens
        //await this.updateRefreshToken(user.id, tokens.refresh_token) //put the refresh token in database
        return tokens
    }

    // Save the user with google signUp in database and if user already exists signin
    async saveOAuthUser(user: any) {
        const userEmail = user.profile.emails[0].value
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: userEmail
            }
        })

        //SignIn the user
        if(existingUser) {
            const signInUser: SignInDto = {
                email: userEmail,
                password: user.profile.id
            }
            return this.signIn(signInUser)
        }

        //Create new user
        const firstName = user.profile.name.givenName
        const lastName = user.profile.name.familyName
        let genratedUsername = await this.genrateUsername(user.profile.name.givenName)
        
        //Check if the genrated username already exists or not if exists try till you dont find a unqiue one
        let checkUsername = await this.prisma.user.findUnique({
            where: {
                username: genratedUsername
            }
        })
        if(checkUsername) {
            while(checkUsername) {
                genratedUsername = await this.genrateUsername(user.profile.name.givenName)
                checkUsername = await this.prisma.user.findUnique({
                    where: {
                        username: genratedUsername
                    }
                })
            }
        }

        const password = user.profile.id
        const hashedPassword = await argon.hash(password)
        const userDto = {
            username: genratedUsername,
            email: userEmail,
            password: hashedPassword,
            mobile: null,
            firstName,
            lastName,
            gender: 'OTHER' as Gender,
            social_links: [],
            location: "Ahmedabad"
        }
        const newUser = await this.prisma.user.create({
            data: userDto
        })
        const tokens = await this.getTokens(newUser.id, newUser.email) //fetch the tokens
        //await this.updateRefreshToken(newUser.id, tokens.refresh_token) //put the refresh token in database
        return tokens
    }

    //Create the refresh and access tokens
    async getTokens(userId: number, email: string){
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync({
                sub: userId,
                email,
            }, {
                secret: this.config.get<string>("ACCESS_SECRET"),
                expiresIn: '15m',
            }),
            this.jwtService.signAsync({
                sub: userId,
                email,
            }, {
                secret: this.config.get<string>("REFRESH_SECRET"),
                expiresIn:'15d'
            })

        ])

        await this.updateRefreshToken(userId, rt)
        return {
            access_token: at,
            refresh_token: rt,
        }
    }

    //function to add the refresh token in user table
    async updateRefreshToken(userId: number, refreshToken: string){
        const hash = await argon.hash(refreshToken);
        await this.prisma.user.update({
            where: {
                id: userId
            }, 
            data: {
                refreshToken: hash
            }
        })
    }

    //Genrate username for user with google SignUp
    async genrateUsername(name: string) {
        const random = Math.floor(1000 + Math.random() * 9000).toString();
        const username = name + random
        return username.toLowerCase()
    }
    
}
