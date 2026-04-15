import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RestaurantImage,
  ImageType,
  RestaurantImageDocument,
} from '../schemas/logo_banner';
import { UploadService } from '../upload/upload.service';
import { ServicegrpcService } from '../../grpcmodule/servicegrpc/servicegrpc.service';
import { BulkUploadImageDto } from '../dtos/bulk-upload-image.dto';
import { productImage, productImageDocument } from '../schemas/bulk-image.schema';


// constants/roles.constant.ts
export const ADMIN_ROLES = new Set([
  'global-admin',
  'india-manager',
  'state-manager',
  'district-manager',
  'block-manager',
  'marketing-manager',
  'finance-accounts',
  'quality-inspector',
  'support-executive',
]);

export const RESTAURANT_ROLES = new Set([
  'restaurant-owner',
  'restaurant-manager',
  'chef-kitchen-head',
  'waiter-service-staff',
  'inventory-manager',
  'delivery-partner',
]);


function ownsRestaurant(userDetails: any, restaurantId: string): boolean {
  return (
    Array.isArray(userDetails.restaurantIds) &&
    userDetails.restaurantIds.includes(restaurantId.toString())
  );
}

@Injectable()
export class ServicesCloudService {
  constructor(
    @InjectModel(RestaurantImage.name, 'restraurentconnection')
    private readonly restaurantImageModel: Model<RestaurantImageDocument>,
        @InjectModel(productImage.name, 'restraurentconnection')  // ← must match module registration exactly
    private readonly bulkImageModel: Model<productImageDocument>,
    private readonly uploadService: UploadService,
    private readonly authGrpc: ServicegrpcService,
  ) {}

  // ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// UPLOAD IMAGE  (always INSERT — never replace)
// ─────────────────────────────────────────────
async uploadImage(file: Express.Multer.File, body: any, user: any) {
  const session = await this.restaurantImageModel.db.startSession();
  session.startTransaction();

  let uploadedFile: { url: string; key: string } | null = null;

  try {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const userDetails = await this.authGrpc.getUserDetails(user);

    const restaurantId =
      userDetails.restaurantIds && userDetails.restaurantIds.length > 0
        ? userDetails.restaurantIds[0]
        : null;

    // ✅ STEP 1: Upload to R2
    uploadedFile = await this.uploadService.uploadFile(
      file,
      body.filetype,
      body.imageName,
    );

    // ❌ अगर upload fail → catch में जाएगा (no DB touch)

    // ✅ STEP 2: DB save (transaction)
    const newImage = new this.restaurantImageModel({
      filetype: body.filetype,
      imageName: body.imageName ?? '',
      url: uploadedFile.url,
      key: uploadedFile.key,
      isGlobal: !restaurantId,
      restaurantId: restaurantId ?? null,
      isActive: true,
      isVerified: false,
      verifiedBy: null,
    });

    const savedImage = await newImage.save({ session });

    // ✅ COMMIT
    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: 'Image uploaded successfully',
      data: {
        id: savedImage._id,
        restaurantId: savedImage.restaurantId,
        filetype: savedImage.filetype,
        imageName: savedImage.imageName,
        url: savedImage.url,
        key: savedImage.key,
        isActive: savedImage.isActive,
        isVerified: savedImage.isVerified,
      },
    };
  } catch (error) {
    // ❌ DB rollback
    await session.abortTransaction();
    session.endSession();

    // ❌ R2 rollback (IMPORTANT)
    if (uploadedFile?.key) {
      try {
        await this.uploadService.deleteFile(uploadedFile.key);
        console.log('🧹 Rolled back uploaded file from R2');
      } catch (deleteErr) {
        console.error('❌ Failed to rollback file from R2:', deleteErr);
      }
    }

    console.error('Upload Image Error:', error);

    if (error instanceof BadRequestException) throw error;

    throw new InternalServerErrorException(
      error?.message || 'Something went wrong while uploading image',
    );
  }
}

  // ─────────────────────────────────────────────
  // VERIFY IMAGE
  // ─────────────────────────────────────────────
  async verifyImage(imageId: string, user: any, isVerified: boolean) {
    try {
      const image = await this.restaurantImageModel.findById(imageId);

      if (!image || image.isDeleted) {
        throw new NotFoundException('Image not found');
      }

      const userDetails = await this.authGrpc.getUserDetails(user);

if (image.restaurantId && !ownsRestaurant(userDetails, image.restaurantId.toString())) {
  throw new BadRequestException('You do not have permission to delete this image');
}

      image.isVerified = isVerified;
      image.verifiedBy = isVerified ? new Types.ObjectId(userDetails.id) : null;
      await image.save();

      return {
        success: true,
        message: isVerified ? 'Image verified successfully' : 'Image unverified successfully',
        data: {
          id: image._id,
          isVerified: image.isVerified,
          verifiedBy: image.verifiedBy,
        },
      };
    } catch (error) {
      console.error('Verify Image Error:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to update image verification status');
    }
  }

  // ─────────────────────────────────────────────
  // GET IMAGES
  // ─────────────────────────────────────────────
