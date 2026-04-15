import { Module } from '@nestjs/common';
import { CloudControllerController } from './cloud-controller/cloud-controller.controller';
import { ServicesCloudService } from './services-cloud/services-cloud.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadService } from './upload/upload.service';
import { GrpcmoduleModule } from '../grpcmodule/grpcmodule.module';
import { RestaurantImageSchema , RestaurantImage} from './schemas/logo_banner';
import { productImage, productImageSchema } from './schemas/bulk-image.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: RestaurantImage.name, schema: RestaurantImageSchema },
        {name: productImage.name, schema: productImageSchema}
      ],
      'restraurentconnection',
    ),
    GrpcmoduleModule,
  ],
  controllers: [CloudControllerController],
  providers: [ServicesCloudService, UploadService]
})
export class CloudflairUploadsModule {}
