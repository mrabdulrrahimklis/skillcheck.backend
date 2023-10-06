/* eslint-disable prettier/prettier */
import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Keleya')
  .setDescription('Keleya')
  .setVersion('1.0')
  .addTag('Keleya')
  .addBearerAuth({
      type : 'http',
      scheme : 'bearer',
      bearerFormat : 'JWT',
      name : 'JWT',
      description : 'Enter access token',
      in : 'header'
    },
    'Access Token')
  .build();
