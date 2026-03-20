import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ingredient, IngredientSchema } from './schemas/ingredient.schema';
import { IngredientService } from './services/ingredient.service';
import { IngredientresolverResolver } from './ingredientresolver/ingredientresolver.resolver';
import { IngredientconrollerController } from './ingredientconroller/ingredientconroller.controller';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Ingredient.name, schema: IngredientSchema }],
      'restraurentconnection', // ← named connection match karna zaroori hai
    ),
  ],
  controllers: [IngredientconrollerController],
  providers: [IngredientService, IngredientresolverResolver],
})
export class IngredientMasterModule {}