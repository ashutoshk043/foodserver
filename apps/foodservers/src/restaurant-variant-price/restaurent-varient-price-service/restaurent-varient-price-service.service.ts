import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RestaurantVariantPrice,
  RestaurantVariantPriceDocument,
} from '../schemas/restaurant-variant-price.schema';
import { CreateRestaurantVariantPriceInput } from '../dtos/create-restaurant-variant-price.input';
import { UpdateRestaurantVariantPriceInput } from '../dtos/update-restaurant-variant-price.input';

@Injectable()
export class RestaurantVariantPriceService {
constructor(
    @InjectModel(RestaurantVariantPrice.name, 'restraurentconnection')
    private readonly recipeModel: Model<RestaurantVariantPriceDocument>,
  ) { }

  // ── Paginated List ───────────────────────────────────────
async findAll(page = 1, limit = 10, search = '') {
  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    {
      $match: {
        // isAvailable: true,
        isDeleted: false,
      },
    },

    // ── Variant lookup ───────────────────────────────────
    {
      $lookup: {
        from: 'productvariants',
        let: { variantId: '$variantId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$variantId'] } } },
          { $project: { _id: 1, name: '$size', productId: 1 } },
        ],
        as: 'variant',
      },
    },
    { $unwind: '$variant' },

    // ── Product lookup ───────────────────────────────────
    {
      $lookup: {
        from: 'products',
        let: { productId: '$variant.productId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$productId'] } } },
          { $project: { _id: 1, name: 1 } },
        ],
        as: 'product',
      },
    },
    { $unwind: '$product' },

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

    // ── Project nested objects ───────────────────────────
{
  $project: {
    _id: 1,
    price: 1,
    // ✅ $ifNull handles old docs that don't have these fields
    mrp:                { $ifNull: ['$mrp', 0] },
    // actualSellingPrice: { $ifNull: ['$actualSellingPrice', 0] },
    isAvailable: 1,
    variant: 1,
    product: 1,
    restaurant: 1,
  },
},

    // ── Search on nested fields ──────────────────────────
    ...(search
      ? [
          {
            $match: {
              $or: [
                { 'restaurant.name': { $regex: search, $options: 'i' } },
                { 'product.name':    { $regex: search, $options: 'i' } },
                { 'variant.name':    { $regex: search, $options: 'i' } },
              ],
            },
          },
        ]
      : []),

    { $sort: { 'restaurant.name': 1, 'product.name': 1 } },

    {
      $facet: {
        data:       [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ];

  const result = await this.recipeModel.aggregate(pipeline);
  const data   = result[0].data;
  const total  = result[0].totalCount[0]?.count || 0;
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