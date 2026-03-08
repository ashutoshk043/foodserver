import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CategoryInput } from '../../dtos/category.input';
import { Category } from '../../schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name, 'restraurentconnection')
    private readonly categoryModel: Model<Category>,
  ) { }

  // =========================
  // CREATE CATEGORY
  // =========================
  async createCategory(input: CategoryInput) {

    const exists = await this.categoryModel.findOne({
      $or: [
        { slug: input.slug },
        { name: input.name },
        { order: input.order },
      ],
    });

    if (exists) {
      if (exists.slug === input.slug) {
        throw new BadRequestException('Category slug already exists');
      }
      if (exists.name === input.name) {
        throw new BadRequestException('Category name already exists');
      }
      if (exists.order === input.order) {
        throw new BadRequestException('Category order already exists');
      }
    }

    const category = new this.categoryModel(input);
    return category.save();
  }

  // =========================
  // UPDATE CATEGORY
  // =========================
  async updateCategory(id: string, input: CategoryInput) {

    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const exists = await this.categoryModel.findOne({
      _id: { $ne: id },
      $or: [
        { slug: input.slug },
        { name: input.name },
        { order: input.order },
      ],
    });

    if (exists) {
      if (exists.slug === input.slug) {
        throw new BadRequestException('Category slug already exists');
      }
      if (exists.name === input.name) {
        throw new BadRequestException('Category name already exists');
      }
      if (exists.order === input.order) {
        throw new BadRequestException('Category order already exists');
      }
    }

    Object.assign(category, input);
    return category.save();
  }

  // =========================
  // GET ALL
  // =========================
async deleteCategory(id: string) {
  return this.categoryModel.findByIdAndUpdate(
    id,
    { $set: { isDeleted: true } },
    { new: true }
  ).lean();
}

  async getIncludedCategoriesPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    try {

      page = page < 1 ? 1 : page;
      limit = limit > 50 ? 50 : limit;

      const skip = (page - 1) * limit;

      const query: any = {
        isDeleted: false,
        isActive: true,
        name: { $not: /^bestseller$/i },
      };

      if (search && search.trim() !== '') {
        query.name = { $regex: search.trim(), $options: 'i' };
      }

      const [data, total] = await Promise.all([
        this.categoryModel
          .find(query)
          .select({
            _id: 1,
            name: 1,
            slug: 1,
            imageUrl: 1,
            order: 1,
            priority: 1,
            categoryType: 1,
            displaySections: 1,
            badges: 1,
            isActive: 1,
            isOnlineVisible: 1,
          })
          .sort({ order: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        this.categoryModel.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };

    } catch (error) {

      console.error('Error in getIncludedCategoriesPaginated:', error);

      return {
        data: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        limit,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }
  }
}