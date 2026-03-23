import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductVariant, ProductVariantDocument } from '../schema/product-variant.schema';
import { GetVariantsInput } from '../dtos/get-variants.input';
import { CreateProductVariantInput } from '../dtos/create-product-variant.input';
import { UpdateProductVariantInput } from '../dtos//update-product-variant.input';
import { ProductVariantListResponse } from '../types/product-variant-list.response';
import { ProductVariantType } from '../types/product-variant.type';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectModel(ProductVariant.name, 'restraurentconnection')
    private readonly variantModel: Model<ProductVariantDocument>,
  ) { }
  // Converts any ObjectId fields to string for GQL layer
  private mapVariant(doc: any): ProductVariantType {
    return {
      _id:       doc._id?.toString(),
      productId: doc.productId?.toString(),   // ObjectId → string
      size:      doc.size,
      isActive:  doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      product:   doc.product
        ? {
            _id:  doc.product._id?.toString(),
            name: doc.product.name,
          }
        : undefined,
    };
  }

  async getProductVariants(input: GetVariantsInput): Promise<ProductVariantListResponse> {
    const { page = 1, limit = 10, search } = input;
    const skip = (page - 1) * limit;

const basePipeline: any[] = [
  // ✅ Variant must be active
  {
    $match: {
      isActive: true,
    },
  },

  // 🔗 Join Product
  {
    $lookup: {
      from: 'products',
      localField: 'productId',
      foreignField: '_id',
      as: 'product',
    },
  },

  // ❌ remove null products
  {
    $unwind: '$product',
  },

  // ✅ Product must be active
  {
    $match: {
      'product.isActive': true,
    },
  },

  // 🔗 Join Category
  {
    $lookup: {
      from: 'categories',
      localField: 'product.categoryId',
      foreignField: '_id',
      as: 'category',
    },
  },

  // ❌ remove null category
  {
    $unwind: '$category',
  },

  // ✅ Category must be active
  {
    $match: {
      'category.isActive': true,
    },
  },

  // 🔍 Search on product name
  ...(search
    ? [{ $match: { 'product.name': { $regex: search, $options: 'i' } } }]
    : []),

  // 🎯 Final projection
  {
    $project: {
      productId: 1,
      size: 1,
      isActive: 1,
      createdAt: 1,
      updatedAt: 1,

      product: {
        _id: '$product._id',
        name: '$product.name',
      },

      category: {
        _id: '$category._id',
        name: '$category.name',
      },
    },
  },
];

    const [data, countResult] = await Promise.all([
      this.variantModel.aggregate([...basePipeline, { $skip: skip }, { $limit: limit }]),
      this.variantModel.aggregate([...basePipeline, { $count: 'total' }]),
    ]);

    const total      = countResult[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data:        data.map((d) => this.mapVariant(d)),  // <-- map all docs
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async createProductVariant(input: CreateProductVariantInput): Promise<ProductVariantType> {
    const variant = new this.variantModel({
      ...input,
      productId: new Types.ObjectId(input.productId),    // string → ObjectId for DB
    });
    const saved = await variant.save();
    return this.mapVariant(saved.toObject());
  }

  async updateProductVariant(input: UpdateProductVariantInput): Promise<ProductVariantType> {
    const { _id, ...rest } = input;
    const updated = await this.variantModel.findByIdAndUpdate(
      new Types.ObjectId(_id),
      { $set: rest },
      { new: true },
    );
    if (!updated) throw new NotFoundException(`Variant ${_id} not found`);
    return this.mapVariant(updated.toObject());
  }

  async deleteProductVariant(id: string): Promise<boolean> {
    const result = await this.variantModel.findByIdAndDelete(new Types.ObjectId(id));
    if (!result) throw new NotFoundException(`Variant ${id} not found`);
    return true;
  }
}