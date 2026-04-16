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

const ADMIN_ROLES = [
  'global-admin',
  'india-manager',
  'state-manager',
  'district-manager',
  'block-manager',
];

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
  ctx: any,
  input: CreateProductInput,
): Promise<ProductType> {
  try {
    const user = ctx.user;

    const userDetails = await this.getUserDetailsFromAuth(user.userId);
    console.log('User details from Auth service:', userDetails);

    const isAdmin = ADMIN_ROLES.includes(userDetails.role);

    let isGlobal = false;
    let restaurantId: Types.ObjectId | null = null;

    if (isAdmin) {
      // ✅ Admin case
      isGlobal = true;
      restaurantId = null;
    } else {
      // ✅ Restaurant user case
      if (!userDetails.restaurantIds || userDetails.restaurantIds.length === 0) {
        throw new BadRequestException('No restaurant assigned to user');
      }

      isGlobal = false;
      restaurantId = new Types.ObjectId(userDetails.restaurantIds[0]); // assuming single
    }

    const product = await this.productModel.create({
      name: input.name,
      slug: input.slug,
      categoryId: new Types.ObjectId(input.categoryId),
      description: input.description ?? '',
      imageUrl: input.imageUrl ?? '',
      varients: input.varients ?? [],
      isVeg: input.isVeg ?? true,
      isActive: input.isActive ?? true,
      isOnlineVisible: input.isOnlineVisible ?? true,

      // ✅ NEW FIELDS
      isGlobal,
      restaurantId,
    });

    return {
      _id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId.toString(),
      description: product.description ?? '',
      imageUrl: product.imageUrl ?? '',
      varients: product.varients,
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

      const updateData = {
        ...(input.name && { name: input.name }),
        ...(input.slug && { slug: input.slug }),

        // ✅ convert to ObjectId
        ...(input.categoryId && { categoryId: new Types.ObjectId(input.categoryId) }),

        ...(input.description !== undefined && { description: input.description }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        ...(input.varients && { varients: input.varients }),
        ...(input.isVeg !== undefined && { isVeg: input.isVeg }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.isOnlineVisible !== undefined && {
          isOnlineVisible: input.isOnlineVisible,
        }),
      };

      const product = await this.productModel.findByIdAndUpdate(
        _id,
        updateData,
        { new: true, runValidators: true },
      );

      if (!product) {
        throw new NotFoundException(`Product with ID "${_id}" not found`);
      }

      return {
        _id: product._id.toString(),
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId.toString(), // also convert here
        description: product.description ?? '',
        imageUrl: product.imageUrl ?? '',
        varients: product.varients,
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
    ctx?: any;
  } = {},
) {
  const { name, categoryId, page = 1, limit = 10, ctx } = filters;

  try {
    const user = ctx.user;
    const userDetails = await this.getUserDetailsFromAuth(user.userId);

    const isAdmin = this.isAdminRole(userDetails.role);

    const match: any = {
      isDeleted: false,
      isActive: true,
      isOnlineVisible: true,
    };

    // 🔐 ROLE-BASED FILTER
    if (!isAdmin) {
      if (!userDetails.restaurantIds || userDetails.restaurantIds.length === 0) {
        throw new BadRequestException('No restaurant assigned to user');
      }

      match.$or = [
        { isGlobal: true },
        {
          restaurantId: new Types.ObjectId(userDetails.restaurantIds[0]),
        },
      ];
    }

    // 🔍 Name search
    if (name) {
      match.name = { $regex: name, $options: 'i' };
    }

    // 🔍 Category filter
    if (categoryId) {
      match.categoryId = new Types.ObjectId(categoryId);
    }

    const skip = (page - 1) * limit;

    const pipeline: any = [
      { $match: match },

      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },

      { $unwind: '$category' },

      {
        $match: {
          'category.isActive': true,
        },
      },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: { $toString: '$_id' },
                name: 1,
                slug: 1,
                description: 1,
                imageUrl: 1,
                varients: 1,
                isVeg: 1,
                isActive: 1,
                isOnlineVisible: 1,
                createdAt: 1,
                updatedAt: 1,
                category: {
                  id: { $toString: '$category._id' },
                  name: '$category.name',
                },
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const result = await this.productModel.aggregate(pipeline);

    const data = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    return {
      data,
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
        categoryId: product.categoryId.toString(),
        description: product.description ?? '',
        imageUrl: product.imageUrl ?? '',
        varients: product.varients,
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


  async getProductById(_id: string): Promise<ProductType> {
  const product = await this.productModel
    .findById(new Types.ObjectId(_id))
    .lean();

  if (!product) {
    throw new NotFoundException(`Product ${_id} not found`);
  }

  return {
    ...product,
    _id:        product._id.toString(),
    categoryId: product.categoryId?.toString() ?? null,
  } as any;
}



isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role);
}

}
