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
  ) {}

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
  async getCategories() {
    return this.categoryModel
      .find()
      .sort({ priority: 1, order: 1 })
      .lean();
  }

  // =========================
  // INCLUDED CATEGORIES
  // =========================
  async getIncludedCategories() {
    return this.categoryModel
      .find({
        isActive: true,
        name: { $not: /^bestseller$/i },
      })
      .select({ _id: 1, name: 1 })
      .sort({ name: 1 })
      .lean();
  }
}