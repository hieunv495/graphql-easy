import { ResolverMiddleware } from 'graphql-compose';
import { ObjectTypeComposerWithMongooseResolvers } from 'graphql-compose-mongoose';
import { Model } from 'mongoose';
import completeSlug from '../utils/completeSlug';

export interface MakeUpdateByIdWithSlugParams {
  model: Model<any>;
  tc: ObjectTypeComposerWithMongooseResolvers<any, any>;
}

const makeUpdateByIdWithSlug = ({
  model,
  tc,
}: MakeUpdateByIdWithSlugParams) => {
  const middleware: ResolverMiddleware<any, any> = async (
    resolve,
    source,
    args,
    context,
    info
  ) => {
    const newSlug = await completeSlug(model, args.record.slug);
    const newRecord = { ...args.record, slug: newSlug };
    return resolve(source, { ...args, record: newRecord }, context, info);
  };

  return tc.mongooseResolvers.updateById().withMiddlewares([middleware]);
};

export default makeUpdateByIdWithSlug;
