import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AtStrategy, RtStrategy } from 'src/auth/strategies';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/mail/mail.service';

@Module({
    imports: [
        JwtModule.register({}),
        ConfigModule,
        CloudinaryModule
    ],
    controllers: [UserController],
    providers: [UserService, AtStrategy, RtStrategy,AuthService, MailService]

})
export class UserModule {}
