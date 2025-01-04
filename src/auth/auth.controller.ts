import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';
import { Tokens } from './types';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';


@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('signup')
    signUp(@Body() dto: SignUpDto): Promise<Tokens>{
        return this.authService.signUp(dto)
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signIn(@Body() dto: SignInDto): Promise<Tokens>{
        return this.authService.signIn(dto)
    }

    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    logout(@Req() req: Request){
        const user = req.user;
        return this.authService.logout(user['sub'])
    }

    @UseGuards(AuthGuard('jwt-refresh'))
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    refreshTokens(@Req() req: Request){
        const user = req.user;
        return this.authService.refreshTokens(user['sub'],user['refreshToken'])
    }
}
