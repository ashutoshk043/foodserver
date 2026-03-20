import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ingredient, IngredientDocument } from '../schemas/ingredient.schema';
import { CreateIngredientInput } from '../dtos/create-ingredient.input';
import { UpdateIngredientInput } from '../dtos/update-ingredient.input';

@Injectable()
export class IngredientService {
  constructor(
    @InjectModel(Ingredient.name, 'restraurentconnection')
    private readonly ingredientModel: Model<IngredientDocument>,
  ) { }

  // ── Create ──────────────────────────────────────────────
async create(input: CreateIngredientInput): Promise<IngredientDocument> {
  
  // ✅ Same name already exist karta hai?
  const existing = await this.ingredientModel.findOne({
    name: { $regex: `^${input.name.trim()}$`, $options: 'i' }, // case-insensitive
    isDeleted: false,
  });

  if (existing) {
    throw new Error(`Ingredient "${input.name}" already exists`);
  }

  const ingredient = new this.ingredientModel({
    ...input,
    name: input.name.trim(), // ← trim whitespace
  });

  return ingredient.save();
}

  // ── findAll ──────────────────────────────────────────
  async findAll(page: number = 1, limit: number = 10, search: string = '') {
    const skip = (page - 1) * limit;

    const filter: any = {
      isActive: true,
      isDeleted: false,   // ← add karo
    };

    if (search?.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    const [raw, total] = await Promise.all([
      this.ingredientModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.ingredientModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const data = raw.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }));

    return { data, total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
  }

  // ── findOne ──────────────────────────────────────────
  async findOne(id: string): Promise<IngredientDocument> {
    const ingredient = await this.ingredientModel
      .findOne({ _id: id, isDeleted: false })  // ← add karo
      .lean();

    if (!ingredient) throw new NotFoundException(`Ingredient ${id} not found`);
    return ingredient as any;
  }

  // ── update ───────────────────────────────────────────
  async update(input: UpdateIngredientInput): Promise<IngredientDocument> {
    const { id, ...rest } = input;

    const updated = await this.ingredientModel.findOneAndUpdate(
      { _id: id, isDeleted: false },   // ← add karo
      { $set: rest },
      { new: true },
    );

    if (!updated) throw new NotFoundException(`Ingredient ${id} not found`);
    return updated;
  }

  // ── remove — soft delete ─────────────────────────────
  async remove(id: string): Promise<IngredientDocument> {
    const deleted = await this.ingredientModel.findOneAndUpdate(
      { _id: id, isDeleted: false },         // ← pehle se deleted na ho
      { $set: { isDeleted: true } },         // ← isDeleted true karo
      { new: true },
    );

    if (!deleted) throw new NotFoundException(`Ingredient ${id} not found or already deleted`);
    return deleted;
  }
}