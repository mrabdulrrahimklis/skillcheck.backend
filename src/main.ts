import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { SwaggerModule } from "@nestjs/swagger";
import { swaggerConfig } from "./common/utils/swagger.config";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});

  const configService = app.get(ConfigService);

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(configService.get('PORT'));
}
bootstrap();

// Endpoints marked (public) should allow access without authorization
// Endpoints not marked (public) should check JWT tokens and map to users
// Health Check endpoints should be public and no JWT should be required
//  Non-public endpoints called by Admin users should allow requests to modify
//  all users, while regular users should locked into their own user - they are only allowed to work on their own user id
// Passwords need to be hashed and salted