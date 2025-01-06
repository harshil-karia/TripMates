import { Body, Controller, ForbiddenException, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { GetCurrentUserId, Public } from 'src/auth/common/decorator';
import { UpdatePasswordDto, UpdateUserDto } from './dto';
import { UserService } from './user.service';

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
    @Patch('forgotPassword')
    forgotPassword(@Body() dto: UpdatePasswordDto) {
        return this.userService.forgotPassword(dto)
    }
}
