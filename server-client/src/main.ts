import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as CookieParser from 'cookie-parser'

import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  app.setGlobalPrefix('api/v1')

  app.enableCors({
    origin: [process.env.CLIENT_URL, process.env.ADMIN_PANEL_URL],
    credentials: true
  })

  app.use(CookieParser())

  app.useGlobalPipes(new ValidationPipe())

  const PORT = process.env.PORT ?? 8080

  await app.listen(PORT, () => {
    console.log('Server started on port: ', PORT)
  });
}
bootstrap();
