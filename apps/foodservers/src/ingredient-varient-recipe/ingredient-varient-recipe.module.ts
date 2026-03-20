import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Recipe, RecipeSchema } from './schemas/recipe.schema';
import { RecipeService } from './ingredientverientrecipeservice/ingredientverientrecipeservice.service';
import { RecipeResolver } from './ingredientverientreciperesolver/ingredientverientreciperesolver.resolver';
import { IngredientverientrecipecontrollerController } from './ingredientverientrecipecontroller/ingredientverientrecipecontroller.controller';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Recipe.name, schema: RecipeSchema }],
      'restraurentconnection',
    ),
  ],
  controllers: [IngredientverientrecipecontrollerController],
  providers: [RecipeService, RecipeResolver],
})
export class IngredientVarientRecipeModule {}