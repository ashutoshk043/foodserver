// dto/get-stock-logs.args.ts
import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

@ArgsType()
export class GetStockLogsArgs {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt() @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 20 })
  @IsInt() @Min(1)
  limit: number = 20;

  @Field({ nullable: true })
  @IsOptional() @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional() @IsString()
  reason?: string;          // ORDER | RETURN | WASTAGE | MANUAL_ADD | MANUAL_SUB

  @Field({ nullable: true })
  @IsOptional() @IsString()
  fromDate?: string;        // "2026-03-01"

  @Field({ nullable: true })
  @IsOptional() @IsString()
  toDate?: string;          // "2026-03-31"
}