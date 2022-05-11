import { schemaComposer } from 'graphql-compose';
import { Model } from 'mongoose';

export interface MakeFindBySlugParams {
  resource: string;
  model: Model<any>;
}

const makeFindBySlug = ({ resource, model }: MakeFindBySlugParams) =>
  schemaComposer.createResolver<any, { slug: string }>({
    name: `${resource}FindBySlug`,
    type: `${resource}!`,
    args: {
      slug: 'String!',
    },
    resolve: async ({ args: { slug } }) => {
      const item = await model.findOne({ slug });
      if (!item) {
        throw new Error('Not found');
      }
      return item;
    },
  });

export default makeFindBySlug;
