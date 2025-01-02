import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { AtStrategy, RtStrategy } from './strategies';

@Module({
  imports: [
    JwtModule.register({}),
    ConfigModule
  ],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
  
})
export class AuthModule {}