async getImages(user: any, page: number, limit: number, search?: string) {
  try {
    const userDetails = await this.authGrpc.getUserDetails(user);

    const userRole: string = userDetails?.role?.id ?? userDetails?.role;
    const restaurantIds: string[] = userDetails?.restaurantIds ??
      (userDetails?.restaurantId ? [userDetails.restaurantId] : []);

    // ── GUARD: unknown role ──────────────────────────────────────
    if (!ADMIN_ROLES.has(userRole) && !RESTAURANT_ROLES.has(userRole)) {
      throw new ForbiddenException('Access denied: unrecognized role');
    }

    // ── GUARD: restaurant role but no restaurantId ────────────────
    if (RESTAURANT_ROLES.has(userRole) && restaurantIds.length === 0) {
      throw new BadRequestException('Restaurant ID missing for this user');
    }

    const skip = (page - 1) * limit;

    // ── BASE FILTER ───────────────────────────────────────────────
    const filter: any = {
      isActive: true,
      isDeleted: { $ne: true },
    };

    // ── ROLE FILTER ───────────────────────────────────────────────
    if (RESTAURANT_ROLES.has(userRole)) {
      // Restaurant sees: their own images OR globally shared admin images
      filter.$or = [
        { restaurantId: { $in: restaurantIds } },
        { isGlobal: true },
      ];
    }
    // admin roles → no extra filter, sees everything

    // ── SEARCH FILTER ─────────────────────────────────────────────
    if (search?.trim()) {
      filter.imageName = { $regex: search.trim(), $options: 'i' };
    }

    const [data, total] = await Promise.all([
      this.restaurantImageModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.restaurantImageModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Get Images Error:', error);
    if (error instanceof BadRequestException) throw error;
    if (error instanceof ForbiddenException) throw error;
    throw new InternalServerErrorException('Failed to fetch images');
  }
}

async getProductImages(user: any, page: number, limit: number, search?: string) {
  try {
    const userDetails = await this.authGrpc.getUserDetails(user);

    const userRole: string = userDetails?.role?.id ?? userDetails?.role;
    const restaurantIds: string[] = userDetails?.restaurantIds ??
      (userDetails?.restaurantId ? [userDetails.restaurantId] : []);

    // ── GUARD: unknown role ──────────────────────────────────────
    if (!ADMIN_ROLES.has(userRole) && !RESTAURANT_ROLES.has(userRole)) {
      throw new ForbiddenException('Access denied: unrecognized role');
    }

    // ── GUARD: restaurant role but no restaurantId ────────────────
    if (RESTAURANT_ROLES.has(userRole) && restaurantIds.length === 0) {
      throw new BadRequestException('Restaurant ID missing for this user');
    }

    const skip = (page - 1) * limit;

    // ── BASE FILTER ───────────────────────────────────────────────
    const filter: any = {
      isActive: true,
      isDeleted: { $ne: true },
      filetype: 'PRODUCT',
    };

    // ── ROLE FILTER ───────────────────────────────────────────────
    if (RESTAURANT_ROLES.has(userRole)) {
      // Restaurant sees: their own images OR globally shared admin images
      filter.$or = [
        { restaurantId: { $in: restaurantIds } },
        { isGlobal: true },
      ];
    }
    // admin roles → no extra filter, sees everything

    // ── SEARCH FILTER ─────────────────────────────────────────────
    if (search?.trim()) {
      filter.imageName = { $regex: search.trim(), $options: 'i' };
    }

    const [data, total] = await Promise.all([
      this.bulkImageModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.bulkImageModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Get Product Images Error:', error);
    if (error instanceof BadRequestException) throw error;
    if (error instanceof ForbiddenException) throw error;
    throw new InternalServerErrorException('Failed to fetch product images');
  }
}


// ─────────────────────────────────────────────
// HELPER — resolve role string safely
// ─────────────────────────────────────────────
readonly resolveRole = (userDetails: any): string => {
  return userDetails?.role?.id ?? userDetails?.role ?? '';
};

// ─────────────────────────────────────────────
// DELETE IMAGE
// ─────────────────────────────────────────────
async deleteImage(imageId: string, user: any) {
  try {
    const image = await this.restaurantImageModel.findById(imageId);

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    const userDetails = await this.authGrpc.getUserDetails(user);
    const userRole = this.resolveRole(userDetails);

    // ── GUARD: unknown role ──────────────────────────────────────
    if (!ADMIN_ROLES.has(userRole) && !RESTAURANT_ROLES.has(userRole)) {
      throw new ForbiddenException('Access denied: unrecognized role');
    }

    // ── PERMISSION LOGIC ─────────────────────────────────────────
    if (RESTAURANT_ROLES.has(userRole)) {
      // Restaurant users CANNOT delete global images
      if (image.isGlobal || !image.restaurantId) {
        throw new ForbiddenException(
          'You do not have permission to delete global images',
        );
      }

      // Restaurant users can only delete their own restaurant's images
      if (!ownsRestaurant(userDetails, image.restaurantId.toString())) {
        throw new ForbiddenException(
          'You do not have permission to delete this image',
        );
      }
    }
    // ADMIN_ROLES → can delete anything (global or restaurant-specific)

    // ── PROMOTE FALLBACK if active ────────────────────────────────
    let newActiveImage: { id: string; url: string } | null = null;

    if (image.isActive) {
      const fallbackImage = await this.restaurantImageModel
        .findOne({
          restaurantId: image.restaurantId,
          filetype: image.filetype,
          _id: { $ne: image._id },
          isDeleted: { $ne: true },
        })
        .sort({ createdAt: -1 });

      if (fallbackImage) {
        fallbackImage.isActive = true;
        await fallbackImage.save();
        newActiveImage = {
          id: fallbackImage._id.toString(),
          url: fallbackImage.url,
        };
      }
    }

    // ── DELETE from R2 — non-blocking ─────────────────────────────
    try {
      await this.uploadService.deleteFile(image.key);
    } catch (err) {
      console.error('R2 delete failed (DB will still be cleaned):', err);
    }

    // ── HARD DELETE from DB ───────────────────────────────────────
    await this.restaurantImageModel.findByIdAndDelete(imageId);

    return {
      success: true,
      message: 'Image deleted permanently',
      newActiveImage,
    };
  } catch (error) {
    console.error('Delete Image Error:', error);
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException ||
      error instanceof ForbiddenException
    )
      throw error;
    throw new InternalServerErrorException('Failed to delete image');
  }
}

// ─────────────────────────────────────────────
// DELETE PRODUCT IMAGE
// ─────────────────────────────────────────────
async deleteProductImage(imageId: string, user: any) {
  try {
    const image = await this.bulkImageModel.findById(imageId);

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    const userDetails = await this.authGrpc.getUserDetails(user);
    const userRole = this.resolveRole(userDetails);

    // ── GUARD: unknown role ──────────────────────────────────────
    if (!ADMIN_ROLES.has(userRole) && !RESTAURANT_ROLES.has(userRole)) {
      throw new ForbiddenException('Access denied: unrecognized role');
    }

    // ── PERMISSION LOGIC ─────────────────────────────────────────
    if (RESTAURANT_ROLES.has(userRole)) {
      // Restaurant users CANNOT delete global images
      if (image.isGlobal || !image.restaurantId) {
        throw new ForbiddenException(
          'You do not have permission to delete global images',
        );
      }

      // Restaurant users can only delete their own restaurant's images
      if (!ownsRestaurant(userDetails, image.restaurantId.toString())) {
        throw new ForbiddenException(
          'You do not have permission to delete this image',
        );
      }
    }
    // ADMIN_ROLES → can delete anything (global or restaurant-specific)

    // ── PROMOTE FALLBACK if active ────────────────────────────────
    let newActiveImage: { id: string; url: string } | null = null;

    if (image.isActive) {
      const fallbackImage = await this.bulkImageModel
        .findOne({
          restaurantId: image.restaurantId,
          filetype: image.filetype,
          _id: { $ne: image._id },
          isDeleted: { $ne: true },
        })
        .sort({ createdAt: -1 });

      if (fallbackImage) {
        fallbackImage.isActive = true;
        await fallbackImage.save();
        newActiveImage = {
          id: fallbackImage._id.toString(),
          url: fallbackImage.url,
        };
      }
    }

    // ── DELETE from R2 — non-blocking ─────────────────────────────
    try {
      await this.uploadService.deleteFile(image.key);
    } catch (err) {
      console.error('R2 delete failed (DB will still be cleaned):', err);
    }

    // ── HARD DELETE from DB ───────────────────────────────────────
    await this.bulkImageModel.findByIdAndDelete(imageId);

    return {
      success: true,
      message: 'Image deleted permanently',
      newActiveImage,
    };
  } catch (error) {
    console.error('Delete Product Image Error:', error);
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException ||
      error instanceof ForbiddenException
    )
      throw error;
    throw new InternalServerErrorException('Failed to delete product image');
  }
}


  // ─────────────────────────────────────────────
// BULK VERIFY IMAGE
// ─────────────────────────────────────────────
async bulkVerifyImages(ids: string[], user: any, isVerified: boolean) {
  try {
    if (!ids || !ids.length) {
      throw new BadRequestException('No IDs provided');
    }

    const userDetails = await this.authGrpc.getUserDetails(user);
    const userRole = this.resolveRole(userDetails);

    // ── GUARD: only admin roles can verify ───────────────────────
    if (!ADMIN_ROLES.has(userRole)) {
      throw new ForbiddenException('Only admin users can verify images');
    }

    const objectIds = ids.map(id => new Types.ObjectId(id));

    const images = await this.bulkImageModel.find({
      _id: { $in: objectIds },
      isDeleted: { $ne: true },
    });

    if (!images.length) {
      throw new NotFoundException('No matching images found');
    }

    // ── Bulk update in one query ──────────────────────────────────
    await this.bulkImageModel.updateMany(
      { _id: { $in: objectIds }, isDeleted: { $ne: true } },
      {
        $set: {
          isVerified,
          verifiedBy: isVerified ? new Types.ObjectId(userDetails.id) : null,
        },
      },
    );

    return {
      success: true,
      message: `${images.length} image(s) ${isVerified ? 'verified' : 'unverified'} successfully`,
    };
  } catch (error) {
    console.error('Bulk Verify Error:', error);
    if (
      error instanceof BadRequestException ||
      error instanceof ForbiddenException ||
      error instanceof NotFoundException
    )
      throw error;

    throw new InternalServerErrorException('Failed to bulk update images');
  }
}



// ─────────────────────────────────────────────────────────────────────────────
// BULK UPLOAD IMAGES
// Uploads each file to R2 + saves to DB independently.
// A failure in one file does NOT block the others.
// ─────────────────────────────────────────────────────────────────────────────
async bulkUploadImages(
  files: Express.Multer.File[],
  body: BulkUploadImageDto,
  user: any,
) {
  try {
    // ── GUARD ─────────────────────────────────────────────────────
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const userDetails = await this.authGrpc.getUserDetails(user);
    const restaurantId =
      userDetails.restaurantIds?.length > 0
        ? userDetails.restaurantIds[0]
        : null;

    // ── Process each file independently ───────────────────────────
    const results = await Promise.allSettled(
      files.map(async (file) => {
        let uploadedFile: { url: string; key: string } | null = null;

        try {                                       
          // Build a unique imageName per file
          const imageName = body.folderName
            ? `${body.folderName}-${file.originalname}`
            : file.originalname;

          // STEP 1 — Upload to R2
          uploadedFile = await this.uploadService.uploadFile(
            file,
            body.filetype,
            imageName,
          );

          // STEP 2 — Save to DB
          const newImage = new this.bulkImageModel({
            filetype   : body.filetype,
            imageName  : imageName,
            url        : uploadedFile.url,
            key        : uploadedFile.key,
            isGlobal   : !restaurantId,
            restaurantId: restaurantId ?? null,
            isActive   : true,
            isVerified : false,
            verifiedBy : null,
          });

          const saved = await newImage.save();

          return {
            fileName : file.originalname,
            status   : 'success' as const,
            data: {
              id          : saved._id,
              url         : saved.url,
              imageName   : saved.imageName,
              filetype    : saved.filetype,
              restaurantId: saved.restaurantId,
              isVerified  : saved.isVerified,
            },
          };

        } catch (error) {
          // ── R2 rollback if DB save failed ──────────────────────
          if (uploadedFile?.key) {
            try {
              await this.uploadService.deleteFile(uploadedFile.key);
              console.log(`🧹 R2 rollback done for: ${file.originalname}`);
            } catch (deleteErr) {
              console.error(`❌ R2 rollback failed for: ${file.originalname}`, deleteErr);
            }
          }

          return {
            fileName: file.originalname,
            status  : 'failed' as const,
            error   : error?.message || 'Upload failed',
          };
        }
      }),
    );

    // ── Flatten Promise.allSettled results ─────────────────────────
    const output = results.map((result) =>
      result.status === 'fulfilled'
        ? result.value
        : { fileName: 'unknown', status: 'failed' as const, error: 'Unexpected error' },
    );

    const uploadedCount = output.filter(r => r.status === 'success').length;
    const failedCount   = output.filter(r => r.status === 'failed').length;

    console.log(`Bulk Upload — ✓ ${uploadedCount} success | ✕ ${failedCount} failed`);

    return {
      success : failedCount === 0,
      uploaded: uploadedCount,
      failed  : failedCount,
      results : output,
    };

  } catch (error) {
    console.error('Bulk Upload Images Error:', error);
    if (error instanceof BadRequestException) throw error;
    throw new InternalServerErrorException(
      error?.message || 'Something went wrong during bulk upload',
    );
  }
}

}