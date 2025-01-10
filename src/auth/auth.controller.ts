import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';
import { Tokens } from './types';
import { RefreshTokenGuard } from './common/guards';
import { GetCurrentUser, GetCurrentUserId, Public } from './common/decorator';
import { AuthGuard } from '@nestjs/passport';


@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Public()
    @HttpCode(HttpStatus.CREATED)
    @Post('signup')
    signUp(@Body() dto: SignUpDto): Promise<Tokens>{
        return this.authService.signUp(dto)
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signIn(@Body() dto: SignInDto): Promise<Tokens>{
        return this.authService.signIn(dto)
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    logout(@GetCurrentUserId() userId: number){
        // const user = req.user;
        return this.authService.logout(userId)
    }

    @Public()
    @UseGuards(RefreshTokenGuard)
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    refreshTokens(
        @GetCurrentUserId() userId: number,
        @GetCurrentUser('refreshToken') refreshToken: string
    ){
        //const user = req.user;
        return this.authService.refreshTokens(userId,refreshToken)
    }

    @Public()
    @Get('google')
    @UseGuards(AuthGuard('oauth'))
    googleAuth() {
    }

    @Public()
    @Get('google/callback')
    @UseGuards(AuthGuard('oauth'))  // Use the OAuthStrategy guard
    googleAuthRedirect() {
    // This will be called once the user is redirected back from Google
    // After successful authentication, user data will be available
        return { message: 'Authentication successful' };
    }


}
