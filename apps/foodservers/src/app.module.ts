import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { SharedGraphQLModule } from '@app/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@app/redis/redis.module';   // ✅ Added
import { Restaurant, RestaurantSchema } from './restraurent/schemas/restraurent.model';
import { RestraurentModule } from './restraurent/restraurent.module';
import { BullModule } from '@nestjs/bull';
import { UploadModule } from '../src/upload/upload.module';
import { ImportWorkerModule } from '../src/import-worker/import-worker.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductVarientsModule } from './product-varients/product-varients.module';

@Module({
  imports: [

    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    UploadModule,
    ImportWorkerModule,

    // Global config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'docker' ? '.env.docker' : '.env',
    }),

    // Database connection
    DatabaseModule.forRoot([
      { name: 'restraurentconnection', dbName: 'foodprebook', uriKey: 'MONGO_FOOD_DB' },
    ]),

    // Mongoose schemas
    MongooseModule.forFeature(
      [
        { name: Restaurant.name, schema: RestaurantSchema },
      ],
      'restraurentconnection',
    ),

    // GraphQL
    SharedGraphQLModule.forRoot({
      federation: true,
      playground: true,
      context: ({ req }) => {
        const xUserHeader = req.headers['x-user'] as string | undefined;
        if (!xUserHeader) return { req };

        try {
          const user = JSON.parse(xUserHeader);
          return { req, user };
        } catch (err) {
          console.log('❌ Failed to parse x-user header:', err.message);
          return { req };
        }
      },
    }),

    // JWT Module
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey'
    }),

    // 🟢 Redis Module (MANDATORY)
    RedisModule,

    RestraurentModule,

    ProductsModule,

    CategoriesModule,

    ProductVarientsModule,
  ],
  controllers: [],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor() {
    this.logger.log('🚀 AppModule Initialized...');
  }
}
