import { Model } from 'mongoose';

export interface MakeViewBySlugParams {
  resource: string;
  model: Model<any>;
}

const makeViewBySlug = ({ resource, model }: MakeViewBySlugParams) => ({
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
    const item = await model.findOneAndUpdate({ slug }, { $inc: { views: 1 } });
    if (!item) {
      throw new Error('Not found');
    }
    return item;
  },
});

export default makeViewBySlug;
