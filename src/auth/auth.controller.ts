import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';
import { Tokens } from './types';
import { RefreshTokenGuard } from './common/guards';
import { GetCurrentUser, GetCurrentUserId, Public } from './common/decorator';
import { AuthGuard } from '@nestjs/passport';
import { GetOAuthUser } from './common/decorator/get-oauth-user';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Public()
    @HttpCode(HttpStatus.CREATED)
    @Post('signup')
    signUp(@Body() dto: SignUpDto): Promise<any>{
        return this.authService.signUp(dto)
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signIn(@Body() dto: SignInDto): Promise<any>{
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
    googleAuthRedirect(@GetOAuthUser() user: any) {
        return this.authService.saveOAuthUser(user)
    }


}
