import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product_schema';
import { CreateProductInput } from '../../dtos/create_product_input';
import { ProductType } from '../../types/product.types';

@Injectable()
export class AddEditProductsService {

  constructor(
    @InjectModel(Product.name, 'restraurentconnection')
    private readonly productModel: Model<ProductDocument>,
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


  // add-edit-products.service.ts
  async searchProducts(filters: {
    name?: string;
    category?: string;
  } = {}): Promise<ProductType[]> {

    const query: any = {};

    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' }; // case-insensitive
    }

    if (filters.category) {
      query.category = { $regex: filters.category, $options: 'i' };
    }

    // Agar filters empty hain, to pura collection fetch hoga
    const products = await this.productModel.find(query);

    return products.map((product) => ({
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
    }));
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
