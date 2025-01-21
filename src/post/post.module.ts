import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AuthService } from 'src/auth/auth.service';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptions } from 'src/multer/multer.options';

@Module({
  imports: [
    JwtModule.register({}),
    CloudinaryModule,
    MulterModule.register(multerOptions)
  ],
  controllers: [PostController],
  providers: [PostService,AuthService]
})
export class PostModule {}
