import { schemaComposer } from 'graphql-compose';
import { Model } from 'mongoose';

export interface MakeViewBySlugParams {
  resource: string;
  model: Model<any>;
}

const makeViewBySlug = ({ resource, model }: MakeViewBySlugParams) =>
  schemaComposer.createResolver<
    any,
    {
      slug: string;
    }
  >({
    name: `${resource}ViewBySlug`,
    type: `${resource}!`,
    args: {
      slug: 'String!',
    },
    resolve: async ({ args: { slug } }) => {
      const item = await model.findOneAndUpdate(
        { slug },
        { $inc: { views: 1 } }
      );
      if (!item) {
        throw new Error('Not found');
      }
      return item;
    },
  });

export default makeViewBySlug;
