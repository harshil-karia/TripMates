import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    JwtModule.register({}),
    CloudinaryModule
  ],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule {}
