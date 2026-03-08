// product-variant.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductVariant, ProductVariantDocument } from '../schema/product-variant.schema';
import { CreateProductVariantInput } from '../dtos/create-product-variant.input';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectModel(ProductVariant.name, 'restraurentconnection')
    private readonly variantModel: Model<ProductVariantDocument>,
  ) {}

async addProductVariant(input: CreateProductVariantInput) {
  return this.variantModel.create({
    ...input,
    productId: new Types.ObjectId(input.productId), // 👈 FIX
  });
}

async updateProductVariant(_id: string, input: CreateProductVariantInput) {
  return this.variantModel.findByIdAndUpdate(
    _id,
    {
      ...input,
      productId: new Types.ObjectId(input.productId), // 👈 FIX
    },
    // { new: true },
  );
}


async getProductVariants(
  productId?: string,
  size?: string,
  page: number = 1,
  limit: number = 10,
) {
  const matchStage: any = {};

  if (productId) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid productId');
    }
    matchStage.productId = new Types.ObjectId(productId);
  }

  if (size) {
    matchStage.size = size;
  }

  const skip = (page - 1) * limit;

  const result = await this.variantModel.aggregate([
    { $match: matchStage },

    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product',
      },
    },

    {
      $unwind: {
        path: '$product',
        preserveNullAndEmptyArrays: true,
      },
    },

    // ✅ IMPORTANT FIX HERE
    {
      $project: {
        _id: { $toString: '$_id' },              // 🔥 MUST
        productId: { $toString: '$productId' },  // 🔥 MUST
        size: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,                            // 🔥 MUST
        product: {
          _id: { $toString: '$product._id' },
          name: '$product.name',
        },
      },
    },

    { $sort: { createdAt: -1 } },

    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  const data = result[0]?.data || [];
  const total = result[0]?.totalCount[0]?.count || 0;

  return {
    data,
    total,
    page,
    limit,
  };
}
}