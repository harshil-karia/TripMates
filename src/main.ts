import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }));
  app.enableCors({
    origin: "*", 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  });
  const key = uuidv4()
  console.log(key)
  await app.listen(process.env.PORT ?? 3500);
}
bootstrap();
