// stock-logs.resolver.ts
import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { ServicestocklogsService } from '../servicestocklogs/servicestocklogs.service';
import { GetStockLogsArgs } from '../dtos/get-stock-logs.args';
import { StockLogsResponse } from '../types/stock.logs';

@Resolver()
export class StocklogsResolver {
  constructor(private readonly stockLogsService: ServicestocklogsService) {}

  @Query(() => StockLogsResponse, { name: 'getStockLogs' })
  async getStockLogs(
    @Args() args: GetStockLogsArgs,
    @Context() ctx,
  ): Promise<StockLogsResponse> {

    return this.stockLogsService.getStockLogs(ctx.user,args);
  }
}