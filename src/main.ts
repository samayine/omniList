import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── CORS ──────────────────────────────────────────────────────────
  // Allow the Next.js frontend dev server and any deployed frontend
  app.enableCors({
    origin: (process.env.FRONTEND_ORIGIN ?? 'http://localhost:3001')
      .split(',')
      .map((o) => o.trim()),
    credentials: true,
  });

  // ── Global prefix ─────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Validation ────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ── Swagger ───────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('OmniList API')
    .setDescription('Multi-tenant property listing platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 8000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📖 Swagger docs → http://localhost:${port}/api/docs`);
}
void bootstrap();
