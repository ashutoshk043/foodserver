import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const GrpcClientsModule = ClientsModule.register([
  {
    name: 'AUTH_GRPC',
    transport: Transport.GRPC,
    options: {
      url: process.env.AUTH_GRPC_URL || 'localhost:50051',
      package: 'auth',
      protoPath: join(
        process.cwd(),
        'apps/foodservers/src/grpc/proto/auth.proto',
      ),
      loader: {
        keepCase: true,
      },
    },
  },

  // 🔮 Future ready
  // {
  //   name: 'GROCERY_GRPC',
  //   transport: Transport.GRPC,
  //   options: { ... }
  // },
]);
