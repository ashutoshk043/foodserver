import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRestaurantInput } from '../../dtos/create_restraurent.input';
import { Restaurant } from '../../schemas/restraurent.model';
import * as microservices from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RestaurantPagination } from '../../dtos/restraurent_details_pagination';

/* =======================
   gRPC AUTH INTERFACE
======================= */
interface AuthGrpcService {
  GetUserEmails(data: {
    page: number;
    limit: number;
    search?: string;
  }): any;

  UpdateUserRestaurant(data: {
    ownerEmail: string;
    restaurantId: string;
  }): any;
}

@Injectable()
export class RestraurentService implements OnModuleInit {

  private authService: AuthGrpcService;

  constructor(
    @InjectModel(Restaurant.name, 'restraurentconnection')
    private readonly restaurantModel: Model<Restaurant>,

    @Inject('AUTH_GRPC')
    private readonly client: microservices.ClientGrpc,
  ) {}

  /* =======================
     INIT gRPC SERVICE
  ======================= */
  onModuleInit() {
    this.authService =
      this.client.getService<AuthGrpcService>('AuthService');
  }

  /* =======================
     CREATE RESTAURANT
  ======================= */
  async createRestaurant(input: CreateRestaurantInput): Promise<Restaurant> {

    const existingRestaurant = await this.restaurantModel.findOne({
      $or: [
        { gstNumber: input.gstNumber },
        { fssaiNumber: input.fssaiNumber },
      ],
    });

    if (existingRestaurant) {
      throw new Error('Restaurant already exists with same GST or FSSAI');
    }

    const restaurant = new this.restaurantModel(input);
    const savedRestaurant = await restaurant.save();

    /* 🔗 gRPC CALL → AUTH SERVICE */
    try {
      await firstValueFrom(
        this.authService.UpdateUserRestaurant({
          ownerEmail: input.ownerEmail,
          restaurantId: savedRestaurant.id,
        }),
      );
    } catch (error) {
      console.error(
        '⚠️ Auth service update failed:',
        error?.message || error,
      );
      // ❗ Restaurant create successful rahega
    }

    return savedRestaurant;
  }

  /* =======================
     UPDATE RESTAURANT
  ======================= */
async updateRestaurant(input: CreateRestaurantInput): Promise<Restaurant> {
  if (!input.id) {
    throw new Error('Restaurant ID is required for update');
  }

  // 🔍 Fetch existing restaurant
  const oldRestaurant = await this.restaurantModel.findById(input.id);
  if (!oldRestaurant) {
    throw new Error('Restaurant not found');
  }

  // 🔍 GST / FSSAI duplication check
  const duplicate = await this.restaurantModel.findOne({
    $or: [
      { gstNumber: input.gstNumber },
      { fssaiNumber: input.fssaiNumber },
    ],
    _id: { $ne: input.id },
  });

  if (duplicate) {
    throw new Error('Another restaurant already exists with same GST or FSSAI');
  }

  // 📝 Update restaurant
  const updatedRestaurant = await this.restaurantModel.findByIdAndUpdate(
    input.id,
    input,
    { new: true },
  );

  if (!updatedRestaurant) {
    throw new Error('Restaurant update failed');
  }

  /* ===============================
     📡 gRPC SYNC WITH AUTH (ALWAYS)
  =============================== */

  // if (updatedRestaurant.ownerEmail) {
  //   try {
  //     console.log('🔄 Syncing restaurant with Auth service');

  //     await firstValueFrom(
  //       this.authService.UpdateUserRestaurant({
  //         ownerEmail: updatedRestaurant.ownerEmail,
  //         restaurantId: updatedRestaurant.id,
  //       }),
  //     );

  //     console.log('✅ Auth sync successful');
  //   } catch (error) {
  //     console.error(
  //       '⚠️ Auth sync failed (restaurant update still OK):',
  //       error?.message || error,
  //     );
  //   }
  // }

  return updatedRestaurant;
}



  /* =======================
     GET RESTAURANTS
  ======================= */
  async getRestaurants(
    page: number,
    limit: number,
    search?: string,
  ): Promise<RestaurantPagination> {

    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.restaurantName = { $regex: search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      this.restaurantModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.restaurantModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /* =======================
     GET USERS FROM AUTH
  ======================= */
  async getUsers(input: any) {
    return firstValueFrom(
      this.authService.GetUserEmails(input),
    );
  }



  async getRestaurantSummary() {
  const result = await this.restaurantModel.aggregate([
    {
      $group: {
        _id: null,
        totalRestaurants: { $sum: 1 },
        openCount: {
          $sum: {
            $cond: [{ $eq: ['$openStatus', true] }, 1, 0],
          },
        },
        closedCount: {
          $sum: {
            $cond: [{ $eq: ['$openStatus', false] }, 1, 0],
          },
        },
      },
    },
  ]);

  // Agar koi restaurant hi nahi ho
  if (!result.length) {
    return {
      totalRestaurants: 0,
      openCount: 0,
      closedCount: 0,
    };
  }

  return {
    totalRestaurants: result[0].totalRestaurants,
    openCount: result[0].openCount,
    closedCount: result[0].closedCount,
  };
}

}
