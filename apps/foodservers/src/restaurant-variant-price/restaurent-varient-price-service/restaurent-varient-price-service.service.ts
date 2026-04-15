import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RestaurantVariantPrice,
  RestaurantVariantPriceDocument,
} from '../schemas/restaurant-variant-price.schema';
import { CreateRestaurantVariantPriceInput } from '../dtos/create-restaurant-variant-price.input';
import { UpdateRestaurantVariantPriceInput } from '../dtos/update-restaurant-variant-price.input';
import { firstValueFrom, Observable } from 'rxjs';
import * as microservices from '@nestjs/microservices';


interface AuthGrpcService {
  GetUserDetails(data: { userId: string }): Observable<any>;
}

@Injectable()
export class RestaurantVariantPriceService {
  private authGRPCService: AuthGrpcService;
  constructor(

    @InjectModel(RestaurantVariantPrice.name, 'restraurentconnection')
    private readonly recipeModel: Model<RestaurantVariantPriceDocument>,

    @Inject('AUTH_GRPC')
    private readonly client: microservices.ClientGrpc,
  ) { }

  onModuleInit() {
    this.authGRPCService = this.client.getService<AuthGrpcService>('AuthService');
  }

  // ── Paginated List ───────────────────────────────────────
async findAll(
  user: any,
  page = 1,
  limit = 10,
  search = '',
  restId?: string,
) {
  const skip = (page - 1) * limit;

  if (!user || !user.userId) {
    throw new Error('User authentication failed');
  }

  console.log(restId, "<<<<< Received restId in service >>>>>");

  if (restId && !Types.ObjectId.isValid(restId)) {
    throw new Error('Invalid restaurant ID');
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

  const highRoles = [
    "global-admin",
    "india-manager",
    "state-manager",
    "district-manager",
    "block-manager"
  ];

  const restrictedRoles = [
    "restaurant-owner",
    "restaurant-manager"
  ];

  const matchStage: any = {
    isDeleted: false,
  };

  // ✅ 🔥 PRIORITY: restId
  if (restId) {

    // restricted user check
    if (restrictedRoles.includes(userDetails.role)) {
      const restaurantIds = userDetails?.restaurantIds || [];

      if (!restaurantIds.includes(restId)) {
        throw new Error('You are not allowed to access this restaurant');
      }
    }

    matchStage.restaurantId = new Types.ObjectId(restId);

  } else {

    // ✅ fallback → role based
    if (restrictedRoles.includes(userDetails.role)) {
      const restaurantIds = userDetails?.restaurantIds;

      if (!restaurantIds || !Array.isArray(restaurantIds) || restaurantIds.length === 0) {
        throw new Error('No restaurant access assigned');
      }

      matchStage.restaurantId = {
        $in: restaurantIds.map((id: string) => new Types.ObjectId(id)),
      };

    } else if (highRoles.includes(userDetails.role)) {
      // no filter → all data
    } else {
      throw new Error('Your role does not have access');
    }
  }

  const pipeline: any[] = [
    { $match: matchStage },

    {
      $lookup: {
        from: 'productvariants',
        let: { variantId: '$variantId' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$variantId'] },
              isActive: true,
            },
          },
          {
            $project: {
              _id: 1,
              name: '$size',
              productId: 1,
            },
          },
        ],
        as: 'variant',
      },
    },
    { $unwind: '$variant' },

    {
      $lookup: {
        from: 'products',
        let: { productId: '$variant.productId' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$productId'] },
              isActive: true,
              isDeleted: false,
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
            },
          },
        ],
        as: 'product',
      },
    },
    { $unwind: '$product' },

    {
      $lookup: {
        from: 'restaurants',
        let: { restaurantId: '$restaurantId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$_id', '$$restaurantId'] },
                  { $eq: ['$isVerified', true] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: '$restaurantName',
            },
          },
        ],
        as: 'restaurant',
      },
    },
    { $unwind: '$restaurant' },

    {
      $project: {
        _id: 1,
        price: 1,
        mrp: { $ifNull: ['$mrp', 0] },
        isAvailable: 1,
        variant: 1,
        product: 1,
        restaurant: 1,
      },
    },

    ...(search
      ? [
          {
            $match: {
              $or: [
                { 'restaurant.name': { $regex: search, $options: 'i' } },
                { 'product.name': { $regex: search, $options: 'i' } },
                { 'variant.name': { $regex: search, $options: 'i' } },
              ],
            },
          },
        ]
      : []),

    {
      $sort: {
        'restaurant.name': 1,
        'product.name': 1,
      },
    },

    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ];

  const result = await this.recipeModel.aggregate(pipeline);

  const data = result[0]?.data || [];
  const total = result[0]?.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

  // ── Create ───────────────────────────────────────────────
  async create(input: CreateRestaurantVariantPriceInput) {
    const created = new this.recipeModel({
      ...input,
      restaurantId: new Types.ObjectId(input.restaurantId),
      variantId: new Types.ObjectId(input.variantId),
    });
    return created.save();
  }

  // ── Update ───────────────────────────────────────────────
  async update(input: UpdateRestaurantVariantPriceInput) {
    const { _id, ...rest } = input;
    const update: any = { ...rest };

    if (rest.restaurantId)
      update.restaurantId = new Types.ObjectId(rest.restaurantId);
    if (rest.variantId)
      update.variantId = new Types.ObjectId(rest.variantId);

    return this.recipeModel.findByIdAndUpdate(
      new Types.ObjectId(_id),
      { $set: update },
      { new: true },
    );
  }

  // ── Soft Delete ──────────────────────────────────────────
  async remove(id: string) {
    await this.recipeModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { $set: { isDeleted: true } },
    );
    return true;
  }
}