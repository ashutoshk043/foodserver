import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
  Body,
  BadRequestException,
  Get,
  Query,
  Delete,
  Param,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ServicesCloudService } from '../services-cloud/services-cloud.service';
import { UploadImageDto } from '../dtos/upload-image.dto';
import * as jwt from 'jsonwebtoken';
import { memoryStorage } from 'multer';
import { BulkUploadImageDto } from '../dtos/bulk-upload-image.dto';

@Controller('upload')
export class CloudControllerController {
  constructor(
    private readonly service: ServicesCloudService,

  ) { }

  // 🔹 Reusable function inside controller
  private getUserFromHeader(req: any) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new BadRequestException('Authorization header missing');
    }

    // ✅ "Bearer <token>" se token extract karo
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      throw new BadRequestException('Token missing');
    }

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

      return {
        userId: decoded.user_id,
        roleId: decoded.roleId,
        mobile: decoded.mobile,
      };
    } catch (err) {
      //  console.log(err.message, 'err message');
      throw new BadRequestException('Invalid token');
    }
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadImageDto,
    @Req() req: any,
  ) {
    // ✅ Reuse function to get user
    const user = this.getUserFromHeader(req);
    return this.service.uploadImage(file, body, user);
  }

  @Post('banner')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadBanner(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadImageDto,
    @Req() req: any,
  ) {
    // ✅ Same reusable function

    //     console.log('FILE:', file);                        // undefined? → Multer not parsing
    // console.log('CONTENT-TYPE:', req.headers['content-type']); // must include multipart/form-data
    // console.log('BODY:', body);

    const user = this.getUserFromHeader(req);

    return this.service.uploadImage(file, body, user);
  }


  @Get('images')
  async getImages(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '12',
    @Query('search') search?: string,
  ) {
    const user = this.getUserFromHeader(req);

    return this.service.getImages(
      user,
      Math.max(1, parseInt(page, 10) || 1),
      Math.min(100, parseInt(limit, 10) || 12),
      search,
    );
  }

  @Get('product-images')
  async getProductImages(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '21',
    @Query('search') search?: string,
  ) {
    const user = this.getUserFromHeader(req);

    return this.service.getProductImages(
      user,
      Math.max(1, parseInt(page, 10) || 1),
      Math.min(100, parseInt(limit, 10) || 21),
      search,
    );
  }

  // ✅ DELETE API
  @Delete('images/:id')
  async deleteImage(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const user = this.getUserFromHeader(req);
    return this.service.deleteImage(id, user);
  }

  @Delete('product-images/:id')
  async deleteProductImage(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const user = this.getUserFromHeader(req);
    return this.service.deleteProductImage(id, user);
  }


  // ==============================
  // ✅ FIRST: Bulk (specific route)
  @Post('images/bulk/verify')
  async bulkVerifyImages(
    @Body() body: { ids: string[]; isVerified: boolean },
    @Req() req: any,
  ) {
    const user = this.getUserFromHeader(req);
    return this.service.bulkVerifyImages(body.ids, user, body.isVerified);
  }

  // ✅ SECOND: Single
  @Post('images/:id/verify')
  async verifyImage(
    @Param('id') id: string,
    @Body('isVerified') isVerified: boolean,
    @Req() req: any,
  ) {
    const user = this.getUserFromHeader(req);
    return this.service.verifyImage(id, user, isVerified);
  }


  @Post('images/bulk')
  @UseInterceptors(
    FilesInterceptor('files', 50, { storage: memoryStorage() })  // max 50 files
  )
  async bulkUploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: BulkUploadImageDto,
    @Req() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const user = this.getUserFromHeader(req);

    console.log(`Bulk upload request — ${files.length} file(s), filetype: ${body.filetype}`);

    return this.service.bulkUploadImages(files, body, user);
  }



}