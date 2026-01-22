import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@ObjectType()
@Directive('@key(fields: "id")') // ⭐ federation key
@Schema({ timestamps: true })
export class Restaurant extends Document {

  @Field(() => ID)
  declare readonly id: string;

  // 🔹 Mandatory fields
  @Field()
  @Prop({ required: true })
  restaurantName: string;

  @Field()
  @Prop({ required: true })
  restaurantType: string;

  @Field()
  @Prop({ required: true })
  restaurantAddress: string;

  @Field()
  @Prop({ required: true , index:true})
  ownerEmail: string;

  @Field()
  @Prop({ required: true })
  pincode: string;

  @Field()
  @Prop({ required: true })
  latitude: string;

  @Field()
  @Prop({ required: true })
  longitude: string;

  @Field()
  @Prop({ required: true, unique: true })
  fssaiNumber: string;

  // ✅ GST OPTIONAL
  @Field({ nullable: true })
  @Prop({ unique: true, required: false })
  gstNumber?: string;

  @Field()
  @Prop({ required: true })
  registrationDate: string;

  // 🔹 Backend time (HH:mm)
  @Field()
  @Prop({ required: true })
  openingTime: string;

  @Field()
  @Prop({ required: true })
  closingTime: string;

  // 🔹 Optional media & description
  @Field({ nullable: true })
  @Prop()
  logoUrl?: string;

  @Field({ nullable: true })
  @Prop()
  coverImageUrl?: string;

  @Field({ nullable: true })
  @Prop()
  description?: string;

  // 🔹 Mandatory verification
  @Field()
  @Prop({ required: true, default: false })
  isVerified: boolean;

    @Field()
  @Prop({ default: false })
  openStatus: boolean;

  // 🔹 Optional
  @Field({ nullable: true })
  @Prop()
  verifiedBy?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
