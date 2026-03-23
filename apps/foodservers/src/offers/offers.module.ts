import { Module } from '@nestjs/common';
import { OffersResolverResolver } from '../offers/offers-resolver/offers-resolver.resolver';
import { OffersControllerController } from './offers-controller/offers-controller.controller';
import { OffersServiceService } from './offers-service/offers-service.service';
import { Offers, OffersSchema } from './schemas/offers.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Offers.name, schema: OffersSchema }],
      'restraurentconnection',
    ),
  ],
  providers: [ OffersResolverResolver, OffersServiceService],
  controllers: [OffersControllerController]
})
export class OffersModule {}
