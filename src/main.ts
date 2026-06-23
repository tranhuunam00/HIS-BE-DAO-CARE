import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Thiết lập tiền tố API toàn cục
  app.setGlobalPrefix('api/v1');

  // Middlewares bảo mật
  app.use(helmet());
  app.use(cookieParser());

  // Cấu hình CORS
  const corsWhitelist = (process.env.CORS_ORIGIN_WHITELIST || '').split(',');
  app.enableCors({
    origin: corsWhitelist.length > 0 && corsWhitelist[0] ? corsWhitelist : true,
    credentials: true,
  });

  // Validation pipe toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Cấu hình tài liệu Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('HIS-DAO-CARE API')
    .setDescription('Tài liệu API hệ thống quản lý phòng khám HIS-DAO-CARE')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap();
