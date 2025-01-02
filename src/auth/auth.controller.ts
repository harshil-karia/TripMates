import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';
import { Tokens } from './types';


@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('/signup')
    signUp(@Body() dto: SignUpDto): Promise<Tokens>{
        return this.authService.signUp(dto)
    }

    @Post('/signin')
    signIn(@Body() dto: SignInDto){
        return this.authService.signIn(dto)
    }

    @Post('/logout')
    logout(){
        return this.authService.logout()
    }

    @Post('/refresh')
    refreshTokens(){
        return this.authService.refreshTokens()
    }
}
