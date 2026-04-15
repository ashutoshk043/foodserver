import { Module } from '@nestjs/common';
import { ServicegrpcService } from './servicegrpc/servicegrpc.service';
import { GrpcClientsModule } from '../grpc/clients/grpc.clients';

@Module({
  imports: [
    GrpcClientsModule
  ],
  providers: [ServicegrpcService],
  exports: [ServicegrpcService] // ✅ yahi add karna hai
})
export class GrpcmoduleModule {}