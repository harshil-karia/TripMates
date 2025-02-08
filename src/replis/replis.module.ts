import { Module } from '@nestjs/common';
import { ReplisService } from './replis.service';
import { ReplisController } from './replis.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [
    JwtModule.register({}),
  ],
  providers: [ReplisService,AuthService],
  controllers: [ReplisController]
})
export class ReplisModule {}
