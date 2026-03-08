import { registerEnumType } from '@nestjs/graphql';

export enum VariantSize {
  SMALL = 'SMALL',
  REGULAR = 'REGULAR',
  LARGE = 'LARGE',
}

registerEnumType(VariantSize, {
  name: 'VariantSize',
});