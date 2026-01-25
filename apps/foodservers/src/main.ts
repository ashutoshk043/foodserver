import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { enableGlobalCors } from 'libs/cors/cors.helper';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import * as fs from 'fs';

function resolveProtoFromPackage(): string {
  const possiblePaths = [
    // 1️⃣ prod / build
    join(__dirname, '../../node_modules/@tivr/grpc-protos/proto/restaurant/restaurant.proto'),
    // 2️⃣ ts-node / dev
    join(process.cwd(), 'node_modules/@tivr/grpc-protos/proto/restaurant/restaurant.proto'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log('✅ Using protoPath:', p);
      return p;
    }
  }

  console.error('❌ Could not find restaurant.proto in @tivr/grpc-protos package. Tried paths:');
  possiblePaths.forEach(p => console.error('  -', p));
  process.exit(1);
}


async function bootstrap() {
  try {

    const app = await NestFactory.create(AppModule);

    // Enable CORS
    enableGlobalCors(app);

    // ENV Ports
    const HTTP_PORT = Number(process.env.RESTAURANT_HTTP_PORT) || 3000;
    const GRPC_PORT = Number(process.env.RESTAURANT_GRPC_PORT) || 5000;

    // Resolve proto
    const protoPath = resolveProtoFromPackage();

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
