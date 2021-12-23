import { Model } from 'mongoose';

export interface MakeFindBySlugParams {
  resource: string;
  model: Model<any>;
}

const makeFindBySlug = ({ resource, model }: MakeFindBySlugParams) => ({
  type: `${resource}!`,
  args: {
    slug: 'String!',
  },
  resolve: async (
    _root: any,
    args: {
      slug: any;
    }
  ) => {
    const { slug } = args;
    const item = await model.findOne({ slug });
    if (!item) {
      throw new Error('Not found');
    }
    return item;
  },
});

export default makeFindBySlug;
