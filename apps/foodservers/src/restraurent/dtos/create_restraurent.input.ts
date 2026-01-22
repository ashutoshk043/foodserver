// dto/create-restaurant.input.ts
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateRestaurantInput {

  @Field({ nullable: true })
  id?: string;

  // 🔹 Mandatory
  @Field()
  restaurantName: string;

  @Field()
  restaurantType: string;

  @Field()
  restaurantAddress: string;

  @Field()
  ownerEmail: string;

  @Field()
  pincode: string;

  @Field()
  latitude: string;

  @Field()
  longitude: string;

  @Field()
  fssaiNumber: string;

  // 🔹 OPTIONAL (GST)
  @Field({ nullable: true })
  gstNumber?: string;

  @Field()
  registrationDate: string;

  // 🔹 Backend time (HH:mm)
  @Field()
  openingTime: string;

  @Field()
  closingTime: string;

  // 🔹 Optional
  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  coverImageUrl?: string;

  @Field({ nullable: true })
  description?: string;

  // 🔹 Mandatory
  @Field()
  isVerified: boolean;

  // 🔹 Optional
  @Field({ nullable: true })
  openStatus?: string;

  // 🔹 Optional
  @Field({ nullable: true })
  verifiedBy?: string;
}
