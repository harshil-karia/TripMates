import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat-gateway';
import { ChatController } from './chat.controller';
import { MongooseModule, Schema } from '@nestjs/mongoose';
import { Chat, ChatSchema } from 'src/model/chat.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            uri: configService.get<string>('MONGODB_URI'),
          }),
        }),
    MongooseModule.forFeature([
      {
        name: Chat.name,
        schema: ChatSchema,
      }
    ]),
    AuthModule
  ],
  providers: [ChatService,ChatGateway,PrismaService,AuthService,JwtService],
  controllers: [ChatController]
})
export class ChatModule {}
