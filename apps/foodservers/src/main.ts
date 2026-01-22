import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { enableGlobalCors } from 'libs/cors/cors.helper';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import * as fs from 'fs';

function resolveProtoPath(): string {
  const candidates = [
    // ✅ prod build (dist)
    join(__dirname, 'grpc/proto/restraurent.proto'),

    // ✅ prod alternative (sometimes Nest outputs here)
    join(process.cwd(), 'dist/apps/foodservers/grpc/proto/restraurent.proto'),

    // ✅ dev (ts-node)
    join(process.cwd(), 'apps/foodservers/src/grpc/proto/restraurent.proto'),
  ];

  for (const path of candidates) {
    if (fs.existsSync(path)) {
      console.log('✅ Using protoPath:', path);
      return path;
    }
  }

  console.error('❌ gRPC proto file NOT FOUND. Tried paths:');
  candidates.forEach(p => console.error(' -', p));
  process.exit(1);
}


async function bootstrap() {
  try {
    console.log('🔄 [Restaurant] Bootstrapping Service...');
    console.log('📂 __dirname:', __dirname);
    console.log('📂 process.cwd():', process.cwd());

    const app = await NestFactory.create(AppModule);

    // Enable CORS
    enableGlobalCors(app);

    // ENV Ports
    const HTTP_PORT = Number(process.env.RESTAURANT_HTTP_PORT) || 3000;
    const GRPC_PORT = Number(process.env.RESTAURANT_GRPC_PORT) || 5000;

    // Resolve proto
    const protoPath = resolveProtoPath();

    // Attach gRPC Microservice
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        url: `0.0.0.0:${GRPC_PORT}`,
        package: 'restaurant',
        protoPath,
        loader: { keepCase: true },
      },
    });

    await app.startAllMicroservices();
    await app.listen(HTTP_PORT, '0.0.0.0');

    console.log(`🚀 HTTP running on port ${HTTP_PORT}`);
    console.log(`📡 gRPC running on port ${GRPC_PORT}`);
    console.log(`🍽️ GraphQL => http://localhost:${HTTP_PORT}/graphql`);
  } catch (error) {
    console.error('❌ Failed to start Restaurant Service:', error);
    process.exit(1);
  }
}

bootstrap();
