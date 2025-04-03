import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './auth/common/guards';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { HashtagModule } from './hashtag/hashtag.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ReplisModule } from './replis/replis.module';
import { ConnectionModule } from './connection/connection.module';
import { MailModule } from './mail/mail.module';
import { ChatModule } from './chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';




// export const multerOptions = {
//   storage: diskStorage({
//     destination: './uploads', // Folder to save files
//     filename: (req, file, cb) => {
//       const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//       const ext = extname(file.originalname); // Get file extension
//       cb(null, `${file.fieldname}-${uniqueSuffix}-${ext}`); // Save with unique name
//     },
//   }),
// };

@Module({
  imports: [
    AuthModule, 
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    PostModule,
    CommentsModule,
    LikesModule,
    HashtagModule,
    CloudinaryModule,
    ReplisModule,
    ConnectionModule,
    MailModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard
    },
  ],
})
export class AppModule {}
