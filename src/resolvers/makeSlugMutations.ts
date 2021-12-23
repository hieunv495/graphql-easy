import { ObjectTypeComposerWithMongooseResolvers } from 'graphql-compose-mongoose';
import { Model } from 'mongoose';
import makeCreateOneWithSlug from './makeCreateOneWithSlug';
import makeUpdateByIdWithSlug from './makeUpdateByIdWithSlug';

export default function makeSlugMutations(
  resource: string,
  model: Model<any>,
  tc: ObjectTypeComposerWithMongooseResolvers<any, any>
) {
  return {
    [`${resource}.createOne`]: makeCreateOneWithSlug({
      model,
      tc,
    }),
    [`${resource}.updateById`]: makeUpdateByIdWithSlug({
      model,
      tc,
    }),
  };
}
