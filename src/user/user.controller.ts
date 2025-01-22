import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { GetCurrentUserId, Public } from 'src/auth/common/decorator';
import { UpdatePasswordDto, UpdateUserDto } from './dto';
import { UserService } from './user.service';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/multer/multer.options';

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

    @HttpCode(HttpStatus.OK)
    @Patch('updateProfilePhoto')
    @UseInterceptors(FileInterceptor('image',multerOptions))
    updateProfilePhoto(
        @UploadedFile() image: Express.Multer.File,
        @GetCurrentUserId() userId: number
    ) {
        return this.userService.updateProfilePhoto(image,userId)
    }

    @HttpCode(HttpStatus.OK)
    @Patch('updateCoverPhoto')
    @UseInterceptors(FileInterceptor('image',multerOptions))
    updateCoverPhoto(
        @UploadedFile() image: Express.Multer.File,
        @GetCurrentUserId() userId: number
    ) {
        return this.userService.updateCoverPhoto(image,userId)
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
