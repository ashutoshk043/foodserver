// libs/database/src/database.module.ts
import { DynamicModule, Module, Logger } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

export interface DatabaseConnectionOptions {
  name: string;       // connection name
  dbName: string;     // MongoDB database name
  uriKey?: string;    // env variable key for URI (optional, default: MONGO_FOOD_DB)
}

@Module({})
export class DatabaseModule {
  /**
   * Create multiple DB connections dynamically
   * @param connections Array of DatabaseConnectionOptions
   */
  static forRoot(connections: DatabaseConnectionOptions[]): DynamicModule {
    const imports = connections.map((conn) =>
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        connectionName: conn.name, // name of this connection
        useFactory: (config: ConfigService): MongooseModuleOptions => {
          const logger = new Logger(`DatabaseModule:${conn.name}`);
          const mongoUri = config.get<string>(conn.uriKey || 'MONGO_FOOD_DB');

          console.log(mongoUri, "console from food libs dbs")

          if (!mongoUri) {
            throw new Error(`❌ ${conn.uriKey || 'MONGO_FOOD_DB'} not found in environment variables!`);
          }

          logger.log(`🔗 Connecting to MongoDB "${conn.dbName}" at: ${mongoUri}`);

          return {
            uri: mongoUri,
            dbName: conn.dbName,
            connectionFactory: (connection) => {
              connection.on('connected', () =>
                logger.log(`✅ MongoDB "${conn.dbName}" Connected Successfully!`),
              );
              connection.on('error', (err) =>
                logger.error(`❌ MongoDB "${conn.dbName}" Connection Failed:`, err),
              );
              connection.on('disconnected', () =>
                logger.warn(`⚠️ MongoDB "${conn.dbName}" Disconnected!`),
              );
              return connection;
            },
          };
        },
      }),
    );

    return {
      module: DatabaseModule,
      imports,
      exports: imports,
    };
  }
}
