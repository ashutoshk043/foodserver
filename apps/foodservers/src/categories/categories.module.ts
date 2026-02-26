import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Category, CategorySchema } from './schemas/category.schema';
import { CategoryService } from './services/category/category.service';
import { CategoryResolver } from './resolvers/categories/categories.resolver';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Category.name,
          schema: CategorySchema, // ✅ CORRECT
        },
      ],
      'restraurentconnection', // ✅ connection name
    ),
  ],
  providers: [
    CategoryService,   // ✅ REQUIRED
    CategoryResolver,  // ✅ REQUIRED
  ],
  exports: [CategoryService],
})
export class CategoriesModule {}
