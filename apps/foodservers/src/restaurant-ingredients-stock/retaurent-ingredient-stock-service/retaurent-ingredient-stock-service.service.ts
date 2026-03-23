import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RestaurantIngredientsStock,
  RestaurantIngredientsStockDocument,
} from '../schemas/restaurant-ingredients-stock.schema';
import { CreateRestaurantIngredientsStockInput } from '../dtos/create-restaurant-ingredients-stock.input';
import { UpdateRestaurantIngredientsStockInput } from '../dtos/update-restaurant-ingredients-stock.input';

@Injectable()
export class RestaurantIngredientsStockService {
  constructor(
    @InjectModel(RestaurantIngredientsStock.name, 'restraurentconnection')
    private readonly stockModel: Model<RestaurantIngredientsStockDocument>,
  ) {}

  // ── Paginated List ───────────────────────────────────────
  async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: { isDeleted: false } },

      // ── Restaurant lookup ──────────────────────────────
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

      // ── Ingredient lookup ──────────────────────────────
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
      { $unwind: '$ingredient' },

      {
        $project: {
          _id: 1,
          availableQty: 1,
          alertLevel: 1,
          createdAt: 1,
          restaurant: 1,
          ingredient: 1,
        },
      },

      // ── Search after project ───────────────────────────
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { 'restaurant.name':  { $regex: search, $options: 'i' } },
                  { 'ingredient.name':  { $regex: search, $options: 'i' } },
                  { 'ingredient.unit':  { $regex: search, $options: 'i' } },
                ],
              },
            },
          ]
        : []),

      { $sort: { 'restaurant.name': 1, 'ingredient.name': 1 } },

      {
        $facet: {
          data:       [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const result     = await this.stockModel.aggregate(pipeline);
    const data       = result[0].data;
    const total      = result[0].totalCount[0]?.count || 0;
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
  async create(input: CreateRestaurantIngredientsStockInput) {
    const created = new this.stockModel({
      ...input,
      restaurantId: new Types.ObjectId(input.restaurantId),
      ingredientId: new Types.ObjectId(input.ingredientId),
    });
    return created.save();
  }

  // ── Update ───────────────────────────────────────────────
  async update(input: UpdateRestaurantIngredientsStockInput) {
    const { _id, ...rest } = input;
    const update: any = { ...rest };

    if (rest.restaurantId)
      update.restaurantId = new Types.ObjectId(rest.restaurantId);
    if (rest.ingredientId)
      update.ingredientId = new Types.ObjectId(rest.ingredientId);

    return this.stockModel.findByIdAndUpdate(
      new Types.ObjectId(_id),
      { $set: update },
      { new: true },
    );
  }

  // ── Soft Delete ──────────────────────────────────────────
  async remove(id: string) {
    await this.stockModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { $set: { isDeleted: true } },
    );
    return true;
  }
}