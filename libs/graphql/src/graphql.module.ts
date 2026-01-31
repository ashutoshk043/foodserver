import { Module, DynamicModule, Logger } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

export interface GraphQLConnectionOptions {
  federation?: boolean;  // true => Federation mode
  playground?: boolean;  // true => enable playground
  schemaPath?: string;   // path of schema file
  context?: ({ req }: { req: any }) => any; // ✅ context type
}

@Module({})
export class SharedGraphQLModule {
  private static readonly logger = new Logger(SharedGraphQLModule.name);

  static forRoot(options: GraphQLConnectionOptions = {}): DynamicModule {
    const {
      federation = true,
      playground = true,
      schemaPath = 'src/schema.gql',
      context = undefined, // default undefined
    } = options;

    this.logger.log(
      `🚀 Initializing GraphQL Module [Mode: ${federation ? 'Federation' : 'Standalone'}]`
    );

    const gqlImports = federation
      ? [
          GraphQLModule.forRoot<ApolloFederationDriverConfig>({
            driver: ApolloFederationDriver,
            autoSchemaFile: { federation: 2 },
            playground: playground,
            context: context, // explicitly pass context
          }),
        ]
      : [
          GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            playground: playground,
            autoSchemaFile: join(process.cwd(), schemaPath),
            context: context,
          }),
        ];

    return {
      module: SharedGraphQLModule,
      global: true,
      imports: gqlImports,
      exports: gqlImports,
    };
  }
}
