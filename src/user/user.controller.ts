import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { GetCurrentUserId, Public } from 'src/auth/common/decorator';
import { UpdatePasswordDto, UpdateUserDto } from './dto';
import { UserService } from './user.service';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Controller('user')
export class UserController {

    constructor(
        private userService: UserService,
    ) {}

    @HttpCode(HttpStatus.OK)
    @Patch('updateUser')
    updateUser(@GetCurrentUserId() userId: number, @Body() dto: UpdateUserDto){
        return this.userService.updateUser(userId, dto);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Patch('updatePassword')
    updatePassword(@Body() dto: UpdatePasswordDto) {
        return this.userService.updatePassword(dto)
    }

    @HttpCode(HttpStatus.OK)
    @Get(':username')
    searchUserByUsername(@Param('username') username: string){
        if(!username) {
            throw new ForbiddenException("Invalid username")
        }
        return this.userService.searchUserByUsername(username)
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('forgotPassword')
    forgotPassword(@Body('email') email: string) {
        return this.userService.forgotPassword(email)
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Patch(':jwt')
    resetPassword(@Param('jwt') jwt: string, @Body() dto: ResetPasswordDto) {
        return this.userService.resetPassword(jwt,dto)
    }
}
