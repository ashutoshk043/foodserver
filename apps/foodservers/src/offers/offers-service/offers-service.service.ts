import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Offers, OffersDocument } from '../schemas/offers.schema';
import { CreateOffersInput } from '../dtos/create-offers.input';
import { UpdateOffersInput } from '../dtos/update-offers.input';

@Injectable()
export class OffersServiceService {
  constructor(
    @InjectModel(Offers.name, 'restraurentconnection')
    private readonly offersModel: Model<OffersDocument>,
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
          title: 1,
          type: 1,
          productIds: 1,
          discountType: 1,
          discountValue: 1,
          minOrderValue: 1,
          isActive: 1,
          startAt: 1,
          endAt: 1,
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
                  { title:            { $regex: search, $options: 'i' } },
                  { type:             { $regex: search, $options: 'i' } },
                  { discountType:     { $regex: search, $options: 'i' } },
                  { 'restaurant.name':{ $regex: search, $options: 'i' } },
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

    const result     = await this.offersModel.aggregate(pipeline);
    const data       = result[0].data;
    const total      = result[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return { data, total, page, limit, totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  // ── Create ───────────────────────────────────────────────
  async create(input: CreateOffersInput) {
    const created = new this.offersModel({
      ...input,
      restaurantId: new Types.ObjectId(input.restaurantId),
      productIds:   input.productIds?.map(id => new Types.ObjectId(id)) || [],
    });
    return created.save();
  }

  // ── Update ───────────────────────────────────────────────
  async update(input: UpdateOffersInput) {
    const { _id, ...rest } = input;
    const update: any = { ...rest };

    if (rest.restaurantId)
      update.restaurantId = new Types.ObjectId(rest.restaurantId);
    if (rest.productIds)
      update.productIds = rest.productIds.map(id => new Types.ObjectId(id));

    return this.offersModel.findByIdAndUpdate(
      new Types.ObjectId(_id),
      { $set: update },
      { new: true },
    );
  }

  // ── Soft Delete ──────────────────────────────────────────
  async remove(id: string) {
    await this.offersModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { $set: { isDeleted: true } },
    );
    return true;
  }
}
