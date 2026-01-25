import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product_schema';
import { CreateProductInput } from '../../dtos/create_product_input';
import { ProductType } from '../../types/product.types';
import { Restaurant } from 'apps/foodservers/src/restraurent/schemas/restraurent.model';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AddEditProductsService {

  constructor(
    @InjectModel(Product.name, 'restraurentconnection')
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Restaurant.name, 'restraurentconnection')
    private readonly restaurantModel: Model<Restaurant>,
  ) { }

  async createProduct(
    input: CreateProductInput,
  ): Promise<ProductType> {

    const product = await this.productModel.create(input);

    return {
      _id: product._id.toString(),
      productId: product.productId,
      name: product.name,
      description: product.description,
      category: product.category,
      variant: product.variant,
      price: product.price,
      stock: product.stock,
      status: product.status,
      imageUrl: product.imageUrl,
      restaurantName: product.restaurantName.toString(),
    };
  }



  // add-edit-products.service.ts
  async updateProduct(
    _id: string,
    input: CreateProductInput,
  ): Promise<ProductType> {

    const product = await this.productModel.findByIdAndUpdate(
      _id,
      input,
      { new: true }, // updated document return
    );

    if (!product) {
      throw new NotFoundException(`Product with _id ${_id} not found`);
    }

    return {
      _id: product._id.toString(),
      productId: product.productId,
      name: product.name,
      description: product.description,
      category: product.category,
      variant: product.variant,
      price: product.price,
      stock: product.stock,
      status: product.status,
      imageUrl: product.imageUrl,
      restaurantName: product.restaurantName.toString(),
    };
  }


async searchProducts(
  filters: {
    name?: string;
    category?: string;
    page?: number;
    limit?: number;
    user?: any;
  } = {},
) {
  const {
    name,
    category,
    page = 1,
    limit = 10,
    user,
  } = filters;

  console.log(user, 'user');

  const query: any = {};

  if (name) {
    query.name = { $regex: name, $options: 'i' };
  }

  if (category) {
    query.category = { $regex: category, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    this.productModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),

    this.productModel.countDocuments(query),
  ]);

  return {
    data: products.map((product) => ({
      _id: product._id.toString(),
      productId: product.productId,
      name: product.name,
      description: product.description,
      category: product.category,
      variant: product.variant,
      price: product.price,
      stock: product.stock,
      status: product.status,
      imageUrl: product.imageUrl,
      restaurantName: product.restaurantName.toString(),
    })),
    total,
    page,
    limit,
  };
}

  async deleteProduct(_id: string): Promise<ProductType> {
    const product = await this.productModel.findByIdAndDelete(_id);

    if (!product) {
      throw new NotFoundException(`Product with _id ${_id} not found`);
    }

    return {
      _id: product._id.toString(),
      productId: product.productId,
      name: product.name,
      description: product.description,
      category: product.category,
      variant: product.variant,
      price: product.price,
      stock: product.stock,
      status: product.status,
      imageUrl: product.imageUrl,
      restaurantName: product.restaurantName.toString(),
    };
  }


}
