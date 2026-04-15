import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Inject } from '@nestjs/common';
import * as microservices from '@nestjs/microservices';
import { OnModuleInit } from '@nestjs/common';

import { Coupons } from '../schemas/coupons.schema';
import { CreateCouponsInput }  from '../dtos/create-coupons.input';
import { UpdateCouponsInput }  from '../dtos/update-coupons.input';

// ── Role groups (mirror your restaurant service) ─────────────────────────────
const HIGH_ROLES       = ['global-admin', 'india-manager', 'state-manager', 'district-manager', 'block-manager'];
const RESTRICTED_ROLES = ['restaurant-owner', 'restaurant-manager'];

// ── gRPC interface ────────────────────────────────────────────────────────────
interface AuthGrpcService {
  GetUserDetails(data: { userId: string }): import('rxjs').Observable<any>;
}

@Injectable()
export class CouponServiceService implements OnModuleInit {

  private authGRPCService: AuthGrpcService;

  constructor(
    @InjectModel(Coupons.name, 'restraurentconnection')
    private readonly couponsModel: Model<any>,

    @Inject('AUTH_GRPC')
    private readonly client: microservices.ClientGrpc,
  ) {}

  onModuleInit() {
    this.authGRPCService = this.client.getService<AuthGrpcService>('AuthService');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGINATED LIST — role-based access
  // ═══════════════════════════════════════════════════════════════════════════
  async findAll(page = 1, limit = 10, search = '', user: any) {

    if (!user?.userId) throw new ForbiddenException('User authentication failed');

    // ── Fetch user details from Auth gRPC service ────────────────────────
    let userDetails: any;
    try {
      userDetails = await firstValueFrom(
        this.authGRPCService.GetUserDetails({ userId: user.userId }),
      );
    } catch {
      throw new ServiceUnavailableException('Auth service not reachable');
    }

    if (!userDetails?.role) throw new NotFoundException('User details not found');

    const skip          = (page - 1) * limit;
    const matchFilter: any = { isDeleted: false };

    // ── Role-based scoping ───────────────────────────────────────────────
    if (RESTRICTED_ROLES.includes(userDetails.role)) {

      // restaurant-owner / restaurant-manager → only their restaurants
      if (!Array.isArray(userDetails.restaurantIds) || !userDetails.restaurantIds.length) {
        throw new ForbiddenException('No restaurant access assigned');
      }

      matchFilter.restaurantId = {
        $in: userDetails.restaurantIds.map((id: string) => new Types.ObjectId(id)),
      };

    } else if (HIGH_ROLES.includes(userDetails.role)) {
      // global-admin and managers → see all coupons (no extra filter)
    } else {
      throw new ForbiddenException('Your role does not have access');
    }

    try {
      const pipeline: any[] = [

        { $match: matchFilter },

        // ── Restaurant lookup ──────────────────────────────────────────
        {
          $lookup: {
            from: 'restaurants',
            let:  { restaurantId: '$restaurantId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$restaurantId'] } } },
              { $project: { _id: 1, name: '$restaurantName' } },
            ],
            as: 'restaurant',
          },
        },
        { $unwind: '$restaurant' },

        {
          $project: {
            _id:               1,
            code:              1,
            discountType:      1,
            discountValue:     1,
            minOrderValue:     1,
            usageLimitPerUser: 1,
            isActive:          1,
            expiryDate:        1,
            createdAt:         1,
            restaurant:        1,
          },
        },

        // ── Search ────────────────────────────────────────────────────
        ...(search
          ? [{
              $match: {
                $or: [
                  { code:             { $regex: search, $options: 'i' } },
                  { discountType:     { $regex: search, $options: 'i' } },
                  { 'restaurant.name':{ $regex: search, $options: 'i' } },
                ],
              },
            }]
          : []),

        { $sort: { createdAt: -1 } },

        {
          $facet: {
            data:       [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
      ];

      const result     = await this.couponsModel.aggregate(pipeline);
      const data       = result[0].data;
      const total      = result[0].totalCount[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data, total, page, limit, totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };

    } catch (err) {
      if (err.status) throw err;
      throw new InternalServerErrorException('Failed to fetch coupons');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE
  // ═══════════════════════════════════════════════════════════════════════════
  async create(input: CreateCouponsInput) {
    const created = new this.couponsModel({
      ...input,
      code:         input.code.toUpperCase().trim(),
      restaurantId: new Types.ObjectId(input.restaurantId),
    });
    return created.save();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE
  // ═══════════════════════════════════════════════════════════════════════════
  async update(input: UpdateCouponsInput) {
    const { _id, ...rest } = input;
    const update: any = { ...rest };

    if (rest.code)         update.code         = rest.code.toUpperCase().trim();
    if (rest.restaurantId) update.restaurantId = new Types.ObjectId(rest.restaurantId);

    return this.couponsModel.findByIdAndUpdate(
      new Types.ObjectId(_id),
      { $set: update },
      { new: true },
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SOFT DELETE
  // ═══════════════════════════════════════════════════════════════════════════
  async remove(id: string) {
    await this.couponsModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { $set: { isDeleted: true } },
    );
    return true;
  }
}