import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product_schema';
import { CreateProductInput } from '../../dtos/create_product_input';
import { ProductType } from '../../types/product.types';
import { Restaurant } from 'apps/foodservers/src/restraurent/schemas/restraurent.model';
import { firstValueFrom, Observable } from 'rxjs';
import { Server } from 'http';
import * as microservices from '@nestjs/microservices';
import { Restraurents } from '../../types/restaurant.types';

interface AuthGrpcService {
  GetUserDetails(data: {
    userId: string;
  }): Observable<any>;
}

@Injectable()
export class AddEditProductsService {

  private authGRPCService: AuthGrpcService;

  constructor(
    @InjectModel(Product.name, 'restraurentconnection')
    private readonly productModel: Model<ProductDocument>,

    @InjectModel(Restaurant.name, 'restraurentconnection')
    private readonly restaurantModel: Model<Restaurant>,

    @Inject('AUTH_GRPC')
    private readonly client: microservices.ClientGrpc,
  ) { }

  onModuleInit() {
    this.authGRPCService =
      this.client.getService<AuthGrpcService>('AuthService');
  }
  async createProduct(
    input: CreateProductInput,
  ): Promise<ProductType> {
    try {
      const product = await this.productModel.create({
        name: input.name,
        slug: input.slug,
        categoryId: input.categoryId,
        description: input.description ?? '',
        imageUrl: input.imageUrl ?? '',
        tags: input.tags ?? [],
        isVeg: input.isVeg ?? true,
        isActive: input.isActive ?? true,
        isOnlineVisible: input.isOnlineVisible ?? true,
      });

      return {
        _id: product._id.toString(),
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId,
        description: product.description ?? '',
        imageUrl: product.imageUrl ?? '',
        tags: product.tags,
        isVeg: product.isVeg,
        isActive: product.isActive,
        isOnlineVisible: product.isOnlineVisible,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

    } catch (error) {
      console.error('Error in createProduct:', error);

      if (error?.code === 11000) {
        throw new BadRequestException('Product already exists');
      }

      throw new InternalServerErrorException('Failed to create product');
    }
  }


  // add-edit-products.service.ts
  async updateProduct(
    _id: string,
    input: CreateProductInput,
  ): Promise<ProductType> {
    try {
      // 1️⃣ Prepare update payload (only allowed fields)
      const updateData = {
        ...(input.name && { name: input.name }),
        ...(input.slug && { slug: input.slug }),
        ...(input.categoryId && { categoryId: input.categoryId }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        ...(input.tags && { tags: input.tags }),
        ...(input.isVeg !== undefined && { isVeg: input.isVeg }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.isOnlineVisible !== undefined && {
          isOnlineVisible: input.isOnlineVisible,
        }),
      };

      // 2️⃣ Update product
      const product = await this.productModel.findByIdAndUpdate(
        _id,
        updateData,
        { new: true, runValidators: true },
      );

      // 3️⃣ Not found check
      if (!product) {
        throw new NotFoundException(`Product with ID "${_id}" not found`);
      }

      // 4️⃣ SAFE mapping
      return {
        _id: product._id.toString(),
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId,
        description: product.description ?? '',
        imageUrl: product.imageUrl ?? '',
        tags: product.tags,
        isVeg: product.isVeg,
        isActive: product.isActive,
        isOnlineVisible: product.isOnlineVisible,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

    } catch (error) {
      console.error('Error in updateProduct:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.name === 'CastError') {
        throw new BadRequestException(`Invalid Product ID format`);
      }

      throw new InternalServerErrorException(
        'An error occurred while updating the product',
      );
    }
  }

  async searchProducts(
    filters: {
      name?: string;
      categoryId?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { name, categoryId, page = 1, limit = 10 } = filters;

    try {
      const query: any = {};

      // 🔍 Search filters
      if (name) {
        query.name = { $regex: name, $options: 'i' };
      }

      if (categoryId) {
        query.categoryId = categoryId;
      }

      // Only active + visible products
      // query.isActive = true;
      // query.isOnlineVisible = true;

      const skip = (page - 1) * limit;

      // 📊 Fetch data + count
      const [products, total] = await Promise.all([
        this.productModel
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        this.productModel.countDocuments(query),
      ]);

      // 🧼 Map DB → API
      return {
        data: products.map((product) => ({
          _id: product._id.toString(),
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          description: product.description ?? '',
          imageUrl: product.imageUrl ?? '',
          tags: product.tags,
          isVeg: product.isVeg,
          isActive: product.isActive,
          isOnlineVisible: product.isOnlineVisible,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })),
        total,
        page,
        limit,
      };

    } catch (error) {
      console.error('Error in searchProducts:', error);
      throw new InternalServerErrorException(
        'An error occurred during product search',
      );
    }
  }


  async deleteProduct(_id: string): Promise<ProductType> {
    try {
      // 1️⃣ Find & delete
      const product = await this.productModel.findByIdAndDelete(_id);

      if (!product) {
        throw new NotFoundException(`Product with ID "${_id}" not found`);
      }

      // 2️⃣ Safe mapping
      return {
        _id: product._id.toString(),
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId,
        description: product.description ?? '',
        imageUrl: product.imageUrl ?? '',
        tags: product.tags,
        isVeg: product.isVeg,
        isActive: product.isActive,
        isOnlineVisible: product.isOnlineVisible,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

    } catch (error) {
      console.error('Error in deleteProduct:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error?.name === 'CastError') {
        throw new BadRequestException(`Invalid Product ID format`);
      }

      throw new InternalServerErrorException('Failed to delete product');
    }
  }

  async getAllRestaurants(ctx: any): Promise<Restraurents[]> {
    try {
      const user = ctx.user;
      if (!user) throw new UnauthorizedException('User not found');

      // 🔹 Auth service call (already wrapped inside helper)
      const userDetails = await this.getUserDetailsFromAuth(user.userId);

      const restIds = userDetails.restaurantIds || [];
      if (!restIds.length) return [];

      // 🔹 DB fetch
      const restaurantsDetails = await this.restaurantModel.find({
        _id: { $in: restIds.map(id => new Types.ObjectId(id)) },
      });

      // 🔹 Map DB → GraphQL type
      return restaurantsDetails.map(r => ({
        _id: r._id.toString(),
        name: r.restaurantName,
      }));

    } catch (error) {
      console.error('Get Restaurants Error:', error);

      // gRPC errors already handled inside helper, so this mostly DB errors
      throw new InternalServerErrorException('Failed to fetch restaurants');
    }
  }

  private async getUserDetailsFromAuth(userId: string) {
    try {
      const userDetails = await firstValueFrom(
        this.authGRPCService.GetUserDetails({ userId }),
      );

      if (!userDetails) {
        throw new NotFoundException('User not found in Auth service');
      }

      return userDetails;

    } catch (error) {
      throw new ServiceUnavailableException('Auth service not reachable');
    }
  }

}
