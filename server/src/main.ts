import { NestFactory } from '@nestjs/core';
import * as CookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'


import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const PORT = process.env.PORT ?? 9090;

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Euphoria API Documentation')
    .setDescription(`This api was developed for the website at the link: ${process.env.CLIENT_URL}`)
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);



  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
  });
  app.use(CookieParser());
  app.useGlobalPipes(new ValidationPipe());


  await app.listen(PORT, () => {
    console.log('Server started on port: ', PORT);
  });
}
bootstrap();
