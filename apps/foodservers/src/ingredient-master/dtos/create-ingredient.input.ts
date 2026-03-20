// ✅ Correct order
import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsNotEmpty, IsEnum } from 'class-validator';

export enum UnitEnum {
  PCS = 'PCS',
  GRAM = 'GRAM',
  KG = 'KG',
  ML = 'ML',
  LITER = 'LITER',
}

// ✅ enum define hone ke BAAD call karo, import ke saath group mat karo
registerEnumType(UnitEnum, { name: 'UnitEnum' });

@InputType()
export class CreateIngredientInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field(() => UnitEnum)
  @IsEnum(UnitEnum)
  unit: UnitEnum;
}