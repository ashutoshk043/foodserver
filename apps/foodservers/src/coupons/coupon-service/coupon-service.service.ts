import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Coupons, CouponsDocument } from '../schemas/coupons.schema';
import { CreateCouponsInput } from '../dtos/create-coupons.input';
import { UpdateCouponsInput } from '../dtos/update-coupons.input';

@Injectable()
export class CouponServiceService {
  constructor(
    @InjectModel(Coupons.name, 'restraurentconnection')
    private readonly couponsModel: Model<CouponsDocument>,
  ) {}

  // ── Paginated List ───────────────────────────────────────
  async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: { isDeleted: false } },

      // ── Restaurant lookup ────────────────────────────────
      {
        $lookup: {
          from: 'restaurants',
          let: { restaurantId: '$restaurantId' },
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
          _id: 1,
          code: 1,
          discountType: 1,
          discountValue: 1,
          minOrderValue: 1,
          usageLimitPerUser: 1,
          isActive: 1,
          expiryDate: 1,
          createdAt: 1,
          restaurant: 1,
        },
      },

      // ── Search ───────────────────────────────────────────
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { code:              { $regex: search, $options: 'i' } },
                  { discountType:      { $regex: search, $options: 'i' } },
                  { 'restaurant.name': { $regex: search, $options: 'i' } },
                ],
              },
            },
          ]
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
  }

  // ── Create ───────────────────────────────────────────────
  async create(input: CreateCouponsInput) {
    const created = new this.couponsModel({
      ...input,
      code:         input.code.toUpperCase().trim(),
      restaurantId: new Types.ObjectId(input.restaurantId),
    });
    return created.save();
  }

  // ── Update ───────────────────────────────────────────────
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

  // ── Soft Delete ──────────────────────────────────────────
  async remove(id: string) {
    await this.couponsModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { $set: { isDeleted: true } },
    );
    return true;
  }
}
