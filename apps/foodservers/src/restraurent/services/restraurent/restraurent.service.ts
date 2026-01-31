import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateRestaurantInput } from '../../dtos/create_restraurent.input';
import { Restaurant } from '../../schemas/restraurent.model';
import * as microservices from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RestaurantPagination } from '../../dtos/restraurent_details_pagination';
import { Observable } from 'rxjs';

/* =======================
   gRPC AUTH INTERFACE
======================= */
interface AuthGrpcService {

  GetUserEmails(data: {
    page: number;
    limit: number;
    search?: string;
  }): Observable<any>;

  UpdateUserRestaurant(data: {
    ownerEmail: string;
    restaurantId: string;
  }): Observable<any>;

  GetUserDetails(data: {
    userId: string;
  }): Observable<any>;
}
@Injectable()
export class RestraurentService implements OnModuleInit {

  private authGRPCService: AuthGrpcService;

  constructor(
    @InjectModel(Restaurant.name, 'restraurentconnection')
    private readonly restaurantModel: Model<Restaurant>,

    @Inject('AUTH_GRPC')
    private readonly client: microservices.ClientGrpc,
  ) { }

  /* =======================
     INIT gRPC SERVICE
  ======================= */
  onModuleInit() {
    this.authGRPCService =
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
        this.authGRPCService.UpdateUserRestaurant({
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

    return updatedRestaurant;
  }



  /* =======================
     GET RESTAURANTS
  ======================= */
  async getRestaurants(
    user: any,
    page: number,
    limit: number,
    search?: string,
    restId?: string
  ): Promise<RestaurantPagination> {

    // ✅ Validate pagination
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Invalid page or limit value');
    }

    // ✅ Validate logged-in user
    if (!user || !user.userId) {
      throw new ForbiddenException('User authentication failed');
    }

    const skip = (page - 1) * limit;
    const filter: any = {};

    try {
      // 🔗 Fetch user from Auth service
      let userDetails: any;

      try {
        userDetails = await firstValueFrom(
          this.authGRPCService.GetUserDetails({ userId: user.userId })
        );
      } catch (err) {
        throw new ServiceUnavailableException('Auth service not reachable');
      }

      if (!userDetails || !userDetails.role) {
        throw new NotFoundException('User details not found');
      }

      const highRoles = ["global-admin", "india-manager", "state-manager", "district-manager", "block-manager"];
      const restrictedRoles = ["restaurant-owner", "restaurant-manager"];

      // 🔎 Search filter
      if (search) {
        filter.restaurantName = { $regex: search, $options: 'i' };
      }

      // 🧠 Role based access
      if (restrictedRoles.includes(userDetails.role)) {

        if (!Array.isArray(userDetails.restaurantIds)) {
          throw new ForbiddenException('No restaurant access assigned');
        }

        if (restId) {
          if (!Types.ObjectId.isValid(restId)) {
            throw new BadRequestException('Invalid restaurant ID');
          }

          if (!userDetails.restaurantIds.includes(restId)) {
            throw new ForbiddenException('You are not allowed to access this restaurant');
          }

          filter._id = restId;
        } else {
          filter._id = { $in: userDetails.restaurantIds };
        }

      } else if (highRoles.includes(userDetails.role)) {

        if (restId) {
          if (!Types.ObjectId.isValid(restId)) {
            throw new BadRequestException('Invalid restaurant ID');
          }
          filter._id = restId;
        }

      } else {
        throw new ForbiddenException('Your role does not have access');
      }

      // 🗄 DB Query
      const [data, total] = await Promise.all([
        this.restaurantModel
          .find(filter)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .exec(),
        this.restaurantModel.countDocuments(filter),
      ]);

      return { data, total, page, limit };

    } catch (err) {
      console.error('❌ getRestaurants Error:', err);

      // If already NestJS HTTP exception → rethrow
      if (err.status) throw err;

      throw new InternalServerErrorException('Failed to fetch restaurants');
    }
  }


  /* =======================
     GET USERS FROM AUTH
  ======================= */
  async getUsers(input: any) {
    return firstValueFrom(
      this.authGRPCService.GetUserEmails(input),
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

  async deleteRestaurant(id: string) {
    return this.restaurantModel.findByIdAndDelete(id);
  }


}
