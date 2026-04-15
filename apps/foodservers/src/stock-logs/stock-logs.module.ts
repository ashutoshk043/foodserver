import { Module } from '@nestjs/common';
import { StocklogsResolver } from './stocklogs/stocklogs.resolver';
import { ServicestocklogsService } from './servicestocklogs/servicestocklogs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StockLogs, StockLogsSchema } from '../orders/schemas/stock-logs.schema';
import { Restaurant, RestaurantSchema } from '../restraurent/schemas/restraurent.model';
import { GrpcClientsModule } from '../grpc/clients/grpc.clients';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: StockLogs.name, schema: StockLogsSchema },
        { name: Restaurant.name, schema: RestaurantSchema },
      ],
      'restraurentconnection',
    ),
    GrpcClientsModule,
  ],
  providers: [StocklogsResolver, ServicestocklogsService],
})
export class StockLogsModule {}