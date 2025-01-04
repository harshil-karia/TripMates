import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';
import { Tokens } from './types';
import { RefreshTokenGuard } from './common/guards';
import { GetCurrentUser, GetCurrentUserId, Public } from './common/decorator';


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

    //@UseGuards(AccessTokenGuard)
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
}
