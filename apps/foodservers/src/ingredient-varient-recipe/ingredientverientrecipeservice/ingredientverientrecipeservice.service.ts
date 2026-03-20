import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Recipe, RecipeDocument } from '../schemas/recipe.schema';
import { CreateRecipeInput } from '../dtos/create-recipe.input';
import { UpdateRecipeInput } from '../dtos/update-recipe.input';

@Injectable()
export class RecipeService {
  constructor(
    @InjectModel(Recipe.name, 'restraurentconnection')
    private readonly recipeModel: Model<RecipeDocument>,
  ) {}

  // ── Create ──────────────────────────────────────────────
  async create(input: CreateRecipeInput): Promise<RecipeDocument> {
    const existing = await this.recipeModel.findOne({
      variantId: new Types.ObjectId(input.variantId),
      ingredientId: new Types.ObjectId(input.ingredientId),
      isDeleted: false,
    });

    if (existing) {
      throw new Error('This ingredient is already added to the variant recipe');
    }

    const recipe = new this.recipeModel({
      ...input,
      variantId: new Types.ObjectId(input.variantId),
      ingredientId: new Types.ObjectId(input.ingredientId),
    });

    return recipe.save();
  }

  // ── Update ──────────────────────────────────────────────
  async update(input: UpdateRecipeInput): Promise<RecipeDocument> {
    const { id, ...rest } = input;

    const payload: any = { ...rest };
    if (rest.variantId) payload.variantId = new Types.ObjectId(rest.variantId);
    if (rest.ingredientId) payload.ingredientId = new Types.ObjectId(rest.ingredientId);

    const updated = await this.recipeModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: payload },
      { new: true },
    );

    if (!updated) throw new NotFoundException(`Recipe ${id} not found`);
    return updated;
  }

  // ── Soft Delete ─────────────────────────────────────────
  async remove(id: string): Promise<RecipeDocument> {
    const deleted = await this.recipeModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!deleted) throw new NotFoundException(`Recipe ${id} not found or already deleted`);
    return deleted;
  }

  // ── Paginated List ──────────────────────────────────────
async findAll(page = 1, limit = 10, search = '') {

  const skip = (page - 1) * limit;

  const pipeline: any[] = [

    {
      $match: {
        isDeleted: false,
        isActive: true
      }
    },

    {
      $lookup: {
        from: "productvariants",
        localField: "variantId",
        foreignField: "_id",
        as: "variant"
      }
    },
    { $unwind: "$variant" },

    {
      $lookup: {
        from: "products",
        localField: "variant.productId",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },

    {
      $lookup: {
        from: "categories",
        localField: "product.categoryId",
        foreignField: "_id",
        as: "category"
      }
    },
    { $unwind: "$category" },

    {
      $lookup: {
        from: "ingredients",
        localField: "ingredientId",
        foreignField: "_id",
        as: "ingredient"
      }
    },
    { $unwind: "$ingredient" },

    {
      $project: {
        _id: 1,
        quantity: 1,
        variantId: "$variant._id",
        variantSize: "$variant.size",
        productId: "$product._id",
        productName: "$product.name",
        categoryId: "$category._id",
        categoryName: "$category.name",
        ingredientId: "$ingredient._id",
        ingredientName: "$ingredient.name",
        unit: "$ingredient.unit"
      }
    },

    ...(search
      ? [
          {
            $match: {
              $or: [
                { productName: { $regex: search, $options: 'i' } },
                { variantSize: { $regex: search, $options: 'i' } },
                { ingredientName: { $regex: search, $options: 'i' } },
              ],
            },
          },
        ]
      : []),

    {
      $sort: {
        productName: 1,
        variantSize: 1
      }
    },

    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit }
        ],
        totalCount: [
          { $count: "count" }
        ]
      }
    }
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
    hasPrevPage: page > 1
  };
}

  // ── Find by Variant ─────────────────────────────────────
  async findByVariant(variantId: string) {
    const raw = await this.recipeModel
      .find({
        variantId: new Types.ObjectId(variantId),
        isDeleted: false,
      })
      .lean();

    return raw.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      variantId: doc.variantId.toString(),
      ingredientId: doc.ingredientId.toString(),
    }));
  }

  // ── Find One ────────────────────────────────────────────
  async findOne(id: string): Promise<RecipeDocument> {
    const recipe = await this.recipeModel
      .findOne({ _id: id, isDeleted: false })
      .lean();

    if (!recipe) throw new NotFoundException(`Recipe ${id} not found`);
    return recipe as any;
  }
}