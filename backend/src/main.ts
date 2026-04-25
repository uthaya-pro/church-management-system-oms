import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const logger = new Logger('Bootstrap');
  const requestedPort = Number(process.env.PORT ?? 3000);

  try {
    await app.listen(requestedPort);
  } catch (error: unknown) {
    if ((error as { code?: string }).code !== 'EADDRINUSE') {
      throw error;
    }

    const fallbackPort = requestedPort + 1;
    logger.warn(`Port ${requestedPort} is in use. Retrying on ${fallbackPort}.`);
    await app.listen(fallbackPort);
  }
}
bootstrap();
