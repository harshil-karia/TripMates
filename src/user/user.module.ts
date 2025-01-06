import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AtStrategy, RtStrategy } from 'src/auth/strategies';

@Module({
    imports: [
        JwtModule.register({}),
        ConfigModule
    ],
    controllers: [UserController],
    providers: [UserService, AtStrategy, RtStrategy]

})
export class UserModule {}
