import { Module } from '@nestjs/common';
import { ReplisService } from './replis.service';
import { ReplisController } from './replis.controller';

@Module({
  providers: [ReplisService],
  controllers: [ReplisController]
})
export class ReplisModule {}
