import { Injectable, Inject, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { StockLogs } from '../../orders/schemas/stock-logs.schema';
import { GetStockLogsArgs } from '../dtos/get-stock-logs.args';
import { StockLogsResponse } from '../types/stock.logs';
import { Observable, firstValueFrom } from 'rxjs';
import { Restaurant } from '../../restraurent/schemas/restraurent.model';
import * as microservices from '@nestjs/microservices';

interface AuthGrpcService {
  GetUserDetails(data: { userId: string }): Observable<any>;
}

@Injectable()
export class ServicestocklogsService implements OnModuleInit {
  private authGRPCService: AuthGrpcService;

  constructor(
    @InjectModel(StockLogs.name, 'restraurentconnection')
    private readonly stockLogsModel: Model<StockLogs>,

    @InjectModel(Restaurant.name, 'restraurentconnection')
    private readonly restaurantModel: Model<Restaurant>,

    @Inject('AUTH_GRPC')
    private readonly client: microservices.ClientGrpc,
  ) {}

  onModuleInit() {
    this.authGRPCService = this.client.getService<AuthGrpcService>('AuthService');
  }

async getStockLogs(
  user: any,
  args: GetStockLogsArgs,
): Promise<StockLogsResponse> {
  const { page, limit, search, reason, fromDate, toDate } = args;
  const skip = (page - 1) * limit;

  if (!user || !user.userId) {
    throw new Error('User authentication failed');
  }

  let userDetails: any;

  try {
    userDetails = await firstValueFrom(
      this.authGRPCService.GetUserDetails({ userId: user.userId }),
    );
  } catch (err) {
    throw new ServiceUnavailableException('Auth service not reachable');
  }

  if (!userDetails || !userDetails.role) {
    throw new Error('User details not found');
  }

  const highRoles = ["global-admin", "india-manager", "state-manager", "district-manager", "block-manager"];
  const restrictedRoles = ["restaurant-owner", "restaurant-manager"];

  const baseMatch: Record<string, any> = {};

  if (restrictedRoles.includes(userDetails.role)) {
    const restaurantIds = userDetails?.restaurantIds;

    if (!restaurantIds || !Array.isArray(restaurantIds) || restaurantIds.length === 0) {
      throw new Error('No restaurant access assigned');
    }

    baseMatch.restaurantId = {
      $in: restaurantIds.map((id: string) => new Types.ObjectId(id)),
    };
  } else if (highRoles.includes(userDetails.role)) {
  } else {
    throw new Error('Your role does not have access');
  }

  if (reason) baseMatch.reason = reason;

  if (fromDate || toDate) {
    baseMatch.createdAt = {};
    if (fromDate) baseMatch.createdAt.$gte = new Date(fromDate);
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      baseMatch.createdAt.$lte = end;
    }
  }

  const pipeline: PipelineStage[] = [
    { $match: baseMatch },
    {
      $lookup: {
        from: 'ingredients',
        let: { ingredientId: '$ingredientId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$ingredientId'] } } },
          { $project: { _id: 1, name: 1, unit: 1 } },
        ],
        as: 'ingredient',
      },
    },
    { $unwind: { path: '$ingredient', preserveNullAndEmptyArrays: false } },
    {
      $lookup: {
        from: 'restaurants',
        let: { restaurantId: '$restaurantId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$restaurantId'] } } },
          { $project: { _id: 1, restaurantName: 1 } },
        ],
        as: 'restaurant',
      },
    },
    { $unwind: { path: '$restaurant', preserveNullAndEmptyArrays: true } },
    ...(search
      ? [{
          $match: {
            $or: [
              { orderNumber: { $regex: search, $options: 'i' } },
              { reason: { $regex: search, $options: 'i' } },
              { 'ingredient.name': { $regex: search, $options: 'i' } },
              { note: { $regex: search, $options: 'i' } },
            ],
          },
        } as PipelineStage]
      : []),
    {
      $project: {
        _id: 1,
        orderNumber: 1,
        reason: 1,
        changeQty: 1,
        note: 1,
        createdAt: 1,
        ingredient: 1,
        restaurant: {
          _id: '$restaurant._id',
          name: '$restaurant.restaurantName',
        },
        changeLabel: {
          $concat: [
            { $cond: [{ $lt: [{ $ifNull: ['$changeQty', 0] }, 0] }, '', '+'] },
            { $toString: { $ifNull: ['$changeQty', 0] } },
            ' ',
            { $ifNull: ['$ingredient.unit', '' ] },
          ],
        },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        docs: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: 'count' }],
      },
    },
  ];

  const [result] = await this.stockLogsModel.aggregate(pipeline);
  const total = result?.total?.[0]?.count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return {
    docs: result?.docs ?? [],
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
}