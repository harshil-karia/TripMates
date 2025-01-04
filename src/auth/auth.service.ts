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
    async signUp(dto: SignUpDto): Promise<Tokens>{
        
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
                    location: dto.location
                }
            })
            const tokens = await this.getTokens(user.id, user.email) //fetch the tokens
            await this.updateRefreshToken(user.id, tokens.refresh_token) //put the refresh token in database
            return tokens  
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
    async signIn(dto: SignInDto): Promise<Tokens>{
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
        await this.updateRefreshToken(user.id, tokens.refresh_token) //put the refresh token in database
        return tokens

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
        console.log()
        const success = await argon.verify(user.refreshToken, refreshToken)
        if(!success) {
            throw new ForbiddenException('Invalid Credentials')
        }
        //Genrate tokens
        const tokens = await this.getTokens(user.id, user.email) //fetch the tokens
        await this.updateRefreshToken(user.id, tokens.refresh_token) //put the refresh token in database
        return tokens
    }

    //Create the refresh and access tokens
    async getTokens(userId: number, email: string){
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync({
                sub: userId,
                email,
            }, {
                secret: 'at-secret',
                expiresIn: 60 * 15,
            }),
            this.jwtService.signAsync({
                sub: userId,
                email,
            }, {
                secret: 'rt-secret',
                expiresIn: 60 * 60 * 24 * 15
            })

        ])
        
        return {
            access_token: at,
            refresh_token: rt
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
    
}
