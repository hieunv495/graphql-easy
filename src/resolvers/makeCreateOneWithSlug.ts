import { ResolverMiddleware } from 'graphql-compose';
import { ObjectTypeComposerWithMongooseResolvers } from 'graphql-compose-mongoose';
import { Model } from 'mongoose';
import completeSlug from '../utils/completeSlug';

export interface MakeCreateOneWithSlugParams {
  model: Model<any>;
  tc: ObjectTypeComposerWithMongooseResolvers<any, any>;
}

const makeCreateOneWithSlug = ({ model, tc }: MakeCreateOneWithSlugParams) => {
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

  return tc.mongooseResolvers.createOne().withMiddlewares([middleware]);
};

export default makeCreateOneWithSlug;
